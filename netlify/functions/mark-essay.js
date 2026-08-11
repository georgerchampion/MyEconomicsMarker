// netlify/functions/mark-essay.js
//
// SECTION C — server function skeleton, fake-answer mode.
//
// Returns a hard-coded response in the exact JSON shape the real Groq-backed
// version (section D) will use. No AI call happens here yet — this proves
// the browser -> server -> browser round trip works before any real marking
// logic or API key is involved.
//
// TESTING SWITCHES (type these words into the essay box — no URL editing
// needed, so they're testable from the normal page):
//   "simulateerror"     -> immediate 500, simulates the server failing outright
//   "simulatetimeout"   -> waits ~4s then returns 504, simulates Groq being slow/down
//   "simulatemalformed" -> returns 200 but with a body that is NOT valid JSON,
//                          to prove the frontend never trusts an unchecked response
//
// DECISION (logged per tasks.md section G): tasks.md suggested a query
// param for these test switches. Essay-text magic strings were used instead
// because George tests through the real form, not by hand-editing URLs —
// same effect, easier to actually use.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Malformed request body — not valid JSON.' }) };
  }

  const { paper, theme, knownQuestionId, question, essay } = payload;

  if (!paper || !theme || !question || !essay) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Missing required fields: paper, theme, question, and essay are all required.' }),
    };
  }

  const essayLower = String(essay).toLowerCase();

  if (essayLower.includes('simulateerror')) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Simulated server failure, for testing.' }) };
  }

  if (essayLower.includes('simulatetimeout')) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return { statusCode: 504, body: JSON.stringify({ error: 'Simulated timeout, for testing.' }) };
  }

  if (essayLower.includes('simulatemalformed')) {
    // Deliberately broken JSON — the frontend must catch this, not crash.
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '{ "mark": 23, "this is not valid JSON' };
  }

  // ---- Normal fake success response, matching the real JSON shape ----
  const confidenceTier = knownQuestionId ? 'exact-match' : 'general-only';

  const fakeResponse = {
    confidenceTier,
    sourceNote: confidenceTier === 'exact-match'
      ? 'Matched to a real past question: June 2024, Paper 1 — rising energy bills (hotel industry).'
      : 'No exact past-paper match — marked against the general 25-mark banding grid only.',
    mark: 23,
    outOf: 25,
    overallLevel: 'Level 4 — high',
    // Two holistic components, matching how Edexcel actually marks a
    // 25-mark essay — NOT four additive AO sub-scores. (This corrects an
    // inconsistency from the section B mockup — see tasks.md section G.)
    components: [
      {
        key: 'kaa',
        label: 'Knowledge, Application & Analysis',
        maxMarks: 16,
        marksAwarded: 15,
        level: 'Level 4',
        commentary: 'FAKE DATA (section C). Real commentary will cite specific sentences from your essay and the mark scheme once section D wires up the real AI call.',
      },
      {
        key: 'eval',
        label: 'Evaluation',
        maxMarks: 9,
        marksAwarded: 8,
        level: 'Level 4',
        commentary: 'FAKE DATA (section C). This is placeholder text from mark-essay.js, not a real assessment.',
      },
    ],
    issues: [
      { category: 'diagram', severity: 'quality', text: 'FAKE — this is placeholder output from the server function skeleton.' },
      { category: 'theory', severity: 'serious', text: 'FAKE — replace mark-essay.js with the real Groq call in section D.' },
      { category: 'structure', severity: 'quality', text: 'FAKE — structure/phrasing checks will use your real essay text once wired to Groq.' },
    ],
    improvement: 'FAKE DATA. This field will show one specific, sentence-level improvement once the real AI call is wired up in section D.',
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fakeResponse),
  };
};
