/**
 * Punctuation Fixer
 * Fixes common Bangla and English punctuation problems:
 *
 * Bangla-specific:
 *  - English full stop (.) → বাংলা দাঁড়ি (।) in Bangla sentences
 *  - Space before দাঁড়ি: "বাংলা ।" → "বাংলা।"
 *  - Double দাঁড়ি: "।।" → "॥" (double danda)
 *  - Missing space after দাঁড়ি
 *  - Comma স্থানে দাঁড়ি (common mistake)
 *  - Wrong quotes: " " → "  " (curly)
 *
 * English-specific:
 *  - Straight quotes → smart/curly quotes
 *  - Space before punctuation: "word ." → "word."
 *  - Missing space after punctuation: "word.Next" → "word. Next"
 *  - Double spaces after period
 *  - Ellipsis: "..." → "…"
 *  - Em/en dash: " - " → " — "
 *
 * General:
 *  - Multiple exclamation: "!!!" → "!"
 *  - Multiple question marks: "???" → "?"
 *  - Comma spacing
 *  - Oxford comma (optional)
 *  - Consistent apostrophe
 *
 * Each fix is individually toggleable.
 */

// ─── Fix Definitions ──────────────────────────────────────────────────────────

export const FIXES = {

  // ─ Bangla ─────────────────────────────────────────────────────
  bn_space_before_danda: {
    label: 'দাঁড়ির আগের space সরাও',
    desc: '"বাংলা ।" → "বাংলা।"',
    category: 'bangla',
    fn: (t) => t.replace(/\s+([।॥])/g, '$1'),
  },

  bn_space_after_danda: {
    label: 'দাঁড়ির পরে space যোগ করো',
    desc: '"বাংলা।পরের" → "বাংলা। পরের"',
    category: 'bangla',
    fn: (t) => t.replace(/([।॥])([^\s\n০-৯0-9।॥'"\)])/g, '$1 $2'),
  },

  bn_double_danda: {
    label: 'Double দাঁড়ি → ॥',
    desc: '"।।" বা "। ।" → "॥"',
    category: 'bangla',
    fn: (t) => t.replace(/।\s*।/g, '॥'),
  },

  bn_period_to_danda: {
    label: 'বাংলা বাক্যে . → ।',
    desc: 'বাংলা অক্ষরের পর . থাকলে দাঁড়িতে রূপান্তর',
    category: 'bangla',
    fn: (t) => t.replace(/([\u0980-\u09FF])\.\s/g, '$1। '),
  },

  bn_comma_space: {
    label: 'Comma-র পরে space',
    desc: '"শব্দ,পরের" → "শব্দ, পরের"',
    category: 'bangla',
    fn: (t) => t.replace(/,([^\s\n\d])/g, ', $1'),
  },

  bn_comma_before_space: {
    label: 'Comma-র আগের space সরাও',
    desc: '"শব্দ ," → "শব্দ,"',
    category: 'bangla',
    fn: (t) => t.replace(/\s+,/g, ','),
  },

  bn_multiple_danda: {
    label: 'একাধিক দাঁড়ি → একটি',
    desc: '"।।।" → "।"',
    category: 'bangla',
    fn: (t) => t.replace(/।{2,}/g, '।').replace(/॥{2,}/g, '॥'),
  },

  bn_question_mark: {
    label: 'প্রশ্নবোধক চিহ্ন ঠিক করো',
    desc: '"কী ?" → "কী?" এবং space fix',
    category: 'bangla',
    fn: (t) => t
      .replace(/\s+\?/g, '?')
      .replace(/\?([^\s\n])/g, '? $1'),
  },

  // ─ English ────────────────────────────────────────────────────
  en_space_before_punct: {
    label: 'Punctuation-এর আগের space সরাও',
    desc: '"word ." → "word." (English)',
    category: 'english',
    fn: (t) => t.replace(/([a-zA-Z0-9])\s+([.!?,;:])/g, '$1$2'),
  },

  en_space_after_punct: {
    label: 'Sentence-ending punctuation-এর পরে space',
    desc: '"word.Next" → "word. Next"',
    category: 'english',
    fn: (t) => t.replace(/([.!?])([A-Z])/g, '$1 $2'),
  },

  en_ellipsis: {
    label: '"..." → "…" (ellipsis)',
    desc: 'তিনটি dot → একটি ellipsis character',
    category: 'english',
    fn: (t) => t.replace(/\.{3,}/g, '…'),
  },

  en_em_dash: {
    label: '" - " → " — " (em dash)',
    desc: 'Hyphen surrounded by spaces → em dash',
    category: 'english',
    fn: (t) => t.replace(/\s+-\s+/g, ' — '),
  },

  en_smart_quotes_double: {
    label: 'Straight " " → curly " "',
    desc: 'Smart double quotes',
    category: 'english',
    fn: (t) => {
      // Opening quote: after space/start, before word
      t = t.replace(/(^|[\s(])"([^\s])/g, '$1\u201c$2');
      // Closing quote: after word, before space/end
      t = t.replace(/([^\s])"/g, '$1\u201d');
      return t;
    },
  },

  en_smart_quotes_single: {
    label: "Straight ' → curly ' '",
    desc: 'Smart single quotes / apostrophe',
    category: 'english',
    fn: (t) => {
      // Apostrophe in contractions: don't, it's
      t = t.replace(/([a-zA-Z])'([a-zA-Z])/g, '$1\u2019$2');
      // Opening single quote
      t = t.replace(/(^|[\s(])'([^\s])/g, '$1\u2018$2');
      // Closing single quote
      t = t.replace(/([^\s])'/g, '$1\u2019');
      return t;
    },
  },

  en_multiple_exclaim: {
    label: '"!!!" → "!"',
    desc: 'একাধিক বিস্ময়চিহ্ন → একটি',
    category: 'general',
    fn: (t) => t.replace(/!{2,}/g, '!'),
  },

  en_multiple_question: {
    label: '"???" → "?"',
    desc: 'একাধিক প্রশ্নচিহ্ন → একটি',
    category: 'general',
    fn: (t) => t.replace(/\?{2,}/g, '?'),
  },

  en_colon_space: {
    label: 'Colon (:) এর পরে space',
    desc: '"label:value" → "label: value"',
    category: 'english',
    fn: (t) => t.replace(/:([^\s\n\/\/])/g, ': $1'),
  },

  en_semicolon_space: {
    label: 'Semicolon (;) এর পরে space',
    desc: '"word;next" → "word; next"',
    category: 'english',
    fn: (t) => t.replace(/;([^\s\n])/g, '; $1'),
  },

  // ─ General ────────────────────────────────────────────────────
  double_space: {
    label: 'Double space → single',
    desc: '"word  word" → "word word"',
    category: 'general',
    fn: (t) => t.replace(/[^\S\n]{2,}/g, ' '),
  },

  normalize_dash: {
    label: 'Dash normalize করো',
    desc: '–– → — (en dash → em dash where appropriate)',
    category: 'general',
    fn: (t) => t.replace(/–{2}/g, '—').replace(/\-{2}/g, '—'),
  },

  strip_extra_newlines: {
    label: 'অতিরিক্ত blank line সরাও',
    desc: '৩+ blank lines → ১টি',
    category: 'general',
    fn: (t) => t.replace(/\n{3,}/g, '\n\n'),
  },
};

// ─── Presets ──────────────────────────────────────────────────────────────────

export const PRESETS = {
  bangla_standard: {
    label: 'বাংলা Standard',
    icon: '🇧🇩',
    desc: 'বাংলা text এর জন্য সব প্রয়োজনীয় fixes',
    ops: [
      'bn_space_before_danda', 'bn_space_after_danda', 'bn_double_danda',
      'bn_comma_space', 'bn_comma_before_space', 'bn_multiple_danda',
      'bn_question_mark', 'double_space', 'strip_extra_newlines',
    ],
  },
  english_standard: {
    label: 'English Standard',
    icon: '🇬🇧',
    desc: 'English text এর জন্য standard fixes',
    ops: [
      'en_space_before_punct', 'en_space_after_punct', 'en_ellipsis',
      'en_multiple_exclaim', 'en_multiple_question', 'en_colon_space',
      'en_semicolon_space', 'double_space', 'strip_extra_newlines',
    ],
  },
  smart_quotes: {
    label: 'Smart Quotes',
    icon: '💬',
    desc: 'Straight quotes → curly/smart quotes',
    ops: ['en_smart_quotes_double', 'en_smart_quotes_single'],
  },
  all_fixes: {
    label: 'সব Fix',
    icon: '✨',
    desc: 'সব ধরনের punctuation fix একসাথে',
    ops: Object.keys(FIXES),
  },
};

// ─── Category Labels ──────────────────────────────────────────────────────────

export const CATEGORIES = {
  bangla:  { label: '🇧🇩 বাংলা',   color: 'green' },
  english: { label: '🇬🇧 English', color: 'blue' },
  general: { label: '⚙️ General', color: 'amber' },
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Fix punctuation in text
 * @param {string} text
 * @param {string[]} fixKeys - array of keys from FIXES
 * @returns {{ result: string, changes: object[] }}
 */
export function fixPunctuation(text, fixKeys = []) {
  if (!text) return { result: '', changes: [] };

  let current = text;
  const changes = [];

  for (const key of fixKeys) {
    const fix = FIXES[key];
    if (!fix) continue;
    const before = current;
    try {
      current = fix.fn(current);
      if (before !== current) {
        changes.push({
          key,
          label: fix.label,
          charsBefore: before.length,
          charsAfter: current.length,
        });
      }
    } catch (e) {
      // skip failed fix
    }
  }

  return { result: current, changes };
}

/**
 * Apply a preset
 */
export function fixWithPreset(text, presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return { result: text, changes: [] };
  return fixPunctuation(text, preset.ops);
}

export const SAMPLES = [
  {
    label: 'বাংলা সমস্যা',
    text: 'বাংলাদেশ একটি সুন্দর দেশ .এখানে অনেক নদী আছে ।পাখিরা গান গায়।।আমরা এই দেশকে ভালোবাসি !',
  },
  {
    label: 'English সমস্যা',
    text: 'Hello world .This is a test...I love coding!!!Can you help me???The answer:yes.',
  },
  {
    label: 'Mixed সমস্যা',
    text: 'বাংলাদেশ একটি  সুন্দর দেশ . The country has many rivers .পাখিরা গান গায় !!!',
  },
];