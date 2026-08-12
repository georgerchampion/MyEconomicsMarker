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

**Still not calibrated.** `CALIBRATED = false` remains correct and is doing
exactly the job it was written for.

## Test 2
**Paper/Theme:**
**Question:**
**Essay:**
**Known correct mark:**

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
