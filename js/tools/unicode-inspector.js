/**
 * Unicode Inspector
 * Deep analysis of every character in text:
 *  - Unicode code point (U+XXXX)
 *  - Character name and category
 *  - Block name (Bengali, Latin, etc.)
 *  - Script identification
 *  - Encoding bytes (UTF-8, UTF-16)
 *  - Bengali-specific info (vowel sign, consonant, etc.)
 *  - Problematic character detection
 *  - Copy individual characters or code points
 */

// ─── Unicode Block Ranges ─────────────────────────────────────────────────────

const UNICODE_BLOCKS = [
  { start: 0x0000, end: 0x007F, name: 'Basic Latin',            script: 'Latin' },
  { start: 0x0080, end: 0x00FF, name: 'Latin-1 Supplement',     script: 'Latin' },
  { start: 0x0100, end: 0x017F, name: 'Latin Extended-A',        script: 'Latin' },
  { start: 0x0300, end: 0x036F, name: 'Combining Diacriticals',  script: 'Combining' },
  { start: 0x0600, end: 0x06FF, name: 'Arabic',                  script: 'Arabic' },
  { start: 0x0900, end: 0x097F, name: 'Devanagari',              script: 'Devanagari' },
  { start: 0x0980, end: 0x09FF, name: 'Bengali',                 script: 'Bengali' },
  { start: 0x0A00, end: 0x0A7F, name: 'Gurmukhi',               script: 'Gurmukhi' },
  { start: 0x0E00, end: 0x0E7F, name: 'Thai',                    script: 'Thai' },
  { start: 0x2000, end: 0x206F, name: 'General Punctuation',     script: 'Common' },
  { start: 0x2070, end: 0x209F, name: 'Superscripts/Subscripts', script: 'Common' },
  { start: 0x20A0, end: 0x20CF, name: 'Currency Symbols',        script: 'Common' },
  { start: 0x2100, end: 0x214F, name: 'Letterlike Symbols',      script: 'Common' },
  { start: 0x2150, end: 0x218F, name: 'Number Forms',            script: 'Common' },
  { start: 0x2190, end: 0x21FF, name: 'Arrows',                  script: 'Common' },
  { start: 0x2200, end: 0x22FF, name: 'Mathematical Operators',  script: 'Common' },
  { start: 0x25A0, end: 0x25FF, name: 'Geometric Shapes',        script: 'Common' },
  { start: 0x2600, end: 0x26FF, name: 'Misc Symbols',            script: 'Common' },
  { start: 0x1F300, end: 0x1F9FF, name: 'Emoji / Symbols',       script: 'Emoji' },
  { start: 0xFE00, end: 0xFE0F, name: 'Variation Selectors',     script: 'Inherited' },
  { start: 0xFEFF, end: 0xFEFF, name: 'BOM / Zero Width NBSP',   script: 'Common' },
  { start: 0x200B, end: 0x200F, name: 'Zero Width Chars',        script: 'Common' },
];

// ─── Bengali Character Database ───────────────────────────────────────────────

const BENGALI_CHARS = {
  // Independent vowels
  0x0985: { name: 'BENGALI LETTER A',            category: 'স্বরবর্ণ',   label: 'অ' },
  0x0986: { name: 'BENGALI LETTER AA',           category: 'স্বরবর্ণ',   label: 'আ' },
  0x0987: { name: 'BENGALI LETTER I',            category: 'স্বরবর্ণ',   label: 'ই' },
  0x0988: { name: 'BENGALI LETTER II',           category: 'স্বরবর্ণ',   label: 'ঈ' },
  0x0989: { name: 'BENGALI LETTER U',            category: 'স্বরবর্ণ',   label: 'উ' },
  0x098A: { name: 'BENGALI LETTER UU',           category: 'স্বরবর্ণ',   label: 'ঊ' },
  0x098B: { name: 'BENGALI LETTER VOCALIC R',    category: 'স্বরবর্ণ',   label: 'ঋ' },
  0x098F: { name: 'BENGALI LETTER E',            category: 'স্বরবর্ণ',   label: 'এ' },
  0x0990: { name: 'BENGALI LETTER AI',           category: 'স্বরবর্ণ',   label: 'ঐ' },
  0x0993: { name: 'BENGALI LETTER O',            category: 'স্বরবর্ণ',   label: 'ও' },
  0x0994: { name: 'BENGALI LETTER AU',           category: 'স্বরবর্ণ',   label: 'ঔ' },
  // Consonants
  0x0995: { name: 'BENGALI LETTER KA',           category: 'ব্যঞ্জনবর্ণ', label: 'ক' },
  0x0996: { name: 'BENGALI LETTER KHA',          category: 'ব্যঞ্জনবর্ণ', label: 'খ' },
  0x0997: { name: 'BENGALI LETTER GA',           category: 'ব্যঞ্জনবর্ণ', label: 'গ' },
  0x0998: { name: 'BENGALI LETTER GHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ঘ' },
  0x0999: { name: 'BENGALI LETTER NGA',          category: 'ব্যঞ্জনবর্ণ', label: 'ঙ' },
  0x099A: { name: 'BENGALI LETTER CA',           category: 'ব্যঞ্জনবর্ণ', label: 'চ' },
  0x099B: { name: 'BENGALI LETTER CHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ছ' },
  0x099C: { name: 'BENGALI LETTER JA',           category: 'ব্যঞ্জনবর্ণ', label: 'জ' },
  0x099D: { name: 'BENGALI LETTER JHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ঝ' },
  0x099E: { name: 'BENGALI LETTER NYA',          category: 'ব্যঞ্জনবর্ণ', label: 'ঞ' },
  0x099F: { name: 'BENGALI LETTER TTA',          category: 'ব্যঞ্জনবর্ণ', label: 'ট' },
  0x09A0: { name: 'BENGALI LETTER TTHA',         category: 'ব্যঞ্জনবর্ণ', label: 'ঠ' },
  0x09A1: { name: 'BENGALI LETTER DDA',          category: 'ব্যঞ্জনবর্ণ', label: 'ড' },
  0x09A2: { name: 'BENGALI LETTER DDHA',         category: 'ব্যঞ্জনবর্ণ', label: 'ঢ' },
  0x09A3: { name: 'BENGALI LETTER NNA',          category: 'ব্যঞ্জনবর্ণ', label: 'ণ' },
  0x09A4: { name: 'BENGALI LETTER TA',           category: 'ব্যঞ্জনবর্ণ', label: 'ত' },
  0x09A5: { name: 'BENGALI LETTER THA',          category: 'ব্যঞ্জনবর্ণ', label: 'থ' },
  0x09A6: { name: 'BENGALI LETTER DA',           category: 'ব্যঞ্জনবর্ণ', label: 'দ' },
  0x09A7: { name: 'BENGALI LETTER DHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ধ' },
  0x09A8: { name: 'BENGALI LETTER NA',           category: 'ব্যঞ্জনবর্ণ', label: 'ন' },
  0x09AA: { name: 'BENGALI LETTER PA',           category: 'ব্যঞ্জনবর্ণ', label: 'প' },
  0x09AB: { name: 'BENGALI LETTER PHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ফ' },
  0x09AC: { name: 'BENGALI LETTER BA',           category: 'ব্যঞ্জনবর্ণ', label: 'ব' },
  0x09AD: { name: 'BENGALI LETTER BHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ভ' },
  0x09AE: { name: 'BENGALI LETTER MA',           category: 'ব্যঞ্জনবর্ণ', label: 'ম' },
  0x09AF: { name: 'BENGALI LETTER YA',           category: 'ব্যঞ্জনবর্ণ', label: 'য' },
  0x09B0: { name: 'BENGALI LETTER RA',           category: 'ব্যঞ্জনবর্ণ', label: 'র' },
  0x09B2: { name: 'BENGALI LETTER LA',           category: 'ব্যঞ্জনবর্ণ', label: 'ল' },
  0x09B6: { name: 'BENGALI LETTER SHA',          category: 'ব্যঞ্জনবর্ণ', label: 'শ' },
  0x09B7: { name: 'BENGALI LETTER SSA',          category: 'ব্যঞ্জনবর্ণ', label: 'ষ' },
  0x09B8: { name: 'BENGALI LETTER SA',           category: 'ব্যঞ্জনবর্ণ', label: 'স' },
  0x09B9: { name: 'BENGALI LETTER HA',           category: 'ব্যঞ্জনবর্ণ', label: 'হ' },
  // Vowel signs (matras)
  0x09BE: { name: 'BENGALI VOWEL SIGN AA',       category: 'মাত্রা',      label: 'া' },
  0x09BF: { name: 'BENGALI VOWEL SIGN I',        category: 'মাত্রা',      label: 'ি' },
  0x09C0: { name: 'BENGALI VOWEL SIGN II',       category: 'মাত্রা',      label: 'ী' },
  0x09C1: { name: 'BENGALI VOWEL SIGN U',        category: 'মাত্রা',      label: 'ু' },
  0x09C2: { name: 'BENGALI VOWEL SIGN UU',       category: 'মাত্রা',      label: 'ূ' },
  0x09C3: { name: 'BENGALI VOWEL SIGN VOCALIC R',category: 'মাত্রা',      label: 'ৃ' },
  0x09C7: { name: 'BENGALI VOWEL SIGN E',        category: 'মাত্রা',      label: 'ে' },
  0x09C8: { name: 'BENGALI VOWEL SIGN AI',       category: 'মাত্রা',      label: 'ৈ' },
  0x09CB: { name: 'BENGALI VOWEL SIGN O',        category: 'মাত্রা',      label: 'ো' },
  0x09CC: { name: 'BENGALI VOWEL SIGN AU',       category: 'মাত্রা',      label: 'ৌ' },
  // Special
  0x09CD: { name: 'BENGALI SIGN VIRAMA (Hasanta)',category: 'হসন্ত',      label: '্' },
  0x09BC: { name: 'BENGALI SIGN NUKTA',          category: 'বিশেষ চিহ্ন', label: '়' },
  0x0981: { name: 'BENGALI SIGN CANDRABINDU',    category: 'বিশেষ চিহ্ন', label: 'ঁ' },
  0x0982: { name: 'BENGALI SIGN ANUSVARA',       category: 'বিশেষ চিহ্ন', label: 'ং' },
  0x0983: { name: 'BENGALI SIGN VISARGA',        category: 'বিশেষ চিহ্ন', label: 'ঃ' },
  // Digits
  0x09E6: { name: 'BENGALI DIGIT ZERO',          category: 'বাংলা অঙ্ক',  label: '০' },
  0x09E7: { name: 'BENGALI DIGIT ONE',           category: 'বাংলা অঙ্ক',  label: '১' },
  0x09E8: { name: 'BENGALI DIGIT TWO',           category: 'বাংলা অঙ্ক',  label: '২' },
  0x09E9: { name: 'BENGALI DIGIT THREE',         category: 'বাংলা অঙ্ক',  label: '৩' },
  0x09EA: { name: 'BENGALI DIGIT FOUR',          category: 'বাংলা অঙ্ক',  label: '৪' },
  0x09EB: { name: 'BENGALI DIGIT FIVE',          category: 'বাংলা অঙ্ক',  label: '৫' },
  0x09EC: { name: 'BENGALI DIGIT SIX',           category: 'বাংলা অঙ্ক',  label: '৬' },
  0x09ED: { name: 'BENGALI DIGIT SEVEN',         category: 'বাংলা অঙ্ক',  label: '৭' },
  0x09EE: { name: 'BENGALI DIGIT EIGHT',         category: 'বাংলা অঙ্ক',  label: '৮' },
  0x09EF: { name: 'BENGALI DIGIT NINE',          category: 'বাংলা অঙ্ক',  label: '৯' },
  // Special chars
  0x09DC: { name: 'BENGALI LETTER RRA',          category: 'ব্যঞ্জনবর্ণ', label: 'ড়' },
  0x09DD: { name: 'BENGALI LETTER RHA',          category: 'ব্যঞ্জনবর্ণ', label: 'ঢ়' },
  0x09DF: { name: 'BENGALI LETTER YYA',          category: 'ব্যঞ্জনবর্ণ', label: 'য়' },
  0x09CE: { name: 'BENGALI LETTER KHANDA TA',    category: 'ব্যঞ্জনবর্ণ', label: 'ৎ' },
  0x09F3: { name: 'BENGALI RUPEE SIGN',          category: 'মুদ্রা চিহ্ন', label: '৳' },
  0x0964: { name: 'DEVANAGARI DANDA',            category: 'যতিচিহ্ন',    label: '।' },
  0x0965: { name: 'DEVANAGARI DOUBLE DANDA',     category: 'যতিচিহ্ন',    label: '॥' },
};

// Invisible / problematic characters
const INVISIBLE_CHARS = {
  0x200B: { name: 'Zero Width Space',           short: 'ZWSP',  danger: 'medium', displayAs: '[ZWSP]' },
  0x200C: { name: 'Zero Width Non-Joiner',       short: 'ZWNJ',  danger: 'low',    displayAs: '[ZWNJ]' },
  0x200D: { name: 'Zero Width Joiner',           short: 'ZWJ',   danger: 'low',    displayAs: '[ZWJ]' },
  0x200E: { name: 'Left-to-Right Mark',          short: 'LRM',   danger: 'low',    displayAs: '[LRM]' },
  0x200F: { name: 'Right-to-Left Mark',          short: 'RLM',   danger: 'low',    displayAs: '[RLM]' },
  0x2060: { name: 'Word Joiner',                 short: 'WJ',    danger: 'medium', displayAs: '[WJ]' },
  0x00A0: { name: 'Non-Breaking Space',          short: 'NBSP',  danger: 'low',    displayAs: '[NBSP]' },
  0xFEFF: { name: 'Byte Order Mark',             short: 'BOM',   danger: 'high',   displayAs: '[BOM]' },
  0x034F: { name: 'Combining Grapheme Joiner',   short: 'CGJ',   danger: 'medium', displayAs: '[CGJ]' },
  0x00AD: { name: 'Soft Hyphen',                 short: 'SHY',   danger: 'low',    displayAs: '[SHY]' },
};

// ─── UTF-8 Encoding ───────────────────────────────────────────────────────────

function toUTF8Bytes(codePoint) {
  const bytes = [];
  if (codePoint <= 0x7F) {
    bytes.push(codePoint);
  } else if (codePoint <= 0x7FF) {
    bytes.push(0xC0 | (codePoint >> 6));
    bytes.push(0x80 | (codePoint & 0x3F));
  } else if (codePoint <= 0xFFFF) {
    bytes.push(0xE0 | (codePoint >> 12));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
    bytes.push(0x80 | (codePoint & 0x3F));
  } else {
    bytes.push(0xF0 | (codePoint >> 18));
    bytes.push(0x80 | ((codePoint >> 12) & 0x3F));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
    bytes.push(0x80 | (codePoint & 0x3F));
  }
  return bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'));
}

function toUTF16Units(codePoint) {
  if (codePoint <= 0xFFFF) {
    return ['U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')];
  }
  // Surrogate pair
  const adjusted = codePoint - 0x10000;
  const high = 0xD800 + (adjusted >> 10);
  const low  = 0xDC00 + (adjusted & 0x3FF);
  return [
    'U+' + high.toString(16).toUpperCase().padStart(4, '0'),
    'U+' + low.toString(16).toUpperCase().padStart(4, '0'),
  ];
}

// ─── Block Lookup ─────────────────────────────────────────────────────────────

function getBlock(codePoint) {
  return UNICODE_BLOCKS.find(b => codePoint >= b.start && codePoint <= b.end)
    || { name: 'Unknown Block', script: 'Unknown' };
}

function getCategory(codePoint) {
  if (codePoint >= 0x0041 && codePoint <= 0x005A) return 'Latin Uppercase Letter';
  if (codePoint >= 0x0061 && codePoint <= 0x007A) return 'Latin Lowercase Letter';
  if (codePoint >= 0x0030 && codePoint <= 0x0039) return 'ASCII Digit';
  if (codePoint === 0x0020) return 'Space';
  if (codePoint === 0x000A) return 'Line Feed';
  if (codePoint === 0x000D) return 'Carriage Return';
  if (codePoint === 0x0009) return 'Tab';
  if (BENGALI_CHARS[codePoint]) return BENGALI_CHARS[codePoint].category;
  if (INVISIBLE_CHARS[codePoint]) return 'Invisible Character';
  if (codePoint >= 0x0021 && codePoint <= 0x002F) return 'ASCII Punctuation';
  if (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) return 'Emoji';
  return 'Other';
}

// ─── Main Inspector ───────────────────────────────────────────────────────────

/**
 * Inspect all characters in text
 * @param {string} text
 * @param {number} limit - max chars to inspect (performance)
 */
export function inspectText(text, limit = 500) {
  if (!text) return [];

  const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;
  let graphemes;

  if (hasSegmenter) {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    graphemes = [...seg.segment(text)].map(s => s.segment).slice(0, limit);
  } else {
    graphemes = [...text].slice(0, limit);
  }

  return graphemes.map((grapheme, idx) => {
    const codePoint = grapheme.codePointAt(0);
    const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
    const block = getBlock(codePoint);
    const bengaliInfo = BENGALI_CHARS[codePoint];
    const invisibleInfo = INVISIBLE_CHARS[codePoint];
    const isWhitespace = /^\s$/.test(grapheme);
    const isMultiCodePoint = [...grapheme].length > 1;

    // All code points in this grapheme cluster
    const codePoints = [...grapheme].map(ch => {
      const cp = ch.codePointAt(0);
      return {
        char: ch,
        decimal: cp,
        hex: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
        bengaliInfo: BENGALI_CHARS[cp],
      };
    });

    return {
      index: idx,
      grapheme,
      display: invisibleInfo
        ? invisibleInfo.displayAs
        : isWhitespace
          ? grapheme === '\n' ? '↵' : grapheme === '\t' ? '→' : '·'
          : grapheme,
      codePoint,
      codePointHex: `U+${hex}`,
      decimal: codePoint,
      name: bengaliInfo?.name
        || invisibleInfo?.name
        || (isWhitespace ? 'Whitespace' : `U+${hex}`),
      category: getCategory(codePoint),
      block: block.name,
      script: block.script,
      utf8Bytes: toUTF8Bytes(codePoint),
      utf16Units: toUTF16Units(codePoint),
      isBengali: codePoint >= 0x0980 && codePoint <= 0x09FF,
      isInvisible: !!invisibleInfo,
      isWhitespace,
      isEmoji: codePoint >= 0x1F300 && codePoint <= 0x1F9FF,
      isMultiCodePoint,
      bengaliInfo,
      invisibleInfo,
      danger: invisibleInfo?.danger || null,
      codePoints,
      jsLength: grapheme.length, // JS .length (may be > 1 for surrogate pairs)
    };
  });
}

/**
 * Get summary stats
 */
export function getInspectorStats(chars) {
  return {
    total:     chars.length,
    bengali:   chars.filter(c => c.isBengali).length,
    latin:     chars.filter(c => c.script === 'Latin').length,
    invisible: chars.filter(c => c.isInvisible).length,
    emoji:     chars.filter(c => c.isEmoji).length,
    whitespace:chars.filter(c => c.isWhitespace).length,
    blocks:    [...new Set(chars.map(c => c.block))],
    scripts:   [...new Set(chars.map(c => c.script))],
    dangerous: chars.filter(c => c.danger === 'high').length,
  };
}

export const SAMPLES = [
  { label: 'বাংলা text',         text: 'বাংলাদেশ ভালো।' },
  { label: 'Conjunct (যুক্তাক্ষর)', text: 'ক্ষমা ব্রহ্ম জ্ঞান' },
  { label: 'Hidden chars',       text: 'বাংলা\u200Bটেক্সট\uFEFF' },
  { label: 'Mixed script',       text: 'Hello বাংলা 123 ১২৩' },
  { label: 'Emoji + বাংলা',      text: '🇧🇩 বাংলাদেশ ❤️' },
];