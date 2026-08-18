#!/usr/bin/env node
//
// run-tests.js — the evaluation runner (Thursday task 1).
//
// WHY THIS EXISTS. On Wednesday every prompt change was judged by running one
// essay and reading one screenshot. That cannot work when the same essay can
// score 16 or 22 between runs: a single result can't tell "this fix helped"
// apart from "this run landed higher". This runs the whole test set in one
// command so a change can be measured across all cases at once.
//
// WHAT IT DOES AND DOESN'T JUDGE. Per the playbook: a runner may check what is
// objectively true — did the call succeed, is the shape valid, which levels
// came back, how long it took, which prompt version produced it. It must NOT
// decide whether a judgement was *good*. This deliberately prints the known
// mark beside the tool's answer and leaves the verdict to you, by hand.
// Never let the AI be the judge of its own judgement.
//
// SINGLE SOURCE OF TRUTH. Cases are parsed straight out of test-inputs.md
// rather than copied into a second file — duplicated essays would drift, and
// "documents that stop matching reality" is the failure mode this project has
// already been bitten by.
//
// USAGE
//   node run-tests.js --dry-run    parse and show the cases, call nothing
//   node run-tests.js              run every case against the real Groq API
//   node run-tests.js --only=2,5   run just those case numbers
//
// PACING. Groq's free tier allows 8000 tokens/minute and one marking request
// uses close to all of it, so cases are spaced ~65s apart. A full set takes
// about five minutes; leave it running.

const fs = require('fs');
const path = require('path');

// ---- load .env (no dependency on dotenv) ----
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^=#]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const DRY_RUN = process.argv.includes('--dry-run');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.split('=')[1].split(',').map((n) => parseInt(n.trim(), 10)) : null;

const PAPER_MAP = { 'paper 1': 'paper1', 'paper 2': 'paper2' };
const THEME_MAP = { 'theme 1': 'theme1', 'theme 2': 'theme2', 'theme 3': 'theme3', 'theme 4': 'theme4' };

// ---- Parse test-inputs.md into runnable cases ----
function parseTestInputs() {
  const md = fs.readFileSync(path.join(__dirname, 'test-inputs.md'), 'utf8');
  // Split on "## Test N" headings, keeping only real case sections.
  const blocks = md.split(/\n(?=## Test \d)/).filter((b) => /^## Test \d/.test(b));

  return blocks.map((block) => {
    const num = parseInt(block.match(/^## Test (\d)/)[1], 10);
    const title = (block.match(/^## Test \d+ — (.+)$/m) || [, `Test ${num}`])[1].trim();

    const paperThemeLine = (block.match(/\*\*Paper\/Theme:\*\*([\s\S]*?)(?=\n\*\*)/) || [, ''])[1];
    const paperKey = Object.keys(PAPER_MAP).find((k) => paperThemeLine.toLowerCase().includes(k));
    const themeKey = Object.keys(THEME_MAP).find((k) => paperThemeLine.toLowerCase().includes(k));

    const questionRaw = (block.match(/\*\*Question:\*\*([\s\S]*?)(?=\n\*\*)/) || [, ''])[1];
    const question = questionRaw.replace(/\s+/g, ' ').replace(/^"|"$/g, '').trim();

    // Diagram: any "**Diagram description(s)...:**" block up to the next bold heading.
    const diagRaw = (block.match(/\*\*Diagram descriptions?[^*]*:\*\*([\s\S]*?)(?=\n\*\*Essay:)/) || [, ''])[1];
    let diagram = diagRaw.trim();
    // Test 1 explicitly records that none exists — don't send that prose as if it were one.
    if (/^none recorded/i.test(diagram)) diagram = '';

    const essay = (block.match(/\*\*Essay:\*\*\n([\s\S]*?)(?=\n\*\*Known correct mark)/) || [, ''])[1].trim();

    const knownRaw = (block.match(/\*\*Known correct mark[:\s]*([\s\S]*?)(?=\n\n)/) || [, ''])[1];
    const known = knownRaw.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    // A case whose "mark" is a grade band, not a number, cannot be scored numerically.
    const scoreable = !/NOT A MARK/i.test(known);

    return {
      num,
      title,
      paper: paperKey ? PAPER_MAP[paperKey] : null,
      theme: themeKey ? THEME_MAP[themeKey] : null,
      question,
      essay,
      diagram,
      known,
      scoreable,
    };
  });
}

function validateCase(c) {
  const problems = [];
  if (!c.paper) problems.push('paper not parsed');
  if (!c.theme) problems.push('theme not parsed');
  if (!c.question || c.question.length < 20) problems.push('question missing/short');
  if (!c.essay || c.essay.length < 500) problems.push(`essay missing/short (${c.essay.length} chars)`);
  if (!c.known) problems.push('known mark not parsed');
  return problems;
}

async function runCase(handler, c) {
  const started = Date.now();
  const res = await handler({
    httpMethod: 'POST',
    headers: { 'x-nf-client-connection-ip': `runner-${c.num}` }, // distinct IP per case so the rate limiter doesn't block the set
    body: JSON.stringify({
      paper: c.paper,
      theme: c.theme,
      knownQuestionId: null,
      question: c.question,
      essay: c.essay,
      diagram: c.diagram,
    }),
  });

  const durationMs = Date.now() - started;
  let body;
  try { body = JSON.parse(res.body); } catch (e) { body = { unparseable: String(res.body).slice(0, 200) }; }

  const ok = res.statusCode === 200 && Array.isArray(body.components) && body.components.length === 2;
  return {
    case: c.num,
    title: c.title,
    known: c.known,
    scoreable: c.scoreable,
    httpStatus: res.statusCode,
    ok,
    durationMs,
    overallLevel: body.overallLevel || null,
    kaa: ok ? `${body.components[0].level} (${body.components[0].marksAwarded}/${body.components[0].maxMarks})` : null,
    evaluation: ok ? `${body.components[1].level} (${body.components[1].marksAwarded}/${body.components[1].maxMarks})` : null,
    computedMark: typeof body.mark === 'number' ? body.mark : null,
    seriousIssues: ok ? body.issues.filter((i) => i.severity === 'serious').length : null,
    qualityIssues: ok ? body.issues.filter((i) => i.severity === 'quality').length : null,
    issues: ok ? body.issues : null,
    improvement: body.improvement || null,
    error: res.statusCode !== 200 ? (body.error || 'unknown') : null,
    debugGroqDetail: body.debugGroqDetail || null,
  };
}

(async () => {
  let cases = parseTestInputs();
  if (ONLY) cases = cases.filter((c) => ONLY.includes(c.num));

  console.log(`\nParsed ${cases.length} case(s) from test-inputs.md\n${'='.repeat(70)}`);
  let anyProblem = false;
  for (const c of cases) {
    const problems = validateCase(c);
    if (problems.length) anyProblem = true;
    console.log(
      `Test ${c.num}: ${c.title}\n` +
      `  paper/theme : ${c.paper || '??'} / ${c.theme || '??'}\n` +
      `  question    : ${c.question.slice(0, 70)}...\n` +
      `  essay       : ${c.essay.length} chars\n` +
      `  diagram     : ${c.diagram ? c.diagram.length + ' chars' : '(none)'}\n` +
      `  known mark  : ${c.known.slice(0, 80)}\n` +
      `  scoreable   : ${c.scoreable ? 'yes' : 'NO — grade band only, judge by direction'}\n` +
      (problems.length ? `  ** PARSE PROBLEMS: ${problems.join(', ')}\n` : '')
    );
  }

  if (anyProblem) {
    console.log('Some cases failed to parse cleanly — fix test-inputs.md before trusting a run.\n');
  }
  if (DRY_RUN) {
    console.log('Dry run only. Nothing was sent to Groq.\n');
    return;
  }
  if (!process.env.GROQ_API_KEY) {
    console.error('No GROQ_API_KEY found in .env — cannot run for real.\n');
    process.exit(1);
  }

  // Wait longer than production so slow-but-valid answers can still be judged.
  // Cases exceeding the real 6500ms production limit are flagged in the report
  // rather than silently passing — a mark nobody can wait for is still a fail.
  const PRODUCTION_TIMEOUT_MS = 6500;
  process.env.GROQ_TIMEOUT_MS = '25000';

  const { handler } = require('./netlify/functions/mark-essay.js');
  const { SYSTEM_PROMPT_VERSION } = require('./netlify/functions/lib/system-prompt-v1.js');

  const results = [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    process.stdout.write(`Running test ${c.num} (${c.title})... `);
    try {
      const r = await runCase(handler, c);
      results.push(r);
      console.log(r.ok ? `ok in ${(r.durationMs / 1000).toFixed(1)}s` : `FAILED (${r.httpStatus}) ${r.error || ''}`);
    } catch (err) {
      results.push({ case: c.num, title: c.title, ok: false, error: String(err && err.message) });
      console.log(`THREW: ${err && err.message}`);
    }
    // Respect the free tier's per-minute token ceiling.
    if (i < cases.length - 1) {
      process.stdout.write('  waiting 65s for the token window... ');
      await new Promise((r) => setTimeout(r, 65000));
      console.log('go');
    }
  }

  // ---- Report ----
  console.log(`\n${'='.repeat(70)}\nRESULTS — prompt ${SYSTEM_PROMPT_VERSION}, model openai/gpt-oss-20b`);
  console.log(`${'='.repeat(70)}`);
  console.log('Test | Known         | KAA           | Evaluation    | Tool | Sev | Time  | Live?');
  console.log('-----|---------------|---------------|---------------|------|-----|-------|------');
  for (const r of results) {
    const known = (r.known || '').replace(/\s+/g, ' ').slice(0, 13).padEnd(13);
    const tooSlow = r.durationMs && r.durationMs > PRODUCTION_TIMEOUT_MS;
    console.log(
      `  ${String(r.case).padEnd(2)} | ${known} | ${(r.kaa || 'FAILED').padEnd(13)} | ${(r.evaluation || '-').padEnd(13)} | ` +
      `${String(r.computedMark ?? '-').padEnd(4)} | ${String(r.seriousIssues ?? '-').padEnd(3)} | ` +
      `${(r.durationMs ? (r.durationMs / 1000).toFixed(1) + 's' : '-').padEnd(5)} | ${tooSlow ? 'TIMEOUT' : 'ok'}`
    );
  }

  const tooSlowCount = results.filter((r) => r.durationMs > PRODUCTION_TIMEOUT_MS).length;
  if (tooSlowCount) {
    console.log(`\n!! ${tooSlowCount} case(s) took longer than production's ${PRODUCTION_TIMEOUT_MS}ms limit.`);
    console.log('   They produced a mark here, but a real student would have seen a timeout.');
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(__dirname, 'test-runs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, `run-${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    ranAt: new Date().toISOString(),
    promptVersion: SYSTEM_PROMPT_VERSION,
    model: 'openai/gpt-oss-20b',
    results,
  }, null, 2));

  const failures = results.filter((r) => !r.ok).length;
  console.log(`\nSaved to ${path.relative(__dirname, outFile)}`);
  console.log(`${results.length - failures}/${results.length} returned a valid response.`);
  console.log('\nThe runner does NOT judge quality. Read the commentary and issues in the saved');
  console.log('JSON and score the judgements by hand against the known marks above.\n');
})();
