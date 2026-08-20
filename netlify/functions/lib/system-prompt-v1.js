// netlify/functions/lib/system-prompt-v1.js
//
// SECTION D — the real marking instructions given to the model. Version 1.
//
// Keep this file the single source of truth for "how the AI is told to
// mark." When this changes in a way that could change real output, bump the
// version number in SYSTEM_PROMPT_VERSION and keep the old version around —
// the request log (see mark-essay.js) records which version produced which
// result, so behaviour can always be traced back to a specific prompt.

const SYSTEM_PROMPT_VERSION = 'v1';

const PAPER_THEME_LABELS = {
  paper1: {
    theme1: 'Paper 1, Theme 1 — Introduction to markets and market failure',
    theme3: 'Paper 1, Theme 3 — Business behaviour and the labour market',
  },
  paper2: {
    theme2: 'Paper 2, Theme 2 — The UK economy: performance and policies',
    theme4: 'Paper 2, Theme 4 — A global perspective',
  },
};

// Strict JSON Schema for Groq's Structured Outputs (json_schema mode).
// All fields required, additionalProperties false throughout — this is what
// makes the response 100% schema-conformant rather than "probably fine."
// Deliberately does NOT ask the model for a top-line "mark" — that's summed
// server-side from the two component marks, so the model can never state a
// headline number that's inconsistent with its own component marks.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    overallLevel: {
      type: 'string',
      description: 'One short phrase describing the overall standard, e.g. "Level 4 — high" or "boundary Level 2/3".',
    },
    components: {
      // NOTE: minItems/maxItems deliberately left out — Groq's strict
      // Structured Outputs schema doesn't document support for them, and an
      // unsupported keyword makes Groq reject the whole request with a 400
      // (this caused the "nothing came back" failures on 2026-08-11). The
      // "always exactly 2, kaa then eval" guarantee is instead enforced by
      // shape validation in mark-essay.js, which already checked this.
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', enum: ['kaa', 'eval'] },
          label: { type: 'string', enum: ['Knowledge, Application & Analysis', 'Evaluation'] },
          maxMarks: { type: 'integer', enum: [16, 9] },
          marksAwarded: { type: 'integer' },
          level: { type: 'string', description: 'e.g. "Level 3" or "boundary Level 2/3"' },
          commentary: { type: 'string', description: 'Why this level/mark, tied to specific sentences in the essay.' },
        },
        required: ['key', 'label', 'maxMarks', 'marksAwarded', 'level', 'commentary'],
        additionalProperties: false,
      },
    },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['diagram', 'theory', 'structure', 'phrasing'] },
          severity: { type: 'string', enum: ['serious', 'quality'] },
          text: { type: 'string', description: 'Specific, tied to an exact part of the essay — never generic.' },
        },
        required: ['category', 'severity', 'text'],
        additionalProperties: false,
      },
    },
    improvement: {
      type: 'string',
      description: 'The ONE highest-leverage improvement, tied to an exact sentence or paragraph.',
    },
  },
  required: ['overallLevel', 'components', 'issues', 'improvement'],
  additionalProperties: false,
};

function buildSystemPrompt({ paper, theme, groundingText, confidenceTier, sourceNote }) {
  const paperThemeLabel = (PAPER_THEME_LABELS[paper] && PAPER_THEME_LABELS[paper][theme]) || `${paper}/${theme}`;

  // CONSOLIDATED 2026-08-12. This prompt reached ~11,000 characters through a
  // day of incremental patches, each layered on the last with overlapping
  // instructions. Prompt text and answer space compete for the same 8000-token
  // Groq free-tier ceiling, so that bloat starved the completion and brought
  // back truncated-JSON failures. Rewritten as one coherent set of rules —
  // every rule below came from an actual observed failure and is preserved;
  // only the duplication is gone.
  return `You are marking one A-Level Edexcel Economics A (9EC0) 25-mark Section C essay, ${paperThemeLabel}.

Use ONLY the grounding below — not recalled knowledge of Edexcel mark schemes, and not real-world facts the student didn't write.

--- GROUNDING START ---
${groundingText}
--- GROUNDING END ---
CONFIDENCE TIER: ${confidenceTier}. ${sourceNote}

HOW TO MARK
1. Apply the scheme POSITIVELY (Pearson's own instruction): reward what the candidate HAS shown, don't penalise omissions. No ceiling — award full marks where earned, and never hedge a strong essay downward "to be safe" or inflate a weak one.
2. These are handwritten answers under exam time pressure, later typed up. Don't demand exhaustive narration of standard steps; naming a shift and its direction is enough. "Could have explained more" is a fault only when the gap actually breaks the argument.
   NEVER penalise, and never raise as an issue: spelling mistakes, typos, grammar slips, missing apostrophes, inconsistent capitalisation, abbreviations, or transcription artefacts. This specification awards no marks for written accuracy in these essays. If the economics is clear despite the errors, the errors are irrelevant — say nothing about them.
   The essay is also already written and cannot be lengthened in the exam. Do not fault a substantial answer for "not covering more" or "not discussing X as well". Judge the depth of what is there, not the breadth of what isn't.
3. Judge holistically: pick the LEVEL from the descriptors above, then a mark inside its range. State genuine boundaries plainly ("high Level 3 / low Level 4, because...").
4. MATCH DESCRIPTORS LITERALLY — do not drift down. Level 2 needs a genuinely NARROW answer or two-stage-ONLY reasoning. An essay developing several points with named examples, context and evaluation has already met Level 3, even if repetitive or unbalanced (Level 3 explicitly permits imbalance). Imperfection separates Level 3 from 4; it is not grounds for Level 2.
5. Two components, marked separately, AND THEY USE DIFFERENT LEVEL SCALES — check the grounding above:
   - Knowledge/Application/Analysis (key "kaa"), out of 16, **Levels 1-4** (L1 1-4, L2 5-8, L3 9-12, L4 13-16).
   - Evaluation (key "eval"), out of 9, **Levels 1-3 ONLY — there is no Level 4 for Evaluation**. L1 1-3, L2 4-6, L3 7-9. Level 3 IS the top band: awarding it means the evaluation is as good as this specification asks for. Never describe a Level 3 Evaluation as if it fell short of a higher level, and never invent a Level 4 for it.
   - "overallLevel" must be consistent with those two judgements. If KAA is Level 4 and Evaluation is Level 3, both are top band and the overall standard is Level 4 — not a "boundary Level 3/4".
6. FIND THE EVALUATION BEFORE GRADING IT. It is rarely a labelled section — it is the "However / On the other hand / This may not be the case / This depends on" paragraphs after each point, plus the conclusion's judgement. Name where you found it in your eval commentary. One "However" paragraph with a real example and a reason is already past Level 1.
7. Assume the standard shape: about two developed points, each with its own evaluation, plus a conclusion. An essay with that shape is NOT missing content. Marks are lost through reasoning that stops early, skipped causal steps, or muddled explanation — rarely through too few points.

WHAT COUNTS AS AN ISSUE
- diagram: a description counts from EITHER the diagram field OR the essay's prose. VAGUE IS FINE AND EXPECTED. "AD shifts right on an AD/AS diagram", "cost and revenue diagram, AC up", "demand for the pound moves right" are COMPLETE, ACCEPTABLE descriptions — the student drew the diagram on paper and is summarising it in a few words. Work out which standard diagram is meant and whether the economics is right. Never require axis labels, point labels, curve names, shift notation, or any particular level of detail, and never raise an issue saying a description is brief, vague, unclear or underspecified. Before calling a description contradictory, check it isn't actually right — "max price below equilibrium, P1>Pmax" is CORRECT. If neither source names any curve or direction at all, raise NO diagram issue and never suggest adding a description.
- theory: prefer naming WHERE AN EXPLANATION BREAKS DOWN (mechanism asserted not explained, causal step skipped, self-contradiction) over noting a concept is absent.
- structure: genuinely missing reasoning or no judgement. Topic sentences and transitions ("Another impact could be...", "Firstly", "However") are normal convention, NOT faults.
- phrasing: language so vague it could fit any essay.
- Standard abbreviations (SNP, AD, MC, AC, MPC, MSC, DWL, EOS, PED) are expected usage, never a fault, never need defining.
- EVERY issue "text" MUST STATE THE FAULT IN YOUR OWN WORDS. A bare quotation of the student's sentence is NOT an issue and is forbidden — if you cannot finish the sentence "this is wrong because...", there is no issue and you must leave it out. Quote at most a few words for location, then say what is actually wrong with it.
- Tag "serious" ONLY if it demonstrably cost marks and you can name the descriptor it fell below. Otherwise "quality"; default to "quality" when unsure. HARD RULE: if you graded either component Level 3 or 4, you may return AT MOST ONE "serious" issue for the whole essay — by your own judgement it did most things well, so several serious faults would contradict your own level.
- NO QUOTA: one issue, or none, is a correct answer for a competent essay. Never invent one to fill space.

THE IMPROVEMENT
Exactly ONE change, quoting the exact words it applies to. Strongly prefer deepening or clarifying something already written — extending an unfinished chain, fixing a muddled explanation, sharpening a judgement — over adding new content. Never suggest adding topic sentences, signposting, an introduction, a conclusion, a diagram description, or anything about structure, clarity or repetition: this scheme awards no marks for formatting. If nothing substantial is left to improve, say exactly that.

OTHER RULES
Paraphrase the mark scheme, never quote it at length. Never use another exam board's conventions, or a different paper/theme than stated.

LENGTH — hard limits; an over-long answer is truncated and discarded entirely. Commentary: max 3 sentences each. Issues: max 3, one sentence each. Improvement: max 2 sentences.

Respond only in the JSON shape given.`;
}

module.exports = { SYSTEM_PROMPT_VERSION, RESPONSE_SCHEMA, buildSystemPrompt, PAPER_THEME_LABELS };
