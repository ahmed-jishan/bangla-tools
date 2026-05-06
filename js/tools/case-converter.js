/**
 * Case Converter
 * Handles both Bangla and English text:
 *
 * English modes:
 *  - UPPERCASE, lowercase, Title Case, Sentence case
 *  - camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE
 *  - Alternating case, iNVERSE case
 *
 * Bangla modes:
 *  - প্রথম অক্ষর বড় (capitalize first letter of each sentence)
 *  - প্রতিটি শব্দের প্রথম অক্ষর বড়
 *  - সব ছোট হাতের (no Bangla uppercase, but English parts converted)
 *
 * Bangla has no uppercase/lowercase concept for its own script,
 * so Bangla modes primarily work on the English portions within mixed text.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBanglaChar(ch) {
  const code = ch.codePointAt(0);
  return code >= 0x0980 && code <= 0x09FF;
}

function isEnglishChar(ch) {
  const code = ch.codePointAt(0);
  return (code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A);
}

function isWhitespace(ch) { return /\s/.test(ch); }

function capitalizeFirst(str) {
  if (!str) return str;
  // Find first alphabetic character (English or skip Bangla)
  for (let i = 0; i < str.length; i++) {
    if (isEnglishChar(str[i])) {
      return str.slice(0, i) + str[i].toUpperCase() + str.slice(i + 1);
    }
    if (isBanglaChar(str[i])) return str; // Bangla first — no case to change
  }
  return str;
}

// ─── English Case Converters ──────────────────────────────────────────────────

function toUpperCase(text) { return text.toUpperCase(); }
function toLowerCase(text) { return text.toLowerCase(); }

function toTitleCase(text) {
  // Title case: capitalize first letter of each word, lowercase rest
  // But keep: small words (a, an, the, in, on, at...) lowercase unless first/last
  const SMALL_WORDS = new Set([
    'a','an','the','and','but','or','nor','for','so','yet',
    'in','on','at','to','of','by','up','as','is','it',
  ]);
  const words = text.split(/(\s+)/);
  return words.map((w, i) => {
    if (/^\s+$/.test(w)) return w;
    const lower = w.toLowerCase();
    // Always capitalize first and last word
    if (i === 0 || i === words.length - 1) return capitalizeFirst(lower);
    if (SMALL_WORDS.has(lower)) return lower;
    return capitalizeFirst(lower);
  }).join('');
}

function toSentenceCase(text) {
  // Capitalize first letter after . ! ? । ॥ or at start
  return text
    .toLowerCase()
    .replace(/(^\s*|[.!?।॥]\s+)([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

function toCamelCase(text) {
  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return text;
  return words[0].toLowerCase() +
    words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function toPascalCase(text) {
  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function toSnakeCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camel → words
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('_')
    .toLowerCase();
}

function toKebabCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('-')
    .toLowerCase();
}

function toScreamingSnake(text) {
  return toSnakeCase(text).toUpperCase();
}

function toAlternatingCase(text) {
  let upper = false;
  return [...text].map(ch => {
    if (!isEnglishChar(ch)) return ch;
    const result = upper ? ch.toUpperCase() : ch.toLowerCase();
    upper = !upper;
    return result;
  }).join('');
}

function toInverseCase(text) {
  return [...text].map(ch => {
    if (!isEnglishChar(ch)) return ch;
    return ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase();
  }).join('');
}

// ─── Bangla-aware Modes ───────────────────────────────────────────────────────

/**
 * Capitalize first letter of each sentence (works on English parts in mixed text)
 */
function toBanglaSentenceCase(text) {
  // Lower English, then capitalize after sentence endings
  let result = text.replace(/[a-zA-Z]/g, ch => ch.toLowerCase());
  result = result.replace(/(^|[।॥.!?]\s+)([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
  return result;
}

/**
 * Title case for mixed Bangla+English (only touches English words)
 */
function toBanglaTitleCase(text) {
  return text.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token;
    // If token has English chars, capitalize first English letter
    const hasEnglish = [...token].some(isEnglishChar);
    const hasBangla  = [...token].some(isBanglaChar);
    if (hasEnglish && !hasBangla) {
      return capitalizeFirst(token.toLowerCase());
    }
    return token; // Pure Bangla: unchanged
  }).join('');
}

/**
 * English parts to uppercase, Bangla untouched
 */
function toMixedUppercase(text) {
  return [...text].map(ch => isEnglishChar(ch) ? ch.toUpperCase() : ch).join('');
}

/**
 * English parts to lowercase, Bangla untouched
 */
function toMixedLowercase(text) {
  return [...text].map(ch => isEnglishChar(ch) ? ch.toLowerCase() : ch).join('');
}

// ─── Converters Registry ──────────────────────────────────────────────────────

export const CONVERTERS = {
  // English
  uppercase:      { label: 'UPPERCASE',          icon: '🔠', group: 'english', fn: toUpperCase },
  lowercase:      { label: 'lowercase',           icon: '🔡', group: 'english', fn: toLowerCase },
  titlecase:      { label: 'Title Case',          icon: '📌', group: 'english', fn: toTitleCase },
  sentencecase:   { label: 'Sentence case',       icon: '✏️', group: 'english', fn: toSentenceCase },
  camelcase:      { label: 'camelCase',           icon: '🐪', group: 'code',    fn: toCamelCase },
  pascalcase:     { label: 'PascalCase',          icon: '🏛', group: 'code',    fn: toPascalCase },
  snakecase:      { label: 'snake_case',          icon: '🐍', group: 'code',    fn: toSnakeCase },
  kebabcase:      { label: 'kebab-case',          icon: '🍢', group: 'code',    fn: toKebabCase },
  screamingsnake: { label: 'SCREAMING_SNAKE',     icon: '🔊', group: 'code',    fn: toScreamingSnake },
  alternating:    { label: 'aLtErNaTiNg',         icon: '🔀', group: 'fun',     fn: toAlternatingCase },
  inverse:        { label: 'iNVERSE cASE',        icon: '🙃', group: 'fun',     fn: toInverseCase },
  // Mixed Bangla+English
  mixed_upper:    { label: 'English অংশ → UPPER', icon: '🔡', group: 'bangla',  fn: toMixedUppercase },
  mixed_lower:    { label: 'English অংশ → lower', icon: '🔠', group: 'bangla',  fn: toMixedLowercase },
  bangla_sentence:{ label: 'বাক্য case (Bangla)',  icon: '✍️', group: 'bangla',  fn: toBanglaSentenceCase },
  bangla_title:   { label: 'Title case (Mixed)',   icon: '📋', group: 'bangla',  fn: toBanglaTitleCase },
};

export const GROUPS = {
  english: { label: 'English',          color: 'blue' },
  code:    { label: 'Code / Dev',       color: 'purple' },
  fun:     { label: 'মজার',             color: 'amber' },
  bangla:  { label: 'Bangla / Mixed',   color: 'green' },
};

/**
 * Convert text using a named converter
 */
export function convertCase(text, converterKey) {
  const converter = CONVERTERS[converterKey];
  if (!converter || !text) return text;
  return converter.fn(text);
}

export function getStats(original, converted) {
  return {
    inputLen:  original.length,
    outputLen: converted.length,
    changed:   [...converted].filter((ch, i) => ch !== original[i]).length,
  };
}

export const SAMPLES = [
  {
    label: 'English text',
    text: 'the quick brown fox jumps over the lazy dog near the river bank.',
  },
  {
    label: 'Mixed বাংলা+English',
    text: 'বাংলাদেশের GDP growth rate is very high. technology sector এবং garments industry দুটোই এগিয়ে যাচ্ছে।',
  },
  {
    label: 'Code identifier',
    text: 'user profile data handler',
  },
  {
    label: 'Camel to readable',
    text: 'getUserProfileDataHandler',
  },
];