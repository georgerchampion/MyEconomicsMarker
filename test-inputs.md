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

**Known correct mark:** 21 out of 25, **marked by his teacher** (confirmed with
George 2026-08-12 — not Seb's own self-assessment, which was the thing worth
ruling out given Seb's interview describes him self-marking).

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

## Test 3 — carbon emissions / road traffic essay
**Paper/Theme:** Paper 1, Theme 1 (Introduction to markets and market failure)
— the manifest's only Theme 1 entry is June 2024 Q7 (rising energy bills,
hotel industry), a different question, so this is another **general-only**
confidence-tier case.
**Question:** "Evaluate the methods a government could use to reduce carbon
emissions from road traffic." (25 marks)
**Diagram descriptions (two given — the richest diagram test so far):**
1. *Negative externality diagram:* MPB=MSB (demand) with two supply/cost
   curves, MPC+tax and MSC, MPC below both. Price axis shows P1 (social
   optimum) above Pf and P1 (private equilibrium); quantity axis shows Q1
   (socially efficient) and Q (market equilibrium). Market equilibrium at Q
   where MPC=MPB produces over-consumption relative to the social optimum Q1,
   with the shaded triangle between MSC and MPC as the deadweight welfare loss.
2. *Maximum price diagram:* standard D and S curves, equilibrium price P and
   quantity Q. A maximum price (Pmax) set below equilibrium creates excess
   demand — quantity supplied falls to Q1 while quantity demanded rises to Q2,
   illustrating a shortage in public transport provision (Q2 − Q1).
**Essay:**

One method to reduce carbon emissions by road traffic is through taxation. For example the UK government have put into place congestion charges in London and taxes fuel-inefficient cars such as diesel cars. These taxes increase the cost of owning and running a car for individuals in the UK, and therefore more households are incentivised to switch to electric cars or increase public transport usage. Therefore, initially there was a negative externality of consumption, due to the consumption of fossil fuels leading to a negative 3rd party effect. This therefore caused a DWL (as shown by the shaded region) and market failure to occur. However, government taxation causes consumers to face the true social costs and slight behaviour to buy more sustainable cars, so MPC=MSC, thus shifting behaviour to switch (MPC + tax) fully internalising the DWL and eliminating market failure.

However, this deadweight loss may only be partially internalised due to taxation. Therefore market failure may still be occurring. For example, electric cars require lithium batteries that lead to 3× the emissions from production than regular diesel cars. Additionally, public transport such as HS2 caused 250 hectares of forest to be cut down and high levels of petrol-heavy machinery to be used, demonstrating how seemingly "clean" alternatives may also cause market failure.

Another way the UK government could reduce carbon emissions is by implementing a maximum price on public transport. For example the UK have a maximum price of £3 for all bus journeys in the UK. This maximum price is set below the equilibrium price P1>Pmax, therefore leading to greater demand for public transport (Q2>Q). More demand for public transport means that consumers switch from travelling individually in high emission cars, instead trying to travel collectively in a bus, reducing the number of cars on roads and the quantity of fuel used up.

However, maximum prices may not lead to a decrease in emissions due to government failure. Equilibrium price for buses is hard to measure and therefore the UK government may set the price too high or low, which can lead to no increase in demand for buses (thus no decrease in emissions) or too much demand (leading to overcrowding), therefore leading to government failure. This is because future consequences and consumer behaviour is hard to measure and there is an information gap.

Overall, the best method for reducing carbon emissions via government intervention is taxation. This is because it reduces market failure effectively due to disincentivising high emission behaviour. Additionally it is easier to implement than max prices as there are less information gaps associated and therefore less risk of government failure.

**Known correct mark:** 22 out of 25. **Marker not yet specified — confirm
whether this was a teacher or an examiner** before treating it as a firm anchor
(same standard applied to Test 2).

**Why this is the most valuable test case so far:**
1. **Two diagram descriptions**, both substantial. This is the real test of the
   charitable-reading rule.
2. **Diagram 1's description is internally muddled** — the student writes "P1"
   for both the social optimum and the private equilibrium, and mentions a
   third label "Pf". A human examiner would read past that and credit the
   economics, since the rest of the description makes the intent clear. The
   tool must do the same: per the prompt's charitable-reading rule it should
   judge the economics represented, not the precision of the labelling. If it
   raises this as a serious diagram error, that is over-penalising a labelling
   slip and a bug.
3. **It contains real-world claims that must NOT be fact-checked** — "electric
   cars ... 3× the emissions from production", "HS2 caused 250 hectares of
   forest to be cut down", "£3 maximum price for all bus journeys". CLAUDE.md
   forbids inventing, citing or correcting real-world statistics the student
   didn't write; the tool must judge only how well the evidence was deployed.
   Any attempt to correct these figures is a constitution violation.
4. **A likely genuine economics error to catch:** the first paragraph claims
   taxation results in "fully internalising the DWL and eliminating market
   failure", which overstates what a tax achieves — and the essay's own next
   paragraph contradicts it ("may only be partially internalised"). A good
   marker should notice that tension. This is a real test of whether the tool
   finds substantive analytical problems rather than surface ones.

## Test 4 — National Minimum Wage / social care essay
**Paper/Theme:** Paper 1 — **theme genuinely ambiguous, see the finding below.**
Recorded as Theme 3 (Business behaviour and the labour market), since the
question is about wages and firm profitability.
**Question:** "Evaluate the impact of an increase in the National Minimum Wage
on the profitability of firms in the social care industry." (25 marks)
— **this is a real past-paper question: 2021, Paper 1, Q7.**
**Diagram descriptions (two given):**
1. *Firm cost/revenue diagram:* AR (demand) and MR curves, with two sets of
   MC/AC curves (MC, AC and MC1, AC1) showing a rise in costs. Shift from
   (Q, P) earning supernormal profit (P−C)×Q to (Q1, P1, C1) representing a
   loss (C1−P1)×Q1, as costs rise faster than revenue.
2. *Positive externality of production diagram:* D=MSB=MPB with two supply/cost
   curves, S=MPC and MSC, MSC below MPC. Market equilibrium at (P, Q) where
   MPC=MPB versus the socially optimal (Pt, Qt) where MSB=MSC. Triangle (abc)
   between the two supply curves, bounded by Q and Qt, as the potential welfare
   gain/loss from underproduction of the positive externality (social care).
**Essay:**

One disadvantage could be a decrease in the profit for firms in the social care industry. Due to the increase in national minimum wage, social care firms now have to pay its employees £10.50 an hour in comparison to £8.72 an hour in 2020. This planned increase in wages for 2024 would increase costs for firms due to having to pay higher salaries. This therefore causes both MC and AC to shift up (MC→MC1) and (AC→AC1). Due to no increase in revenue, this causes the social care firm to now be operating unprofitably, initially receiving SNP (RC×Q) to making a loss (C1−P1×Q1).

However, due to higher wages this may increase worker motivation and thus lead to higher productivity. For example, workers may feel a greater sense of loyalty to the social care firm due to higher wages and therefore work harder and more efficiently than previously. This would decrease unit labour costs as the firm's labour would be more efficient and would be able to operate with less workers, thus reducing costs. Additionally, many workers in the social care sector are volunteers and are therefore not paid wages. Therefore an increase in national living wage may not have a significant impact on the firm's costs.

Additionally, an increase in national minimum wage would increase market failure. Due to increased costs to firms in the social care sector, this may lead to many firms shutting down or having to make severe cutbacks on costs such as staffing and capacity. This thus leads to the provision of social care to be underprovided, leading to a positive externality to form. Due to higher costs of production, social care firms are unable to produce at socially optimum level (Pt Qt) and instead just produce at (PQ) where MPC is less than MSC. This leads to the underproduction of social care (Q − Qt) and thus an inefficient allocation of resources leading to a welfare loss to form (welfare loss abc). This is because for every additional unit produced MSB>MSC, therefore market failure occurs.

However, this may not be the case if the government decides to subsidise social care due to its positive impact on the welfare of many vulnerable groups in society. By subsidising wages, firms would therefore be able to maintain profitability due to lower costs of production and therefore are prevented from having to close down, with many firms in the social care sector now able to increase their capacity and quality of care. This means the MPC curve right shifts close to the socially optimum level (Pt Qt), thus partially internalising the externality, leading to less underproduction. This therefore decreases the potential welfare gain and decreases market failure.

Overall, the most important disadvantage of an increase in national living wage is a decrease in firms' profitability. Due to the increased costs causing firms loss of profit, this has both an effect on the firm but also leads to market failure due to firms having to shut down due to low profit, causing underprovision of social care.

**Known correct mark:** 19–20 out of 25, marked by the teacher (confirmed with
George 2026-08-13). Originally reported only as "mid A", which is a grade band
rather than a mark — the real figure was obtained rather than inferred from a
grade boundary, since guessing it and then treating the guess as ground truth
is exactly the substitution this project exists to prevent. Kept as a range,
which is honest, rather than forced to one number.

**FINDING — the paper/theme dropdown can't represent this essay properly.**
This is a real design limitation, surfaced by a real essay rather than
predicted. The question is a labour-market question (Theme 3), but the essay
answers it half in Theme 3 (cost/revenue curves, supernormal profit, losses)
and half in Theme 1 (positive externalities, MPC vs MSC, welfare loss,
subsidies) — and that combination is legitimate, creditable economics, not a
student error. The current design forces exactly one theme, which means
whichever is picked, the tool loads a grid that only covers part of what was
written. Worth recording in spec.md as a genuine gap. Note it does not break
marking today, because both themes fall back to the same general 25-mark
banding grid — but it would matter the moment theme-specific grounding is
attached to each theme, which is the planned direction.

**OPPORTUNITY — this could become the first exact-match test case.**
Unlike Tests 1–3, this is a genuine past-paper question (2021 Paper 1 Q7). If
the official 2021 mark scheme and examiner's report are sourced from Pearson
and added to the manifest, this essay becomes the first test of the
**exact-match** confidence tier against a real known mark — currently completely
untested, since all four essays so far are general-only. That is a more
valuable next addition than bulk-loading unrelated papers.

## Test 5 — globalisation essay (Luke)
**Paper/Theme:** Paper 2, Theme 4 (A global perspective). The manifest has no
Theme 4 entries, so **general-only** tier.
**Question:** "Evaluate the impact of globalisation on the global economy."
(25 marks)
**Diagram descriptions (two given):**
1. *AD/AS diagram:* downward-sloping AD and upward-sloping SRAS on Price Level
   vs Real National Output axes. AD shifts right (AD→AD1) as export income
   rises, equilibrium moving (Y, P) → (Y1, P1) — an increase in both price
   level and real output.
2. *Trade creation diagram:* domestic supply (Sp) and demand (Dp) curves with
   two horizontal world-price lines, PEU+t (with tariff) and PEU (tariff
   removed post-accession). Quantities Q1, Q2, Q3 for domestic production and
   imports pre/post tariff removal. Triangles (a) and (b) between the price
   lines as the deadweight welfare gains from trade creation — production
   efficiency gain and consumer surplus gain.
**Essay:**

One impact of globalisation on the global economy is an increase in economic growth for many countries. Increased containerization means that countries are able to transport goods cheaper and easier around the world. For example Nigeria can export vast amounts of crude oil around the world due to its comparative advantage. Therefore the export income in the economy leads to an improvement in net trade. As net trade is a component of AD (C+I+G+(X−M)) this therefore causes AD to shift right (AD→AD1) hence causing an increase in RNO (Y→Y1) leading to greater economic growth for many countries that have absolute and comparative advantages in certain goods.

However, globalisation may not cause growth due to dutch disease. For example Nigeria's vast crude oil industry and exports means that a boom in the industry can cause rapid currency appreciation due to greater demand for the Nigerian currency. This appreciation causes other sectors in Nigeria such as manufacturing to become less internationally competitive due to exports being relatively more expensive after the appreciation, leading to less industry and potentially results in a decline in long run growth. Dutch disease is a downside of [TEXT MISSING — cut off by page break]

Another impact of globalisation on the global economy is an increase in trade creation. Greater global trade agreements such as the EU (a customs union) can remove trade barriers or protectionist measures to allow countries to focus on goods that have a comparative advantage in. By for example France joining the EU, the tariff on EU countries is eliminated (PEU+t→PEU) leading to an increase in imports (Q1−Q2)→(Q−Q3). This therefore leads to greater efficiency as France experiences a deadweight welfare gain of efficiency demonstrated by area (a) and a deadweight welfare gain to French consumers (b). Therefore countries can specialise leading to lower prices and increased efficiency within the trading bloc.

However, increased trade agreements can cause trade diversion also. This is where France for example is forced to switch from low cost international producers to higher cost producers within the trading bloc due to the common external tariff that the EU renders. This therefore leads to a loss of efficiency and increased prices in many areas, potentially such as cars — when France has to import from Germany which produce at a higher cost than China. This therefore causes a deadweight welfare loss of consumer surplus, French efficiency and EU efficiency.

Overall, the most likely impact of globalisation is an increase in growth. This is because globalisation is increased containerization and technology, allowing the market to increase hugely, allowing transport of goods and services to increase hugely. Many countries can import with firms comparative advantage to increase more trade and growth.

**Known correct mark: 18 out of 25 — and uniquely, BROKEN DOWN BY COMPONENT:**
- **Knowledge, Application & Analysis: 12 / 16** (Level 3)
- **Evaluation: 6 / 9** (Level 2)
Marked by a teacher — a *different* teacher from the one who marked Tests 2–4,
which is worth noting as an independent marking source rather than a single
teacher's calibration.

**WHY THIS IS THE MOST USEFUL CASE IN THE SET.** It is the only essay with
component-level marks, and those two components are exactly what the tool
outputs. Every other case can only check the total, which hides compensating
errors — a tool that awards 14/16 KAA and 4/9 Evaluation reaches the same 18
while being wrong about both. This case can check whether the tool gets the
*split* right, not just the sum. It also happens to be the lowest-scoring essay
in the set, so together with Test 1 (24–25) it defines the range the tool must
be able to tell apart.

**CAVEAT THAT MUST BE HONOURED WHEN SCORING — the transcription is incomplete.**
1. The second paragraph is **cut off mid-sentence** at a page break ("Dutch
   disease is a downside of..."), so material the teacher read and credited is
   missing from what the tool will see.
2. The final paragraph was **faint and partly best-effort transcribed**.
Consequently the tool is being asked to mark *less* essay than the teacher
marked. If it lands below 18, that is not automatically an error — a lower mark
may be the correct response to a shorter answer. **Either recover the missing
text before treating 18/25 as a strict target, or score this case as
"directionally correct?" (is it in the Level 2/3 region, and is Evaluation
marked below KAA?) rather than pass/fail against an exact number.**

---

# BASELINE STATUS — the test set as it now stands

| # | Essay | Paper/Theme | Known mark | Marker | Tier |
|---|---|---|---|---|---|
| 1 | Interest rates (Maxim) | P2 / T2 | 24–25 / 25 | Examiner | general-only |
| 2 | Monopoly efficiency (Seb) | P1 / T3 | 21 / 25 | Teacher | general-only |
| 3 | Carbon emissions / road traffic | P1 / T1 | 22 / 25 | Teacher | general-only |
| 4 | NMW / social care | P1 / T3 (ambiguous) | 19–20 / 25 | Teacher | general-only |
| 5 | Globalisation (Luke) | P2 / T4 | 18 / 25 (12 KAA + 6 Eval) | Teacher (different) | general-only |

**Five real essays, five known marks, spanning 18 to 25, across all four
themes and both papers, from at least three independent markers.** Every mark
was recorded here before the tool saw the essay.

**What this set can and cannot prove.** It can show whether the tool *ranks*
essays correctly — arguably more important than exact numbers, since a marker
that consistently reads 3 marks low but ranks correctly is useful and
correctable, while one that ranks randomly is not. It cannot yet test the
exact-match confidence tier, because no essay in the set has its official mark
scheme loaded (Test 4 is the candidate — see its entry).

**Note for running the baseline:** Groq's free tier allows 8000 tokens/minute
and each request uses close to that, so these must be run roughly **one per
minute**, not back to back.
