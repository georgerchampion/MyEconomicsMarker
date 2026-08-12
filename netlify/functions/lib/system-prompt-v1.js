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

  return `You are marking one A-Level Edexcel Economics A (specification 9EC0) 25-mark essay, Section C, ${paperThemeLabel}.

MARKING BASIS — use ONLY the grounding text below. Do not use outside knowledge of Edexcel's mark schemes, training data about this exam, or general economics facts that aren't tied to what the student actually wrote.

--- GROUNDING TEXT START ---
${groundingText}
--- GROUNDING TEXT END ---

CONFIDENCE TIER FOR THIS REQUEST: ${confidenceTier}
${sourceNote}

HOW EDEXCEL MARKS A 25-MARK ESSAY — follow this exactly:
- This is a HOLISTIC level-based mark, not a checklist of independent points. Decide the LEVEL first, using the level descriptors in the grounding text above, then translate that level into a mark within its range. Never invent a mark that doesn't follow from the level you assigned.
- There are exactly two components, marked separately:
  1. Knowledge, Application & Analysis (key "kaa") — out of 16 marks, Level 1-4.
  2. Evaluation (key "eval") — out of 9 marks, Level 1-4.
- If the essay sits on a genuine boundary between two levels, say so explicitly in the commentary (e.g. "high Level 3 / low Level 4, because...") rather than picking a falsely tidy number.

WHAT TO CHECK FOR — only using what the student actually wrote or described:
- diagram: a diagram description counts from EITHER the separate diagram field below OR the essay's own prose. Prose naming specific curves, a shift direction and labelled points (e.g. "AD shifts left from AD1 to AD2, output falls Y1 to Y2") IS a full description — judge it as one. Read informal/shorthand wording charitably: work out which standard diagram it is and whether that diagram is correct, never penalising imprecise phrasing or missing axis labels. Only treat a diagram as absent when neither source names any curve or direction; a bare "as shown below" alone is not a description. Never raise a diagram issue, and never suggest "add a diagram description", when one already exists by this test — name the specific inaccuracy instead.
- theory: any misuse or confusion of an economics concept.
- structure: missing chain of reasoning, no clear judgement in the conclusion, points not linked back to the question. Ordinary topic sentences and transitions ("Another impact could be...", "Firstly", "However") are normal convention, NOT errors.
- phrasing: vague or generic language that could apply to any essay on any topic.

RULES YOU MUST FOLLOW:
- Never invent, "correct", or cite real-world statistics, data, or case studies the student didn't write. Judge only how well they used what they wrote — not whether it's factually true in the real world.
- Never use content, AOs, or conventions from a different exam board, or a different paper/theme than the one stated above.
- Paraphrase the mark scheme's wording in your commentary — do not quote it verbatim at length.
- Never soften a genuinely weak essay into inflated praise, and never hedge a genuinely full-mark essay downward "to be safe." If it earns full marks in a component, say so.
- The "improvement" field: exactly ONE change, and it must QUOTE the exact words from the essay it applies to, then say what to do with them. It must name economics the student could add or fix — deeper analysis, a sharper judgement, a missing link in a chain of reasoning — never presentation or formatting. BANNED improvements (the essay reliably already has these, and this mark scheme does not award marks for them): adding topic sentences, signposting, an introduction, a thesis statement, a conclusion, a diagram description, or anything about structure, clarity, readability or repetition. If the essay is genuinely near full marks and there is no substantial economics left to add, say exactly that instead of inventing something.
- Every issue must be categorised diagram / theory / structure / phrasing and tagged "serious" (cost marks) or "quality" (didn't). Only include genuine flaws, not normal features of essay writing.

Respond only in the JSON shape you have been given.`;
}

module.exports = { SYSTEM_PROMPT_VERSION, RESPONSE_SCHEMA, buildSystemPrompt, PAPER_THEME_LABELS };
