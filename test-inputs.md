# Test inputs — Edexcel A-Level Economics 25-Mark Essay Marker

Five real essays with a known-correct mark, written down BEFORE the product
ever sees them (Monday task 8). The "known correct mark" must come from a
real source — a teacher, an examiner, or your own check against the actual
mark scheme — never from an AI's guess. That substitution is exactly the
failure this whole project exists to fix.

## Test 1 — interest rates essay (Maxim)
**CORRECTION (Wednesday):** this slot previously described a different,
mislabelled essay (car subsidies) from an earlier session — that was wrong
and has been replaced with the real essay and real confirmed mark below,
caught by George when the pasted essay text didn't match the recorded
question.

**Paper/Theme:** Paper 2, Theme 2 (The UK economy: performance and policies)
— no exact past-paper match in the manifest, so this is a **general-only**
confidence-tier test case, which is itself useful: it's the tier most real
students will hit.
**Question:** "Assess the economic impacts of increasing interest rates in
the UK." (25 marks)
**Diagram description:** none recorded. The essay's own prose references a
diagram ("as can be shown on the diagram below") twice, but no text
description of what was actually drawn has been captured — the real
submission was hand-drawn on paper. Calibration runs against this test case
are therefore not a perfect stand-in for what the real examiner saw; treat
any diagram-related feedback from a run with no diagram field as untested
against the real essay, not confirmed right or wrong.
**Essay:**

Firstly one impact as a result of increasing interest rates could be reduced economic growth. For example, in 2024 in the UK, interest rates were hiked to 5% from 4.25% previously, in order to combat inflation, and as a reuslt economic growth decreased by -0.5%. Another example, could be in 2023 in South Korea, whereby economic growth decreased as a result of the interst rates rising from 1.25% to 3.5%. This is because higher interest rates means that the cost of borrowing is higher, and the reward from savings are higher as well. This would mean that consumers would be more willing to save their money, as they would receive more money back as interest, than spend their money in the economy. Furthermore, fewer people would choose to take out loans, as it would cost more money to pay them back. Both these factors therefore would lead to a decrease in consumption. Therefore, given that consumption is a component of AD (C+I+G+(X-M)) this would lead to a leftward shift in AD from AD1 to AD2, as can be shown on the diagram below. Therefore the negative economic growth can be seen as the decrease in national output from Y1 to Y2. Furthermore, with decreased consumption, firms would have decreased profits. This may mean that demand for labour would decrease, as with lower profits, then they may be forced to lay off workers. Therefore increased interest rates could lead to increased unemployment. This would further lead to an increase in savings and decreased consumption, which would thus again lead to reduced economic growth. Therefore, this shows how one impact of increased interest rates in the economy could be reduced economic growth.

However, the impact of the reduced economic growth may depend on consumer confidence. For example, while a relatively dated example, in 1960s, despite high interest rates, as a result of the boom in the economy, consumption still remained high despite high interest rates. This is because interest rates only increae the cost of borrowing, does not therefore reduced dispoable incomes of consumers. As a result, despite high interest rates, the GDK consumer confidence at the time was high, and without reduced disposable incomes, consumers continued spending in the economy. This therefore led to continued economic growth, socially that soley increasing interest rates may not lead to decreased economic growth in the economy.

Another potential impact of high interest rates on the economy could be reduced inflation. For example as stated earlier, the Bank of England in 2024 to combat high inflation decided to increase interest rates to 5%. Furthermore another example of high interest rates could be in the 1990s in the UK, where as a result of high inflation, interest rates were raised to nearly 15%. This therefore lead to not only decreased consumption, but also decreased business investment. If the confidence in the economy was low as a result of high inflation, and cost of borrowing becomes higher, businesses may choose to delay/postpone investment plans, as future profits would become more uncertain. Therefore, as stated earlier, given investment is a component of AD, this would lead to AD shifting leftwards from AD1 to AD2. As a result the price level, the average price for goods and services in the economy would decrease from P1 to P2, showing how another effect of interest rates could be reduced inflation. Moreover, high interest rates can increase hot money flows between countries. For example, as stated earlier, when the UK's base rate was at 15%, the USA's at the same was only at 9%. Therefore, this could increase incentive for foreign firms to choose to save money in UK accounts, as they would get more return on their savings. This therefore would lead to demand for the pound increasing from D1 to D2, as can be shown on the diagram below, thus leading to an increase in price of the pound in dollars from P1 to P2. Thereore, this shows how an impact from increased interest rates can cause the value of the pound to appreciate. This would make it more expensive for countries who import goods into the UK to do so, thus meaning that UK exports would decrease. This would further contribute to a leftward AD shift, as net trade is a component of AD. Again with reduced AD, this would lead to reduced inflation in the economy, showing how an impact from increased interest rates could be a lower rate of inflation.

However, the real impact of reduced inflation must depend on the original cause of inflation. While if inflation is demand pull, then interest rates can be used to reduce consumer spending and business investment meaning that the inflation can be combatted, this may not be the case if the cause of inflation is cost push. For example in 2022, the UK experienced inflation rates of over 10% as a result of the Russia-Ukraine war causing oil prices to rise. However, despite the central bank raising interest rates, inflation persisted at a high rate for a numbe of quarters. This is because interest rates would have no effect on the costs of prodcution. Interest rates have little to no effect on oil prices for example, even if oil prices are hiked to high levels, if oil prices remain high, the inflation would still be persited in the economy, showing how it may have a limited impact on inflation, as the root cause is cost push.

Therefore, overall, it is key that interest rates are used wisely by the central bank or the Bank of England, if the desired impact is going to be achieved. In times of high confidence and economic growth, then increased interest rates may have little to no effect on economic growth, as real disposable incomes would not be effected. Furthermore interest rates, as seen in 2022, may have limited impact of cost push inflation, as costs of production may still remain high. Thus in conclusion, interest rates can be a key tool which have vast economic impacts on the economy, but that may not be the case every time, so it is important the Bank of England or the central bank take into account these factors when choosing to increase interest rates.

**Known correct mark:** 24–25 out of 25, per the examiner (a real confirmed
range, not a single invented number — deliberately kept as a range here
rather than forced to one figure).

**Calibration run log (Wednesday 2026-08-12) — see tasks.md Section F for
the full bug-by-bug detail. Summary of results against this known 24-25
mark, same essay each time:**
- Run 1 (400 error, not a real mark) → fixed max_completion_tokens/reasoning_effort issue.
- Run 2, with an invented diagram description not from the real essay: Level 4 (KAA) / Level 3 (Eval) ≈ 21/25.
- Run 3, diagram field empty, before the diagram-instruction fix: Level 3 / Level 3 ≈ 18/25, incorrectly penalised for a missing diagram.
- Run 4, diagram field empty, after the diagram-instruction fix: Level 3 / Level 2 ≈ 15/25 — lower than run 3, raising a determinism concern (seed + system_fingerprint logging added in response).
- Run 5, diagram field empty, after adding seed + fixing a bogus "structure" issue and generic improvement-advice bug: Level 3 / Level 3 ≈ 18/25, but the specific issues raised were still not accurate to the essay (a normal topic sentence flagged as a serious structure error; the suggested improvement asked for an intro/conclusion the essay already has). Prompt fixed for both.
- Run 6, after the diagram fix in the USER message (the real bug — the user message was telling the model "none given — do not assume or invent a diagram" right next to the essay, overriding the system prompt): **Level 4 / Level 3 ≈ 22/25 — the closest to the known mark so far.** The false diagram issue disappeared and the commentary explicitly credited "multiple examples and diagram descriptions", confirming it now reads diagrams out of the essay prose. Remaining flaw: the improvement suggested "add clear topic sentences", which the essay already has.
- Run 7, after tightening the improvement rule (must quote the essay, must name economics, formatting suggestions banned): the improvement was correctly fixed — it quoted a real sentence and gave a genuine economics point. **But the mark dropped to Level 3 / Level 2 ≈ 16/25 on the same essay.**
- Run 8, identical input again: Level 3 / Level 2 ≈ 17/25.

**THE REAL FINDING FROM THIS SESSION — variance, not just accuracy.** Across
runs 6, 7 and 8, with the same essay and no change capable of explaining it,
the result moved ~22 → ~16 → ~17 out of 25. Earlier runs spanned Level 2 to
Level 4. This directly contradicts CLAUDE.md's rule that "the same essay marked
twice gives the same answer", and it matters more than any individual wording
fix: while the spread is this wide, a single run cannot tell us whether a prompt
change helped, hurt, or did nothing. Temperature is pinned at 0.2 and a fixed
`seed` is sent; neither has delivered reproducibility in practice.

A controlled determinism test (two identical back-to-back runs, comparing
Groq's `system_fingerprint` between them) was started but not completed — the
project's own per-visitor rate limit blocked the second run, and a later
attempt hit an intermittent token-budget failure. Still outstanding.

**Two likely contributing causes, neither yet ruled out:**
1. *Model non-determinism.* Groq documents `seed` as best-effort only, not
   guaranteed. `system_fingerprint` is now logged to tell a Groq-side backend
   change apart from the model simply varying.
2. *Weak anchoring on the general tier.* This essay is Paper 2 Theme 2, which
   has no exact past-paper match, so it's marked against the general banding
   grid alone — abstract level descriptors with no worked example scripts. The
   exact-match tier has real graded exemplars (11/25, 23/25, 14/25, 20/25);
   the general tier has nothing comparable to anchor against. Attaching fuller
   grounding is currently blocked by the free tier's 8000 tokens/minute ceiling.

- Runs 9 and 10, submitted back to back with nothing changed between them, after
  freeing ~500 tokens by trimming the examiner-admin preamble out of the
  grounding: **no errors at all** (the intermittent 400/413 failures are gone —
  the token squeeze is genuinely fixed). But the marks still differed:
  run 9 = Level 3 / Level 3 (≈19–20/25), run 10 = Level 3 / Level 2 (≈16/25).
  Run 10 also flagged the sentence "Another potential impact of high interest
  rates on the economy could be reduced inflation." as a **serious structure
  error** — an ordinary topic sentence, and precisely the fault the prompt now
  explicitly forbids flagging. So the model follows that instruction on some
  runs and ignores it on others.

**CONCLUSION — WEDNESDAY'S "CONFIDENTLY WRONG" FINDING (the deliverable).**
This is the documented answer to the playbook's Wednesday task 7. The product
is confidently wrong in a specific, reproducible-in-kind way: given the exact
same essay, exam question and settings, it returns materially different marks
between runs (observed spread across the session: ≈16/25 to ≈22/25 on an essay
with a confirmed real mark of 24–25/25), and it intermittently reports normal
essay-writing conventions as serious errors while its own instructions forbid
exactly that. It states each of these verdicts in the same confident register,
with plausible-sounding justification, every time.

**Why no further prompt fixes were attempted after run 10.** With a spread this
wide, a single run cannot distinguish "this fix worked" from "this run happened
to land higher" — so continuing to tweak the prompt and re-testing once is not
evidence, it's guessing. Six prompt fixes were made during this session and
each was validated against one run; in hindsight that method could not have
worked. The correct place to fix this is Thursday's evaluation set: ten cases,
scored by hand against known-correct answers, re-run after every change, so a
fix can be shown to help rather than assumed to.

**Two candidate causes, still not distinguished:**
1. Model non-determinism. Temperature is pinned at 0.2 and a fixed `seed` is
   sent, but Groq documents `seed` as best-effort only. A controlled
   fingerprint comparison remains outstanding.
2. Weak anchoring on the general tier. This essay has no exact past-paper
   match, so it's marked against abstract level descriptors with no worked
   exemplar scripts, unlike the exact-match tier which has real graded
   examples. Adding graded exemplars is the most promising fix, and now fits
   within the token ceiling.

**Still not calibrated.** `CALIBRATED = false` remains correct and is doing
exactly the job it was written for — every number above would have been shown
to a student as fact, and each one would have been wrong.

## Test 2 — monopoly efficiency essay (Seb)
**Paper/Theme:** Paper 1, Theme 3 (Business behaviour and the labour market)
— the manifest's only Theme 3 entry is June 2024 Q8 (contestability,
fragrance industry), which is a different question, so this is a
**general-only** confidence-tier case.
**Question:** "Why may monopolies not operate efficiently?" (25 marks)
**Diagram description (given, unlike Test 1):** Monopoly cost/output diagram —
AR (demand) and MC/AC curves, downward-sloping demand, rising MC/AC. Marks
price (P) and cost (C) at output Q, with the gap between the productively
efficient point (MC=AC minimum) and actual output Q illustrating
X-inefficiency. Labels SNP = (P−C)×Q, with an annotation pointing to the firm
"satisficing" rather than profit-maximising.
**Essay:**

A monopoly may not be likely to operate efficiently due to a lack of incentive to be efficient and invest. This is especially prevalent in natural monopolies such as companies like Thames Water. Thames Water is a regional monopoly that supplies water to over 16 million customers. Due to being the sole supplier of water, Thames Water are therefore price makers and can afford to satisfice or be X-inefficient (produce even AC and still make SNP (P−C×Q). Therefore Thames water may satisfice, operate inefficiently and lose key buyers whilst still paying high dividends and wages to employees and shareholders.

However, this may not be the case as increased efficiency can lead to dynamic efficiency. For example Thames water may choose to produce efficiently at low costs in order to gain higher profit, which they can use to invest in order to secure even more efficient (for example replacing labour with specialist machinery, thus reducing unit/labour costs). This would increase dividends in the long run due to lower costs and greater profit, despite lower dividends and wages in the short term.

Another reason why a firm may not operate efficiently is due to high barriers to entry. Thames water for example has very high infrastructure costs for pipes and reservoirs, meaning that large fixed and sunk costs are associated with entering the market. Additionally there are high legal barriers to entry in order to prove that the new firm is trustworthy and the water is safe, incurring even greater costs on the new firm. Due to the large scale (16 million households provided to) of Thames Water, the firm benefits from large economies of scale such as financial (low interest rates for borrowing due to large company size) and purchasing (low purchase price of pipes due to large scale). New firms do not yet have the same scale as Thames water and therefore cannot compete on price even if Thames water is not greatly efficient.

However, Thames water may operate efficiently due to strict regulation by Ofwat. For example Ofwat sets price caps every five years which forces Thames water to lower costs to maximise profit and dividends to shareholders, as they are unable to pass on large scale inefficiencies onto consumers through high prices. Additionally, in 2027 Ofwat approved £300 million in funding for infrastructure improvements, but only if Thames water met certain performance targets, meaning that Thames water are incentivised to be efficient due to the opportunity for high profit if targets are met.

Overall, the most likely outcome is that monopolies become inefficient due to high barriers to entry. The lack of contestability of the industry and lack of external competition due to high fixed costs and EOS mean that Thames water can satisfice and pay high dividends while they are inefficient, satisfying employees who work less hard and shareholders who still earn high dividends due to SNP.

**Known correct mark:** 21 out of 25.

**PROVENANCE — needs confirming before this counts as a calibration anchor.**
Recorded as "scored 21" but the marker was not specified. This matters: Seb's
interview (see spec.md) describes him **self-marking against a real mark
scheme** rather than being marked by a teacher or examiner. If this 21 is
Seb's own self-assessment, it is weaker evidence than Test 1's examiner-
confirmed range, and per this file's own rule ("must come from a real source —
a teacher, an examiner, or your own check against the actual mark scheme")
it should be labelled as such rather than treated as equivalent. **Ask Seb who
marked it.** Still useful either way as a mid-range comparison case; just not
interchangeable with an examiner mark.

**Two things worth noting about this essay as a test case — both useful:**
1. **It comes with a real diagram description**, unlike Test 1. That makes it
   the first genuine test of the diagram-marking path with actual student-
   written content, rather than the absent-diagram path.
2. **It contains a factual oddity** — "in 2027 Ofwat approved £300 million"
   is a future date. Per CLAUDE.md the tool must NOT fact-check or "correct"
   real-world claims the student made; it should judge only how well the
   evidence was used. So the correct behaviour here is to say nothing about
   the date. If the tool flags it as a factual error, that is a constitution
   violation and a genuine bug — making this an accidental but valuable test
   of that rule.

## Test 3
**Paper/Theme:**
**Question:**
**Essay:**
**Known correct mark:**

## Test 4
**Paper/Theme:**
**Question:**
**Essay:**
**Known correct mark:**

## Test 5
**Paper/Theme:**
**Question:**
**Essay:**
**Known correct mark:**
