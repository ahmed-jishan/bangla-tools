/**
 * Text Reverser
 * Bangla-aware reversal at multiple levels:
 *  - Character level (grapheme-aware — বাংলা grapheme clusters preserved)
 *  - Word level (word order reversed, words intact)
 *  - Line level (line order reversed)
 *  - Sentence level (sentence order reversed)
 *  - Word order within each line
 *  - Mirror text (for fun/design)
 */

// ─── Segmentation ─────────────────────────────────────────────────────────────

const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;

/**
 * Get grapheme clusters (handles Bengali conjuncts, matras correctly)
 */
function getGraphemes(text) {
  if (!text) return [];
  if (hasSegmenter) {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return [...seg.segment(text)].map(s => s.segment);
  }
  // Fallback: group Bengali base chars with their combining marks
  const result = [];
  const chars = [...text];
  let i = 0;
  while (i < chars.length) {
    let cluster = chars[i];
    i++;
    // Append combining marks (matras, hasanta, nukta, anusvara etc.)
    while (i < chars.length) {
      const code = chars[i].codePointAt(0);
      if (
        (code >= 0x09BE && code <= 0x09CC) || // vowel signs
        code === 0x09CD ||                      // hasanta
        code === 0x09BC ||                      // nukta
        code === 0x09D7 ||                      // au length mark
        (code >= 0x0981 && code <= 0x0983)      // anusvara, visarga, chandrabindu
      ) {
        cluster += chars[i];
        i++;
      } else break;
    }
    result.push(cluster);
  }
  return result;
}

function splitSentences(text) {
  return text
    .replace(/([।॥!?]+)/g, '$1\x01')
    .replace(/([.]+\s)/g, '$1\x01')
    .split('\x01')
    .filter(s => s.trim());
}

// ─── Mirror Map (Latin lookalikes) ───────────────────────────────────────────

const MIRROR_MAP = {
  'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ',
  'i':'ᴉ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d',
  'q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x',
  'y':'ʎ','z':'z',
  'A':'∀','B':'ᗺ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'Ⅎ','G':'ᵷ','H':'H',
  'I':'I','J':'ᒋ','K':'ʞ','L':'⅂','M':'W','N':'N','O':'O','P':'Ԁ',
  'Q':'Ό','R':'ᴚ','S':'S','T':'⊥','U':'∩','V':'Λ','W':'M','X':'X',
  'Y':'⅄','Z':'Z',
  '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ᔭ','5':'ϛ','6':'9','7':'ㄥ',
  '8':'8','9':'6',
  '!':'¡','?':'¿',',':'\'','\'':',','.':'˙','(':')',')':'(',
  '[':']',']':'[','{':'}','}':'{','<':'>','>':'<',
};

// ─── Reversal Functions ───────────────────────────────────────────────────────

/**
 * Reverse at grapheme level — preserves Bengali clusters perfectly
 */
function reverseChars(text) {
  return text.split('\n').map(line => {
    const graphemes = getGraphemes(line);
    return graphemes.reverse().join('');
  }).join('\n');
}

/**
 * Reverse word order (words intact, order flipped)
 */
function reverseWords(text) {
  return text.split('\n').map(line => {
    const words = line.trim().split(/(\s+)/);
    const wordTokens = words.filter((_, i) => i % 2 === 0); // actual words
    const spaceTokens = words.filter((_, i) => i % 2 === 1); // spaces
    const reversed = wordTokens.reverse();
    // Reinterleave with original spacing
    return reversed.map((w, i) => w + (spaceTokens[i] || '')).join('').trimEnd();
  }).join('\n');
}

/**
 * Reverse line order
 */
function reverseLines(text) {
  return text.split('\n').reverse().join('\n');
}

/**
 * Reverse sentence order (within full text)
 */
function reverseSentences(text) {
  const sentences = splitSentences(text);
  return sentences.reverse().join(' ').trim();
}

/**
 * Reverse word order per line (each line independently)
 */
function reverseWordsPerLine(text) {
  return reverseWords(text); // same as reverseWords which already works line-by-line
}

/**
 * Flip text upside-down using Unicode lookalikes
 */
function mirrorFlip(text) {
  return text.split('\n').map(line => {
    const graphemes = getGraphemes(line);
    return graphemes.reverse().map(g => {
      if (g.length === 1) return MIRROR_MAP[g] || g;
      return g; // Keep Bengali clusters as-is (no Unicode upside-down Bengali exists)
    }).join('');
  }).join('\n');
}

/**
 * Reverse only the English portions, keep Bangla intact
 */
function reverseEnglishOnly(text) {
  // Split into Bangla and English segments, reverse only English word sequences
  return text.replace(/[a-zA-Z][\w\s]*/g, match => {
    return match.trim().split(/\s+/).reverse().join(' ');
  });
}

/**
 * Palindrome check
 */
function isPalindrome(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
  const graphemes = getGraphemes(clean);
  const reversed = [...graphemes].reverse().join('');
  return clean === reversed;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const MODES = {
  chars: {
    label: 'অক্ষর উল্টো করো',
    labelEn: 'Reverse Characters',
    icon: '🔤',
    desc: 'প্রতিটি অক্ষরের ক্রম উল্টো — Bengali grapheme সঠিক থাকে',
    fn: reverseChars,
  },
  words: {
    label: 'শব্দ উল্টো করো',
    labelEn: 'Reverse Words',
    icon: '↔️',
    desc: 'শব্দের ক্রম উল্টো, প্রতিটি শব্দ অক্ষর অক্ষর ঠিক থাকে',
    fn: reverseWords,
  },
  lines: {
    label: 'লাইন উল্টো করো',
    labelEn: 'Reverse Lines',
    icon: '↕️',
    desc: 'লাইনের ক্রম উল্টো করো (শেষ লাইন → প্রথমে)',
    fn: reverseLines,
  },
  sentences: {
    label: 'বাক্য উল্টো করো',
    labelEn: 'Reverse Sentences',
    icon: '📄',
    desc: 'বাক্যের ক্রম উল্টো করো (শেষ বাক্য → প্রথমে)',
    fn: reverseSentences,
  },
  mirror: {
    label: 'Mirror / Flip ↙',
    labelEn: 'Mirror Flip',
    icon: '🪞',
    desc: 'উল্টো করে Unicode lookalike দিয়ে flip — English এর জন্য',
    fn: mirrorFlip,
  },
};

/**
 * Main reverse function
 */
export function reverseText(text, mode = 'words') {
  if (!text) return '';
  const m = MODES[mode];
  if (!m) return text;
  return m.fn(text);
}

export function checkPalindrome(text) {
  return isPalindrome(text);
}

export function getStats(input, output) {
  return {
    inputLen: input.length,
    outputLen: output.length,
    lines: input.split('\n').length,
    words: input.trim().split(/\s+/).filter(Boolean).length,
    isPalindrome: checkPalindrome(input),
  };
}

export const SAMPLES = [
  { label: 'বাংলা বাক্য',   text: 'আমার সোনার বাংলা আমি তোমায় ভালোবাসি।' },
  { label: 'একাধিক লাইন',   text: 'প্রথম লাইন\nদ্বিতীয় লাইন\nতৃতীয় লাইন' },
  { label: 'English text',   text: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Palindrome test', text: 'racecar' },
];