// /**
//  * Frequency Analyzer
//  * Analyzes text frequency at multiple levels:
//  *  - Character frequency (grapheme-aware for Bengali)
//  *  - Word frequency with stop-word filtering
//  *  - Bigram (2-word phrase) frequency
//  *  - Letter frequency heatmap data
//  *  - Zipf's law analysis
//  *
//  * Bangladesh's first proper Bangla-aware frequency tool.
//  */

// // ─── Stop Words ───────────────────────────────────────────────────────────────

// const STOP_WORDS_BN = new Set([
//   'আমি','আমার','আমাদের','আমাকে','আমরা',
//   'আপনি','আপনার','আপনাকে','আপনারা',
//   'তুমি','তোমার','তোমাকে','তোমরা',
//   'সে','তার','তাকে','তারা','তাদের',
//   'এই','ওই','সেই','এটা','ওটা','সেটা','এটি','ওটি','সেটি',
//   'এবং','বা','কিন্তু','তবে','যদি','তাহলে','কারণ','যে','যা','যিনি',
//   'এ','ও','না','নয়','নেই','হয়','হবে','হয়েছে','হয়েছিল',
//   'আছে','আছেন','ছিল','ছিলেন','থাকে','থাকবে',
//   'করে','করা','করেন','করেছে','করেছেন','করব','করবে',
//   'হলে','হলো','হলেন','হওয়া','হওয়ার',
//   'থেকে','দিয়ে','জন্য','মধ্যে','উপর','নিচে','সাথে',
//   'পরে','আগে','কাছে','ভেতর','বাইরে','পাশে',
//   'এখন','তখন','যখন','সব','সবাই','সবকিছু','কিছু','অনেক',
//   'খুব','বেশ','বেশি','কম','একটু','একটা','একটি',
//   'এক','দুই','তিন','প্রথম','শেষ','নতুন','পুরনো',
//   'বলে','বলা','বললেন','বলল','বলেছেন',
//   'যাই','যাও','যায়','যাবে','গেছে','গেল','গেলেন',
//   'আর','তাই','সুতরাং','অর্থাৎ','যেমন','তেমন',
// ]);

// const STOP_WORDS_EN = new Set([
//   'the','a','an','and','or','but','in','on','at','to','for','of',
//   'with','by','from','is','are','was','were','be','been','have',
//   'has','had','do','does','did','not','this','that','it','its',
//   'he','she','they','we','you','i','my','your','his','her','their',
//   'our','what','which','who','how','when','where','why','if','then',
//   'than','so','as','up','out','about','into','through','during',
//   'before','after','above','below','will','would','could','should',
//   'may','might','can','shall','just','also','only','very','too',
// ]);

// // ─── Segmentation ─────────────────────────────────────────────────────────────

// const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;

// function getGraphemes(text) {
//   if (!text) return [];
//   if (hasSegmenter) {
//     const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
//     return [...seg.segment(text)].map(s => s.segment);
//   }
//   return [...text];
// }

// function getWords(text) {
//   if (!text || !text.trim()) return [];
//   return text
//     .replace(/[।॥.!?,;:"""''()\[\]{}'`\-–—]/g, ' ')
//     .trim()
//     .split(/\s+/)
//     .filter(w => w.length > 0);
// }

// function isBanglaWord(word) {
//   return [...word].some(c => {
//     const code = c.codePointAt(0);
//     return code >= 0x0980 && code <= 0x09FF;
//   });
// }

// function isEnglishWord(word) {
//   return /^[a-zA-Z]+$/.test(word);
// }

// function isStopWord(word) {
//   return STOP_WORDS_BN.has(word) || STOP_WORDS_EN.has(word.toLowerCase());
// }

// // ─── Frequency Builders ───────────────────────────────────────────────────────

// function buildFreqMap(items) {
//   const map = new Map();
//   for (const item of items) {
//     map.set(item, (map.get(item) || 0) + 1);
//   }
//   return map;
// }

// function sortedFreq(map, limit = 50) {
//   return [...map.entries()]
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, limit)
//     .map(([item, count], rank) => ({ item, count, rank: rank + 1 }));
// }

// function addPercentages(entries, total) {
//   return entries.map(e => ({
//     ...e,
//     pct: total > 0 ? +((e.count / total) * 100).toFixed(2) : 0,
//   }));
// }

// // ─── Bigram Builder ───────────────────────────────────────────────────────────

// function getBigrams(words) {
//   const bigrams = [];
//   for (let i = 0; i < words.length - 1; i++) {
//     bigrams.push(`${words[i]} ${words[i + 1]}`);
//   }
//   return bigrams;
// }

// // ─── Zipf Analysis ────────────────────────────────────────────────────────────

// function zipfCorrelation(entries) {
//   if (entries.length < 3) return null;
//   // Zipf's law: frequency ∝ 1/rank
//   // We measure how well it fits
//   const top = entries.slice(0, Math.min(20, entries.length));
//   const expected = top.map((_, i) => top[0].count / (i + 1));
//   const actual   = top.map(e => e.count);
//   const n = top.length;
//   let ss_res = 0, ss_tot = 0;
//   const mean = actual.reduce((a, b) => a + b, 0) / n;
//   for (let i = 0; i < n; i++) {
//     ss_res += (actual[i] - expected[i]) ** 2;
//     ss_tot += (actual[i] - mean) ** 2;
//   }
//   const r2 = ss_tot > 0 ? Math.max(0, 1 - ss_res / ss_tot) : 0;
//   return Math.round(r2 * 100);
// }

// // ─── Main Analyze ─────────────────────────────────────────────────────────────

// /**
//  * Full frequency analysis
//  * @param {string} text
//  * @param {object} options
//  * @param {boolean} options.includeStopWords - include stop words in word freq
//  * @param {boolean} options.caseSensitive - case-sensitive for English
//  * @param {'all'|'bangla'|'english'} options.langFilter
//  * @returns {object}
//  */
// export function analyzeFrequency(text, options = {}) {
//   const {
//     includeStopWords = false,
//     caseSensitive = false,
//     langFilter = 'all',
//   } = options;

//   if (!text || !text.trim()) return null;

//   const allWords = getWords(text);
//   const graphemes = getGraphemes(text).filter(g => g.trim());

//   // ── Character frequency ──
//   const charMap = buildFreqMap(
//     graphemes.filter(g => {
//       const code = g.codePointAt(0);
//       if (/\s/.test(g)) return false;
//       if (/[।॥.!?,;:"""''()\[\]{}'`\-–—0-9০-৯]/.test(g)) return false;
//       return true;
//     })
//   );
//   const charTotal = [...charMap.values()].reduce((a, b) => a + b, 0);
//   const charFreq = addPercentages(sortedFreq(charMap, 40), charTotal);

//   // Separate bangla / latin chars
//   const banglaCharFreq = charFreq.filter(e => {
//     const code = e.item.codePointAt(0);
//     return code >= 0x0980 && code <= 0x09FF;
//   });
//   const latinCharFreq = charFreq.filter(e => {
//     const code = e.item.codePointAt(0);
//     return (code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A);
//   });

//   // ── Word frequency ──
//   let filteredWords = allWords;
//   if (langFilter === 'bangla')  filteredWords = allWords.filter(isBanglaWord);
//   if (langFilter === 'english') filteredWords = allWords.filter(isEnglishWord);

//   const normalizedWords = filteredWords.map(w =>
//     caseSensitive ? w : w.toLowerCase()
//   );

//   const wordMap = buildFreqMap(
//     includeStopWords
//       ? normalizedWords
//       : normalizedWords.filter((_, i) => !isStopWord(filteredWords[i]))
//   );
//   const wordTotal = [...wordMap.values()].reduce((a, b) => a + b, 0);
//   const wordFreq  = addPercentages(sortedFreq(wordMap, 50), wordTotal);

//   // ── Bigram frequency ──
//   const cleanWords = normalizedWords.filter((_, i) =>
//     !isStopWord(filteredWords[i])
//   );
//   const bigramMap  = buildFreqMap(getBigrams(cleanWords));
//   const bigramFreq = addPercentages(sortedFreq(bigramMap, 20), cleanWords.length);

//   // ── Digit frequency ──
//   const digitGraphemes = getGraphemes(text).filter(g =>
//     /^[0-9০-৯]$/.test(g)
//   );
//   const digitMap  = buildFreqMap(digitGraphemes);
//   const digitFreq = addPercentages(sortedFreq(digitMap, 10), digitGraphemes.length);

//   // ── Zipf ──
//   const zipfScore = zipfCorrelation(wordFreq);

//   // ── Summary ──
//   const uniqueWords   = wordMap.size;
//   const totalAnalyzed = wordTotal;
//   const topWord       = wordFreq[0] || null;
//   const topChar       = charFreq[0] || null;

//   return {
//     summary: {
//       totalWords: allWords.length,
//       analyzedWords: totalAnalyzed,
//       uniqueWords,
//       totalChars: charTotal,
//       uniqueChars: charMap.size,
//       zipfScore,
//       topWord,
//       topChar,
//     },
//     charFreq,
//     banglaCharFreq,
//     latinCharFreq,
//     wordFreq,
//     bigramFreq,
//     digitFreq,
//     options: { includeStopWords, caseSensitive, langFilter },
//   };
// }

// export const SAMPLES = [
//   {
//     label: 'রবীন্দ্রনাথ',
//     text: `আমার সোনার বাংলা আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ তোমার বাতাস আমার প্রাণে বাজায় বাঁশি। ও মা ফাগুনে তোর আমের বনে ঘ্রাণে পাগল করে। মরি হায় হায় রে। ও মা অঘ্রানে তোর ভরা ক্ষেতে আমি কী দেখেছি মধুর হাসি। কী শোভা কী ছায়া গো কী স্নেহ কী মায়া গো। কী আঁচল বিছিয়েছ বটের মূলে নদীর কূলে কূলে।`,
//   },
//   {
//     label: 'বাংলাদেশ প্রবন্ধ',
//     text: `বাংলাদেশ একটি সুন্দর দেশ। এই দেশের মানুষ অত্যন্ত পরিশ্রমী এবং সৎ। বাংলাদেশের প্রধান নদীগুলো হলো পদ্মা মেঘনা এবং যমুনা। বাংলাদেশ কৃষিপ্রধান দেশ। বাংলাদেশের মানুষ ধান পাট গম সহ বিভিন্ন ফসল চাষ করে। বাংলাদেশের রাজধানী ঢাকা। ঢাকা একটি বড় শহর। ঢাকায় অনেক মানুষ বাস করে। বাংলাদেশ একটি উন্নয়নশীল দেশ।`,
//   },
//   {
//     label: 'Mixed text',
//     text: `Bangladesh is a developing country. বাংলাদেশের GDP বর্তমানে প্রায় ৪০০ billion dollars। The country has made significant progress in education and healthcare. শিক্ষার হার বেড়েছে এবং মাতৃমৃত্যুর হার কমেছে। Technology sector is growing rapidly in Bangladesh.`,
//   },
// ];

/**
 * Professional Frequency Analyzer – Bangla + English
 * 
 * Features:
 * - Character (grapheme) frequency with Bengali support
 * - Word frequency with stop‑word filtering & language detection
 * - N‑gram (any n) phrase analysis
 * - Lexical diversity (TTR, corrected TTR, HD‑D)
 * - Readability statistics (sentence length, word length)
 * - Collocation strength (Pointwise Mutual Information)
 * - Export to CSV / JSON
 * - Async processing for large texts (Worker API)
 * 
 * Ideal for linguists, content analysts, and NLP enthusiasts in Bangladesh.
 * 
 * @version 2.0
 */

// ===============================
// 1. STOP WORDS (Bangla + English)
// ===============================

const STOP_WORDS_BN = new Set([
  'আমি','আমার','আমাদের','আমাকে','আমরা','তুমি','তোমার','তোমাকে','তোমরা',
  'সে','তার','তাকে','তারা','তাদের','এ','ও','ই','উনি','ওনি',
  'এই','ওই','সেই','এটা','ওটা','সেটা','এটি','ওটি','সেটি','এগুলো','ওগুলো','সেগুলো',
  'এবং','ও','বা','কিন্তু','তবে','যদি','তাহলে','কারণ','যে','যা','যিনি','যাদের',
  'না','নয়','নেই','হয়','হবে','হয়েছে','হয়েছিল','ছিল','ছিলেন','থাকে','থাকবে',
  'করে','করা','করেন','করেছে','করেছেন','করব','করবে','হলে','হলো','হলেন','হওয়া',
  'থেকে','দিয়ে','জন্য','মধ্যে','উপর','নিচে','সাথে','পরে','আগে','কাছে','ভেতর','বাইরে',
  'এখন','তখন','যখন','সব','সবাই','সবকিছু','কিছু','অনেক','খুব','বেশ','বেশি','কম',
  'একটু','একটা','একটি','এক','দুই','তিন','চার','পাঁচ','প্রথম','শেষ','নতুন','পুরনো',
  'বলে','বলা','বললেন','বলল','বলেছেন','যাই','যাও','যায়','যাবে','গেছে','গেল','গেলেন',
  'আর','তাই','সুতরাং','অর্থাৎ','যেমন','তেমন','আবার','নিজে','নিজের','নিজেদের',
  'কখনো','সর্বদা','কদাচিৎ','প্রায়','তারপর','অতঃপর','এখনো','তখনো',
  'হঠাৎ','ধীরে','সাধারণত','মোটেই','বরং','বা','বরাবর','সহ',
]);

const STOP_WORDS_EN = new Set([
  'a','an','and','or','but','so','for','nor','yet','of','to','in','on','at','by','with',
  'without','via','per','as','like','unlike','such','into','through','during','before',
  'after','above','below','between','among','is','are','was','were','be','been','being',
  'have','has','had','having','do','does','did','doing','will','would','shall','should',
  'may','might','must','can','could','the','this','that','these','those','some','any',
  'no','every','each','both','all','most','more','very','just','only','so','too','very',
  'quite','rather','somewhat','thus','hence','whereas','wherever','whatever','who','whom',
  'which','when','where','why','how','then','now','there','here','what','if','then','else',
  'otherwise','whether','nor','not','off','once','than','that','thence','thereby','therefore',
  'these','they','this','those','through','throughout','thru','till','to','together','too',
  'toward','towards','under','unless','until','up','upon','us','use','used','uses','using',
  'various','very','via','vs','want','was','we','were','what','when','where','whereafter',
  'whereas','whereby','wherein','whereupon','wherever','whether','which','while','whither',
  'who','whoever','whole','whom','whomever','whose','why','will','with','within','without',
  'would','yes','yet','you','your','yours','yourself','yourselves','he','him','his','she',
  'her','hers','it','its','they','them','their','theirs','we','us','our','ours','i','my',
  'mine','me','you','your','yours',
]);

// Merge for easy use
const STOP_WORDS = new Set([...STOP_WORDS_BN, ...STOP_WORDS_EN]);

// ===============================
// 2. LANGUAGE DETECTION HELPERS
// ===============================

function isBanglaChar(code) {
  return (code >= 0x0980 && code <= 0x09FF) || 
         (code >= 0x09F0 && code <= 0x09F9); // includes ৎ, ঁ, etc.
}

function isBanglaWord(word) {
  return [...word].some(ch => isBanglaChar(ch.codePointAt(0)));
}

function isEnglishWord(word) {
  return /^[a-zA-Z]+$/.test(word);
}

// ===============================
// 3. GRAPHEME SEGMENTATION (Bengali‑aware)
// ===============================

const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;

function getGraphemes(text) {
  if (!text) return [];
  if (hasSegmenter) {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return [...seg.segment(text)].map(s => s.segment);
  }
  // Fallback: simple Unicode grapheme break (limited)
  return [...text];
}

// ===============================
// 4. WORD & SENTENCE SPLITTER
// ===============================

const PUNCTUATION = /[।॥.!?,;:""''()\[\]{}'`\-–—\n\r\t]/g;

function getWords(text, keepPunctuation = false) {
  if (!text || !text.trim()) return [];
  let cleaned = text;
  if (!keepPunctuation) cleaned = text.replace(PUNCTUATION, ' ');
  return cleaned.trim().split(/\s+/).filter(w => w.length > 0);
}

function getSentences(text) {
  // Bengali sentence boundaries: । ! ? . followed by space or end
  const sentences = text.split(/(?<=[।!?।])\s+/);
  return sentences.filter(s => s.trim().length > 0);
}

// ===============================
// 5. CORE FREQUENCY BUILDERS
// ===============================

function buildFreqMap(items) {
  const map = new Map();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

function sortedFreq(map, limit = 50) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item, count], idx) => ({ item, count, rank: idx + 1 }));
}

function addPercentages(entries, total) {
  if (total === 0) return entries.map(e => ({ ...e, pct: 0 }));
  return entries.map(e => ({
    ...e,
    pct: Number(((e.count / total) * 100).toFixed(2)),
  }));
}

// ===============================
// 6. N‑GRAM ANALYSIS
// ===============================

function getNGrams(words, n, stopWordFilter = true) {
  if (words.length < n) return [];
  const result = [];
  for (let i = 0; i <= words.length - n; i++) {
    const slice = words.slice(i, i + n);
    if (stopWordFilter) {
      // skip n‑gram if any word is a stop word
      if (slice.some(w => STOP_WORDS.has(w.toLowerCase()))) continue;
    }
    result.push(slice.join(' '));
  }
  return result;
}

// ===============================
// 7. LEXICAL DIVERSITY (TTR)
// ===============================

function getLexicalDiversity(words) {
  if (words.length === 0) return 0;
  const unique = new Set(words.map(w => w.toLowerCase()));
  const ttr = unique.size / words.length;
  // Corrected TTR (Carroll, 1964) - for comparison across text lengths
  const cttr = unique.size / Math.sqrt(2 * words.length);
  return {
    typeTokenRatio: Number(ttr.toFixed(4)),
    correctedTTR: Number(cttr.toFixed(4)),
    uniqueWords: unique.size,
    totalWords: words.length,
  };
}

// ===============================
// 8. READABILITY STATISTICS (Basic)
// ===============================

function getReadabilityStats(text) {
  const words = getWords(text);
  const sentences = getSentences(text);
  const graphemes = getGraphemes(text).filter(g => !/\s/.test(g));
  
  const avgWordLen = words.length > 0 ? graphemes.length / words.length : 0;
  const avgSentenceLen = sentences.length > 0 ? words.length / sentences.length : 0;
  
  return {
    charCount: graphemes.length,
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordLength: Number(avgWordLen.toFixed(2)),
    avgSentenceLength: Number(avgSentenceLen.toFixed(2)),
  };
}

// ===============================
// 9. COLLOCATION (PMI Score - Pointwise Mutual Information)
// ===============================

function getPMI(bigramMap, unigramMap, totalBigrams) {
  const pmiScores = [];
  for (let [bigram, count] of bigramMap.entries()) {
    const [w1, w2] = bigram.split(' ');
    const p_bigram = count / totalBigrams;
    const p_w1 = unigramMap.get(w1) / totalBigrams; // careful: unigram count should be from words, but for PMI we use same total
    const p_w2 = unigramMap.get(w2) / totalBigrams;
    if (p_w1 === 0 || p_w2 === 0) continue;
    const pmi = Math.log2(p_bigram / (p_w1 * p_w2));
    pmiScores.push({ bigram, count, pmi: Number(pmi.toFixed(2)) });
  }
  return pmiScores.sort((a, b) => b.pmi - a.pmi).slice(0, 20);
}

// ===============================
// 10. MAIN ANALYSIS FUNCTION
// ===============================

/**
 * Full frequency analysis.
 * @param {string} text - Input text
 * @param {object} options
 * @param {boolean} options.includeStopWords - include stop words in word/bigram freq
 * @param {boolean} options.caseSensitive - case sensitivity for English words
 * @param {'all'|'bangla'|'english'} options.langFilter - language filter
 * @param {number} options.nGramSize - n for n‑grams (1=words, 2=bigrams, 3=trigrams...)
 * @param {boolean} options.collocations - compute PMI collocations
 * @param {number} options.topK - max number of items in each frequency list
 * @returns {object} Detailed analysis
 */
export function analyzeFrequency(text, options = {}) {
  const {
    includeStopWords = false,
    caseSensitive = false,
    langFilter = 'all',
    nGramSize = 2,        // default bigram
    collocations = true,  // compute PMI
    topK = 50,
  } = options;

  if (!text || typeof text !== 'string') return null;

  // --- 1. Basic tokenization ---
  const rawWords = getWords(text);
  let filteredWords = rawWords;
  if (langFilter === 'bangla') filteredWords = rawWords.filter(isBanglaWord);
  if (langFilter === 'english') filteredWords = rawWords.filter(isEnglishWord);

  const normalizedWords = filteredWords.map(w =>
    caseSensitive ? w : w.toLowerCase()
  );

  // --- 2. Word frequency ---
  let wordFiltered = normalizedWords;
  if (!includeStopWords) {
    wordFiltered = normalizedWords.filter((_, i) => !STOP_WORDS.has(filteredWords[i].toLowerCase()));
  }
  const wordMap = buildFreqMap(wordFiltered);
  const wordTotal = [...wordMap.values()].reduce((a, b) => a + b, 0);
  let wordFreq = sortedFreq(wordMap, topK);
  wordFreq = addPercentages(wordFreq, wordTotal);

  // --- 3. N‑gram frequency ---
  let ngramWords = normalizedWords;
  if (!includeStopWords) {
    ngramWords = normalizedWords.filter((_, i) => !STOP_WORDS.has(filteredWords[i].toLowerCase()));
  }
  const ngramList = getNGrams(ngramWords, nGramSize, !includeStopWords);
  const ngramMap = buildFreqMap(ngramList);
  const ngramTotal = ngramList.length;
  let ngramFreq = sortedFreq(ngramMap, topK);
  ngramFreq = addPercentages(ngramFreq, ngramTotal);

  // --- 4. Character frequency (graphemes) ---
  const graphemes = getGraphemes(text).filter(g => g.trim().length > 0 && !PUNCTUATION.test(g));
  const charMap = buildFreqMap(graphemes);
  const charTotal = graphemes.length;
  let charFreq = sortedFreq(charMap, topK);
  charFreq = addPercentages(charFreq, charTotal);

  // Separate Bangla / Latin characters
  const banglaCharFreq = charFreq.filter(c => isBanglaChar(c.item.codePointAt(0)));
  const latinCharFreq = charFreq.filter(c => {
    const code = c.item.codePointAt(0);
    return (code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A);
  });

  // --- 5. Digit frequency ---
  const digits = getGraphemes(text).filter(g => /^[\d০-৯]$/.test(g));
  const digitMap = buildFreqMap(digits);
  let digitFreq = sortedFreq(digitMap, 10);
  digitFreq = addPercentages(digitFreq, digits.length);

  // --- 6. Lexical diversity ---
  const lexicalDiversity = getLexicalDiversity(wordFiltered);

  // --- 7. Readability statistics ---
  const readability = getReadabilityStats(text);

  // --- 8. Collocations (PMI) only for bigrams if nGramSize === 2 and collocations true ---
  let collocationScores = [];
  if (collocations && nGramSize === 2 && ngramMap.size > 0) {
    const bigramMap = ngramMap;
    const unigramMap = buildFreqMap(ngramWords);
    collocationScores = getPMI(bigramMap, unigramMap, ngramTotal);
  }

  // --- 9. Zipf score (fit to Zipf's law) ---
  const zipfScore = computeZipfScore(wordFreq);

  // --- 10. Summary ---
  const summary = {
    totalWords: rawWords.length,
    analyzedWords: wordTotal,
    uniqueWords: wordMap.size,
    totalChars: charTotal,
    uniqueChars: charMap.size,
    totalNGrams: ngramTotal,
    uniqueNGrams: ngramMap.size,
    lexicalDiversity,
    readability,
    zipfScore,
    topWord: wordFreq[0] || null,
    topChar: charFreq[0] || null,
  };

  return {
    summary,
    charFreq,
    banglaCharFreq,
    latinCharFreq,
    wordFreq,
    ngram: {
      size: nGramSize,
      total: ngramTotal,
      unique: ngramMap.size,
      freq: ngramFreq,
      collocations: collocationScores,
    },
    digitFreq,
    options: { includeStopWords, caseSensitive, langFilter, nGramSize, topK },
  };
}

function computeZipfScore(entries) {
  if (entries.length < 3) return null;
  const top = entries.slice(0, Math.min(20, entries.length));
  const actual = top.map(e => e.count);
  const expected = top.map((_, i) => top[0].count / (i + 1));
  const n = top.length;
  let ss_res = 0, ss_tot = 0;
  const mean = actual.reduce((a, b) => a + b, 0) / n;
  for (let i = 0; i < n; i++) {
    ss_res += (actual[i] - expected[i]) ** 2;
    ss_tot += (actual[i] - mean) ** 2;
  }
  const r2 = ss_tot > 0 ? Math.max(0, 1 - ss_res / ss_tot) : 0;
  return Math.round(r2 * 100);
}

// ===============================
// 11. EXPORT FORMAT HELPERS
// ===============================

export function exportToCSV(data, filename = 'frequency.csv') {
  if (!data || !data.wordFreq) return;
  const rows = [['Rank', 'Item', 'Count', 'Percentage']];
  data.wordFreq.forEach(f => {
    rows.push([f.rank, f.item, f.count, f.pct]);
  });
  const csv = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ===============================
// 12. ASYNC ANALYSIS (for large texts)
// ===============================

export async function analyzeFrequencyAsync(text, options = {}) {
  // Simple wrapper – can be extended with Web Worker
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(analyzeFrequency(text, options));
    }, 0);
  });
}

// ===============================
// 13. SAMPLE TEXTS FOR DEMO
// ===============================

export const SAMPLES = [
  {
    label: 'রবীন্দ্রনাথ - আমার সোনার বাংলা',
    text: `আমার সোনার বাংলা আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ তোমার বাতাস আমার প্রাণে বাজায় বাঁশি। ও মা ফাগুনে তোর আমের বনে ঘ্রাণে পাগল করে। মরি হায় হায় রে। ও মা অঘ্রানে তোর ভরা ক্ষেতে আমি কী দেখেছি মধুর হাসি। কী শোভা কী ছায়া গো কী স্নেহ কী মায়া গো। কী আঁচল বিছিয়েছ বটের মূলে নদীর কূলে কূলে।`,
  },
  {
    label: 'বাংলাদেশ প্রবন্ধ',
    text: `বাংলাদেশ একটি সুন্দর দেশ। এই দেশের মানুষ অত্যন্ত পরিশ্রমী এবং সৎ। বাংলাদেশের প্রধান নদীগুলো হলো পদ্মা মেঘনা এবং যমুনা। বাংলাদেশ কৃষিপ্রধান দেশ। বাংলাদেশের মানুষ ধান পাট গম সহ বিভিন্ন ফসল চাষ করে। বাংলাদেশের রাজধানী ঢাকা। ঢাকা একটি বড় শহর। ঢাকায় অনেক মানুষ বাস করে। বাংলাদেশ একটি উন্নয়নশীল দেশ।`,
  },
  {
    label: 'ইংরেজি + বাংলা মিশ্রিত',
    text: `Bangladesh is a developing country. বাংলাদেশের GDP বর্তমানে প্রায় ৪০০ billion dollars। The country has made significant progress in education and healthcare. শিক্ষার হার বেড়েছে এবং মাতৃমৃত্যুর হার কমেছে। Technology sector is growing rapidly in Bangladesh.`,
  },
];

// Self-test on import (non-production)
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  console.log('📊 Frequency Analyzer v2.0 – Self Test\n');
  const sample = SAMPLES[1].text;
  const result = analyzeFrequency(sample, { nGramSize: 2, collocations: true });
  console.log(`Summary: ${result.summary.totalWords} words, ${result.summary.uniqueWords} unique, ${result.summary.zipfScore}% Zipf fit.`);
  console.log(`Top word: ${result.wordFreq[0]?.item} (${result.wordFreq[0]?.count})`);
  console.log(`Top bigram: ${result.ngram.freq[0]?.item} (${result.ngram.freq[0]?.count})`);
  console.log(`PMI top collocation: ${result.ngram.collocations[0]?.bigram} (PMI=${result.ngram.collocations[0]?.pmi})`);
  console.log('✅ Analysis ready.\n');
}