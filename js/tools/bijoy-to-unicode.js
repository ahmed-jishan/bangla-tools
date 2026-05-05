/**
 * Bijoy → Unicode Converter (Improved Edition)
 * Converts Bijoy Bayanno (ASCII/ANSI encoded Bengali) to standard Unicode.
 * Features:
 * - Comprehensive character mapping (including extended ASCII)
 * - Intelligent vowel sign reordering (pre-base → post-base)
 * - Preserves conjuncts (consonant + halant + consonant)
 * - Handles numerals, punctuation, and special symbols
 * - Iterative transformation for complex nested patterns
 */

// ===============================
// 1. MAPPING TABLE (Bijoy → Unicode)
// ===============================
const BIJOY_TO_UNICODE_MAP = {
  // Independent Vowels & Special Consonants
  'A': 'আ', 'B': 'ভ', 'C': 'ছ', 'D': 'ড', 'E': 'ঈ', 'F': 'ফ',
  'G': 'গ', 'H': 'হ', 'I': 'ই', 'J': 'ঝ', 'K': 'খ', 'L': 'ল',
  'M': 'ম', 'N': 'ণ', 'O': 'ও', 'P': 'প', 'Q': 'ক্ষ', 'R': 'র',
  'S': 'স', 'T': 'ট', 'U': 'উ', 'V': 'ভ', 'W': 'ও', 'X': 'ক্স',
  'Y': 'য', 'Z': 'য়',               // Z → য় (corrected)

  // Dependent Vowel Signs & Consonants (lowercase)
  'a': 'া', 'b': 'ব', 'c': 'চ', 'd': 'দ', 'e': 'ে', 'f': 'ফ',
  'g': 'গ', 'h': 'হ', 'i': 'ি', 'j': 'জ', 'k': 'ক', 'l': 'ল',
  'm': 'ম', 'n': 'ন', 'o': 'ো', 'p': 'প', 'q': 'ক', 'r': 'র',
  's': 'স', 't': 'ত', 'u': 'ু', 'v': 'ব', 'w': 'ও', 'x': 'ক্স',
  'y': '্য',                                 // y → যুক্ত-ফলা (্য)
  'z': 'জ',

  // Digits
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',

  // Punctuation & Symbols
  '$': '৳', '.': '।', '|': '।', '\u00a6': '।', '\u00a1': '।',

  // Extended ASCII (Bijoy special characters)
  '\u00a2': 'ক', '\u00a3': 'খ', '\u00a4': 'গ', '\u00a5': 'ঘ',
  '\u00a7': 'ষ', '\u00a8': 'শ', '\u00a9': 'চ', '\u00aa': 'ছ',
  '\u00ab': '্র',                               // র-ফলা (্র)
  '\u00ac': 'ন', '\u00ad': 'ট', '\u00ae': 'ড', '\u00af': 'য',
  '\u00b0': 'ো', '\u00b1': 'ৌ', '\u00b2': 'ং', '\u00b3': 'ঃ',
  '\u00b4': 'ঁ', '\u00b5': '্',                 // হসন্ত (্)
  '\u00b6': 'ষ', '\u00b7': 'শ', '\u00b8': 'ঋ', '\u00b9': 'ৎ',
  '\u00ba': 'ড়', '\u00bb': 'ঢ়', '\u00bc': 'য়', '\u00bd': '।',
  '\u00be': 'ৃ', '\u00bf': '্',

  '\u00c0': 'ো', '\u00c1': 'ী', '\u00c2': 'া', '\u00c3': 'ু',
  '\u00c4': 'ূ', '\u00c5': 'ৃ', '\u00c6': 'ে', '\u00c7': 'ৈ',
  '\u00c8': 'ৌ',

  '\u00d0': 'থ', '\u00d1': 'ধ', '\u00d2': 'ঘ', '\u00d3': 'ঢ',
  '\u00d4': 'ছ', '\u00d5': 'ঠ', '\u00d6': 'ঝ', '\u00d7': 'ঞ',
  '\u00d8': 'ঙ', '\u00d9': 'ণ', '\u00da': 'ষ', '\u00db': 'শ',
  '\u00dc': 'ঋ',

  '\u00e0': 'ো', '\u00e1': 'া', '\u00e2': 'ি', '\u00e3': 'ী',
  '\u00e4': 'ু', '\u00e5': 'ূ', '\u00e6': 'ৃ', '\u00e7': 'ে',
  '\u00e8': 'ৈ', '\u00e9': 'ো', '\u00ea': 'ৌ',

  '\u00f7': '্', '\u00fe': '্', '\u00ff': '্য',

  // Typographic quotes and dashes
  '\u2018': '\'', '\u2019': '\'', '\u201c': '"', '\u201d': '"',
  '\u2013': '–', '\u2014': '—',

  // Other symbols
  '\u2020': 'ত', '\u00a0': 'া',
};

// Set of vowel signs that appear before a consonant in Bijoy (visual encoding)
// In Unicode these must be placed AFTER the consonant.
const PRE_BASE_VOWELS = ['ে', 'ি', 'ো', 'ৌ', 'ৈ', 'ী'];

// Bengali consonant range (Unicode)
const CONSONANT_PATTERN = '[\\u0995-\\u09B9\\u09DC-\\u09DF]';  // ক-হ, ড়-য়

// ===============================
// 2. MAIN CONVERSION FUNCTION
// ===============================

/**
 * Convert Bijoy encoded string to Unicode Bengali.
 * @param {string} input - Bijoy text (ASCII / ANSI)
 * @returns {string} - Unicode Bengali text
 */
export function bijoyToUnicode(input) {
  if (!input || typeof input !== 'string') return '';

  // Step 1: direct character mapping
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const code = input.charCodeAt(i);
    // Preserve whitespace
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
      result += ch;
      continue;
    }
    // Map known characters
    const mapped = BIJOY_TO_UNICODE_MAP[ch] || BIJOY_TO_UNICODE_MAP[String.fromCharCode(code)];
    result += mapped !== undefined ? mapped : ch;
  }

  // Step 2: fix vowel order (pre-base vowels moved after consonant cluster)
  result = fixVowelOrder(result);

  // Step 3: optional normalization for special conjuncts (e.g., ক্ষ, জ্ঞ)
  result = normalizeSpecialConjuncts(result);

  return result;
}

// ===============================
// 3. VOWEL REORDERING (ITERATIVE)
// ===============================

/**
 * Moves any pre‑base vowel sign (ে,ি,ো,ৌ,ৈ,ী) to the correct position
 * after the consonant cluster it belongs to.
 * Examples:
 *   "ি" + "ক"  → "ক" + "ি"   (কি)
 *   "ে" + "খ"  → "খ" + "ে"   (খে)
 *   "ো" + "দ" + "্" + "য"  → "দ" + "্" + "য" + "ো"  (দ্যো)
 *
 * The regex matches a vowel sign followed by a consonant cluster:
 * consonant + (হসন্ত + consonant)*
 */
function fixVowelOrder(text) {
  let changed = false;
  let newText = text;

  do {
    changed = false;
    for (const vowel of PRE_BASE_VOWELS) {
      // Build regex: vowel + consonant cluster
      // Cluster = consonant ( then optionally (হসন্ত + consonant) )
      const clusterPattern = new RegExp(
        `(${vowel})(${CONSONANT_PATTERN}(্${CONSONANT_PATTERN})*)`,
        'g'
      );
      const replaced = newText.replace(clusterPattern, (match, v, cluster) => {
        // Move vowel after the cluster
        return cluster + v;
      });
      if (replaced !== newText) {
        newText = replaced;
        changed = true;
      }
    }
  } while (changed);

  return newText;
}

// ===============================
// 4. SPECIAL CONJUNCT NORMALIZATION
// ===============================

/**
 * Some conjuncts may need explicit handling if the basic mapping + vowel
 * reordering does not produce the correct standard form.
 * (Most conjuncts are correctly represented as consonant + ্ + consonant.)
 */
function normalizeSpecialConjuncts(text) {
  // Replace common irregular sequences (if any) – keep as Unicode sequences
  // Example: "ক্ষ" is already correct when "ক্‌ষ" is produced
  // However, some legacy mappings might give "খন" etc. – we add safety.
  const fixes = [
    [/ক্‌ষ/g, 'ক্ষ'],    // ক + ্ + ষ → ক্ষ (but the sequence itself is fine)
    [/জ্‌ঞ/g, 'জ্ঞ'],    // ঞ always uses জ্ঞ glyph
    [/হ্‌ম/g, 'হ্ম'],
  ];
  let result = text;
  for (const [pattern, replacement] of fixes) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ===============================
// 5. UTILITY FUNCTIONS
// ===============================

/**
 * Get statistics about the converted text.
 * @param {string} original - Original Bijoy text
 * @param {string} converted - Converted Unicode text
 * @returns {object} - { words, chars, banglaChars, originalLen }
 */
export function getStats(original, converted) {
  const words = converted.trim() ? converted.trim().split(/\s+/).length : 0;
  const chars = converted.length;
  const banglaChars = [...converted].filter(c => {
    const code = c.charCodeAt(0);
    return code >= 0x0980 && code <= 0x09FF; // Bengali Unicode range
  }).length;
  return { words, chars, banglaChars, originalLen: original.length };
}

/**
 * Example Bijoy phrases for demonstration.
 */
export const SAMPLES = [
  { label: 'বাংলা (Bangla)', bijoy: 'evsjv' },
  { label: 'আমার সোনার বাংলা', bijoy: 'Avgvi †mvbvi evsjv' },
  { label: 'আমি তোমায় ভালোবাসি', bijoy: 'Avwg †Zvgvq fv‡jvevwm' },
  { label: 'আমাদের ছোট নদী', bijoy: "Avgv‡`i †QvU b`x" },
  { label: 'যুক্তাক্ষর (conjuncts)', bijoy: 'hy×ks kw³' },    // ক্ষ, ক্ষমতা etc.
];

// ===============================
// 6. AUTO-TEST (node/browser)
// ===============================
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  console.log('🔍 Bijoy Converter Self-Test:');
  SAMPLES.forEach(sample => {
    const converted = bijoyToUnicode(sample.bijoy);
    console.log(`📝 ${sample.label}:`);
    console.log(`   Bijoy:   ${sample.bijoy}`);
    console.log(`   Unicode: ${converted}\n`);
  });
}