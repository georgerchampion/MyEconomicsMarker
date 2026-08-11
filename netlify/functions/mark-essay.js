// netlify/functions/mark-essay.js
//
// SECTION D — the real Groq call, on top of section C's server function.
//
// The three "simulateX" essay-text testing switches from section C are kept
// and still run BEFORE any Groq call, so error-state testing never costs a
// real request against Groq's free-tier quota:
//   "simulateerror"     -> immediate 500
//   "simulatetimeout"   -> waits ~4s then returns 504
//   "simulatemalformed" -> returns 200 with a body that is NOT valid JSON
//
// MODEL CHOICE — openai/gpt-oss-20b, not gpt-oss-120b. Both support Groq's
// strict Structured Outputs (json_schema mode), which is used here so Groq
// itself guarantees the response matches RESPONSE_SCHEMA — no more hoping
// the model produces valid JSON. gpt-oss-20b was chosen over the larger
// 120b specifically because Netlify's free plan kills synchronous functions
// at 10 seconds, and 20b's ~1000 tokens/sec leaves a safer margin than
// 120b's ~500 tokens/sec for a response of this length. If Netlify is later
// upgraded past the 10s ceiling, 120b is worth re-testing for quality.
//
// CALIBRATION GATE — per CLAUDE.md: "Never show a numeric mark until it's
// been checked against essays with a known, agreed mark. Until then, show
// 'not yet calibrated.'" CALIBRATED stays false until tasks.md task F
// (running Maxim's real, known-mark essay through this exact pipeline and
// confirming it lands on the right mark) is actually done — not assumed.
// The real mark is still computed and returned in this response (so it CAN
// be checked, e.g. via the browser's network tab, for calibration testing)
// but the frontend must not display it to a normal visitor while this is
// false. Flip this only after task F passes, and log why in tasks.md.
const CALIBRATED = false;

const { loadGrounding, GroundingNotLoadedError } = require('./lib/mark-scheme-loader');
const { SYSTEM_PROMPT_VERSION, RESPONSE_SCHEMA, buildSystemPrompt } = require('./lib/system-prompt-v1');

const GROQ_MODEL = 'openai/gpt-oss-20b';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TIMEOUT_MS = 8500; // Netlify free plan kills the function at 10s — return our own clean timeout before that happens

// ---- SECTION E: per-visitor request cap ----
// No login means there's nothing else stopping one visitor (or one person
// double-clicking, or refreshing) from spending the whole day's Groq free
// quota by themselves (CLAUDE.md guardrail). This caps each visitor to
// RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_MS.
//
// HONEST LIMITATION: this is an in-memory Map, kept only for as long as
// this particular function instance stays warm — it resets on a cold start
// and isn't shared across multiple simultaneous instances. CLAUDE.md rules
// out a database for this project, so this is the best available guardrail
// without adding infrastructure. It stops the realistic accidental case
// (one person's browser looping) — it is NOT a hardened defence against a
// deliberate attacker with multiple devices. That distinction is worth
// knowing, not hiding.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 5 requests per 10 minutes per visitor
const requestLog = new Map(); // ip -> array of request timestamps (ms)

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - timestamps[0]);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);

  // Prevent unbounded growth over a long-lived warm instance — drop entries
  // for visitors who haven't made a request in over an hour.
  if (requestLog.size > 500) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => now - t > 60 * 60 * 1000)) requestLog.delete(key);
    }
  }

  return { allowed: true };
}

function getClientIp(event) {
  const headers = event.headers || {};
  return headers['x-nf-client-connection-ip']
    || (headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
}

exports.handler = async (event) => {
  const startedAt = Date.now();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Malformed request body — not valid JSON.' }) };
  }

  const { paper, theme, knownQuestionId, question, essay, diagram } = payload;

  if (!paper || !theme || !question || !essay) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Missing required fields: paper, theme, question, and essay are all required.' }),
    };
  }

  const essayLower = String(essay).toLowerCase();

  // ---- Free testing switches — never reach Groq, never cost quota, and
  // deliberately not rate-limited so testing error states stays convenient ----
  if (essayLower.includes('simulateerror')) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Simulated server failure, for testing.' }) };
  }
  if (essayLower.includes('simulatetimeout')) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return { statusCode: 504, body: JSON.stringify({ error: 'Simulated timeout, for testing.' }) };
  }
  if (essayLower.includes('simulatemalformed')) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '{ "mark": 23, "this is not valid JSON' };
  }
  if (essayLower.includes('simulateratelimit')) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests. Simulated for testing — wait a minute and try again.', retryAfterSeconds: 60 }) };
  }

  // ---- Rate limit real requests only, per visitor IP ----
  const clientIp = getClientIp(event);
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    logRequest({ startedAt, success: false, reason: 'rate-limited' });
    return {
      statusCode: 429,
      body: JSON.stringify({
        error: `You've made several requests in a short time. Please wait ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s) and try again.`,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      }),
    };
  }

  // ---- Load grounding — fail loudly if it's missing, never guess ----
  let grounding;
  try {
    grounding = loadGrounding({ paper, theme, knownQuestionId: knownQuestionId || null });
  } catch (e) {
    if (e instanceof GroundingNotLoadedError) {
      logRequest({ startedAt, success: false, reason: 'grounding-not-loaded' });
      return { statusCode: 422, body: JSON.stringify({ error: 'Mark scheme not loaded for this paper/theme/question. Refusing to mark rather than guess.' }) };
    }
    logRequest({ startedAt, success: false, reason: 'grounding-error' });
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error loading grounding data.' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    logRequest({ startedAt, success: false, reason: 'missing-api-key' });
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is not configured with a Groq API key.' }) };
  }

  const systemPrompt = buildSystemPrompt({
    paper,
    theme,
    groundingText: grounding.groundingText,
    confidenceTier: grounding.confidenceTier,
    sourceNote: grounding.sourceNote,
  });

  const userMessage = [
    `EXAM QUESTION:\n${question}`,
    `STUDENT'S ESSAY:\n${essay}`,
    diagram ? `STUDENT'S DIAGRAM DESCRIPTION (in their own words):\n${diagram}` : `STUDENT'S DIAGRAM DESCRIPTION: (none given — do not assume or invent a diagram)`,
  ].join('\n\n');

  const controller = new AbortController();
  const groqTimeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  let groqResponse;
  try {
    groqResponse = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2, // fixed low temperature — same essay marked twice should give the same answer (CLAUDE.md)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'essay_mark', strict: true, schema: RESPONSE_SCHEMA },
        },
      }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(groqTimeout);
    const isAbort = fetchErr.name === 'AbortError';
    logRequest({ startedAt, success: false, reason: isAbort ? 'groq-timeout' : 'groq-network-error' });
    return {
      statusCode: isAbort ? 504 : 500,
      body: JSON.stringify({ error: isAbort ? 'Timed out waiting for the AI service.' : 'Could not reach the AI service.' }),
    };
  }
  clearTimeout(groqTimeout);

  if (!groqResponse.ok) {
    const errText = await groqResponse.text().catch(() => '');
    // Log Groq's own error message, truncated. Without this the logs only
    // say "something failed" — this is the difference between a fixable
    // bug report and a guess. Contains no student essay text.
    logRequest({ startedAt, success: false, reason: `groq-http-${groqResponse.status}`, detail: errText.slice(0, 500) });
    // Groq's own rate-limit status is 429 too — passed through as the same
    // status code our own per-visitor cap uses, so the frontend's one
    // "rate-limited" handler covers both causes with one honest message.
    return {
      statusCode: groqResponse.status === 429 ? 429 : 502,
      body: JSON.stringify({ error: `AI service returned an error (status ${groqResponse.status}).` }),
    };
  }

  const raw = await groqResponse.text();
  let groqBody;
  try {
    groqBody = JSON.parse(raw);
  } catch (e) {
    logRequest({ startedAt, success: false, reason: 'groq-body-not-json' });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '{ "malformed": true, this triggers the frontend malformed-response path' };
  }

  const contentText = groqBody && groqBody.choices && groqBody.choices[0] && groqBody.choices[0].message && groqBody.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(contentText);
  } catch (e) {
    logRequest({ startedAt, success: false, reason: 'model-content-not-json' });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '{ "malformed": true, this triggers the frontend malformed-response path' };
  }

  // Never trust an unchecked response, even a "structured output" one —
  // validate the shape ourselves before it goes anywhere near the frontend.
  const componentsOk = Array.isArray(parsed.components) && parsed.components.length === 2 &&
    parsed.components.every((c) => c && typeof c.marksAwarded === 'number' && typeof c.maxMarks === 'number' &&
      typeof c.level === 'string' && typeof c.commentary === 'string');
  const shapeOk = parsed && typeof parsed.overallLevel === 'string' && componentsOk &&
    Array.isArray(parsed.issues) && typeof parsed.improvement === 'string';

  if (!shapeOk) {
    logRequest({ startedAt, success: false, reason: 'shape-validation-failed' });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '{ "malformed": true, this triggers the frontend malformed-response path' };
  }

  // The headline mark is summed here, server-side, from the model's own two
  // component marks — the model is never asked for a top-line number, so it
  // can never state one that's inconsistent with its own components.
  const mark = parsed.components.reduce((sum, c) => sum + c.marksAwarded, 0);

  logRequest({ startedAt, success: true, reason: 'ok' });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      confidenceTier: grounding.confidenceTier,
      sourceNote: grounding.sourceNote,
      mark,
      outOf: 25,
      overallLevel: parsed.overallLevel,
      components: parsed.components,
      issues: parsed.issues,
      improvement: parsed.improvement,
      calibrated: CALIBRATED,
    }),
  };
};

// One request-level log line: time, model, prompt version, success/fail,
// duration. Never the essay or question text (CLAUDE.md: never log the
// pasted question or essay beyond serving that one request).
function logRequest({ startedAt, success, reason, detail }) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    model: GROQ_MODEL,
    promptVersion: SYSTEM_PROMPT_VERSION,
    success,
    reason,
    ...(detail ? { detail } : {}),
    durationMs: Date.now() - startedAt,
  }));
}
