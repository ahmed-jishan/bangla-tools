/**
 * Word & Character Counter
 * Bangla-aware: correctly counts Unicode Bengali grapheme clusters,
 * words, sentences, paragraphs, and provides readability estimates.
 *
 * Key insight: "বাংলা" is 3 grapheme clusters, not 5 code points.
 * Standard JS .length gives code units — wrong for Bengali.
 * We use Intl.Segmenter (modern browsers) with fallback.
 */

// ─── Segmenter Setup ──────────────────────────────────────────────────────────

const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;

function getGraphemes(text) {
  if (!text) return [];
  if (hasSegmenter) {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return [...seg.segment(text)].map(s => s.segment);
  }
  // Fallback: split on Bengali Unicode ranges + combining marks
  // Groups: base char + any following matras/hasanta/nukta/anusvara
  return text.match(/[\u0980-\u09FF][\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E0-\u09E3]*/g)
    || text.split('') ;
}

function getWords(text, lang = 'both') {
  if (!text || !text.trim()) return [];
  // Split on whitespace, filter empty
  return text.trim().split(/\s+/).filter(Boolean);
}

function getSentences(text) {
  if (!text || !text.trim()) return [];
  // Bangla sentence ends with ।  ॥  or English . ! ?
  return text.split(/[।॥.!?]+/).map(s => s.trim()).filter(Boolean);
}

function getParagraphs(text) {
  if (!text || !text.trim()) return [];
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

// ─── Language Detection ───────────────────────────────────────────────────────

function detectLanguageRatio(text) {
  const chars = [...text].filter(c => c.trim());
  if (!chars.length) return { bangla: 0, english: 0, other: 0, primary: 'empty' };

  let bangla = 0, english = 0, digit = 0, other = 0;
  chars.forEach(c => {
    const code = c.codePointAt(0);
    if (code >= 0x0980 && code <= 0x09FF) bangla++;
    else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) english++;
    else if (code >= 0x0030 && code <= 0x0039) digit++;
    else other++;
  });

  const total = chars.length;
  const banglaRatio = bangla / total;
  const engRatio = english / total;

  let primary = 'mixed';
  if (banglaRatio > 0.6) primary = 'bangla';
  else if (engRatio > 0.6) primary = 'english';
  else if (banglaRatio > 0 && engRatio > 0) primary = 'mixed';

  return {
    bangla: Math.round(banglaRatio * 100),
    english: Math.round(engRatio * 100),
    digit: Math.round(digit / total * 100),
    other: Math.round(other / total * 100),
    primary,
    counts: { bangla, english, digit, other },
  };
}

// ─── Reading Speed ────────────────────────────────────────────────────────────

const WPM = {
  bangla: { slow: 100, average: 150, fast: 200 },   // words per minute
  english: { slow: 150, average: 238, fast: 300 },
  mixed: { slow: 120, average: 180, fast: 240 },
};

function readingTimeSeconds(wordCount, speed, lang) {
  const wpm = WPM[lang]?.[speed] || WPM.mixed[speed];
  return Math.ceil((wordCount / wpm) * 60);
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds} সেকেন্ড`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} মিনিট`;
  return `${m} মিনিট ${s} সেকেন্ড`;
}

// ─── Unique Words ─────────────────────────────────────────────────────────────

function getUniqueWords(words) {
  return new Set(words.map(w => w.toLowerCase())).size;
}

function getLexicalDiversity(words) {
  if (!words.length) return 0;
  return Math.round((getUniqueWords(words) / words.length) * 100);
}

// ─── Top Words ────────────────────────────────────────────────────────────────

const STOP_WORDS_BN = new Set([
  'আমি','আমার','আমাদের','আপনি','আপনার','তুমি','তোমার',
  'সে','তার','তাদের','এই','ওই','সেই','এটা','ওটা',
  'এবং','বা','কিন্তু','যে','যা','এ','ও','না','হয়',
  'আছে','ছিল','হবে','করে','করা','হয়েছে','থেকে','দিয়ে',
  'জন্য','মধ্যে','উপর','নিচে','সাথে','পরে','আগে',
]);

const STOP_WORDS_EN = new Set([
  'the','a','an','and','or','but','in','on','at','to',
  'for','of','with','by','from','is','are','was','were',
  'be','been','have','has','had','do','does','did','not',
]);

function getTopWords(text, limit = 10) {
  const words = getWords(text);
  const freq = {};
  words.forEach(w => {
    const clean = w.replace(/[।॥.!?,;:"""''()\[\]{}'`]/g, '').trim();
    if (!clean || clean.length < 2) return;
    if (STOP_WORDS_BN.has(clean) || STOP_WORDS_EN.has(clean.toLowerCase())) return;
    freq[clean] = (freq[clean] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

// ─── Main Analysis ────────────────────────────────────────────────────────────

/**
 * Full text analysis
 * @param {string} text
 * @returns {object} - Complete stats
 */
export function analyzeText(text) {
  if (!text) {
    return {
      graphemes: 0, codePoints: 0, codeUnits: 0, bytes: 0,
      words: 0, uniqueWords: 0, lexicalDiversity: 0,
      sentences: 0, paragraphs: 0, lines: 0,
      banglaChars: 0, englishChars: 0,
      langRatio: { bangla: 0, english: 0, primary: 'empty' },
      readingTime: { average: '—', slow: '—', fast: '—' },
      topWords: [],
    };
  }

  const graphemeList = getGraphemes(text);
  const wordList = getWords(text);
  const sentenceList = getSentences(text);
  const paraList = getParagraphs(text);
  const langRatio = detectLanguageRatio(text);
  const lang = langRatio.primary === 'empty' ? 'mixed' : langRatio.primary;

  // Byte count (UTF-8)
  let bytes = 0;
  try {
    bytes = new TextEncoder().encode(text).length;
  } catch { bytes = text.length; }

  const wordCount = wordList.length;

  return {
    // Character counts
    graphemes: graphemeList.length,           // visually correct count
    codePoints: [...text].length,              // Unicode scalar values
    codeUnits: text.length,                    // JS string .length
    bytes,
    charsNoSpace: [...text].filter(c => !/\s/.test(c)).length,

    // Word stats
    words: wordCount,
    uniqueWords: getUniqueWords(wordList),
    lexicalDiversity: getLexicalDiversity(wordList),

    // Structure
    sentences: sentenceList.length,
    paragraphs: paraList.length,
    lines: text.split('\n').length,

    // Language breakdown
    banglaChars: langRatio.counts.bangla,
    englishChars: langRatio.counts.english,
    digitChars: langRatio.counts.digit,
    langRatio,

    // Reading time
    readingTime: {
      average: formatTime(readingTimeSeconds(wordCount, 'average', lang)),
      slow: formatTime(readingTimeSeconds(wordCount, 'slow', lang)),
      fast: formatTime(readingTimeSeconds(wordCount, 'fast', lang)),
    },

    // Top words (excluding stop words)
    topWords: getTopWords(text, 8),
  };
}

export const SAMPLES = [
  {
    label: 'বাংলা অনুচ্ছেদ',
    text: `আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি।
বাংলাদেশ একটি সুন্দর দেশ। এই দেশের মানুষ অত্যন্ত পরিশ্রমী এবং সৎ। প্রকৃতির অপার সৌন্দর্যে ভরপুর এই দেশটি বিশ্বের মানচিত্রে একটি গুরুত্বপূর্ণ স্থান অধিকার করে আছে।`
  },
  {
    label: 'Mixed Bangla+English',
    text: `Bangladesh is a developing country in South Asia. বাংলাদেশের GDP growth rate বর্তমানে approximately 6-7% per year। এই দেশের population প্রায় ১৭ কোটি।`
  },
  {
    label: 'English paragraph',
    text: `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet at least once. It has been used for testing typewriters and keyboards since the 19th century.`
  },
];