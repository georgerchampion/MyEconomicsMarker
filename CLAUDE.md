# Project constitution

## What this is
A single-page web app. A student selects a **paper and theme from a dropdown**
(Paper 1: Themes 1 & 3, or Paper 2: Themes 2 & 4 — Paper 3 synoptic is out of
scope this week, it needs a case-study extract this tool doesn't collect),
pastes the exam question and their written essay, and gets back one structured
critique. No accounts, no login, no saved history. Diagrams are handled as
**text only** — the student describes any diagram in words; the tool marks
only what was described and never penalises a diagram it wasn't shown.

## Built with
- Frontend: static HTML/CSS/JS, deployed on Netlify.
- Backend: a Netlify serverless function (Node 20) — the only place the AI
  call happens.
- AI: a single pinned Groq model, called server-side only, at a fixed low
  temperature (≤0.2) so the same essay marked twice gives the same answer.
  Name the exact model once chosen — "whatever's available" is not a
  decision.
- API key lives in `.env` locally (gitignored) and in Netlify's environment
  settings in production. Never in the repo, never in the client.
- No database unless a later task explicitly needs one.
- Output is structured JSON (mark, level, per-AO commentary, diagram errors,
  theory errors, structure errors, phrasing errors, improvement), not a text
  blob — the frontend renders fields, not prose it has to parse.

## Grounding — non-negotiable
Four source types, ranked by authority. More sources is not more precision —
each one added is something that must be hand-verified and something that
can disagree with the others. This ranking exists so the tool always knows
which source wins.

1. **Official question-specific mark scheme** (when the pasted question
   matches a real past paper) — decisive authority on marks.
2. **Examiner's report for that same question** — not for allocating marks,
   for the *why*: precise, specific feedback on what separated strong from
   weak answers.
3. **The general 25-mark banding grid** (KAA 16 + Evaluation 9, Level 1–4) —
   always loaded, the only thing used when a question has no exact past-paper
   match.
4. **Third-party content notes (e.g. PMT)** — walled off, used only to flag
   whether the economics *theory* is correct. Never used to allocate marks or
   override the mark scheme. **When sources disagree, the official mark
   scheme always wins — PMT is never allowed to override it.**

Real sourced example (June 2024, Paper 1, 9EC0/01): the question text,
official mark scheme, and examiner's report for Q7 (hotel/energy bills) and
Q8 (fragrance/contestability) are saved in the repo, extracted from Pearson's
own site and checked against the source. The general banding grid is saved
separately and applies to any 25-mark Section C question, matched or not.

- The theme and paper are **selected by dropdown, never guessed from the
  pasted question.** Free-text detection is a real failure point: misread the
  theme and you grade against the wrong grid, which breaks the one thing this
  rule exists to prevent.
- Marking follows Edexcel's actual model: a **holistic level**, not additive
  AO sub-scores. The AO-by-AO commentary is diagnostic writing derived
  *after* landing on a level — never independent AO points invented to look
  plausible.
- **Tell the student which confidence tier was used**: matched to a specific
  real past-paper mark scheme, or marked against the general grid only with
  no exact match found. Never blend the two silently.
- Never invent, cite, or "correct" real-world statistics or case studies the
  student didn't write — judge how well they used what they wrote, not
  whether it's factually true.
- Never apply mark schemes, AOs, or conventions from a different exam board
  (AQA, OCR) or a different paper/theme than the one selected.
- Paraphrase mark scheme wording in the output rather than reproducing
  Pearson's copyrighted text verbatim at length.
- If no mark scheme text (specific or general) is loaded for the
  paper/theme, refuse to mark rather than guess.

## What the agent must do
- Give a level tied explicitly to the level-grid language for that
  paper/theme, translated into a mark. On a genuine boundary case, say so
  plainly — "high Level 3 / low Level 4, because…" — rather than forcing a
  falsely tidy number.
- Give diagnostic AO commentary derived from the level awarded.
- Flag any error in economic theory or diagram logic the essay itself
  contains, using only what the student wrote or described.
- Give one specific, highest-leverage improvement, tied to an exact sentence
  or paragraph — never generic advice that could apply to any essay.

## What the agent must never do
- Never show a numeric mark until it's been checked against essays with a
  known, agreed mark. Until then, show "not yet calibrated."
- Never soften a genuinely weak essay into inflated praise, or hedge a
  genuinely full-mark essay downward to "sound safe." If it's a 25/25, say
  25/25.
- Never phrase output as a guaranteed or certified grade — state plainly it's
  an AI estimate against the mark scheme, not an Edexcel result.
- Never log or store the pasted question or essay text beyond serving that
  one request.
- Never skip input validation — if the question or essay field is empty,
  refuse clearly rather than guessing what was meant.

## Guardrails
- Rate-limit requests per visitor in a short window — no login means a
  single visitor could otherwise drain the API key.
- Every input has a visible label, everything works by keyboard alone, text
  is readable against its background.

## Definition of done
A task is done when: it matches the rules above rather than contradicting
them, it's been tried by hand (not just "looks right"), any mark-scheme
citation can actually be found word-for-word in the source file, and a
boundary-level essay produces an explicit boundary answer rather than a
falsely confident single number.
