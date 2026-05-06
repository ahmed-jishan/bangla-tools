/**
 * Text Truncator
 * Bangla-aware truncation at multiple levels:
 *  - By character count (grapheme-aware — counts বাংলা correctly)
 *  - By word count
 *  - By line count
 *  - By sentence count
 *  - By byte size (UTF-8)
 *  - Smart truncation: don't cut mid-word, mid-sentence
 *  - Custom suffix (…, [more], custom text)
 *  - Preview original vs truncated diff
 */

// ─── Segmentation ─────────────────────────────────────────────────────────────

const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;

function getGraphemes(text) {
  if (!text) return [];
  if (hasSegmenter) {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return [...seg.segment(text)].map(s => s.segment);
  }
  // Fallback
  const result = [];
  const chars = [...text];
  let i = 0;
  while (i < chars.length) {
    let cluster = chars[i++];
    while (i < chars.length) {
      const code = chars[i].codePointAt(0);
      if (
        (code >= 0x09BE && code <= 0x09CC) ||
        code === 0x09CD || code === 0x09BC ||
        (code >= 0x0981 && code <= 0x0983)
      ) { cluster += chars[i++]; } else break;
    }
    result.push(cluster);
  }
  return result;
}

function getWords(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function getSentences(text) {
  return text
    .replace(/([।॥!?]+)/g, '$1\x01')
    .replace(/([.]+\s)/g, '$1\x01')
    .split('\x01')
    .map(s => s.trim())
    .filter(Boolean);
}

function getLines(text) {
  return text.split('\n');
}

// ─── UTF-8 Byte Counter ───────────────────────────────────────────────────────

function getByteLength(text) {
  try { return new TextEncoder().encode(text).length; }
  catch { return text.length; }
}

function truncateToBytes(text, maxBytes, suffix = '…') {
  if (!text) return '';
  const suffixBytes = getByteLength(suffix);
  const targetBytes = maxBytes - suffixBytes;
  if (targetBytes <= 0) return suffix;

  const encoder = new TextEncoder();
  const graphemes = getGraphemes(text);
  let result = '';
  let bytes = 0;

  for (const g of graphemes) {
    const gBytes = encoder.encode(g).length;
    if (bytes + gBytes > targetBytes) break;
    result += g;
    bytes += gBytes;
  }

  return result.trim() + (result.length < text.length ? suffix : '');
}

// ─── Truncation Functions ─────────────────────────────────────────────────────

/**
 * Truncate by grapheme count (visually correct for Bengali)
 * @param {string} text
 * @param {number} maxGraphemes
 * @param {object} options
 */
function truncateByChars(text, maxGraphemes, options = {}) {
  const { suffix = '…', smart = true } = options;
  if (!text) return { result: '', truncated: false, kept: 0, total: 0 };

  const graphemes = getGraphemes(text);
  const total = graphemes.length;

  if (total <= maxGraphemes) {
    return { result: text, truncated: false, kept: total, total };
  }

  let result = graphemes.slice(0, maxGraphemes).join('');

  if (smart) {
    // Don't cut mid-word: back up to last whitespace
    const lastSpace = Math.max(result.lastIndexOf(' '), result.lastIndexOf('\n'));
    if (lastSpace > maxGraphemes * 0.7) {
      result = result.slice(0, lastSpace);
    }
  }

  return {
    result: result.trim() + suffix,
    truncated: true,
    kept: maxGraphemes,
    total,
    removed: total - maxGraphemes,
  };
}

/**
 * Truncate by word count
 */
function truncateByWords(text, maxWords, options = {}) {
  const { suffix = '…', smart = true } = options;
  if (!text) return { result: '', truncated: false, kept: 0, total: 0 };

  // Split preserving whitespace structure
  const words = getWords(text);
  const total = words.length;

  if (total <= maxWords) {
    return { result: text, truncated: false, kept: total, total };
  }

  const kept = words.slice(0, maxWords);

  let result = kept.join(' ');

  if (smart) {
    // Don't end on a connector word (এবং, but, and, the...)
    const WEAK_ENDINGS = new Set(['এবং','বা','কিন্তু','the','and','but','or','a','an','in','on','at']);
    while (kept.length > 1 && WEAK_ENDINGS.has(kept[kept.length - 1].toLowerCase())) {
      kept.pop();
    }
    result = kept.join(' ');
  }

  return {
    result: result.trim() + suffix,
    truncated: true,
    kept: kept.length,
    total,
    removed: total - kept.length,
  };
}

/**
 * Truncate by sentence count
 */
function truncateBySentences(text, maxSentences, options = {}) {
  const { suffix = '' } = options; // sentences usually don't need ellipsis
  if (!text) return { result: '', truncated: false, kept: 0, total: 0 };

  const sentences = getSentences(text);
  const total = sentences.length;

  if (total <= maxSentences) {
    return { result: text, truncated: false, kept: total, total };
  }

  const result = sentences.slice(0, maxSentences).join(' ');
  return {
    result: result.trim() + suffix,
    truncated: true,
    kept: maxSentences,
    total,
    removed: total - maxSentences,
  };
}

/**
 * Truncate by line count
 */
function truncateByLines(text, maxLines, options = {}) {
  const { suffix = '…', includeLineCount = false } = options;
  if (!text) return { result: '', truncated: false, kept: 0, total: 0 };

  const lines = getLines(text);
  const total = lines.length;

  if (total <= maxLines) {
    return { result: text, truncated: false, kept: total, total };
  }

  const kept = lines.slice(0, maxLines);
  const extraLine = includeLineCount ? `\n[আরো ${total - maxLines} টি লাইন...]` : '';

  return {
    result: kept.join('\n') + extraLine,
    truncated: true,
    kept: maxLines,
    total,
    removed: total - maxLines,
  };
}

/**
 * Truncate by byte size (useful for API limits, SMS, database fields)
 */
function truncateByBytes(text, maxBytes, options = {}) {
  const { suffix = '…' } = options;
  if (!text) return { result: '', truncated: false, totalBytes: 0 };

  const totalBytes = getByteLength(text);
  if (totalBytes <= maxBytes) {
    return { result: text, truncated: false, totalBytes, kept: totalBytes };
  }

  const result = truncateToBytes(text, maxBytes, suffix);
  return {
    result,
    truncated: true,
    totalBytes,
    kept: getByteLength(result),
    removed: totalBytes - maxBytes,
  };
}

// ─── Preset Limits ────────────────────────────────────────────────────────────

export const PRESETS = {
  tweet: {
    label: 'Twitter/X (280 chars)',
    icon: '🐦',
    mode: 'chars',
    limit: 280,
    suffix: '…',
  },
  sms: {
    label: 'SMS (160 chars)',
    icon: '📱',
    mode: 'chars',
    limit: 160,
    suffix: '...',
  },
  meta_desc: {
    label: 'Meta Description (155 chars)',
    icon: '🔍',
    mode: 'chars',
    limit: 155,
    suffix: '…',
  },
  og_title: {
    label: 'OG Title (60 chars)',
    icon: '🌐',
    mode: 'chars',
    limit: 60,
    suffix: '…',
  },
  excerpt: {
    label: 'Article Excerpt (50 words)',
    icon: '📰',
    mode: 'words',
    limit: 50,
    suffix: '…',
  },
  summary: {
    label: 'Short Summary (3 sentences)',
    icon: '📝',
    mode: 'sentences',
    limit: 3,
    suffix: '',
  },
  db_varchar: {
    label: 'DB VARCHAR(255)',
    icon: '🗄️',
    mode: 'chars',
    limit: 255,
    suffix: '…',
  },
  preview: {
    label: 'Card Preview (100 chars)',
    icon: '🃏',
    mode: 'chars',
    limit: 100,
    suffix: '…',
  },
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Truncate text
 * @param {string} text
 * @param {object} options
 * @param {'chars'|'words'|'sentences'|'lines'|'bytes'} options.mode
 * @param {number} options.limit
 * @param {string} options.suffix
 * @param {boolean} options.smart - avoid cutting mid-word
 */
export function truncateText(text, options = {}) {
  const {
    mode = 'chars',
    limit = 280,
    suffix = '…',
    smart = true,
  } = options;

  if (!text || !text.trim()) return { result: '', truncated: false };

  switch (mode) {
    case 'chars':     return truncateByChars(text, limit, { suffix, smart });
    case 'words':     return truncateByWords(text, limit, { suffix, smart });
    case 'sentences': return truncateBySentences(text, limit, { suffix });
    case 'lines':     return truncateByLines(text, limit, { suffix });
    case 'bytes':     return truncateByBytes(text, limit, { suffix });
    default:          return truncateByChars(text, limit, { suffix, smart });
  }
}

/**
 * Apply a preset
 */
export function truncateWithPreset(text, presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return { result: text, truncated: false };
  return truncateText(text, {
    mode: preset.mode,
    limit: preset.limit,
    suffix: preset.suffix,
    smart: true,
  });
}

/**
 * Get full stats about text before truncation
 */
export function getTextInfo(text) {
  if (!text) return null;
  const graphemes = getGraphemes(text);
  const words     = getWords(text);
  const sentences = getSentences(text);
  const lines     = getLines(text);
  const bytes     = getByteLength(text);
  return {
    graphemes: graphemes.length,
    words:     words.length,
    sentences: sentences.length,
    lines:     lines.length,
    bytes,
    codeUnits: text.length,
  };
}

export const SAMPLES = [
  {
    label: 'দীর্ঘ বাংলা',
    text: `বাংলাদেশ দক্ষিণ এশিয়ার একটি ছোট কিন্তু ঘনবসতিপূর্ণ দেশ। ১৯৭১ সালে দীর্ঘ মুক্তিযুদ্ধের মাধ্যমে এই দেশটি স্বাধীনতা অর্জন করে। বাংলাদেশের মোট আয়তন প্রায় ১ লক্ষ ৪৭ হাজার বর্গকিলোমিটার এবং জনসংখ্যা প্রায় ১৭ কোটি। বাংলাদেশের অর্থনীতি মূলত গার্মেন্টস শিল্প, কৃষি এবং প্রবাসী আয়ের উপর নির্ভরশীল।`,
  },
  {
    label: 'Social media post',
    text: `আজকে বাংলাদেশ ক্রিকেট দল অসাধারণ খেলেছে! তারা শেষ ওভারে জয় পেয়েছে। সাকিব আল হাসান ৮৫ রান করেছেন এবং ৩টি উইকেট নিয়েছেন। এই জয়টি সত্যিই অবিশ্বাস্য ছিল। সবাইকে অভিনন্দন! #বাংলাদেশ #ক্রিকেট`,
  },
  {
    label: 'Long English',
    text: `Bangladesh is a developing country located in South Asia, bordered by India on the west, north, and east, Myanmar on the southeast, and the Bay of Bengal on the south. The country has a rich cultural heritage and a long history of civilization. The Bengali language and culture form the foundation of the nation's identity.`,
  },
];