# Decisions record

One line per real choice, and why. "Chose X over Y because…"
Kept in commit order so the reasoning can be traced against the code.

## Scope and product shape
- **Edexcel Economics A (9EC0) only, 25-mark Section C essays only** — over any
  broader "essay marker". A narrower target means the grounding can be real
  and checkable; a general marker would have had to invent criteria.
- **Paper 3 (synoptic) excluded** — it needs a case-study extract this tool
  doesn't collect, so marking it would mean guessing at context.
- **Paper and theme chosen by dropdown, never inferred from the pasted text** —
  free-text detection was judged the single most likely way to grade against
  the wrong grid, which is the exact failure the tool exists to prevent.
- **Diagrams handled as text only, no image upload** — image marking is a
  much larger problem; describing in words keeps one week's scope honest.
- **No accounts, no database, no saved history** — nothing is stored beyond
  serving one request, so there's no personal data to protect or leak.

## Marking model
- **Holistic level first, then a mark within that level** — over four additive
  AO sub-scores. The original mockup showed AO1-AO4 percentage bars; that
  contradicted how Edexcel actually marks and was corrected before any real
  prompt was written around it.
- **Exactly two components (KAA /16, Evaluation /9)** — matches the real mark
  scheme's own structure.
- **The headline mark is summed server-side from the two component marks** —
  the model is never asked for a top-line number, so it cannot state a total
  inconsistent with its own components.
- **Four-tier grounding hierarchy** (specific mark scheme > examiner's report
  > general banding grid > third-party notes for theory-checking only) — added
  because more sources is not more precision; the ranking exists so conflicts
  have a defined winner.
- **Refuse to mark rather than guess when no grounding is loaded** — a wrong
  mark delivered confidently is worse than no mark.

## The calibration gate
- **`CALIBRATED = false` hides every number until the tool has been checked
  against a real essay with a known mark** — chosen over showing marks with a
  disclaimer. The mark is still computed and returned (calibration needs it)
  but never displayed. This has repeatedly proven its worth: several runs
  produced marks that would have been badly wrong to show.

## Technical
- **Groq model pinned to `openai/gpt-oss-20b`** — over `gpt-oss-120b`
  (roughly 2x slower, risked Netlify's 10s function timeout) and over
  `llama-3.1-8b-instant` / `llama-3.3-70b-versatile`, which live docs showed
  were being retired. Chosen for strict Structured Outputs support plus speed.
- **Temperature fixed at 0.2, plus a fixed `seed`** — aiming at "same essay
  marked twice gives the same answer". NOTE: this has NOT been achieved in
  practice — see the honest limitations section in tasks.md.
- **Groq's Structured Outputs with `strict: true`, AND our own shape
  validation afterwards** — never trust a "guaranteed" response blindly. The
  second check has caught real malformed responses.
- **`minItems`/`maxItems` removed from the response schema** — not a
  documented Groq Structured Outputs keyword; including it made Groq reject
  the entire request with a 400. The "exactly 2 components" rule is enforced
  by our own validation instead.
- **In-memory per-visitor rate limit (normally 5 per 10 min), not a database**
  — CLAUDE.md rules out a database. Honest limitation: it resets on cold start
  and isn't shared across instances, so it stops one runaway browser, not a
  determined attacker with several devices.
- **Testing switches are magic words typed into the essay box**
  (`simulateerror`, `simulatetimeout`, `simulatemalformed`,
  `simulateratelimit`) — over query parameters, which would need URL editing
  and so wouldn't actually get used. They run before any Groq call, so error
  handling can be tested without spending quota.
- **Separate `dev` branch auto-deploying to its own Netlify URL** —
  production (`main`) is only updated deliberately. This is what let every
  bug below happen somewhere harmless.
- **Completion token budget computed per request rather than hardcoded** —
  four successive hardcoded values (6000, 4400, 4000, then two estimator
  versions) each broke as the prompt grew, because prompt text and answer
  space compete for the same ceiling. The chars-per-token ratio used is
  derived from Groq's own reported numbers in its 413 errors, not guessed.
- **Groq timeout cut from 8500ms to 6500ms** — Netlify's free plan kills a
  function at 10s, and a cold start (1-3s) plus an 8.5s wait exceeded that,
  so the platform's raw error page beat our own error message. 6500ms means
  our honest message always wins.
- **Output length capped in the prompt (max 3 issues, brief commentary)** —
  a truncated response is thrown away entirely, so a shorter guaranteed
  answer beats a longer one that sometimes fails.

## Prompt fixes that came from real observed failures
Each of these was a case of the tool being confidently wrong, found by
testing rather than by reading the code:
- **Diagram content narrated in the essay's own prose counts as a diagram
  description** — the user message previously said "(none given — do not
  assume or invent a diagram)" right beside the essay, which overrode the
  system prompt and made the model report a missing diagram for an essay that
  plainly describes its AD1→AD2 and Y1→Y2 shifts in the text. Nearest, most
  concrete instruction wins.
- **Normal topic sentences are not structure errors** — the model flagged
  "Another potential impact could be..." as a serious structural flaw.
- **The improvement must quote the essay and name real economics** —
  suggestions like "add topic sentences" or "add an introduction" were being
  given for essays that already had both, and this mark scheme awards nothing
  for formatting anyway.
- **`reasoning_effort` left at the default `medium`** — briefly set to `low`
  to save tokens, which caused a severe mis-mark (a known 24-25/25 essay
  scored Level 2 on both components). Reliability was not worth buying with
  accuracy.

## Still open / deliberately deferred
- **Not uploading more past papers yet** — the plan's own rule is to prove one
  theme end-to-end first. Also physically constrained: on the free tier the
  fuller grounding does not fit alongside a real essay within the token
  ceiling.
- **Groq Developer tier upgrade intended but not yet done** — free to enable,
  ~10x limits; it is the change that unlocks fuller grounding. `TPM_CEILING`
  in `mark-essay.js` is the single value to raise afterwards.
- **Temporary debug code still in place** (`debugGroqDetail`,
  `debugSystemFingerprint`, the on-page debug box, and the rate limit
  temporarily raised to 20) — all marked TEMP in the code and must be removed
  before any real tester uses the site.
