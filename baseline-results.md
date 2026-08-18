# Baseline results — Thursday 2026-08-18

The first honest measurement of this tool. Five real essays with known marks,
run in one command via `run-tests.js`, prompt v1, model `openai/gpt-oss-20b`.
Raw output saved in `test-runs/run-2026-08-18T11-39-38-946Z.json`.

Nothing was tuned in response to these numbers before recording them.

## Run 1

| Test | Essay | Known mark | Tool KAA | Tool Eval | Tool total | Error | Time |
|---|---|---|---|---|---|---|---|
| 1 | Interest rates (Maxim) | 24–25 (examiner) | L3 (10/16) | L3 (8/9) | 18 | **−6 to −7** | 3.3s |
| 2 | Monopoly efficiency (Seb) | 21 (teacher) | FAILED — timeout | — | — | — | 6.5s |
| 3 | Carbon emissions | 22 (teacher) | L3 (10/16) | L3 (7/9) | 17 | **−5** | 3.6s |
| 4 | NMW / social care | 19–20 (teacher) | L3 (10/16) | L3 (7/9) | 17 | −2 to −3 | 1.6s |
| 5 | Globalisation (Luke) | 18 (teacher) | L4 (14/16) | L3 (6/9) | 20 | **+2** | 3.5s |

## Finding 1 — the ranking is inverted, which is worse than being inaccurate

Known order, strongest to weakest: **Maxim 24–25 > Carbon 22 > Seb 21 > NMW 19–20 > Luke 18.**
Tool order: **Luke 20 > Maxim 18 > Carbon 17 = NMW 17.**

The weakest essay in the set scored highest; the strongest scored second. A
marker that reads consistently low but ranks correctly is useful and
correctable — you could adjust a known offset. A marker that inverts the order
is not, because there is no correction that fixes it.

Worse, Luke's essay is the one whose transcription is **cut off mid-sentence**
at a page break, so the tool saw *less* of it than the teacher did and still
awarded it the highest mark.

## Finding 2 — regression to the mean, the exact failure this project exists to fix

Tests 1, 3 and 4 all received **identical KAA marks of 10/16**, despite their
teachers awarding 24–25, 22 and 19–20 respectively. Evaluation clusters just as
tightly: 8/9, 7/9, 7/9, 6/9 — a spread of two marks across essays spanning
seven marks of real quality.

This is precisely what happened to Maxim with ChatGPT: a genuinely excellent
essay marked 21 because the model defaulted to a plausible middle. The tool is
currently reproducing the failure it was built to prevent. Grounding it in the
real mark scheme has not, on its own, stopped that.

## Finding 3 — non-determinism is structural, not a prompt problem

Every call returned a different Groq `system_fingerprint`:
`fp_8e23cedc90`, `fp_8b41efc9a3`, `fp_9340e7d14d`, `fp_9b8528b477`.

Groq routes each request to a different backend. Temperature 0.2 and a fixed
`seed` cannot overcome that. This confirms independently what Wednesday's
repeated runs suggested, and it retrospectively invalidates most of Wednesday's
prompt tuning: each change was judged on a single run against noise of roughly
±3 marks. Luke's essay scored L3/L2 on Wednesday and L4/L3 today — same essay,
same prompt family, different answer.

## Finding 4 — one essay is too slow for the live site

Test 2 (Seb) exceeded the 6,500ms production timeout and returned nothing. It
is not a marking failure but a real user-facing one: on Friday, Seb would have
watched his own essay spin and fail. Note the timeout is set at 6,500ms because
Netlify's free plan hard-kills functions at 10s, so this cannot simply be
raised without moving to a paid plan.

## What this means for the calibration gate

`CALIBRATED = false` is unambiguously correct and stays. Had marks been shown,
Maxim would have been told 18 for an essay an examiner gave 24–25 — a worse
error than the 21 from ChatGPT that started this whole project.

## What is NOT yet known

Whether these errors are stable bias or noise. One run cannot distinguish them.
The immediate next step is to re-run the identical set two more times with no
changes, which the runner now makes cheap, and compare. If Test 1 lands 18, 22
and 15 across runs, the problem is variance. If it lands 18, 18, 18, the
problem is systematic under-marking — a completely different fix.

Measure before changing anything. Wednesday was lost to fixing before measuring.
