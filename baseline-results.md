# Baseline results — Thursday 2026-08-18

> **CORRECTIONS FOLLOWING INDEPENDENT REVIEW (2026-08-18).** A fresh session of
> a different model reviewed this file, the test cases and the code, with no
> knowledge of the project. It identified several places where this document
> stated hypotheses as findings. Those are corrected in place below and listed
> here so the error is visible rather than quietly edited away:
>
> 1. **The ranking claim is not valid evidence.** The five essays answer five
>    different questions and were marked by three different people. Comparing
>    them as points on one scale — which this document did repeatedly — assumes
>    a 22 on one question is objectively better than a 21 on another. It isn't
>    established. Rank comparisons are only meaningful *within* the same
>    question, which this dataset cannot support.
> 2. **"Regression to the mean" was the wrong term.** The correct description is
>    **score compression / central-tendency bias**. The observation stands; the
>    statistical label was wrong.
> 3. **The fluency-bias explanation is a HYPOTHESIS, not a finding.** Luke
>    scoring above NMW is observed. The claim that fluent prose *causes* it is
>    not demonstrated — the essays differ in question, topic, author, marker,
>    length and transcription completeness. See the designed experiment below.
> 4. **The fingerprint evidence was overstated.** Different `system_fingerprint`
>    values show backend configuration varies. They do not prove that variation
>    caused the score variance. The defensible claim is narrower: identical
>    inputs produced materially different outputs despite fixed temperature and
>    seed — empirical non-reproducibility, cause unestablished.
> 5. **Averaging flatters the tool.** Per-essay means across six runs are
>    reported below, but a real student receives ONE draw from that spread. The
>    single-call figures are what the product actually delivers.
> 6. **Human marks are reference labels, not ground truth.** One examiner range
>    and several teacher marks, no double-marking. If two teachers would place
>    an essay at 20 and 22, a model saying 20 is not "wrong by 1". There is
>    currently no measure of human disagreement to compare against — so there is
>    no denominator for what "good" would mean.
> 7. **"The written feedback is genuinely useful" is unevidenced.** It was
>    asserted, never measured. No teacher has rated the issues raised, and
>    false-positive/false-negative rates for flagged issues are unknown.
>
> The review's central verdict is accepted: this project is currently much
> stronger as an investigation into *why* LLM essay marking fails than as
> evidence of a working marker.

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

## The model A/B — gpt-oss-120b, same five essays, same prompt

Run with `GROQ_MODEL=openai/gpt-oss-120b node run-tests.js`. One run only.

| Test | Known | 20b (4 runs) | 120b | 120b error |
|---|---|---|---|---|
| 1 Maxim | 24–25 | 18, 19, —, 17 | **19** (11/16, 8/9) | −5 to −6 |
| 2 Seb | 21 | —, 8, 13, 16 | **23** (15/16, 8/9) | +2 |
| 3 Carbon | 22 | 17, 17, —, — | **22** (14/16, 8/9) | **0** |
| 4 NMW | 19–20 | 17, 15, 15, 18 | **16** (11/16, 5/9) | −3 to −4 |
| 5 Luke | 18 | 20, —, 18, 19 | **21** (14/16, 7/9) | +3 |

### What clearly improved

**Reliability: 5/5.** No timeouts, no schema failures, no truncation. Against
73–75% on 20b across four runs. This alone changes what Friday looks like.

**The regression to the mean is gone.** 20b returned exactly 10/16 for KAA in
eleven of fifteen markings. 120b returned 11, 15, 14, 11, 14 — it is now
actually discriminating between essays rather than parking in the middle.

**Mean absolute error roughly 2.8 marks, down from ~3.75.** And one essay
(Carbon) landed exactly on its known mark of 22.

**Speed was not the problem it was predicted to be.** 3.2–3.8s, comfortably
inside the 6,500ms production timeout, and *more consistent* than 20b (which
ranged 1.6–5.9s). The earlier assumption that 120b would be too slow for
Netlify's free plan was wrong — worth recording, since it was the original
reason for choosing 20b on Tuesday.

### What did NOT improve

**The ranking is still wrong.** Tool order: Seb 23 > Carbon 22 > Luke 21 >
Maxim 19 > NMW 16. Known order: Maxim 24–25 > Carbon 22 > Seb 21 > NMW 19–20 >
Luke 18. Only Carbon sits in the right place.

**Maxim is still the core failure.** The essay this entire project exists
because of — an examiner-confirmed 24–25 that ChatGPT marked 21 — is now marked
**19**, and ranked *fourth of five*. The tool rates Luke's truncated 18/25 essay
higher than it. On the specific problem the product was built to solve, 120b
has not fixed it.

**The compression flipped rather than resolved.** 20b under-marked everything
toward the middle. 120b now over-marks weak essays (+2, +3) while still
under-marking the best (−5). The range is still compressed; the bias moved.

### Repeated: three 120b runs

| Test | Known | Run A | Run B | Run C | Spread |
|---|---|---|---|---|---|
| 1 Maxim | 24–25 | 19 | 22 | *429* | 19–22 |
| 2 Seb | 21 | 23 | 23 | 16 | 16–23 |
| 3 Carbon | 22 | 22 | 22 | 19 | 19–22 |
| 4 NMW | 19–20 | 16 | 16 | 19 | 16–19 |
| 5 Luke | 18 | 21 | 21 | 19 | 19–21 |

**Runs A and B returned identical marks on four of five essays** (23, 22, 16,
21 both times). That is by far the most stable behaviour observed all week —
20b never repeated a single essay's mark exactly. Run C diverged more, so
120b is steadier, not steady.

**Reliability across three runs: 14/15.** The single failure was a 429 caused
by starting one run immediately after another, i.e. the test runner's pacing,
not the product. Against 11/20 on 20b.

**Mean absolute error ≈2.4 marks** (best run 2.2), versus ≈3.8 on 20b.

### The error that survives both models

Two essays are consistently misplaced, in the same direction every time:
- **NMW (known 19–20) marked 16, 16, 19** — pushed down.
- **Luke (known 18) marked 21, 21, 19** — pushed up.

They are ranked in the wrong order relative to each other in every single run,
on both models. That is systematic, not noise, and it is worth investigating on
its own: Luke's essay is the truncated one, so the tool rates an incomplete
answer above a complete one. A plausible reading is that the tool rewards
fluent, confident, well-signposted writing over the substance underneath —
which would be a meaningful finding about what AI marking actually measures.

### Decision: switching the default to gpt-oss-120b

Better on every axis measured — reliability, discrimination, accuracy — and the
speed objection that drove the original choice turned out to be wrong.

**What this does NOT fix:** the ranking. Maxim (24–25) still lands 19–22, and
the Luke/NMW inversion persists. The calibration gate stays shut.

**New constraint introduced:** one essay took 6.5s, exactly the production
timeout. 120b is fast enough on average but has less margin than 20b did, so
Netlify's 10s limit is now the binding constraint rather than a comfortable one.

## Five 120b runs — the settled picture

| Test | Known | A | B | C | D | E | Pattern |
|---|---|---|---|---|---|---|---|
| 1 Maxim | 24–25 | 19 | 22 | *429* | 23 | 22 | 19–23, **consistently ~2–3 under** |
| 2 Seb | 21 | 23 | 23 | 16 | 22 | 19 | 16–23, **the noisiest by far** |
| 3 Carbon | 22 | 22 | 22 | 19 | 22 | *timeout* | 19–22, **most accurate** |
| 4 NMW | 19–20 | 16 | 16 | 19 | 16 | 16 | **16 four times out of five — a stable −3.5 bias** |
| 5 Luke | 18 | 21 | 21 | 19 | 19 | 19 | **19–21, consistently 1–3 OVER** |

Best run: mean absolute error 1.4 marks. Typical: ~2.5.

### The one error that never goes away

**Luke is marked above NMW in every single run, on both models.** Known marks
put NMW (19–20) three marks above Luke (18). Luke's essay is also the one whose
transcription is **cut off mid-sentence**, so the tool is rating an incomplete
answer above a complete one, consistently, with no exceptions across nine runs.

Read together with NMW's stable −3.5 and Luke's stable +1 to +3, the most
plausible explanation is that the tool rewards **fluent, confident, well-signposted
prose** over substantive completeness. Luke's writing is clean and reads
authoritatively; the NMW essay is denser, uses more compressed notation and is
harder to follow, while actually containing more creditable economics. That is a
real and quite specific finding about what this kind of AI marking measures, and
it is arguably more interesting than the mark accuracy itself.

## Finding 8 — 120b has occasional severe latency stalls

Run E: Test 3 took **38.4 seconds**. The same essay completed in 3.2–4.5s on
every other run. This was a Groq-side stall, not a code path — but a real
student would have seen a timeout, and the runner's `Live?` column correctly
flagged it.

This matters more than a mark being two off. Production's ceiling is 6,500ms
(set by Netlify's 10s function kill), so a stall of this size is a guaranteed
user-facing failure. It is rare — one occurrence in twenty-five 120b calls —
but it is not something retries or prompt changes can prevent, and it means
**"it works reliably" cannot be claimed without the caveat "except when Groq
stalls, roughly 4% of the time."**

The retry logic does not help here by design: retrying a timeout guarantees
breaching the platform limit.

## Six 120b runs — the settled, final picture

| Essay | Known | All 120b results | Mean | Spread |
|---|---|---|---|---|
| 1 Maxim | 24–25 | 19, 22, —, 23, 22, 16 | ~20.4 | **16–23 (7 marks)** |
| 2 Seb | 21 | 23, 23, 16, 22, 19, 21 | ~20.7 | 16–23 (7 marks) |
| 3 Carbon | 22 | 22, 22, 19, 22, —, 18 | ~20.6 | 18–22 |
| 4 NMW | 19–20 | 16, 16, 19, 16, 16, 16 | **16.5** | 16–19 |
| 5 Luke | 18 | 21, 21, 19, 19, 19, 19 | **19.7** | 19–21 |

### The finding that settles it

**The tool cannot distinguish the top three essays.** Maxim (24–25), Carbon (22)
and Seb (21) all average ~20.5. Their real marks span 3.5 marks; the tool's
averages span 0.3. Whatever it is measuring, it is not what separates a strong
essay from an excellent one.

**The two it does separate, it separates backwards.** NMW sits reliably ~3.5
marks too low, Luke reliably ~1.7 too high, in every run, on both models.

**Range compression, quantified.** Known marks span 18 to 24.5 (6.5 marks).
The tool's per-essay means span 16.5 to 20.7 (4.2 marks) — and in the wrong
order. This is regression to the mean surviving a model upgrade that otherwise
fixed a great deal.

**An earlier single run showed a mean error of 1.4 marks.** It was the fortunate
end of the spread, not progress. Recording it here specifically because it is
exactly the kind of result that would be tempting to quote and dishonest to
rely on — the same essay scored 16 two runs later.

### Latency is drifting toward the ceiling

Durations across runs: 3.2s, 3.6s, 4.1s, 4.9s, 5.5s, 7.1s, and one 38.4s stall.
Two runs have now exceeded production's 6,500ms limit. The variance is
Groq-side and not controllable from here.

### What this means for the product

The calibration gate must stay shut, and on this evidence it should stay shut
permanently unless something structural changes (exemplar anchoring, which the
free tier's token ceiling blocks, or a materially better model).

The honest product is: **level plus written critique, no numeric mark**, with a
plain statement of why. The written feedback is genuinely specific and useful —
it quotes the student's own sentences and identifies real weaknesses. The number
is the part that cannot be trusted, so the number is the part that goes.

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
