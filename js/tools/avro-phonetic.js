/**
 * Avro Phonetic Engine
 * Converts English phonetic input to Unicode Bengali
 * Based on Avro Phonetic keyboard layout
 */

// Phonetic rules — sorted by length (longest match first)
// Each rule: [pattern (regex string), replacement]
const PHONETIC_RULES = [
  // ─── Conjuncts & special sequences ───
  ['kkh',  'ক্ষ'],
  ['ksh',  'ক্ষ'],
  ['nng',  'ঙ'],
  ['jjh',  'ঝ'],
  ['kkh',  'ক্ষ'],
  ['NGG',  'ঙ'],
  ['NGk',  'ঙ্ক'],

  // ─── 3-char ───
  ['rri',  'ঋ'],
  ['ksh',  'ক্ষ'],
  ['jNG',  'জ্ঞ'],

  // ─── 2-char consonants ───
  ['kh',  'খ'],
  ['gh',  'ঘ'],
  ['ng',  'ং'],
  ['NG',  'ঙ'],
  ['ch',  'চ'],
  ['Ch',  'ছ'],
  ['jh',  'ঝ'],
  ['Th',  'ঠ'],
  ['Dh',  'ঢ'],
  ['th',  'থ'],
  ['dh',  'ধ'],
  ['ph',  'ফ'],
  ['bh',  'ভ'],
  ['sh',  'শ'],
  ['Sh',  'ষ'],
  ['rh',  'ড়'],
  ['Rh',  'ঢ়'],
  ['yy',  'য়'],
  ['OI',  'ৈ'],
  ['OU',  'ৌ'],
  ['aa',  'আ'],
  ['ii',  'ঈ'],
  ['uu',  'ঊ'],
  ['ai',  'ঐ'],
  ['oi',  'ঐ'],
  ['ou',  'ঔ'],
  ['ee',  'ঈ'],

  // ─── Single consonants ───
  ['k',   'ক'],
  ['K',   'ক'],
  ['g',   'গ'],
  ['G',   'গ'],
  ['j',   'জ'],
  ['J',   'জ'],
  ['T',   'ট'],
  ['D',   'ড'],
  ['N',   'ণ'],
  ['t',   'ত'],
  ['d',   'দ'],
  ['n',   'ন'],
  ['p',   'প'],
  ['f',   'ফ'],
  ['b',   'ব'],
  ['m',   'ম'],
  ['z',   'জ'],
  ['Z',   'য'],
  ['y',   'য'],
  ['Y',   'য়'],
  ['r',   'র'],
  ['l',   'ল'],
  ['c',   'ক'],
  ['s',   'স'],
  ['S',   'স'],
  ['h',   'হ'],
  ['R',   'ড়'],
  ['x',   'ক্স'],
  ['q',   'ক'],
  ['v',   'ভ'],
  ['w',   'ও'],

  // ─── Vowels ───
  ['A',   'আ'],
  ['i',   'ই'],
  ['I',   'ঈ'],
  ['u',   'উ'],
  ['U',   'ঊ'],
  ['e',   'এ'],
  ['E',   'এ'],
  ['O',   'ও'],
  ['o',   'অ'],
  ['a',   'আ'],
];

// Hasanta (্) — explicit virama
const HASANTA = '্';
const ZERO_WIDTH_JOINER = '\u200D';

// For UI display: quick reference mapping
export const QUICK_REFS = [
  { roman: 'k',  bangla: 'ক' }, { roman: 'kh', bangla: 'খ' },
  { roman: 'g',  bangla: 'গ' }, { roman: 'gh', bangla: 'ঘ' },
  { roman: 'ng', bangla: 'ং' }, { roman: 'ch', bangla: 'চ' },
  { roman: 'Ch', bangla: 'ছ' }, { roman: 'j',  bangla: 'জ' },
  { roman: 'jh', bangla: 'ঝ' }, { roman: 'T',  bangla: 'ট' },
  { roman: 'Th', bangla: 'ঠ' }, { roman: 'D',  bangla: 'ড' },
  { roman: 'Dh', bangla: 'ঢ' }, { roman: 'N',  bangla: 'ণ' },
  { roman: 't',  bangla: 'ত' }, { roman: 'th', bangla: 'থ' },
  { roman: 'd',  bangla: 'দ' }, { roman: 'dh', bangla: 'ধ' },
  { roman: 'n',  bangla: 'ন' }, { roman: 'p',  bangla: 'প' },
  { roman: 'ph', bangla: 'ফ' }, { roman: 'b',  bangla: 'ব' },
  { roman: 'bh', bangla: 'ভ' }, { roman: 'm',  bangla: 'ম' },
  { roman: 'y',  bangla: 'য' }, { roman: 'r',  bangla: 'র' },
  { roman: 'l',  bangla: 'ল' }, { roman: 'sh', bangla: 'শ' },
  { roman: 'Sh', bangla: 'ষ' }, { roman: 's',  bangla: 'স' },
  { roman: 'h',  bangla: 'হ' }, { roman: 'R',  bangla: 'ড়' },
  { roman: 'a',  bangla: 'আ' }, { roman: 'aa', bangla: 'আ' },
  { roman: 'i',  bangla: 'ই' }, { roman: 'ii', bangla: 'ঈ' },
  { roman: 'u',  bangla: 'উ' }, { roman: 'uu', bangla: 'ঊ' },
  { roman: 'e',  bangla: 'এ' }, { roman: 'O',  bangla: 'ও' },
  { roman: 'oi', bangla: 'ঐ' }, { roman: 'ou', bangla: 'ঔ' },
  { roman: 'rri',bangla: 'ঋ' },
];

const VOWEL_UNICODE = new Set(['অ','আ','ই','ঈ','উ','ঊ','ঋ','এ','ঐ','ও','ঔ']);
const CONSONANT_UNICODE = new Set([
  'ক','খ','গ','ঘ','ঙ','চ','ছ','জ','ঝ','ঞ',
  'ট','ঠ','ড','ঢ','ণ','ত','থ','দ','ধ','ন',
  'প','ফ','ব','ভ','ম','য','র','ল','শ','ষ',
  'স','হ','ড়','ঢ়','য়','ৎ'
]);

// Vowel → matra (dependent vowel sign) mapping
const VOWEL_TO_MATRA = {
  'আ': 'া',
  'ই': 'ি',
  'ঈ': 'ী',
  'উ': 'ু',
  'ঊ': 'ূ',
  'ঋ': 'ৃ',
  'এ': 'ে',
  'ঐ': 'ৈ',
  'ও': 'ো',
  'ঔ': 'ৌ',
};

/**
 * Convert phonetic input to Unicode Bengali
 * Processes word-by-word for accurate matra placement
 */
export function avroToUnicode(input) {
  if (!input) return '';

  // Split on whitespace preserving spaces
  return input.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token;
    return convertWord(token);
  }).join('');
}

function convertWord(word) {
  if (!word) return '';

  // Handle ```` for hasanta
  word = word.replace(/`/g, HASANTA);

  let result = '';
  let i = 0;

  while (i < word.length) {
    // Try longest match first
    let matched = false;
    for (let len = Math.min(4, word.length - i); len >= 1; len--) {
      const chunk = word.slice(i, i + len);
      const rule = findRule(chunk);
      if (rule) {
        const [, bangla] = rule;
        result += bangla;
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Digits passthrough
      const ch = word[i];
      if (/\d/.test(ch)) {
        result += ch;
      } else {
        result += ch;
      }
      i++;
    }
  }

  // Post-process: add hasanta between consecutive consonants (conjunct)
  result = addHasantaForConjuncts(result);

  // Convert standalone vowels after consonants to matras
  result = applyMatras(result);

  return result;
}

function findRule(chunk) {
  return PHONETIC_RULES.find(([pat]) => pat === chunk);
}

function addHasantaForConjuncts(text) {
  let out = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    out += chars[i];
    // If current is consonant and next is consonant and no hasanta between
    if (
      CONSONANT_UNICODE.has(chars[i]) &&
      i + 1 < chars.length &&
      CONSONANT_UNICODE.has(chars[i + 1])
    ) {
      out += HASANTA;
    }
  }
  return out;
}

function applyMatras(text) {
  let out = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const prev = chars[i - 1];
    // If this is a vowel and previous is a consonant (or hasanta), use matra
    if (VOWEL_UNICODE.has(ch) && prev && (CONSONANT_UNICODE.has(prev) || prev === HASANTA)) {
      const matra = VOWEL_TO_MATRA[ch];
      if (matra && ch !== 'অ') { // অ is inherent, no matra needed
        out += matra;
        continue;
      }
    }
    out += ch;
  }
  return out;
}

export function getStats(input, output) {
  const words = output.trim() ? output.trim().split(/\s+/).length : 0;
  return {
    words,
    chars: output.length,
    inputLen: input.length,
    banglaChars: [...output].filter(c => {
      const code = c.charCodeAt(0);
      return code >= 0x0980 && code <= 0x09FF;
    }).length,
  };
}

export const SAMPLES = [
  { label: 'আমার সোনার বাংলা', phonetic: 'amar shonar bangla' },
  { label: 'বাংলাদেশ', phonetic: 'bangladesh' },
  { label: 'ভালোবাসা', phonetic: 'bhalobasha' },
  { label: 'আকাশ ভরা সূর্য তারা', phonetic: 'akash bhora shurjo tara' },
];
