# Spec: Edexcel A-Level Economics A — 25-Mark Essay Marker

## Who it's for
A-level Economics A students revising for Edexcel Paper 1 or Paper 2, who need
their 25-mark essay marked and can't get that fast or accurately today.
Three named cases from real interviews:

- **Maxim** — last needed an essay marked a month ago. Went to his teacher
  first (slow/no reply), then tried ChatGPT/Claude directly. Wrote an essay
  that genuinely deserved 25/25; got marked 21, because the model had no real
  mark scheme to anchor to and defaulted to a plausible-sounding "solid but
  not exceptional" guess.
- **Seb** — self-marked against a real mark scheme, but kept making valid,
  correct points that simply weren't listed on it. Mark schemes are
  indicative, not exhaustive — so he had no way to tell whether his niche
  points were creditable or not, and no way to check.
- **Luke** — his teacher was flooded with essays from the whole class and
  could only give minimal feedback: "good," "22/25," nothing on what would
  actually close the gap to 25/25.

## What's annoying today
Three different failure modes, all ending in the same place — no fast, honest
answer:
1. Generic AI marking regresses to the mean (Maxim: 25/25 marked as 21).
2. Real mark schemes are indicative, not exhaustive, so self-marking hits a
   wall on genuinely correct points that aren't listed (Seb).
3. Teachers are accurate but bottlenecked — real feedback exists but arrives
   too thin and too slow to actually close the gap (Luke).

## What's better afterwards
- vs. Maxim: marking anchored to the real Edexcel level grid, so a genuinely
  full-mark essay is graded as one.
- vs. Seb: the tool must judge whether an unlisted point is still creditable
  against the actual AO/level descriptors (valid economic reasoning that
  meets the standard), not just pattern-match against a fixed list — and say
  clearly why. **This is a real spec gap raised by his interview — flag it in
  the gap-hunting pass, it changes the grounding rule.**
- vs. Luke: every result includes one specific, highest-leverage change that
  names exactly what closes the gap to 25/25 — not "good," not a bare number.
- All three: an answer in the time it takes to paste an essay, not days.

## In, and out
**In (one submission, nothing saved):**
- Paper: Paper 1 or Paper 2 (dropdown)
- Theme: dependent dropdown (Themes 1 & 3 for Paper 1, Themes 2 & 4 for Paper 2)
- The exam question, pasted
- The essay, pasted
- Optional: a plain-text description of any diagram referenced (no image
  upload this week)

**Out (one structured critique, per the constitution's fixed fields):**
- Level and mark (or "not yet calibrated" if shown before calibration is
  done — see constitution)
- AO-by-AO diagnostic commentary, derived from the level awarded
- Diagram errors (only for diagrams actually described)
- Economic theory errors
- Structural errors
- Phrasing errors
- One specific, highest-leverage improvement, tied to an exact sentence

## What it will not do
- Will not cover Paper 3 (synoptic) — no case-study extract is collected this
  week.
- Will not mark against AQA, OCR, or any board other than Edexcel.
- Will not accept an uploaded photo or drawing of a diagram — description in
  words only.
- Will not create accounts, logins, or save any essay or question after the
  request finishes.
- Will not keep chat history or allow follow-up turns — one paste in, one
  critique out.
- Will not mark questions of any length other than the 25-mark essay format.
- Will not batch-mark multiple essays in one request.
- Will not rewrite or redraft the student's essay for them.
- Will not check or correct real-world facts/statistics the student cited —
  only whether they used what they wrote well.
- Will not show a numeric mark until it has been checked against essays with
  a known, agreed mark (see constitution).
- Will not claim to be an official or guaranteed Edexcel grade.

## Three things that must be true for this to count as finished
1. A student can pick a paper and theme, paste a question and essay, and get
   a structured critique back on the live public URL — not just on a laptop.
2. Every mark and every criticism can be traced to an actual quote from the
   loaded mark scheme file for that paper/theme — open the file, find the
   words, they're really there.
3. Run against the calibration set (starting with Maxim's real 25/25 essay),
   the tool does not repeat the regression-to-the-mean failure that sent
   people looking for this in the first place — a genuinely full-mark essay
   is not marked down to "sound safe."

## Your five people
Maxim, Seb, Luke, plus two more to confirm for Friday.
