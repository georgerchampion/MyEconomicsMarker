# MyEconomicsMarker

An A-level Edexcel Economics A (9EC0) **25-mark essay marker**. A student picks
their paper and theme, pastes the exam question and their essay, and gets back
one structured critique grounded in the real Pearson mark scheme: a level, a
breakdown across the two marking components, specific issues found, and one
highest-leverage improvement.

Built during the MikaHari Labs Founder Residency (week of 10 August 2026).

## Who it's for

Three real A-level students, interviewed before anything was built:

- **Maxim** — teacher was slow to reply, so tried ChatGPT/Claude. An essay that
  genuinely deserved 25/25 came back marked 21, because a general model has no
  real mark scheme to anchor to and defaults to "solid but not exceptional".
- **Seb** — self-marked against a real mark scheme, but kept making valid points
  that weren't listed on it. Mark schemes are indicative, not exhaustive.
- **Luke** — teacher was marking the whole class; got "good, 22/25" and nothing
  about what would actually close the gap.

## How to run it

Requires Node 20 and a Groq API key.

```bash
git clone https://github.com/georgerchampion/MyEconomicsMarker.git
cd MyEconomicsMarker
echo "GROQ_API_KEY=your_key_here" > .env     # .env* is gitignored, never commit this
npx netlify dev
```

Then open the local URL Netlify prints. The key is read only inside the
serverless function — it never reaches the browser.

## How it works

1. **Browser** (`index.html`) — static HTML/CSS/JS, no build step, no API key.
   Sends one POST to `/.netlify/functions/mark-essay`.
2. **Server function** (`netlify/functions/mark-essay.js`) — checks a
   per-visitor rate limit, loads grounding text, builds the prompt, calls Groq
   server-side, validates the response shape, and sums the headline mark from
   the model's own component marks.
3. **Grounding** (`netlify/functions/lib/mark-scheme-loader.js`) — a four-tier
   hierarchy: question-specific mark scheme → examiner's report → the general
   25-mark banding grid → refuse rather than guess. Real Pearson source text
   lives in `netlify/functions/lib/mark-schemes/`.
4. **Prompt** (`netlify/functions/lib/system-prompt-v1.js`) — versioned, and
   the single source of truth for how the AI is told to mark.

Model: `openai/gpt-oss-20b` on Groq, temperature 0.2, strict Structured
Outputs so the JSON shape is enforced by the provider as well as by us.

## Documents

| File | What it is |
|---|---|
| `CLAUDE.md` | Project constitution — the hard rules, including what the tool must never do |
| `spec.md` | Who it's for, what goes in and out, what it will *not* do |
| `plan.md` | Architecture: what talks to what, where the key lives, failure points |
| `tasks.md` | The build task list, with an honest session log of what broke |
| `test-inputs.md` | Real essays with known marks, written down before the tool saw them |
| `decisions.md` | One line per real choice, and why |

## Testing without spending API quota

Type any of these anywhere in the essay box — they return before any Groq call
is made, so error handling can be tested for free:

| Type this | What happens |
|---|---|
| `simulateerror` | 500 server error |
| `simulatetimeout` | 504 after ~4s |
| `simulatemalformed` | 200 with unusable JSON |
| `simulateratelimit` | 429 rate-limit message |

## What's still broken or unfinished

Being honest here matters more than looking finished.

- **Not calibrated.** `CALIBRATED = false` in `mark-essay.js`, so no numeric
  mark is shown to anyone. Against the one essay with a confirmed real mark
  (24–25/25), runs have landed anywhere from Level 2 to Level 4. Until that's
  resolved, marks stay hidden by design.
- **Marking is not yet reproducible.** CLAUDE.md requires "the same essay
  marked twice gives the same answer". Temperature is pinned at 0.2 and a fixed
  `seed` is sent, but repeat runs of the identical essay have still produced
  materially different levels. Not yet diagnosed — `system_fingerprint` is
  logged to tell Groq-side backend drift apart from model non-determinism.
- **Only one theme is properly grounded.** Real question-specific material
  exists for June 2024 Paper 1 Q7 and Q8 only. Everything else falls back to
  the general banding grid, which has abstract level descriptors and no worked
  examples to anchor against — a likely contributor to the variance above.
- **The free-tier token ceiling is the binding constraint.** Groq's free tier
  allows 8000 tokens/minute for this model; a grounded prompt plus a real essay
  uses ~4,200, leaving barely enough for the model to think and answer. Fuller
  grounding physically does not fit. Raising `TPM_CEILING` after upgrading to
  Groq's Developer tier (free to enable) is the intended fix.
- **Rate limiting is in-memory**, so it resets on cold start and isn't shared
  across function instances. Fine for a five-person pilot; not a real defence.
- **Temporary debug code is still present** — `debugGroqDetail`,
  `debugSystemFingerprint`, an on-page debug box, and the per-visitor cap
  temporarily raised from 5 to 20. All are marked `TEMP` in the code and must
  be removed before real users are given the link.
- **Not done yet:** prompt-injection testing, a constitution rule-removal test,
  four of the five planned test inputs, and the full Thursday/Friday evaluation
  work (ten cases, a one-command test runner, an independent review).

## Not a certified grade

Output is an AI estimate against the mark scheme, not an Edexcel result.
Nothing typed in is stored beyond serving that one request, but it is sent to a
third-party AI service (Groq) — so don't paste personal or identifying
information.
