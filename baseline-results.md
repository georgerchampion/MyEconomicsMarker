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

## Runs 2 and 3 — same set, same prompt, nothing changed

| Test | Known | Run 1 | Run 2 | Run 3 | Spread |
|---|---|---|---|---|---|
| 1 Maxim | 24–25 | 18 | 19 | *429* | 18–19 |
| 2 Seb | 21 | *timeout* | 8 | 13 | 8–13 |
| 3 Carbon | 22 | 17 | 17 | *schema* | 17–17 |
| 4 NMW | 19–20 | 17 | 15 | 15 | 15–17 |
| 5 Luke | 18 | 20 | *schema* | 18 | 18–20 |

Component detail (KAA / Evaluation):

| Test | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| 1 Maxim | 10/16, 8/9 | 11/16, 8/9 | — |
| 2 Seb | — | 6/16, 2/9 | 10/16, 3/9 |
| 3 Carbon | 10/16, 7/9 | 10/16, 7/9 | — |
| 4 NMW | 10/16, 7/9 | 10/16, 5/9 | 10/16, 5/9 |
| 5 Luke | 14/16, 6/9 | — | 10/16, 8/9 |

## Finding 5 — the two components fail in DIFFERENT ways. This is the key result.

**KAA is biased and flat.** It returned exactly **10/16 in six of the nine
successful markings**, across essays a teacher separated by seven marks. It is
not varying much — it is stuck near the middle regardless of quality. This is
regression to the mean, and it is a systematic bias, not noise.

**Evaluation is noisy, not flat.** It swung 8/9, 2/9, 7/9, 5/9, 3/9, 8/9, 6/9.
On Seb's essay it gave 2/9 then 3/9; on Luke's, 6/9 then 8/9. The spread within
a single essay approaches the full range of the component.

These need opposite fixes. A flat, biased component needs better discrimination
— anchoring on what distinguishes a 10 from a 14. A noisy component needs
steadiness — repeat sampling, or a model that doesn't reroute every call. Any
single prompt change aimed at "accuracy" would have addressed at most one of
them, which is why Wednesday's tuning went nowhere.

## Finding 6 — under-marking is systematic at the top, accurate at the bottom

Maxim (24–25) → 18, 19. Carbon (22) → 17, 17. NMW (19–20) → 17, 15, 15.
Luke (18) → 20, 18.

The error grows with essay quality: roughly −6 on the best essay, −5 on the
next, −3 in the middle, and slightly *over* on the weakest. The tool compresses
the range — exactly the "sounds plausible, lands in the middle" behaviour that
gave Maxim a 21 from ChatGPT.

**Seb's essay is a separate outlier**: 8 and 13 against a known 21, plus one
timeout. It is the shortest essay (2,925 chars), contains the most garbled
transcription ("produce even AC and still make SNP (P−C×Q)"), and is the only
one to fail in three different ways. Worth investigating on its own rather than
lumping in with the trend.

## Finding 7 — reliability is 73%, which would be visible on Friday

Across three runs of five essays: **11 of 15 calls returned a valid mark.**
Four distinct failure modes, all real:
- **timeout** (>6.5s production limit) — run 1, Seb
- **truncated JSON** (`failed_generation` empty) — run 2, Luke
- **schema violation** — run 3, Carbon: the model returned an `issues[2].category`
  outside the allowed enum. Groq's strict mode correctly rejected it, but the
  whole request is lost rather than degrading. Notably this is strict Structured
  Outputs *working* — it caught a malformed answer — while still costing the user
  their result.
- **429 rate limit** — run 3, Maxim: the runner's 65s spacing is not enough when
  one run starts immediately after another; Groq reported 4,933 tokens still
  counted against the window.

With five real testers on Friday, roughly one in four attempts failing is not a
background detail — it is the first thing they would notice.

## Conclusion: bias AND noise, in different places

The question this set of runs was designed to answer — bias or noise — has the
answer **both, in different components**. KAA is systematically compressed
toward the middle; Evaluation is genuinely unstable. Plus a reliability problem
independent of either.

Priority order, following "steadiness first, accuracy second":
1. **Reliability** — retry transient failures so 73% becomes closer to 100%.
   This is a product fix, not prompt tuning, and it is measurable.
2. **Evaluation noise** — the component that swings most.
3. **KAA compression** — needs discrimination anchoring (worked exemplars of a
   10 vs a 14), which the free tier's token ceiling currently blocks.

The calibration gate stays shut. On these numbers Maxim would have been shown
18 for an essay worth 24–25 — worse than the ChatGPT result that started this.
