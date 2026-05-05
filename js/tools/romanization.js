/**
 * Bangla Romanization Engine
 * Unicode Bengali → English transliteration
 * Follows National Library at Kolkata (NLK) + modern popular convention
 * Handles: conjuncts, hasanta, matras, special characters
 */

// ─── Core Maps ────────────────────────────────────────────────────────────────

const INDEPENDENT_VOWELS = {
  'অ': 'o',  'আ': 'a',  'ই': 'i',  'ঈ': 'i',
  'উ': 'u',  'ঊ': 'u',  'ঋ': 'ri', 'এ': 'e',
  'ঐ': 'oi', 'ও': 'o',  'ঔ': 'ou',
};

const VOWEL_SIGNS = {
  'া': 'a',  'ি': 'i',  'ী': 'i',  'ু': 'u',
  'ূ': 'u',  'ৃ': 'ri', 'ে': 'e',  'ৈ': 'oi',
  'ো': 'o', 'ৌ': 'ou',
};

const CONSONANTS = {
  'ক': 'k',   'খ': 'kh',  'গ': 'g',   'ঘ': 'gh',  'ঙ': 'ng',
  'চ': 'ch',  'ছ': 'chh', 'জ': 'j',   'ঝ': 'jh',  'ঞ': 'n',
  'ট': 't',   'ঠ': 'th',  'ড': 'd',   'ঢ': 'dh',  'ণ': 'n',
  'ত': 't',   'থ': 'th',  'দ': 'd',   'ধ': 'dh',  'ন': 'n',
  'প': 'p',   'ফ': 'ph',  'ব': 'b',   'ভ': 'bh',  'ম': 'm',
  'য': 'j',   'র': 'r',   'ল': 'l',   'শ': 'sh',  'ষ': 'sh',
  'স': 's',   'হ': 'h',   'ড়': 'r',  'ঢ়': 'rh', 'য়': 'y',
  'ৎ': 't',
};

// Special conjuncts — override default hasanta-joining behavior
const CONJUNCT_OVERRIDES = {
  'ক্ষ': 'kkh',
  'জ্ঞ': 'ggy',
  'হ্ম': 'hm',
  'ন্ত': 'nto',
  'ন্দ': 'ndo',
  'ন্ধ': 'ndho',
  'ন্ব': 'nbo',
  'ন্ম': 'nmo',
  'ম্ব': 'mbo',
  'ম্ভ': 'mbho',
  'ল্ল': 'llo',
  'ত্ত': 'tto',
  'দ্দ': 'ddo',
  'দ্ধ': 'ddho',
  'ক্ক': 'kko',
  'গ্গ': 'ggo',
  'চ্চ': 'ccho',
  'জ্জ': 'jjo',
  'ট্ট': 'tto',
};

// Digits
const DIGITS = {
  '০':'0','১':'1','২':'2','৩':'3','৪':'4',
  '৫':'5','৬':'6','৭':'7','৮':'8','৯':'9',
};

// Punctuation
const PUNCT = {
  '।': '.', '॥': '..', '৳': 'Tk.',
  '–': '-', '—': '--',
};

const HASANTA = '্';
const INHERENT_VOWEL = 'o'; // অ is inherent after consonant

/**
 * Main romanization function
 * @param {string} input - Unicode Bengali text
 * @param {object} options
 * @param {boolean} options.capitalizeFirst - Capitalize first letter of sentences
 * @param {boolean} options.preserveNumbers - Keep Bangla numerals as-is
 * @returns {string} - Romanized text
 */
export function romanizeBangla(input, options = {}) {
  const {
    capitalizeFirst = true,
    preserveNumbers = false,
  } = options;

  if (!input || !input.trim()) return '';

  // Pre-process: replace known conjuncts
  let processed = preProcessConjuncts(input);

  const chars = [...processed];
  let result = '';
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    const code = ch.codePointAt(0);

    // Whitespace / non-Bengali passthrough
    if (code < 0x0980 || code > 0x09FF) {
      // Punctuation map
      if (PUNCT[ch]) { result += PUNCT[ch]; i++; continue; }
      // Digits
      if (!preserveNumbers && DIGITS[ch]) { result += DIGITS[ch]; i++; continue; }
      result += ch;
      i++;
      continue;
    }

    // Hasanta — suppress inherent vowel of previous consonant
    if (ch === HASANTA) {
      // Remove the last inherent vowel if it was added
      if (result.endsWith(INHERENT_VOWEL)) {
        result = result.slice(0, -1);
      }
      i++;
      continue;
    }

    // Independent vowel
    if (INDEPENDENT_VOWELS[ch] !== undefined) {
      result += INDEPENDENT_VOWELS[ch];
      i++;
      continue;
    }

    // Vowel sign (matra) — replaces inherent vowel
    if (VOWEL_SIGNS[ch] !== undefined) {
      // Remove the inherent 'o' that was added after the consonant
      if (result.endsWith(INHERENT_VOWEL)) {
        result = result.slice(0, -1);
      }
      result += VOWEL_SIGNS[ch];
      i++;
      continue;
    }

    // Consonant
    if (CONSONANTS[ch] !== undefined) {
      result += CONSONANTS[ch];
      // Add inherent vowel — will be removed if hasanta or matra follows
      const next = chars[i + 1];
      const nextCode = next ? next.codePointAt(0) : 0;
      const isWordEnd = !next || next === ' ' || next === '\n' ||
        (nextCode < 0x0980 || nextCode > 0x09FF);
      // Add inherent vowel unless at word boundary or before hasanta
      if (next !== HASANTA && !VOWEL_SIGNS[next]) {
        result += INHERENT_VOWEL;
      }
      i++;
      continue;
    }

    // Anusvara, visarga, chandrabindu
    if (ch === 'ং') { result += 'ng'; i++; continue; }
    if (ch === 'ঃ') { result += 'h'; i++; continue; }
    if (ch === 'ঁ') { result += 'n'; i++; continue; }

    // Fallback
    result += ch;
    i++;
  }

  if (capitalizeFirst) {
    result = capitalizeSentences(result);
  }

  return result.trim();
}

function preProcessConjuncts(text) {
  // Replace known conjunct overrides first
  let result = text;
  const sorted = Object.entries(CONJUNCT_OVERRIDES).sort(
    (a, b) => b[0].length - a[0].length
  );
  sorted.forEach(([bangla, roman]) => {
    result = result.split(bangla).join(`\x01${roman}\x01`);
  });
  return result;
}

function capitalizeSentences(text) {
  return text.replace(/(^\s*|\.\s+|!\s+|\?\s+)([a-z])/g,
    (_, sep, ch) => sep + ch.toUpperCase()
  );
}

/**
 * Word-by-word romanization with word boundary detection
 */
export function romanizeWords(input) {
  return input.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token;
    return romanizeBangla(token, { capitalizeFirst: false });
  }).join('');
}

export function getStats(input, output) {
  const words = output.trim() ? output.trim().split(/\s+/).length : 0;
  const banglaWords = input.trim() ? input.trim().split(/\s+/).filter(w =>
    [...w].some(c => c.codePointAt(0) >= 0x0980 && c.codePointAt(0) <= 0x09FF)
  ).length : 0;
  return {
    words,
    chars: output.length,
    banglaWords,
    inputLen: input.length,
  };
}

export const SAMPLES = [
  { label: 'আমার সোনার বাংলা',  text: 'আমার সোনার বাংলা আমি তোমায় ভালোবাসি' },
  { label: 'বাংলাদেশ',           text: 'বাংলাদেশ আমার দেশ, আমার মাতৃভূমি।' },
  { label: 'রবীন্দ্রনাথ',         text: 'রবীন্দ্রনাথ ঠাকুর বাংলা সাহিত্যের শ্রেষ্ঠ কবি।' },
  { label: 'ঢাকা শহর',           text: 'ঢাকা বাংলাদেশের রাজধানী ও প্রধান শহর।' },
];

export const SCHEME_INFO = {
  name: 'Popular Romanization',
  description: 'বাংলাদেশে সবচেয়ে বেশি প্রচলিত romanization পদ্ধতি অনুসরণ করে।',
  examples: [
    { bangla: 'বাংলাদেশ', roman: 'bangladesh' },
    { bangla: 'ভালোবাসা', roman: 'bhalobasha' },
    { bangla: 'রবীন্দ্রনাথ', roman: 'robindronath' },
  ],
};