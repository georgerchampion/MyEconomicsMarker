# Plan: Edexcel A-Level Economics A — 25-Mark Essay Marker

Layout chosen: Mockup 2 (GradeGrid dashboard).

*Updated Wednesday — the sections below marked "as built" replace Monday's
original guesses now that Tuesday's real implementation has confirmed them.
Nothing here is invented after the fact; each change is what section D/E's
actual code does, cross-checked against tasks.md's decision log.*

## What talks to what
1. **Browser** (static HTML/CSS/JS on Netlify). Student picks paper + theme
   from dropdowns, pastes the question, the essay, and an optional diagram
   description. No AI key exists anywhere in this layer.
2. On submit, the browser sends one POST request (paper, theme, question,
   essay, diagram description) to a Netlify serverless function, at
   `/.netlify/functions/mark-essay` (confirmed as-built, not just planned).
3. The **server function** (Node 20) first checks a per-visitor request cap
   (in-memory, 5 requests/10 minutes — section E), then loads grounding text
   via the four-tier hierarchy in `mark-scheme-loader.js` (specific mark
   scheme → examiner's report → general grid → refuse if none of that
   exists), builds the system prompt (`system-prompt-v1.js`: the
   constitution's grounding rules + the loaded grounding text) and the user
   message (question + essay + diagram description), and calls Groq
   server-side using the key from `process.env.GROQ_API_KEY` — never from
   anything sent by the browser.
4. Groq returns a completion, constrained by a strict JSON schema (Groq's
   Structured Outputs, `strict: true`) so the shape is enforced by Groq
   itself. The server function still validates the shape again anyway —
   never trust a "guaranteed" response blindly — and sums the two component
   marks into the headline mark itself, rather than trusting the model to
   state a consistent top-line number.
5. The browser renders those fields into the dashboard layout. Nothing is
   saved anywhere after the response is sent. **One rule not in Monday's
   plan:** per CLAUDE.md's "never show a numeric mark until calibrated,"
   every number is currently replaced with "Not yet calibrated" in the UI
   until section F's calibration passes — the mark is still computed and
   sent, just not displayed to a visitor yet.

## Output shape — corrected from Monday's draft
Monday's draft said the server returns "level, mark, **AO commentary**,
diagram/theory/structure/phrasing errors, improvement." That was wrong in a
way that would have contradicted this project's own constitution rule
("holistic level, not additive AO sub-scores") — it was caught and fixed
during Tuesday's build, before any real prompt was written around it. What's
actually returned: an overall level description, exactly **two** holistic
components (Knowledge/Application/Analysis out of 16, Evaluation out of 9 —
each with its own level and commentary), a list of issues each tagged with
both a category (diagram/theory/structure/phrasing) and a severity
(serious/quality), one improvement, and the confidence tier + source note
that says which grounding was actually used.

## Determinism — the rule this document was missing
Temperature is fixed at exactly **0.2** on every real Groq call (CLAUDE.md's
rule: "same essay marked twice gives the same answer"). This was already
true in the actual code from the day it was written, but this document never
said so explicitly until now — flagged by George, and this is the fix.

**Update (Wednesday, calibration session):** temperature alone did not
deliver on this promise in practice — three back-to-back runs of the exact
same essay/settings during calibration returned meaningfully different
levels (see tasks.md's Section F log). A `seed` parameter has been added as
a best-effort mitigation (Groq documents it as not guaranteed), and
`system_fingerprint` is now logged so backend drift can be told apart from
genuine model non-determinism. Not yet fully resolved — see tasks.md.

## Where the key lives
- Local dev: a `.env` file, gitignored, read by the Netlify Dev CLI.
- Production: the Netlify site's own environment variable settings, injected
  into the function at runtime.
- The key is only ever read inside the serverless function file — never
  imported into anything that ships to the browser.

## What user data crosses each boundary
- **Browser → server:** paper, theme, question, essay text, optional diagram
  description. This is the one place personal information could leak in if a
  student pastes their name into the essay — the on-screen notice (already in
  the constitution) needs to warn against that.
- **Server → AI provider:** the same content, plus the mark scheme text and
  system prompt. This is the one sentence that has to be visible on the page:
  what's typed is sent to a third-party AI service and isn't stored.
- **Server → browser:** only the structured critique — never the raw provider
  response, error internals, or the mark scheme text reproduced verbatim
  (copyright reason, already in the constitution).
- Nothing is written to a database. A request-level log line (time, model,
  prompt version, success, duration) is fine — the essay content itself is
  never logged.

## Most likely failure point
Confirmed correct on Tuesday, not just predicted: it was the **mark scheme
lookup**, now the full four-tier grounding hierarchy in
`mark-scheme-loader.js`. Tested deliberately — a mismatched paper/theme for
a known question is correctly refused, and a theme with no exact-match
question correctly falls back to the general grid rather than guessing.
Two *other* real failures showed up that this section didn't predict, both
fixed the same day: Groq rejected the request outright the first time it
was tried live, because the JSON schema used `minItems`/`maxItems` (not a
documented Groq Structured Outputs keyword), and separately the request was
missing the `strict: true` flag that turns on Groq's actual guarantee. Both
only surfaced by testing against the real API — no amount of reading the
docs first would have caught them, which is exactly why "tried by hand, not
just looks right" is in CLAUDE.md's own definition of done.

**Update (Wednesday, calibration session):** several more real failures
surfaced only by running the actual calibration essay (Maxim's) through the
live pipeline — none of them predictable from reading the code:
- `openai/gpt-oss-20b` is a reasoning model; its hidden reasoning tokens
  count against `max_completion_tokens`, and Groq's default (1024) was too
  small for this essay's grounding + response size, causing silent
  `json_validate_failed` 400s with an empty `failed_generation`.
- Fixing that by raising `max_completion_tokens` and dropping
  `reasoning_effort` to `'low'` traded away marking quality — the same essay
  came back Level 2 across both components against a real 24-25/25.
- Raising `max_completion_tokens` further to compensate then hit Groq's free-
  tier 8000 tokens/minute cap (413), because "requested tokens" counts the
  full completion budget requested, not actual usage.
- The model was also flagging normal essay-writing convention (topic
  sentences, mentions of "the diagram below" with no diagram given) as real
  errors — a prompt-clarity bug, not a model-settings bug.
See tasks.md Section F for the full blow-by-blow and current status.

## What I wasn't certain of on Monday — resolved now
Monday's plan correctly refused to guess at these; here's what checking
actually found, done Tuesday via live docs lookups rather than memory:
- Groq's endpoint is confirmed as `https://api.groq.com/openai/v1/chat/completions`,
  OpenAI-compatible.
- The model is pinned: **`openai/gpt-oss-20b`**, not a guess. The models
  this project's earlier research assumed (`llama-3.1-8b-instant`,
  `llama-3.3-70b-versatile`) turned out to be scheduled for imminent
  retirement, caught by checking `console.groq.com/docs/models` fresh
  rather than trusting anything memorised. `gpt-oss-20b` was chosen over
  the larger `gpt-oss-120b` specifically because Netlify's free-plan
  10-second function timeout favours the faster model — `120b` is worth
  re-testing for quality only if the Netlify plan is upgraded past that
  ceiling.
- Groq's free tier: roughly 30 requests/minute and up to 14,400/day
  (varies by model) — confirmed via Groq's own docs, not assumed. This
  project's own request cap (section E: 5 per visitor per 10 minutes) is
  deliberately far more conservative than Groq's own ceiling, since the
  goal is protecting one shared key from one runaway browser tab, not
  maximising throughput. **Correction (Wednesday):** the 30 req/min figure
  is not the binding constraint for `openai/gpt-oss-20b` specifically — its
  free-tier TPM (tokens per minute) cap of 8000 is what was actually hit
  during calibration testing, well before the request-count cap.
- The architecture has now actually been run against the real Netlify
  project, end to end, with a real essay, live — not just planned.

## Definition of "it works" — extended
A question and essay posted through the real deployed URL return a
structured critique that traces to the actual mark scheme file, in a few
seconds, with the key visible nowhere in the browser, the network tab, or
the repo. **As of section D, one more condition applies:** until section F's
calibration is complete, "it works" does NOT yet mean "the mark shown is
correct" — no mark is shown to a visitor at all yet, by design, until it's
been checked against a real, known-correct essay.
