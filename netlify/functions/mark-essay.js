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
// Netlify's free plan hard-kills a synchronous function at 10s. 8500ms was
// cutting it far too fine: a cold start (routinely 1-3s on the free plan)
// plus an 8.5s Groq wait exceeds 10s, so the PLATFORM killed the function
// before our own abort could return a clean 504 — which surfaces to the
// student as Netlify's raw "Error - Request ID: ..." page rather than any
// message we control (seen live 2026-08-12). 6500ms leaves ~3.5s of room
// for cold start plus response handling, so our own honest timeout message
// always wins the race.
// Overridable so the evaluation runner can wait longer than production does.
// A runner that kills slow requests can't measure marking quality — but the
// production default must stay tight because of Netlify's 10s platform kill,
// so the runner reports separately which cases would have timed out live.
const GROQ_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS) || 6500;
const PRODUCTION_TIMEOUT_MS = 6500;

// ---- Groq tokens-per-minute ceiling ----
// This single number is what forced most of 2026-08-12's failures: on Groq's
// FREE tier, openai/gpt-oss-20b allows 8000 tokens/minute, and Groq counts
// prompt tokens + the max_completion_tokens you ASK for (not what's used).
// With a ~4200-token grounded prompt that leaves under 4000 for the answer,
// which is right at what this reasoning model needs — hence intermittent
// 413s (over the ceiling) and 400s (answer truncated mid-JSON).
//
// >>> AFTER UPGRADING TO GROQ'S DEVELOPER TIER: raise this to 30000. <<<
// The Developer tier is free to enable (card on file, pay only for usage,
// ~10x the free limits). Raising this is the single change that unlocks
// attaching fuller grounding — specific mark schemes AND examiner reports
// together — which the free tier physically cannot fit alongside a real
// essay. Do not raise it before actually upgrading: a too-high value here
// just moves the failure from our clean error message to Groq's 413.
const TPM_CEILING = 8000;

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
// TEMP DEBUG (2026-08-12): raised from 5 to 20 so George can run several
// back-to-back determinism-comparison requests on the dev site while it's
// only him testing. REVERT TO 5 before any real tester (Maxim/Seb/Luke) or
// production ever sees this — the cap exists specifically to stop one
// visitor draining the shared Groq key, which still applies to real users.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 20 requests per 10 minutes per visitor (TEMP — normally 5)
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
    // NOTE (2026-08-12): the "none given" branch used to read "(none given —
    // do not assume or invent a diagram)". That single line sat right beside
    // the essay in the user message and effectively overrode the system
    // prompt's rule that diagrams also count when narrated in the essay's
    // own prose — the model kept reporting a missing diagram for an essay
    // that plainly describes its AD1->AD2 / Y1->Y2 shifts in the text.
    // Nearest, most concrete instruction wins, so this branch now points the
    // model AT the essay instead of away from it.
    diagram
      ? `STUDENT'S SEPARATE DIAGRAM DESCRIPTION (in their own words):\n${diagram}`
      : `STUDENT'S SEPARATE DIAGRAM DESCRIPTION FIELD: left blank.\nThis does NOT mean the student drew no diagram, and is NOT itself a fault. Their essay was hand-written on paper and typically narrates its diagrams in the prose above. Re-read the essay for any passage naming curves, shift directions or labelled points (e.g. "AD shifts left from AD1 to AD2, output falls from Y1 to Y2") and mark THAT as the diagram description. Only if no such passage exists anywhere in the essay should you treat the diagram as absent — and even then, raise no diagram issue and never suggest adding a diagram description.`,
  ].join('\n\n');

  // TPM BUDGET — SELF-SIZING (2026-08-12): Groq's free tier caps
  // openai/gpt-oss-20b at 8000 tokens/minute, and "requested tokens" =
  // prompt tokens + max_completion_tokens (the budget we ask for, not what's
  // actually used). Three separate 413s happened today because a hardcoded
  // max_completion_tokens number kept getting invalidated every time the
  // system prompt grew by a few more instructions (4400 -> 8039, 4000 ->
  // 8005) — a static number here is fragile by construction, since prompt
  // length and completion budget both draw from the same 8000 ceiling.
  // Fix: estimate the real prompt size right here, every request, and size
  // the completion budget to whatever's actually left, instead of a guess
  // that has to be manually re-tuned every time either prompt file changes.
  // ESTIMATE CALIBRATED FROM REAL DATA (2026-08-12, third attempt).
  // The tuning history matters, because both directions fail differently:
  //   /4 + 400 margin  -> UNDER-estimated the prompt -> budget too generous
  //                       -> 413 "Requested 8005" (over the ceiling).
  //   /3.3 + 900 margin -> OVER-estimated the prompt -> budget too small
  //                       -> 400 json_validate_failed with an EMPTY
  //                          completion (the model ran out of room mid-JSON).
  // The window between those two failures is narrow, so this is no longer a
  // guess: Groq's own 413 messages give the real numbers. It reported a
  // total of 8005 requested tokens when max_completion_tokens was 4000,
  // meaning the prompt was really ~4005 tokens for ~14,400 characters —
  // i.e. ~3.6 chars/token for this kind of formal English. Using 3.5 below
  // (slightly conservative, so it errs toward over-estimating the prompt)
  // with a modest 250-token margin, since the ceiling itself is what's
  // tight, not the estimate's accuracy.
  // The system prompt was ALSO condensed in the same commit — it had grown
  // verbose across today's fixes, and prompt text and answer space compete
  // for the same 8000 tokens, so trimming it buys real headroom rather than
  // just moving the problem around.
  // TIGHTENED AGAIN (2026-08-12): the 400 empty-completion failure came back
  // INTERMITTENTLY on the same essay — succeeding some runs, failing others.
  // That pattern is the tell: gpt-oss-20b's hidden reasoning length varies
  // run to run, so a budget that's merely adequate on an average run runs dry
  // on a heavy-reasoning run. Two changes together: (a) use 3.6 chars/token
  // here, which is the ratio actually derived from Groq's own 413 numbers
  // rather than the deliberately-conservative 3.5 — the over-estimate was
  // costing ~290 tokens of real headroom for no benefit; (b) the system
  // prompt now caps output length (max 3 issues, brief commentary), so the
  // JSON needs materially fewer tokens to complete in the first place.
  // CAP RAISED (2026-08-12, final): the upper cap here was 4000, left over from
  // earlier debugging when the prompt was much larger. That cap threw away real
  // headroom on SHORTER essays — Groq returned an explicit
  // "max completion tokens reached before generating a valid document" on a
  // short essay that had ~4,600 tokens available but was handed only 4,000.
  // gpt-oss-20b spends a variable, sometimes large share of the budget on
  // hidden reasoning before writing any JSON, so the answer needs whatever
  // room actually exists rather than an arbitrary ceiling. The TPM formula
  // below is what must constrain this, not a hardcoded number.
  const TPM_SAFETY_MARGIN = 150;
  const estimatedPromptTokens = Math.ceil((systemPrompt.length + userMessage.length) / 3.6);
  const maxCompletionTokens = Math.max(
    2600, // floor — gpt-oss-20b needs real room for hidden reasoning AND the full JSON; going below this is what caused the empty-completion 400
    Math.min(5200, TPM_CEILING - estimatedPromptTokens - TPM_SAFETY_MARGIN)
  );

  // ---- RETRY ON TRANSIENT FAILURES (2026-08-13) ----
  // Thursday's baseline measured 11 of 15 real calls returning a valid mark —
  // 73%. The failures were not all the same thing, and two of them are
  // genuinely transient: Groq's strict validator rejecting a malformed answer
  // (a category outside the enum, or a completion truncated mid-JSON). Those
  // are the model having a bad roll, not a broken request — the identical
  // input succeeds on the next attempt. Retrying once turns most of them into
  // a normal result instead of "nothing came back".
  //
  // Deliberately NOT retried: 429 (needs a wait we don't have), and timeouts
  // (the clock is the constraint — retrying guarantees breaching it).
  //
  // BUDGET-AWARE: Netlify's free plan kills the function at 10s, so a retry is
  // only attempted when enough time remains for it to finish. Better to return
  // one honest error than to be killed mid-retry and show Netlify's raw error
  // page, which is what happened on Wednesday.
  const RETRY_MIN_REMAINING_MS = 3500;

  async function callGroq(timeoutMs) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return { response: await doFetch(controller.signal) };
    } catch (err) {
      return { error: err };
    } finally {
      clearTimeout(t);
    }
  }

  function doFetch(signal) {
    return fetch(GROQ_ENDPOINT, {
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
        // TPM CEILING — see the self-sizing calculation above
        // (maxCompletionTokens). Three separate static numbers (6000, 4400,
        // 4000) each got invalidated by later prompt edits and produced a
        // 413 — this is now computed fresh every request instead of
        // hand-tuned, so it stays correct as the prompt keeps changing,
        // including for the exact-match tier's bigger grounding text.
        reasoning_effort: 'medium',
        max_completion_tokens: maxCompletionTokens,
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
      signal,
    });
  }

  let attempt = await callGroq(GROQ_TIMEOUT_MS);
  let retried = false;

  // Retry once when Groq itself rejected the model's output as invalid JSON /
  // schema — transient, and the same input usually passes on a second attempt.
  if (!attempt.error && attempt.response.status === 400) {
    const elapsed = Date.now() - startedAt;
    const remaining = GROQ_TIMEOUT_MS - elapsed;
    if (remaining >= RETRY_MIN_REMAINING_MS) {
      logRequest({ startedAt, success: false, reason: 'groq-400-retrying', detail: `elapsed=${elapsed}ms` });
      attempt = await callGroq(remaining);
      retried = true;
    }
  }

  if (attempt.error) {
    const isAbort = attempt.error.name === 'AbortError';
    logRequest({ startedAt, success: false, reason: isAbort ? 'groq-timeout' : 'groq-network-error' });
    return {
      statusCode: isAbort ? 504 : 500,
      body: JSON.stringify({ error: isAbort ? 'Timed out waiting for the AI service.' : 'Could not reach the AI service.' }),
    };
  }

  const groqResponse = attempt.response;

  if (!groqResponse.ok) {
    const errText = await groqResponse.text().catch(() => '');
    // Log Groq's own error message, truncated. Without this the logs only
    // say "something failed" — this is the difference between a fixable
    // bug report and a guess. Contains no student essay text.
    logRequest({ startedAt, success: false, reason: `groq-http-${groqResponse.status}${retried ? '-after-retry' : ''}`, detail: errText.slice(0, 500) });
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
