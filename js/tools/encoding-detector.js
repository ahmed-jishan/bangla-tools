/**
 * Encoding Detector
 * Detects text encoding type with confidence score:
 *  - Unicode Bengali (NFD / NFC / NFKC)
 *  - Bijoy Bayanno (ASCII-encoded Bengali)
 *  - ANSI / ASCII
 *  - Mixed encoding (Bijoy + Unicode in same text)
 *  - Avro phonetic romanized
 *  - UTF-8 / UTF-16 byte-order detection
 *
 * Also detects:
 *  - Zero-width characters (ZWJ, ZWNJ, ZWSP)
 *  - Problematic characters that cause display issues
 *  - Unicode normalization form (NFC / NFD / NFKC)
 *  - Font compatibility issues
 */

// ─── Signature Patterns ───────────────────────────────────────────────────────

// Bijoy uses these extended ASCII code points heavily
const BIJOY_SIGNATURE_CHARS = new Set([
  0x00a6, 0x00a7, 0x00a8, 0x00ab, 0x00ac, 0x00ad, 0x00ae, 0x00af,
  0x00b0, 0x00b1, 0x00b2, 0x00b3, 0x00b4, 0x00b5, 0x00b6, 0x00b7,
  0x00b8, 0x00b9, 0x00ba, 0x00bb, 0x00bc, 0x00be, 0x00bf,
  0x00c0, 0x00c1, 0x00c2, 0x00c3, 0x00c4, 0x00c5, 0x00c6, 0x00c7, 0x00c8,
  0x00d0, 0x00d1, 0x00d2, 0x00d3, 0x00d4, 0x00d5, 0x00d6, 0x00d7, 0x00d8,
  0x00e0, 0x00e1, 0x00e2, 0x00e3, 0x00e4, 0x00e5, 0x00e6, 0x00e7,
  0x00f7, 0x00fe, 0x00ff, 0x2020,
]);

// Common Bijoy Latin chars used as Bengali glyphs
const BIJOY_LATIN_PATTERN = /[A-Za-z\u00a0-\u00ff]{3,}/;
const BIJOY_INDICATOR_SEQUENCES = [
  'evsjv',     // বাংলা
  'Avgv',      // আমা
  '†m',        // সে
  '\u2020',    // ত (dagger = ত in Bijoy)
  '\u00b2',    // ং
  '\u00b3',    // ঃ
];

// Unicode Bengali range
const UNICODE_BN_START = 0x0980;
const UNICODE_BN_END   = 0x09FF;

// Invisible/problematic characters
const ZERO_WIDTH_CHARS = {
  '\u200B': { name: 'Zero Width Space',          short: 'ZWSP',  danger: 'medium' },
  '\u200C': { name: 'Zero Width Non-Joiner',      short: 'ZWNJ',  danger: 'low' },
  '\u200D': { name: 'Zero Width Joiner',          short: 'ZWJ',   danger: 'low' },
  '\uFEFF': { name: 'Byte Order Mark (BOM)',       short: 'BOM',   danger: 'high' },
  '\u00A0': { name: 'Non-Breaking Space',         short: 'NBSP',  danger: 'low' },
  '\u2060': { name: 'Word Joiner',                short: 'WJ',    danger: 'medium' },
  '\u034F': { name: 'Combining Grapheme Joiner',  short: 'CGJ',   danger: 'medium' },
  '\u00AD': { name: 'Soft Hyphen',                short: 'SHY',   danger: 'low' },
};

// Unicode normalization forms
const NFC_FORMS = {
  NFC:  'Canonical Decomposition, Canonical Composition',
  NFD:  'Canonical Decomposition',
  NFKC: 'Compatibility Decomposition, Canonical Composition',
  NFKD: 'Compatibility Decomposition',
};

// ─── Analysis Functions ───────────────────────────────────────────────────────

function countUnicodeBengali(text) {
  return [...text].filter(c => {
    const code = c.codePointAt(0);
    return code >= UNICODE_BN_START && code <= UNICODE_BN_END;
  }).length;
}

function countBijoySignatures(text) {
  let count = 0;
  for (const ch of text) {
    if (BIJOY_SIGNATURE_CHARS.has(ch.codePointAt(0))) count++;
  }
  return count;
}

function hasBijoyIndicators(text) {
  return BIJOY_INDICATOR_SEQUENCES.some(seq => text.includes(seq));
}

function detectZeroWidthChars(text) {
  const found = [];
  Object.entries(ZERO_WIDTH_CHARS).forEach(([char, info]) => {
    const count = (text.split(char).length - 1);
    if (count > 0) {
      found.push({
        char,
        codePoint: char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
        ...info,
        count,
      });
    }
  });
  return found;
}

function detectNormalizationForm(text) {
  if (!text.trim()) return null;
  // Check if text changes under different normalization
  const nfc  = text.normalize('NFC');
  const nfd  = text.normalize('NFD');
  const nfkc = text.normalize('NFKC');

  const isNFC  = text === nfc;
  const isNFD  = text === nfd;
  const isNFKC = text === nfkc;

  if (isNFC && isNFD)   return { form: 'NFC+NFD', note: 'ASCII-only or already normalized' };
  if (isNFC)            return { form: 'NFC',  description: 'Composed form — recommended for web' };
  if (isNFD)            return { form: 'NFD',  description: 'Decomposed form — may cause display issues' };
  if (isNFKC)           return { form: 'NFKC', description: 'Compatibility composed' };
  return { form: 'Unknown', description: 'Non-standard normalization' };
}

function getCharacterClasses(text) {
  const classes = {
    unicodeBengali: 0,
    bengaliVowelSigns: 0,
    bengaliConsonants: 0,
    bengaliDigits: 0,
    banglaHasanta: 0,
    latinAscii: 0,
    latinExtended: 0,
    arabicNumerals: 0,
    whitespace: 0,
    punctuation: 0,
    bijoySignature: 0,
    other: 0,
  };

  for (const ch of text) {
    const code = ch.codePointAt(0);

    if (code >= 0x0980 && code <= 0x09FF) {
      classes.unicodeBengali++;
      if (code >= 0x09BE && code <= 0x09CC) classes.bengaliVowelSigns++;
      else if (code >= 0x0995 && code <= 0x09B9) classes.bengaliConsonants++;
      else if (code >= 0x09E6 && code <= 0x09EF) classes.bengaliDigits++;
      if (code === 0x09CD) classes.banglaHasanta++;
    } else if (code >= 0x0041 && code <= 0x007E) {
      classes.latinAscii++;
    } else if (code >= 0x00A0 && code <= 0x00FF) {
      classes.latinExtended++;
      if (BIJOY_SIGNATURE_CHARS.has(code)) classes.bijoySignature++;
    } else if (code >= 0x0030 && code <= 0x0039) {
      classes.arabicNumerals++;
    } else if (/\s/.test(ch)) {
      classes.whitespace++;
    } else if (/[।॥.!?,;:"""''()\[\]{}]/.test(ch)) {
      classes.punctuation++;
    } else {
      classes.other++;
    }
  }

  return classes;
}

function getProblematicPatterns(text) {
  const issues = [];

  // Consecutive hasanta (্্)
  if (/্্/.test(text)) {
    issues.push({
      type: 'double_hasanta',
      severity: 'warning',
      label: 'Double Hasanta',
      description: 'দুটি পরপর হসন্ত (্্) — সম্ভবত encoding error',
      count: (text.match(/্্/g) || []).length,
    });
  }

  // Vowel sign without preceding consonant
  if (/^[\u09BE-\u09CC]/.test(text) || /\s[\u09BE-\u09CC]/.test(text)) {
    issues.push({
      type: 'orphan_matra',
      severity: 'warning',
      label: 'Orphan Vowel Sign',
      description: 'ব্যঞ্জনবর্ণ ছাড়া মাত্রা — display issue হতে পারে',
      count: (text.match(/\s[\u09BE-\u09CC]/g) || []).length,
    });
  }

  // Mixed Bijoy + Unicode in same word
  const words = text.split(/\s+/);
  let mixedCount = 0;
  words.forEach(w => {
    const hasUnicode = [...w].some(c => {
      const code = c.codePointAt(0);
      return code >= 0x0980 && code <= 0x09FF;
    });
    const hasBijoy = [...w].some(c => BIJOY_SIGNATURE_CHARS.has(c.codePointAt(0)));
    if (hasUnicode && hasBijoy) mixedCount++;
  });
  if (mixedCount > 0) {
    issues.push({
      type: 'mixed_encoding_word',
      severity: 'error',
      label: 'Mixed Encoding in Word',
      description: 'একই শব্দে Unicode + Bijoy — text ভেঙে যাবে',
      count: mixedCount,
    });
  }

  return issues;
}

// ─── Main Detection ───────────────────────────────────────────────────────────

/**
 * Detect encoding type of input text
 * @param {string} text
 * @returns {object} - Detection result with confidence
 */
export function detectEncoding(text) {
  if (!text) return null;

  const totalChars = text.length;
  const classes = getCharacterClasses(text);
  const unicodeBengaliRatio = classes.unicodeBengali / totalChars;
  const bijoyRatio = classes.bijoySignature / totalChars;
  const latinRatio = classes.latinAscii / totalChars;

  // ── Determine primary encoding ──
  let primaryEncoding, confidence, description, recommendation;

  const hasUnicodeBengali = classes.unicodeBengali > 2;
  const hasBijoyChars = classes.bijoySignature > 2 || hasBijoyIndicators(text);
  const hasLatin = classes.latinAscii > 5;

  if (hasUnicodeBengali && hasBijoyChars) {
    // Both present = mixed encoding
    primaryEncoding = 'MIXED';
    confidence = 'high';
    description = 'Unicode Bengali এবং Bijoy encoding দুটোই আছে — সম্ভবত copy-paste error বা conversion incomplete';
    recommendation = 'Bijoy → Unicode converter দিয়ে পুরো text আবার convert করুন';
  } else if (hasUnicodeBengali) {
    const subtype = detectUnicodeSubtype(text);
    primaryEncoding = `UNICODE_BENGALI`;
    confidence = unicodeBengaliRatio > 0.3 ? 'high' : 'medium';
    description = `Unicode Bengali (${subtype}) — সব আধুনিক browser ও software এ সঠিক দেখাবে`;
    recommendation = 'কোনো conversion দরকার নেই — এটি সঠিক encoding';
  } else if (hasBijoyChars) {
    primaryEncoding = 'BIJOY';
    confidence = classes.bijoySignature > 5 ? 'high' : 'medium';
    description = 'Bijoy Bayanno encoding — পুরনো software এ তৈরি, ওয়েবে সঠিক দেখাবে না';
    recommendation = 'Bijoy → Unicode converter ব্যবহার করুন';
  } else if (latinRatio > 0.7) {
    // Check if it's Avro phonetic
    const isAvroLike = isLikelyAvroPhonetic(text);
    primaryEncoding = isAvroLike ? 'AVRO_PHONETIC' : 'ASCII';
    confidence = 'medium';
    description = isAvroLike
      ? 'Avro phonetic romanized text — Avro Phonetic converter দিয়ে বাংলায় রূপান্তর করুন'
      : 'ASCII / English text — বাংলা character নেই';
    recommendation = isAvroLike
      ? 'Avro Phonetic tool ব্যবহার করে বাংলায় রূপান্তর করুন'
      : 'যদি বাংলা text হওয়ার কথা, তাহলে সঠিক file/encoding থেকে copy করুন';
  } else {
    primaryEncoding = 'UNKNOWN';
    confidence = 'low';
    description = 'Encoding নির্ধারণ করা যায়নি';
    recommendation = 'Text টি আবার source থেকে copy করুন';
  }

  // ── Normalization ──
  const normalization = detectNormalizationForm(text);

  // ── Hidden characters ──
  const zeroWidthChars = detectZeroWidthChars(text);
  const problematicPatterns = getProblematicPatterns(text);

  // ── Byte estimate ──
  let byteSize = 0;
  try { byteSize = new TextEncoder().encode(text).length; } catch {}

  // ── Confidence score ──
  const confidenceScore = {
    high:   { label: 'উচ্চ (90%+)',   color: 'green'  },
    medium: { label: 'মধ্যম (60-90%)', color: 'amber'  },
    low:    { label: 'কম (<60%)',      color: 'red'    },
  }[confidence];

  return {
    primaryEncoding,
    confidence,
    confidenceScore,
    description,
    recommendation,
    normalization,
    classes,
    totalChars,
    byteSize,
    bytePerChar: totalChars ? (byteSize / totalChars).toFixed(1) : 0,
    zeroWidthChars,
    problematicPatterns,
    hasBOM: text.startsWith('\uFEFF'),
    summary: {
      unicodeBengali: classes.unicodeBengali,
      bijoyChars: classes.bijoySignature,
      latinChars: classes.latinAscii,
      whitespace: classes.whitespace,
    },
  };
}

function detectUnicodeSubtype(text) {
  const hasMatras = /[\u09BE-\u09CC]/.test(text);
  const hasConjuncts = /\u09CD/.test(text); // hasanta
  if (hasConjuncts && hasMatras) return 'NFC with conjuncts';
  if (hasConjuncts) return 'NFC with hasanta';
  if (hasMatras) return 'NFC';
  return 'Basic';
}

function isLikelyAvroPhonetic(text) {
  // Common Avro patterns: kh, gh, ch, sh, bh, th, dh, ph
  const avroPatterns = /\b(kh|gh|ch|sh|bh|th|dh|ph|ng|rr|bangladesh|bangla|ami|tumi|bhalo)\b/i;
  return avroPatterns.test(text);
}

// ─── Character Inspector ──────────────────────────────────────────────────────

/**
 * Inspect individual characters in text
 * @param {string} text
 * @param {number} maxChars - limit for performance
 */
export function inspectCharacters(text, maxChars = 200) {
  const chars = [...text].slice(0, maxChars);
  return chars.map(ch => {
    const code = ch.codePointAt(0);
    const hex = code.toString(16).toUpperCase().padStart(4, '0');
    const isZW = ZERO_WIDTH_CHARS[ch];
    const isBijoySign = BIJOY_SIGNATURE_CHARS.has(code);
    const isUnicodeBn = code >= 0x0980 && code <= 0x09FF;

    let category = 'other';
    if (/\s/.test(ch)) category = 'whitespace';
    else if (isZW) category = 'zero-width';
    else if (isUnicodeBn) category = 'bengali';
    else if (isBijoySign) category = 'bijoy';
    else if (code < 0x0080) category = 'ascii';
    else if (code <= 0x00FF) category = 'latin-ext';

    return {
      char: ch,
      display: isZW ? `[${isZW.short}]` : ch,
      codePoint: `U+${hex}`,
      decimal: code,
      name: isZW?.name || getCharName(code),
      category,
      isProblematic: !!isZW || isBijoySign,
    };
  });
}

function getCharName(code) {
  if (code >= 0x0985 && code <= 0x098C) return 'Bengali Vowel';
  if (code >= 0x0995 && code <= 0x09B9) return 'Bengali Consonant';
  if (code >= 0x09BE && code <= 0x09CC) return 'Bengali Vowel Sign';
  if (code === 0x09CD) return 'Bengali Virama (Hasanta)';
  if (code >= 0x09E6 && code <= 0x09EF) return 'Bengali Digit';
  if (code >= 0x0041 && code <= 0x005A) return 'Latin Capital Letter';
  if (code >= 0x0061 && code <= 0x007A) return 'Latin Small Letter';
  if (code >= 0x0030 && code <= 0x0039) return 'Digit';
  return `U+${code.toString(16).toUpperCase().padStart(4,'0')}`;
}

export const SAMPLES = [
  {
    label: 'Unicode বাংলা',
    text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
    expectedEncoding: 'UNICODE_BENGALI',
  },
  {
    label: 'Bijoy text',
    text: 'Avgvi †mvbvi evsjv, Avwg †Zvgvq fv‡jvevwm|',
    expectedEncoding: 'BIJOY',
  },
  {
    label: 'Mixed encoding',
    text: 'আমার Avgvi mixed text বাংলা',
    expectedEncoding: 'MIXED',
  },
  {
    label: 'Avro phonetic',
    text: 'amar shonar bangla ami tomay bhalobashi',
    expectedEncoding: 'AVRO_PHONETIC',
  },
  {
    label: 'Hidden chars test',
    text: 'বাংলা\u200Bটেক্সট\uFEFFএখানে\u200Cআছে',
    expectedEncoding: 'UNICODE_BENGALI',
  },
];