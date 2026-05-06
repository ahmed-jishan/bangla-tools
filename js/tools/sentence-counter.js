/**
 * Sentence Counter & Structure Analyzer
 * Deep analysis of text structure:
 *  - Sentence count (Bangla ।  + English . ! ?)
 *  - Average sentence length
 *  - Sentence type detection (simple, compound, complex)
 *  - Clause detection
 *  - Paragraph structure
 *  - Longest / shortest sentence
 *  - Readability indicators
 *  - Sentence length distribution
 */

// ─── Constants ────────────────────────────────────────────────────────────────

// Bangla clause connectors
const CLAUSE_CONNECTORS_BN = [
  'এবং','ও','কিন্তু','তবে','বরং','অথবা','না হয়',
  'যদি','যদিও','যদ্যপি','তাহলে','তবেই',
  'কারণ','যেহেতু','সুতরাং','তাই','ফলে','ফলস্বরূপ',
  'যে','যা','যিনি','যাকে','যার','যাদের',
  'যখন','যেখানে','যেভাবে','যেমন','যতক্ষণ',
  'অর্থাৎ','অর্থে','মানে','বিশেষত','বিশেষভাবে',
];

const CLAUSE_CONNECTORS_EN = [
  'and','but','or','yet','so','for','nor',
  'although','though','even though','while','whereas',
  'because','since','as','so that','in order that',
  'if','unless','until','when','where','that','which','who',
  'however','therefore','moreover','furthermore','nevertheless',
];

// Sentence ending markers
const BN_END  = /[।॥]/g;
const EN_END  = /[.!?]+/g;
const ANY_END = /[।॥.!?]+/g;

// Question words (Bangla)
const QUESTION_WORDS_BN = ['কি','কী','কে','কোথায়','কখন','কীভাবে','কেন','কতটুকু','কতজন','কোন'];
const QUESTION_WORDS_EN = ['what','who','where','when','how','why','which','whose','whom'];

// Exclamatory patterns
const EXCLAIM_PATTERNS_BN = ['কী সুন্দর','কী অপূর্ব','হায়','আহা','ওহ','বাহ','কী আশ্চর্য'];

// ─── Sentence Splitting ───────────────────────────────────────────────────────

/**
 * Split text into sentences preserving original text
 */
function splitSentences(text) {
  if (!text || !text.trim()) return [];

  // Split on Bangla danda (।  ॥) and English end marks
  // But don't split on decimal points (3.14) or abbreviations
  const raw = text
    .replace(/([।॥])/g, '$1\x01')
    .replace(/([.!?]+)(\s+[A-Zঀ-৿])/g, '$1\x01$2')
    .replace(/([.!?]+)(\s*$)/g, '$1\x01')
    .split('\x01')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return raw;
}

function countWords(sentence) {
  return sentence.trim().split(/\s+/).filter(Boolean).length;
}

function countSyllables(word) {
  // Approximate for Bangla: each vowel sign or independent vowel = syllable
  const banglaVowels = (word.match(/[\u09BE-\u09CC\u0985-\u098C\u0990\u0993-\u0994]/g) || []).length;
  const consonants   = (word.match(/[\u0995-\u09B9\u09DC-\u09DD\u09DF]/g) || []).length;
  if (banglaVowels > 0) return Math.max(1, banglaVowels);
  // English syllable approximation
  const eng = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!eng) return 1;
  const count = eng.match(/[aeiou]+/g)?.length || 1;
  return Math.max(1, count - (eng.endsWith('e') ? 1 : 0));
}

// ─── Sentence Classification ──────────────────────────────────────────────────

function classifySentence(sentence) {
  const lower = sentence.toLowerCase();
  const words  = countWords(sentence);

  // Question
  const isQuestion =
    sentence.endsWith('?') ||
    QUESTION_WORDS_BN.some(q => sentence.startsWith(q) || sentence.includes(' ' + q + ' ')) ||
    QUESTION_WORDS_EN.some(q => lower.startsWith(q + ' '));

  // Exclamatory
  const isExclamatory =
    sentence.endsWith('!') ||
    EXCLAIM_PATTERNS_BN.some(p => sentence.includes(p));

  // Count clause connectors → complexity
  const connectorCount = [
    ...CLAUSE_CONNECTORS_BN,
    ...CLAUSE_CONNECTORS_EN,
  ].filter(c => lower.includes(c)).length;

  // Clause count (approximate: commas + connectors + 1)
  const commaCount = (sentence.match(/[,،]/g) || []).length;
  const clauseCount = Math.max(1, commaCount + connectorCount + 1);

  let sentenceType;
  if (isQuestion)      sentenceType = 'প্রশ্নবোধক';
  else if (isExclamatory) sentenceType = 'বিস্ময়বোধক';
  else if (clauseCount === 1) sentenceType = 'সরল';
  else if (clauseCount === 2) sentenceType = 'যৌগিক';
  else sentenceType = 'জটিল';

  const sentenceTypeEn =
    isQuestion ? 'Interrogative' :
    isExclamatory ? 'Exclamatory' :
    clauseCount === 1 ? 'Simple' :
    clauseCount === 2 ? 'Compound' : 'Complex';

  return {
    words,
    clauseCount,
    sentenceType,
    sentenceTypeEn,
    isQuestion,
    isExclamatory,
    connectorCount,
    commaCount,
  };
}

// ─── Readability ──────────────────────────────────────────────────────────────

function getBanglaReadabilityLabel(avgWordsPerSentence) {
  if (avgWordsPerSentence <= 8)  return { label: 'অতি সহজ',   color: 'green',  grade: 'শিশু পাঠক উপযোগী' };
  if (avgWordsPerSentence <= 14) return { label: 'সহজ',        color: 'teal',   grade: 'সাধারণ পাঠক উপযোগী' };
  if (avgWordsPerSentence <= 20) return { label: 'মাঝারি',     color: 'amber',  grade: 'শিক্ষিত পাঠক উপযোগী' };
  if (avgWordsPerSentence <= 28) return { label: 'কঠিন',       color: 'orange', grade: 'উচ্চশিক্ষিত পাঠক উপযোগী' };
  return                                { label: 'অতি কঠিন',   color: 'red',    grade: 'একাডেমিক / গবেষণা পর্যায়' };
}

// ─── Distribution ─────────────────────────────────────────────────────────────

function getLengthDistribution(sentences) {
  const buckets = {
    '১-৫ শব্দ':   { min: 1,  max: 5,  count: 0, label: 'ছোট' },
    '৬-১২ শব্দ':  { min: 6,  max: 12, count: 0, label: 'মাঝারি' },
    '১৩-২০ শব্দ': { min: 13, max: 20, count: 0, label: 'বড়' },
    '২১+ শব্দ':   { min: 21, max: Infinity, count: 0, label: 'অনেক বড়' },
  };
  sentences.forEach(s => {
    const w = s.words;
    for (const [key, bucket] of Object.entries(buckets)) {
      if (w >= bucket.min && w <= bucket.max) { bucket.count++; break; }
    }
  });
  return buckets;
}

// ─── Main Analysis ────────────────────────────────────────────────────────────

/**
 * Full sentence analysis
 * @param {string} text
 * @returns {object}
 */
export function analyzeSentences(text) {
  if (!text || !text.trim()) return null;

  const rawSentences = splitSentences(text);
  if (rawSentences.length === 0) return null;

  // Classify each sentence
  const sentences = rawSentences.map(raw => ({
    text: raw,
    ...classifySentence(raw),
  }));

  const totalSentences = sentences.length;
  const totalWords     = sentences.reduce((s, e) => s + e.words, 0);
  const wordLengths    = sentences.map(s => s.words);
  const avgWords       = totalWords / totalSentences;

  // Longest / shortest
  const sorted    = [...sentences].sort((a, b) => b.words - a.words);
  const longest   = sorted[0];
  const shortest  = sorted[sorted.length - 1];
  const median    = sorted[Math.floor(sorted.length / 2)];

  // Paragraph analysis
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const paraData   = paragraphs.map(p => ({
    text: p.slice(0, 80) + (p.length > 80 ? '…' : ''),
    sentences: splitSentences(p).length,
    words: p.split(/\s+/).filter(Boolean).length,
  }));

  // Type distribution
  const typeCounts = { সরল: 0, যৌগিক: 0, জটিল: 0, প্রশ্নবোধক: 0, বিস্ময়বোধক: 0 };
  sentences.forEach(s => { if (typeCounts[s.sentenceType] !== undefined) typeCounts[s.sentenceType]++; });

  // Clause distribution
  const totalClauses  = sentences.reduce((s, e) => s + e.clauseCount, 0);
  const avgClauses    = totalClauses / totalSentences;
  const distribution  = getLengthDistribution(sentences);
  const readability   = getBanglaReadabilityLabel(avgWords);

  return {
    totalSentences,
    totalWords,
    totalClauses,
    avgWords:   +avgWords.toFixed(1),
    avgClauses: +avgClauses.toFixed(1),
    longest,
    shortest,
    median,
    typeCounts,
    distribution,
    readability,
    paragraphs: {
      count:   paragraphs.length,
      avgSentencesPerPara: paragraphs.length ? +(totalSentences / paragraphs.length).toFixed(1) : 0,
      data:    paraData,
    },
    sentences, // full detail per sentence
  };
}

export const SAMPLES = [
  {
    label: 'ছোট অনুচ্ছেদ',
    text: `বাংলাদেশ একটি সুন্দর দেশ। এই দেশের মানুষ পরিশ্রমী। এখানে নদী আছে। পাখি গান গায়।`,
  },
  {
    label: 'মিশ্র বাক্য',
    text: `বাংলাদেশ স্বাধীন হয়েছিল ১৯৭১ সালে, যখন লক্ষ লক্ষ মানুষ জীবন দিয়েছিল। কী অপূর্ব এই দেশের ইতিহাস! তুমি কি জানো সুন্দরবনের কথা? পদ্মা, মেঘনা এবং যমুনা — এই তিনটি বড় নদী বাংলাদেশের বুক চিরে বয়ে গেছে, যা কৃষি ও যোগাযোগে গুরুত্বপূর্ণ ভূমিকা রাখে।`,
  },
  {
    label: 'দীর্ঘ প্রবন্ধ',
    text: `বাংলাদেশের অর্থনীতি মূলত তিনটি প্রধান খাতের উপর নির্ভরশীল: গার্মেন্টস শিল্প, কৃষি এবং প্রবাসী আয়।

গার্মেন্টস শিল্প বাংলাদেশের রপ্তানি আয়ের প্রায় ৮০ শতাংশ প্রদান করে। এই শিল্পে প্রায় ৪০ লক্ষ মানুষ কর্মরত, যাদের অধিকাংশই নারী।

কৃষি খাতে ধান, পাট, চা এবং সবজি প্রধান ফসল। বাংলাদেশ বিশ্বে ধান উৎপাদনে শীর্ষ দেশগুলোর মধ্যে একটি।`,
  },
];