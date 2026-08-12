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
        // gpt-oss-20b is a reasoning model: its hidden reasoning tokens count
        // against max_completion_tokens, and Groq's default for that is only
        // 1024 total. For a schema this size (two commentary fields plus an
        // open-ended issues array) the model was burning that whole budget
        // on hidden reasoning before writing any JSON, so Groq's own
        // validator saw an empty completion and rejected it with
        // "json_validate_failed" / empty failed_generation — a known issue
        // on Groq's community forum for gpt-oss-20b structured outputs, not
        // a bug in our schema. Fix: raise the budget so there's room for
        // both reasoning and the answer.
        // CALIBRATION NOTE (2026-08-12): reasoning_effort was first set to
        // 'low' here to free up budget, but that run mis-marked Maxim's
        // known 24-25/25 essay as Level 2 across both components — a severe
        // miss, not a boundary call. The one thing that changed from the
        // Aug 11 working demo is this dropping from the default 'medium' to
        // 'low'. Reverted to 'medium' (explicit now, not just left unset).
        //
        // TPM CEILING (2026-08-12): Groq's free tier caps openai/gpt-oss-20b
        // at 8000 tokens/minute, and "requested tokens" = prompt tokens +
        // max_completion_tokens, not actual usage. 6000 pushed this exact
        // essay's request to 9313 and got a 413 rate_limit_exceeded. This
        // essay's prompt is ~3300 tokens (general-only tier — no specific
        // mark scheme/examiner report attached), leaving ~4700 of headroom
        // under the 8000 ceiling. Set to 4400 for margin. NOTE: the
        // exact-match tier loads specific mark scheme + examiner report on
        // top of the general grid, so its prompts are meaningfully bigger —
        // if a known-question essay (e.g. Seb/Luke, task 18) hits this same
        // 413, the budget below needs to come down further for that tier,
        // or the grounding text trimmed. Revisit then, don't guess now.
        reasoning_effort: 'medium',
        max_completion_tokens: 4400,
        // DETERMINISM (2026-08-12): three back-to-back runs of the exact
        // same essay/settings during calibration returned meaningfully
        // different levels (21/25, 18/25, ~15/25 — trending down, not
        // random noise around one true value), which breaks CLAUDE.md's
        // "same essay marked twice gives the same answer" rule. Groq
        // documents `seed` as a best-effort determinism control (NOT
        // guaranteed) — worth trying before concluding this is
        // unfixable. system_fingerprint is logged below so a change in
        // Groq's backend can be told apart from a change caused by us.
        seed: 42,
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
      // TEMP DEBUG (2026-08-12): includes Groq's raw error text in the
      // response so it's visible in the browser's Network tab, since
      // Netlify's function-log UI was hard to navigate to mid-calibration.
      // REMOVE before this is shown to anyone other than George — CLAUDE.md
      // says never send raw provider error internals to the browser.
      body: JSON.stringify({ error: `AI service returned an error (status ${groqResponse.status}).`, debugGroqDetail: errText.slice(0, 800) }),
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

  // DETERMINISM DEBUG (2026-08-12): system_fingerprint changes when Groq's
  // backend configuration changes — logging it (and temporarily returning
  // it) lets us tell "Groq's infra changed under us" apart from "our seed
  // isn't actually pinning anything." Never essay/question content.
  const systemFingerprint = groqBody && groqBody.system_fingerprint;
  logRequest({ startedAt, success: true, reason: 'ok', detail: systemFingerprint ? `fp=${systemFingerprint}` : undefined });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      confidenceTier: grounding.confidenceTier,
      sourceNote: grounding.sourceNote,
      mark,
      outOf: 25,
      // TEMP DEBUG (2026-08-12): remove alongside the other debug fields
      // once determinism is sorted — see mark-essay.js notes.
      debugSystemFingerprint: systemFingerprint || null,
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
