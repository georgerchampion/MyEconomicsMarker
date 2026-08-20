# User testing — Friday 2026-08-19

Live link given to testers: **https://myeconomicsmarker.netlify.app**

## How to run each session

Send them the link with **no explanation**. Don't tell them where to click,
don't hover, don't answer questions while they're using it — "I'll answer
afterwards" is a complete sentence. The moment you explain it, the test is over,
because you won't be sitting next to the next thousand users.

Say only this before they start:

> "Have a go and think aloud if you can. Don't put anything private in — it goes
> to an AI company's servers."

Then stop talking and write.

**Record what they DO, not what they say about it.** Friends are kind by
default, so compliments carry almost no information. "Two of three paused before
clicking submit" is data. "They liked it" is manners.

---

## Person 1 — name:                            time:

**Where did they click first?**


**Where did they pause longest?**


**Did they finish without help?**  yes / no
If no — what did you have to tell them?


**First thing they said when they stopped:**


**Anything they tried that you didn't expect:**


---

## Person 2 — name:                            time:

**Where did they click first?**


**Where did they pause longest?**


**Did they finish without help?**  yes / no
If no — what did you have to tell them?


**First thing they said when they stopped:**


**Anything they tried that you didn't expect:**


---

## Person 3 — name:                            time:

**Where did they click first?**


**Where did they pause longest?**


**Did they finish without help?**  yes / no
If no — what did you have to tell them?


**First thing they said when they stopped:**


**Anything they tried that you didn't expect:**


---

## Person 4 — name:                            time:

**Where did they click first?**


**Where did they pause longest?**


**Did they finish without help?**  yes / no


**First thing they said when they stopped:**


---

## Person 5 — name:                            time:

**Where did they click first?**


**Where did they pause longest?**


**Did they finish without help?**  yes / no


**First thing they said when they stopped:**


---

# Sorting the findings

Every finding goes in **exactly one** of these three, and you should be able to
say why. Then make the most important one — just the one.

## A change to the product
Things where the thing itself is wrong.


## A new test case
Things where the behaviour might be wrong and you'd want to catch it
automatically next time — add to test-inputs.md.


## A new rule for the agent
Things where the AI's judgement or the instructions were wrong — add to
CLAUDE.md or the system prompt.


---

## The one change I actually made today, and why


---

## Things worth watching for specifically

Not a script — just what this week's work suggests might trip people up.

- Do they understand the **range** ("21–23") or expect a single mark?
- Do they read the orange note explaining why there's no exact mark, or skip it?
- Does anyone try to submit **without** picking a paper/theme first?
- Does anyone paste an essay **longer than 8,000 characters** and hit the limit?
- Does the **question dropdown** confuse anyone — do they expect their exact
  question to be listed?
- Do they trust the mark? Do they say anything about whether it feels right for
  the essay they put in?
- Does anyone hit an error, a timeout, or a slow response? (Roughly 1 in 25
  calls stalled in testing.)
