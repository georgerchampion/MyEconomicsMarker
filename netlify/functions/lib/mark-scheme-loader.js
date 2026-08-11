// mark-scheme-loader.js
//
// WHERE THIS GOES: alongside your Netlify function, e.g.
//   netlify/functions/lib/mark-scheme-loader.js
// and the .txt grounding files go in a folder it can read, e.g.
//   netlify/functions/lib/mark-schemes/
//
// WHAT IT DOES (task A3 from tasks.md):
// Given a paper, theme, and an optional known-question id, returns the exact
// grounding text to put in the system prompt, plus a confidence tier the
// student is told about. Fails LOUDLY if something required is missing —
// per the constitution, this must never silently fall back to the model's
// general knowledge.
//
// WHY A MANIFEST, NOT FREE-TEXT MATCHING:
// Matching a pasted question to a real past paper by guessing/fuzzy-text
// would break the "never guess from pasted text" rule already applied to
// paper/theme selection. Instead, the student explicitly picks a known
// question from a dropdown (or "a different question"), so the confidence
// tier is always known for certain, never inferred.

const fs = require('fs');
const path = require('path');

const MARK_SCHEME_DIR = path.join(__dirname, 'mark-schemes');

// The manifest of real, sourced past questions. Add an entry here every time
// you source a new one (task F: calibration set growth).
const KNOWN_QUESTIONS = {
  'june2024-paper1-q7': {
    paper: 'paper1',
    theme: 'theme1', // hotel/energy bills — costs of production
    label: 'June 2024, Paper 1, Q7 — rising energy bills (hotel industry)',
    markSchemeFile: 'mark-scheme-june2024-paper1-q7.txt',
    examinerReportFile: 'examiner-report-june2024-paper1-q7.txt',
  },
  'june2024-paper1-q8': {
    paper: 'paper1',
    theme: 'theme3', // contestability — business behaviour/market structure
    label: 'June 2024, Paper 1, Q8 — contestability (fragrance industry)',
    markSchemeFile: 'mark-scheme-june2024-paper1-q8.txt',
    examinerReportFile: 'examiner-report-june2024-paper1-q8.txt',
  },
};

const GENERAL_BANDING_FILE = 'mark-schemes-general-25-mark-banding.txt';
const GENERAL_ADVICE_FILE = 'examiner-report-june2024-paper1-general-advice.txt';

function readFileOrFail(filename) {
  const fullPath = path.join(MARK_SCHEME_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    throw new GroundingNotLoadedError(
      `Mark scheme file "${filename}" not found at ${fullPath}. Refusing to mark rather than guess.`
    );
  }
  return fs.readFileSync(fullPath, 'utf8');
}

class GroundingNotLoadedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GroundingNotLoadedError';
  }
}

/**
 * @param {Object} params
 * @param {string} params.paper - 'paper1' | 'paper2'
 * @param {string} params.theme - e.g. 'theme1'
 * @param {string|null} params.knownQuestionId - key into KNOWN_QUESTIONS, or
 *   null if the student is answering a different question.
 * @returns {{
 *   confidenceTier: 'exact-match' | 'general-only',
 *   groundingText: string,
 *   sourceNote: string
 * }}
 */
function loadGrounding({ paper, theme, knownQuestionId }) {
  // The general banding grid is always required — if it's missing, nothing
  // can be marked at all.
  const generalGrid = readFileOrFail(GENERAL_BANDING_FILE);

  if (!knownQuestionId) {
    // No exact past-paper match selected. Mark against the general grid
    // only, and say so honestly to the student.
    return {
      confidenceTier: 'general-only',
      groundingText: generalGrid,
      sourceNote:
        'No exact past-paper match — marked against the general 25-mark banding grid only.',
    };
  }

  const known = KNOWN_QUESTIONS[knownQuestionId];
  if (!known) {
    throw new GroundingNotLoadedError(
      `Unknown question id "${knownQuestionId}" — not in the manifest.`
    );
  }
  if (known.paper !== paper || known.theme !== theme) {
    throw new GroundingNotLoadedError(
      `Question "${knownQuestionId}" is registered under ${known.paper}/${known.theme}, ` +
      `not the selected ${paper}/${theme}. Refusing to mix papers/themes.`
    );
  }

  const specificMarkScheme = readFileOrFail(known.markSchemeFile);
  const examinerReport = readFileOrFail(known.examinerReportFile);

  let generalAdvice = '';
  try {
    generalAdvice = readFileOrFail(GENERAL_ADVICE_FILE);
  } catch (e) {
    // General advice is a nice-to-have, not required — don't fail the whole
    // request over it, but don't pretend it's there either.
    generalAdvice = '';
  }

  return {
    confidenceTier: 'exact-match',
    groundingText: [
      '=== GENERAL 25-MARK BANDING GRID (baseline authority) ===',
      generalGrid,
      '=== SPECIFIC MARK SCHEME FOR THIS EXACT QUESTION (highest authority) ===',
      specificMarkScheme,
      "=== EXAMINER'S REPORT FOR THIS EXACT QUESTION (use for precise feedback, never for marks) ===",
      examinerReport,
      generalAdvice
        ? "=== GENERAL EXAMINER ADVICE (style/phrasing reference only) ===\n" + generalAdvice
        : '',
    ].filter(Boolean).join('\n\n'),
    sourceNote: `Matched to a real past question: ${known.label}.`,
  };
}

module.exports = { loadGrounding, GroundingNotLoadedError, KNOWN_QUESTIONS };
