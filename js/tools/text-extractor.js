/**
 * Text Extractor
 * Extract structured data from unstructured text:
 *  - URLs / links
 *  - Email addresses
 *  - Phone numbers (BD: 01XXXXXXXXX, international)
 *  - Numbers (English + Bangla digits)
 *  - Dates (various formats, Bangla included)
 *  - Hashtags (#tag)
 *  - Mentions (@user)
 *  - Bengali words only
 *  - English words only
 *  - Custom pattern (user-defined regex)
 */

// ─── Patterns ─────────────────────────────────────────────────────────────────

const PATTERNS = {

  url: {
    label: 'URL / Link',
    icon: '🔗',
    color: 'blue',
    regex: /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}[^\s<>"']*/gi,
    clean: (m) => m.replace(/[.,;:!?)]+$/, ''), // strip trailing punctuation
  },

  email: {
    label: 'Email Address',
    icon: '📧',
    color: 'teal',
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    clean: (m) => m.toLowerCase(),
  },

  phone_bd: {
    label: 'BD Phone Number',
    icon: '📱',
    color: 'green',
    // Bangladeshi: 01XXXXXXXXX (11 digits), with optional +880, 880 prefix
    regex: /(?:\+?880|0)1[3-9]\d{8}/g,
    clean: (m) => m,
  },

  phone_intl: {
    label: 'International Phone',
    icon: '☎️',
    color: 'green',
    regex: /\+?[1-9]\d{1,3}[\s\-.]?\(?\d{1,4}\)?[\s\-.]?\d{1,4}[\s\-.]?\d{1,9}/g,
    clean: (m) => m.trim(),
  },

  number_en: {
    label: 'English সংখ্যা',
    icon: '🔢',
    color: 'amber',
    regex: /-?(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?/g,
    clean: (m) => m,
  },

  number_bn: {
    label: 'বাংলা সংখ্যা',
    icon: '🔢',
    color: 'amber',
    regex: /[০-৯]+(?:[.][০-৯]+)?/g,
    clean: (m) => m,
  },

  date_en: {
    label: 'English Date',
    icon: '📅',
    color: 'purple',
    regex: /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b/gi,
    clean: (m) => m,
  },

  date_bn: {
    label: 'বাংলা তারিখ',
    icon: '📅',
    color: 'purple',
    regex: /[০-৯১-৯]{1,2}\s*(?:জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর|বৈশাখ|জ্যৈষ্ঠ|আষাঢ়|শ্রাবণ|ভাদ্র|আশ্বিন|কার্তিক|অগ্রহায়ণ|পৌষ|মাঘ|ফাল্গুন|চৈত্র)\s*,?\s*[০-৯১-৯]{4}/g,
    clean: (m) => m.trim(),
  },

  hashtag: {
    label: 'Hashtag',
    icon: '#️⃣',
    color: 'coral',
    regex: /#[\u0980-\u09FFa-zA-Z0-9_]+/g,
    clean: (m) => m.toLowerCase(),
  },

  mention: {
    label: 'Mention (@)',
    icon: '@',
    color: 'coral',
    regex: /@[a-zA-Z0-9_\u0980-\u09FF]+/g,
    clean: (m) => m,
  },

  bangla_words: {
    label: 'বাংলা শব্দ',
    icon: '🔤',
    color: 'teal',
    regex: /[\u0980-\u09FF]+(?:[\u09BE-\u09CC\u09CD\u0980-\u09FF]*[\u0980-\u09FF])?/g,
    clean: (m) => m,
  },

  english_words: {
    label: 'English শব্দ',
    icon: '🔡',
    color: 'blue',
    regex: /\b[a-zA-Z]{2,}\b/g,
    clean: (m) => m,
  },

  nid: {
    label: 'NID / জাতীয় পরিচয়পত্র',
    icon: '🪪',
    color: 'amber',
    // BD NID: 10, 13, or 17 digits
    regex: /\b(?:\d{10}|\d{13}|\d{17})\b/g,
    clean: (m) => m,
  },

  currency: {
    label: 'মুদ্রা / Currency',
    icon: '💰',
    color: 'green',
    regex: /(?:৳|Tk\.?|BDT|USD|\$|€|£|¥)\s*[০-৯0-9,]+(?:\.[০-৯0-9]+)?|[০-৯0-9,]+(?:\.[০-৯0-9]+)?\s*(?:টাকা|পয়সা|taka)/gi,
    clean: (m) => m.trim(),
  },

};

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract items matching a pattern key
 * @param {string} text
 * @param {string} patternKey
 * @returns {{ items: string[], unique: string[], count: number }}
 */
export function extract(text, patternKey) {
  if (!text || !patternKey) return { items: [], unique: [], count: 0 };

  const pattern = PATTERNS[patternKey];
  if (!pattern) return { items: [], unique: [], count: 0 };

  const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
  const raw   = text.match(regex) || [];
  const items = raw.map(m => pattern.clean(m)).filter(Boolean);
  const unique = [...new Set(items)];

  return { items, unique, count: items.length, uniqueCount: unique.length };
}

/**
 * Extract using custom regex pattern
 * @param {string} text
 * @param {string} regexStr
 * @param {string} flags
 */
export function extractCustom(text, regexStr, flags = 'g') {
  if (!text || !regexStr) return { items: [], unique: [], count: 0, error: null };

  try {
    const regex = new RegExp(regexStr, flags.includes('g') ? flags : flags + 'g');
    const items = text.match(regex) || [];
    const unique = [...new Set(items)];
    return { items, unique, count: items.length, uniqueCount: unique.length, error: null };
  } catch (e) {
    return { items: [], unique: [], count: 0, error: 'অবৈধ Regular Expression: ' + e.message };
  }
}

/**
 * Extract all pattern types at once
 */
export function extractAll(text) {
  const results = {};
  Object.keys(PATTERNS).forEach(key => {
    const r = extract(text, key);
    if (r.count > 0) results[key] = r;
  });
  return results;
}

export { PATTERNS };

export const SAMPLES = [
  {
    label: 'Contact info',
    text: `যোগাযোগ করুন: info@banglatools.com অথবা support@example.bd
ফোন: 01712345678, 01987654321, +8801612345678
ওয়েবসাইট: https://banglatools.com এবং www.example.com.bd
ঠিকানা: ঢাকা ১২০৭, বাংলাদেশ।`,
  },
  {
    label: 'Social media post',
    text: `আজকে #বাংলাদেশ দলের অসাধারণ জয়! @SakibAlHasan ৮৫ রান করেছেন 🏏
#cricket #BCB @BCCI এই ম্যাচটি ৫ নভেম্বর ২০২৪ তারিখে হয়েছে।
টিকেট মূল্য: ৳৫০০ থেকে ৳২০০০ পর্যন্ত। আরো জানতে: www.bcb.com.bd`,
  },
  {
    label: 'Article with data',
    text: `বাংলাদেশের GDP ২০২৩ সালে ছিল প্রায় $৪৬০ billion। জনসংখ্যা ১৭,০০,০০,০০০ এর বেশি।
যোগাযোগ: pm@cabinet.gov.bd | ফোন: 02-9145000
তারিখ: 16/12/2024 অথবা ১৬ ডিসেম্বর ২০২৪।`,
  },
];