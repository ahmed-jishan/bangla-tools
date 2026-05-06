/**
 * Reading Time Estimator
 * Estimates reading time with:
 *  - Audience presets (student, professional, researcher)
 *  - Language-aware WPM (Bangla reads slower than English)
 *  - Audio/speech time estimation
 *  - Content type adjustment (article, novel, technical, poetry)
 *  - Progress tracker mode
 */

// ─── Reading Speed Database ───────────────────────────────────────────────────

export const AUDIENCE_PRESETS = {
  student: {
    label: 'শিক্ষার্থী',
    labelEn: 'Student',
    icon: '📚',
    bangla: 120,    // wpm
    english: 200,
    description: 'সাধারণ পাঠক, বিষয় নতুন হলে ধীরে পড়েন',
  },
  professional: {
    label: 'পেশাদার',
    labelEn: 'Professional',
    icon: '💼',
    bangla: 160,
    english: 250,
    description: 'অভিজ্ঞ পাঠক, পরিচিত বিষয়ে দ্রুত পড়েন',
  },
  researcher: {
    label: 'গবেষক',
    labelEn: 'Researcher',
    icon: '🔬',
    bangla: 100,
    english: 180,
    description: 'ধীরে, মনোযোগ দিয়ে, বিশ্লেষণ করতে করতে পড়েন',
  },
  speed: {
    label: 'দ্রুত পাঠক',
    labelEn: 'Speed Reader',
    icon: '⚡',
    bangla: 220,
    english: 400,
    description: 'Speed reading technique ব্যবহার করেন',
  },
};

export const CONTENT_TYPES = {
  article: {
    label: 'আর্টিকেল / ব্লগ',
    icon: '📰',
    multiplier: 1.0,
    description: 'সাধারণ গদ্য',
  },
  technical: {
    label: 'Technical / একাডেমিক',
    icon: '⚙️',
    multiplier: 1.5,
    description: 'জটিল বিষয়, বেশি সময় লাগে',
  },
  novel: {
    label: 'গল্প / উপন্যাস',
    icon: '📖',
    multiplier: 0.9,
    description: 'আকর্ষণীয়, একটু দ্রুত পড়া যায়',
  },
  poetry: {
    label: 'কবিতা',
    icon: '🎭',
    multiplier: 2.0,
    description: 'অনুভব করতে করতে পড়তে হয়',
  },
  news: {
    label: 'সংবাদ',
    icon: '📡',
    multiplier: 0.85,
    description: 'সংক্ষিপ্ত, সহজ ভাষা',
  },
};

// Speech rate (words per minute for narration)
const SPEECH_WPM = {
  bangla: { slow: 100, normal: 130, fast: 160 },
  english: { slow: 120, normal: 150, fast: 180 },
};

// ─── Language Detection ───────────────────────────────────────────────────────

function detectPrimaryLang(text) {
  const chars = [...text].filter(c => c.trim());
  if (!chars.length) return 'english';
  const bangla = chars.filter(c => {
    const code = c.codePointAt(0);
    return code >= 0x0980 && code <= 0x09FF;
  }).length;
  return bangla / chars.length > 0.3 ? 'bangla' : 'english';
}

// ─── Core Functions ───────────────────────────────────────────────────────────

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function countSentences(text) {
  return text.split(/[।॥.!?]+/).filter(s => s.trim()).length;
}

function countParagraphs(text) {
  return text.split(/\n\s*\n/).filter(p => p.trim()).length;
}

function secondsToDisplay(seconds) {
  if (seconds < 60) {
    return { value: seconds, unit: 'সেকেন্ড', unitEn: 'sec', formatted: `${seconds} সেকেন্ড` };
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) {
    const str = s > 0 ? `${m} মিনিট ${s} সেকেন্ড` : `${m} মিনিট`;
    return { value: m, unit: 'মিনিট', unitEn: 'min', formatted: str, minutes: m, seconds: s };
  }
  const h = Math.floor(m / 60);
  const rem = m % 60;
  const str = rem > 0 ? `${h} ঘণ্টা ${rem} মিনিট` : `${h} ঘণ্টা`;
  return { value: h, unit: 'ঘণ্টা', unitEn: 'hr', formatted: str };
}

/**
 * Main estimation function
 * @param {string} text
 * @param {string} audienceKey - key from AUDIENCE_PRESETS
 * @param {string} contentTypeKey - key from CONTENT_TYPES
 * @returns {object}
 */
export function estimateReadingTime(text, audienceKey = 'professional', contentTypeKey = 'article') {
  if (!text || !text.trim()) return null;

  const lang = detectPrimaryLang(text);
  const words = countWords(text);
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);

  const audience = AUDIENCE_PRESETS[audienceKey] || AUDIENCE_PRESETS.professional;
  const contentType = CONTENT_TYPES[contentTypeKey] || CONTENT_TYPES.article;

  const baseWPM = lang === 'bangla' ? audience.bangla : audience.english;
  const adjustedWPM = baseWPM / contentType.multiplier;

  const readSeconds = Math.ceil((words / adjustedWPM) * 60);
  const speechSeconds = {
    slow: Math.ceil((words / SPEECH_WPM[lang].slow) * 60),
    normal: Math.ceil((words / SPEECH_WPM[lang].normal) * 60),
    fast: Math.ceil((words / SPEECH_WPM[lang].fast) * 60),
  };

  // Pages estimate (250 words/page standard, 150 for Bangla)
  const wordsPerPage = lang === 'bangla' ? 150 : 250;
  const pages = Math.max(1, Math.ceil(words / wordsPerPage));

  // A4 lines estimate (~12 words per line)
  const a4Lines = Math.ceil(words / 12);

  return {
    words,
    sentences,
    paragraphs,
    lang,
    wpmUsed: Math.round(adjustedWPM),
    audience: { ...audience, key: audienceKey },
    contentType: { ...contentType, key: contentTypeKey },
    readingTime: secondsToDisplay(readSeconds),
    speechTime: {
      slow: secondsToDisplay(speechSeconds.slow),
      normal: secondsToDisplay(speechSeconds.normal),
      fast: secondsToDisplay(speechSeconds.fast),
    },
    pages,
    a4Lines,
    rawSeconds: readSeconds,
  };
}

/**
 * Milestone reading goals
 * Given a target time (minutes), how much more text is needed?
 */
export function getMilestoneInfo(currentWords, audienceKey = 'professional', lang = 'bangla') {
  const audience = AUDIENCE_PRESETS[audienceKey] || AUDIENCE_PRESETS.professional;
  const wpm = lang === 'bangla' ? audience.bangla : audience.english;

  const milestones = [1, 3, 5, 10, 15, 30].map(minutes => {
    const target = Math.ceil(wpm * minutes);
    const remaining = Math.max(0, target - currentWords);
    return { minutes, targetWords: target, remaining, reached: currentWords >= target };
  });

  return milestones;
}

export const SAMPLES = [
  {
    label: 'ছোট অনুচ্ছেদ (~৫০ শব্দ)',
    text: `আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি। ও মা, ফাগুনে তোর আমের বনে ঘ্রাণে পাগল করে, মরি হায়, হায় রে—ও মা, অঘ্রানে তোর ভরা ক্ষেতে আমি কী দেখেছি মধুর হাসি।`,
  },
  {
    label: 'মাঝারি আর্টিকেল (~১৫০ শব্দ)',
    text: `বাংলাদেশ দক্ষিণ এশিয়ার একটি ছোট কিন্তু ঘনবসতিপূর্ণ দেশ। ১৯৭১ সালে দীর্ঘ মুক্তিযুদ্ধের মাধ্যমে এই দেশটি স্বাধীনতা অর্জন করে। বাংলাদেশের মোট আয়তন প্রায় ১ লক্ষ ৪৭ হাজার বর্গকিলোমিটার এবং জনসংখ্যা প্রায় ১৭ কোটি।

বাংলাদেশের অর্থনীতি মূলত গার্মেন্টস শিল্প, কৃষি এবং প্রবাসী আয়ের উপর নির্ভরশীল। দেশটির GDP growth rate গত এক দশক ধরে গড়ে ৬-৭ শতাংশ, যা দক্ষিণ এশিয়ার মধ্যে অন্যতম সর্বোচ্চ।

বাংলাদেশের প্রধান নদীগুলো হলো পদ্মা, মেঘনা এবং যমুনা। এই নদীগুলো দেশের কৃষিকাজে গুরুত্বপূর্ণ ভূমিকা রাখে। সুন্দরবন, যা পৃথিবীর সবচেয়ে বড় ম্যানগ্রোভ বন, বাংলাদেশের দক্ষিণ-পশ্চিম অঞ্চলে অবস্থিত।`,
  },
  {
    label: 'Technical text',
    text: `Unicode is a computing industry standard for the consistent encoding, representation, and handling of text expressed in most of the world's writing systems. The standard, which is maintained by the Unicode Consortium, defines 154,998 characters covering 168 modern and historic scripts, as well as multiple symbol sets and emoji.

Bengali (Bangla) script in Unicode occupies the block U+0980–U+09FF. This block contains characters for the Bengali language as well as the Assamese language. The Bengali script is also used for writing Bishnupriya Manipuri, Chakma, Hajong, and Sylheti Nagri.`,
  },
];