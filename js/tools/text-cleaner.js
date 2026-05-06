/**
 * Text Cleaner
 * Bangla-aware deep text cleaning:
 *  - Extra whitespace, invisible chars, zero-width chars
 *  - Mixed encoding artifacts
 *  - Punctuation normalization (Bangla danda, quotes)
 *  - Line break normalization
 *  - Number normalization (Bangla ↔ English digits)
 *  - Smart quotes → straight quotes
 *  - Each operation is toggleable independently
 */

// ─── Zero-width & Invisible Characters ───────────────────────────────────────

const INVISIBLE_CHARS = [
  '\u200B', // Zero Width Space
  '\u200C', // Zero Width Non-Joiner
  '\u200D', // Zero Width Joiner
  '\u2060', // Word Joiner
  '\u00AD', // Soft Hyphen
  '\uFEFF', // BOM / Zero Width No-Break Space
  '\u034F', // Combining Grapheme Joiner
  '\u00A0', // Non-Breaking Space (replace with regular space)
];

const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const EN_DIGITS = ['0','1','2','3','4','5','6','7','8','9'];

// ─── Individual Cleaners ──────────────────────────────────────────────────────

const CLEANERS = {

  removeZeroWidth: {
    label: 'Zero-width অক্ষর সরাও',
    desc: 'অদৃশ্য Unicode chars যা display সমস্যা করে',
    category: 'invisible',
    fn: (text) => {
      let result = text;
      // Keep ZWNJ/ZWJ only where they're meaningful (between Bengali chars)
      // Remove others unconditionally
      ['\u200B','\u2060','\u00AD','\uFEFF','\u034F'].forEach(ch => {
        result = result.split(ch).join('');
      });
      // Replace non-breaking space with regular space
      result = result.split('\u00A0').join(' ');
      return result;
    },
  },

  removeBOM: {
    label: 'BOM সরাও',
    desc: 'Byte Order Mark (\\uFEFF) — file শুরুতে লুকানো থাকে',
    category: 'invisible',
    fn: (text) => text.replace(/^\uFEFF/, ''),
  },

  normalizeWhitespace: {
    label: 'অতিরিক্ত space সরাও',
    desc: 'একাধিক space → একটি space, tab → space',
    category: 'whitespace',
    fn: (text) => text
      .replace(/\t/g, ' ')
      .replace(/[^\S\n]{2,}/g, ' ')  // multiple spaces → one (preserve newlines)
      .replace(/^ +| +$/gm, ''),      // trim each line
  },

  normalizeLineBreaks: {
    label: 'অতিরিক্ত লাইন সরাও',
    desc: '৩+ blank line → ১টি blank line',
    category: 'whitespace',
    fn: (text) => text.replace(/\n{3,}/g, '\n\n'),
  },

  trimLines: {
    label: 'প্রতি লাইন trim করো',
    desc: 'প্রতিটি লাইনের শুরু ও শেষের space সরাও',
    category: 'whitespace',
    fn: (text) => text.split('\n').map(l => l.trim()).join('\n'),
  },

  normalizeBanglaPunctuation: {
    label: 'বাংলা যতিচিহ্ন ঠিক করো',
    desc: 'English . → বাংলা । (বাংলা বাক্যে), double danda ঠিক করো',
    category: 'punctuation',
    fn: (text) => {
      let result = text;
      // Fix space before danda: "বাংলা ।" → "বাংলা।"
      result = result.replace(/\s+([।॥])/g, '$1');
      // Double danda with space: "। ।" → "॥"
      result = result.replace(/।\s*।/g, '॥');
      // Ensure space after danda if followed by Bengali letter
      result = result.replace(/([।॥])([^\s\n])/g, '$1 $2');
      return result;
    },
  },

  normalizeQuotes: {
    label: 'Smart quotes ঠিক করো',
    desc: '\u201c\u201d → " এবং \u2018\u2019 → \'',
    category: 'punctuation',
    fn: (text) => text
      .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
      .replace(/[\u2018\u2019\u0060\u00B4]/g, "'"),
  },

  normalizeDashes: {
    label: 'Dash normalize করো',
    desc: '\u2013\u2014 → - (সাধারণ hyphen)',
    category: 'punctuation',
    fn: (text) => text
      .replace(/[\u2013\u2014\u2212]/g, '-'),
  },

  removeHtmlTags: {
    label: 'HTML tags সরাও',
    desc: '<b>, <p>, <br> ইত্যাদি সরিয়ে শুধু text রাখো',
    category: 'content',
    fn: (text) => text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"'),
  },

  removeUrls: {
    label: 'URL সরাও',
    desc: 'http://, https://, www. links সরাও',
    category: 'content',
    fn: (text) => text.replace(/https?:\/\/[^\s]+|www\.[^\s]+/g, ''),
  },

  removeEmoji: {
    label: 'Emoji সরাও',
    desc: 'সব emoji ও special symbols সরাও',
    category: 'content',
    fn: (text) => text.replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, ''
    ),
  },

  removeNumbers: {
    label: 'সংখ্যা সরাও',
    desc: 'সব Arabic ও Bangla digits সরাও',
    category: 'content',
    fn: (text) => text.replace(/[0-9০-৯]/g, ''),
  },

  removeEnglish: {
    label: 'English অক্ষর সরাও',
    desc: 'সব Latin characters সরাও (শুধু বাংলা রাখো)',
    category: 'content',
    fn: (text) => text.replace(/[a-zA-Z]/g, ''),
  },

  toBanglaDigits: {
    label: 'English → বাংলা সংখ্যা',
    desc: '1234 → ১২৩৪',
    category: 'normalize',
    fn: (text) => text.replace(/[0-9]/g, d => BN_DIGITS[parseInt(d)]),
  },

  toEnglishDigits: {
    label: 'বাংলা → English সংখ্যা',
    desc: '১২৩৪ → 1234',
    category: 'normalize',
    fn: (text) => text.replace(/[০-৯]/g, d => EN_DIGITS[BN_DIGITS.indexOf(d)]),
  },

  normalizeHasanta: {
    label: 'Double hasanta ঠিক করো',
    desc: 'ভুল ্্ (double hasanta) → ্ (single)',
    category: 'normalize',
    fn: (text) => text.replace(/্{2,}/g, '্'),
  },

  fixOrphanMatra: {
    label: 'Orphan matra সরাও',
    desc: 'ব্যঞ্জনবর্ণ ছাড়া শুধু মাত্রা থাকলে সরাও',
    category: 'normalize',
    fn: (text) => text.replace(/(^|\s)([\u09BE-\u09CC])/g, '$1'),
  },

  removeExtraPunctuation: {
    label: 'অতিরিক্ত punctuation সরাও',
    desc: '!!! → ! এবং ... → …',
    category: 'punctuation',
    fn: (text) => text
      .replace(/!{2,}/g, '!')
      .replace(/\?{2,}/g, '?')
      .replace(/\.{2,}/g, '…')
      .replace(/,{2,}/g, ','),
  },

};

// ─── Preset Profiles ──────────────────────────────────────────────────────────

export const PRESETS = {
  gentle: {
    label: 'হালকা পরিষ্কার',
    icon: '🧹',
    desc: 'শুধু invisible chars ও extra space সরাও',
    ops: ['removeBOM','removeZeroWidth','normalizeWhitespace','normalizeLineBreaks'],
  },
  standard: {
    label: 'স্ট্যান্ডার্ড',
    icon: '✨',
    desc: 'সাধারণ text cleaning — most common use case',
    ops: ['removeBOM','removeZeroWidth','normalizeWhitespace','normalizeLineBreaks',
          'trimLines','normalizeBanglaPunctuation','normalizeQuotes','normalizeHasanta'],
  },
  deep: {
    label: 'গভীর পরিষ্কার',
    icon: '🔥',
    desc: 'HTML, URL, emoji সহ সব ধরনের artifacts',
    ops: ['removeBOM','removeZeroWidth','normalizeWhitespace','normalizeLineBreaks',
          'trimLines','normalizeBanglaPunctuation','normalizeQuotes','normalizeDashes',
          'removeHtmlTags','removeUrls','removeEmoji','normalizeHasanta',
          'fixOrphanMatra','removeExtraPunctuation'],
  },
  banglaOnly: {
    label: 'বাংলা normalize',
    icon: '🇧🇩',
    desc: 'বাংলা text এর জন্য specific fixes',
    ops: ['removeBOM','removeZeroWidth','normalizeWhitespace','normalizeBanglaPunctuation',
          'normalizeHasanta','fixOrphanMatra','toBanglaDigits'],
  },
};

// ─── Main Clean Function ──────────────────────────────────────────────────────

/**
 * Clean text with selected operations
 * @param {string} text
 * @param {string[]} operations - array of cleaner keys
 * @returns {{ result: string, changes: object[] }}
 */
export function cleanText(text, operations = []) {
  if (!text) return { result: '', changes: [] };

  let current = text;
  const changes = [];

  for (const opKey of operations) {
    const cleaner = CLEANERS[opKey];
    if (!cleaner) continue;
    const before = current;
    current = cleaner.fn(current);
    if (before !== current) {
      changes.push({
        op: opKey,
        label: cleaner.label,
        charsBefore: before.length,
        charsAfter: current.length,
        diff: before.length - current.length,
      });
    }
  }

  return { result: current, changes };
}

/**
 * Apply a preset profile
 */
export function cleanWithPreset(text, presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return { result: text, changes: [] };
  return cleanText(text, preset.ops);
}

/**
 * Get diff stats between original and cleaned
 */
export function getDiffStats(original, cleaned) {
  const origWords  = original.trim().split(/\s+/).filter(Boolean).length;
  const cleanWords = cleaned.trim().split(/\s+/).filter(Boolean).length;
  return {
    charsRemoved: original.length - cleaned.length,
    wordsRemoved: origWords - cleanWords,
    linesRemoved: original.split('\n').length - cleaned.split('\n').length,
    pctReduction: original.length
      ? Math.round(((original.length - cleaned.length) / original.length) * 100)
      : 0,
  };
}

export { CLEANERS };

export const SAMPLES = [
  {
    label: 'Zero-width chars',
    text: 'বাংলা\u200Bটেক্সট\uFEFFএখানে\u200Cআছে   অতিরিক্ত   space সহ।',
  },
  {
    label: 'HTML সহ text',
    text: '<p>বাংলাদেশ একটি <b>সুন্দর</b> দেশ।</p><br/><p>এখানে &amp; সেখানে।</p>',
  },
  {
    label: 'মিশ্র সমস্যা',
    text: `আমার   সোনার    বাংলা!!!
আমি   তোমায়   ভালোবাসি...


অনেক   blank   line এর পর।
www.example.com এই link টা দরকার নেই।`,
  },
];