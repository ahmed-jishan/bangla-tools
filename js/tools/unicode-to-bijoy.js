/**
 * Unicode → Bijoy Converter
 * Converts Unicode Bengali text back to Bijoy Bayanno encoding
 */

// Reverse of the Bijoy map — Unicode → Bijoy ASCII
// Longer sequences first (conjuncts before single chars)
const UNICODE_TO_BIJOY_PAIRS = [
  // Conjuncts (must come before individual chars)
  ['ক্ষ', 'Q'],
  ['র্',  '\u00ab'],
  ['ড়', '\u00ba'],
  ['ঢ়', '\u00bb'],
  ['য়', '\u00bc'],
  // Vowel signs (matras) — these need special pre-position handling
  ['া',  'v'],   // placeholder, handled specially
  ['ি',  'w'],   // placeholder
  ['ী',  '\u00c1'],
  ['ু',  'z'],
  ['ূ',  '\u00c4'],
  ['ৃ',  '\u00be'],
  ['ে',  'x'],   // placeholder
  ['ৈ',  '\u00c7'],
  ['ো', 'y'],   // placeholder
  ['ৌ',  '\u00b1'],
  ['ং',  '\u00b2'],
  ['ঃ',  '\u00b3'],
  ['ঁ',  '\u00b4'],
  ['্',  '\u00b5'],
  // Independent vowels
  ['আ', 'A'],
  ['ই', 'I'],
  ['ঈ', 'E'],
  ['উ', 'U'],
  ['ঊ', '\u00c4'],
  ['ঋ', '\u00b8'],
  ['এ', 'G'],
  ['ঐ', '\u00c7'],
  ['ও', 'O'],
  ['ঔ', '\u00b1'],
  ['অ', 'A'],
  // Consonants
  ['ক', 'k'],  ['খ', 'K'],  ['গ', 'g'],  ['ঘ', '\u00d2'],
  ['ঙ', '\u00d8'], ['চ', 'c'],  ['ছ', 'Q'],  ['জ', 'j'],
  ['ঝ', 'J'],  ['ঞ', '\u00d7'], ['ট', 'T'],  ['ঠ', '\u00d5'],
  ['ড', 'D'],  ['ঢ', '\u00d3'], ['ণ', 'N'],  ['ত', 't'],
  ['থ', '\u00d0'], ['দ', 'd'],  ['ধ', '\u00d1'], ['ন', 'n'],
  ['প', 'p'],  ['ফ', 'f'],  ['ব', 'b'],  ['ভ', 'B'],
  ['ম', 'm'],  ['য', 'Z'],  ['র', 'r'],  ['ল', 'l'],
  ['শ', '\u00b7'], ['ষ', '\u00b6'], ['স', 's'],  ['হ', 'h'],
  ['ৎ', '\u00b9'],
  // Digits
  ['০','0'],['১','1'],['২','2'],['৩','3'],['৪','4'],
  ['৫','5'],['৬','6'],['৭','7'],['৮','8'],['৯','9'],
  // Punctuation
  ['।', '.'],  ['৳', '$'],
  ['–', '\u2013'], ['—', '\u2014'],
];

// Vowel signs that must be placed BEFORE the consonant in Bijoy
const PRE_POSITION_VOWELS = {
  'া': 'v',   // a-kar → 'v' before consonant (approximation)
  'ি': 'w',   // i-kar → 'w'
  'ে': 'x',   // e-kar
  'ো': 'y',  // o-kar
};

/**
 * Build lookup map sorted by key length (longest first)
 */
const SORTED_MAP = [...UNICODE_TO_BIJOY_PAIRS].sort(
  (a, b) => b[0].length - a[0].length
);

/**
 * Main conversion function
 * @param {string} input - Unicode Bengali text
 * @returns {string} - Bijoy encoded text
 */
export function unicodeToBijoy(input) {
  if (!input || !input.trim()) return '';

  let result = input;

  // Step 1: Handle pre-position vowels
  // In Unicode: consonant + vowel-sign
  // In Bijoy:   vowel-sign + consonant (visual pre-positioning)
  const CONSONANTS = 'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়ৎ';

  Object.entries(PRE_POSITION_VOWELS).forEach(([unicode, bijoy]) => {
    // consonant + vowel → bijoy-vowel + consonant
    const pattern = new RegExp(`([${CONSONANTS}])${unicode}`, 'g');
    result = result.replace(pattern, `${bijoy}$1`);
  });

  // Step 2: Replace all known Unicode sequences → Bijoy
  SORTED_MAP.forEach(([uni, bij]) => {
    if (Object.values(PRE_POSITION_VOWELS).includes(bij)) return; // already handled
    result = result.replace(new RegExp(escapeRegex(uni), 'g'), bij);
  });

  // Step 3: Fix 'া' (regular a-kar, not pre-positioned)
  result = result.replace(new RegExp('া', 'g'), 'v');

  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getStats(original, converted) {
  const words = converted.trim() ? converted.trim().split(/\s+/).length : 0;
  return {
    words,
    chars: converted.length,
    originalLen: original.length,
    asciiChars: [...converted].filter(c => c.charCodeAt(0) < 128).length,
  };
}

export const SAMPLES = [
  { label: 'বাংলা', unicode: 'বাংলা' },
  { label: 'আমার সোনার বাংলা', unicode: 'আমার সোনার বাংলা' },
  { label: 'আমি তোমায় ভালোবাসি', unicode: 'আমি তোমায় ভালোবাসি' },
  { label: 'বাংলাদেশ আমার দেশ', unicode: 'বাংলাদেশ আমার দেশ' },
];
