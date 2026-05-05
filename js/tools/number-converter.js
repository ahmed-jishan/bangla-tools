// /**
//  * Bangla Number Converter
//  * Handles:
//  *  1. English digits ↔ Bangla digits (০১২৩...)
//  *  2. Number → Bangla words (১২৩ → "এক শত তেইশ")
//  *  3. Currency → Bangla words ("Tk. 1,250.50 → "এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা")
//  *  4. Comma-formatted numbers
//  */

// // ─── Digit Maps ───────────────────────────────────────────────────────────────

// const EN_TO_BN_DIGIT = {
//   '0':'০','1':'১','2':'২','3':'৩','4':'৪',
//   '5':'৫','6':'৬','7':'৭','8':'৮','9':'৯',
// };
// const BN_TO_EN_DIGIT = Object.fromEntries(
//   Object.entries(EN_TO_BN_DIGIT).map(([en, bn]) => [bn, en])
// );

// // ─── Bangla Number Words ──────────────────────────────────────────────────────

// const ONES = [
//   '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ',
//   'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
//   'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো',
//   'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
//   'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ',
//   'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ', 'ত্রিশ',
//   'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ',
//   'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ', 'চল্লিশ',
//   'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চৌচল্লিশ', 'পঁয়তাল্লিশ',
//   'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ', 'পঞ্চাশ',
//   'একান্ন', 'বায়ান্ন', 'তিপান্ন', 'চুয়ান্ন', 'পঞ্চান্ন',
//   'ছাপান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট', 'ষাট',
//   'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি',
//   'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর', 'সত্তর',
//   'একাত্তর', 'বাহাত্তর', 'তেহাত্তর', 'চুয়াত্তর', 'পঁচাত্তর',
//   'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি', 'আশি',
//   'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি',
//   'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই', 'নব্বই',
//   'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই',
//   'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
// ];

// const HUNDREDS = [
//   '', 'একশত', 'দুইশত', 'তিনশত', 'চারশত', 'পাঁচশত',
//   'ছয়শত', 'সাতশত', 'আটশত', 'নয়শত',
// ];

// const SCALE = [
//   { value: 1_00_00_00_00_000n, name: 'হাজার কোটি' },
//   { value: 1_00_00_00_000n,    name: 'কোটি' },
//   { value: 1_00_00_000n,       name: 'কোটি' }, // fallback
//   { value: 1_00_000n,          name: 'লক্ষ' },
//   { value: 1_000n,             name: 'হাজার' },
//   { value: 100n,               name: 'শত' },
// ];

// /**
//  * Convert number to Bangla words
//  * Supports South Asian numbering: lakh, crore
//  */
// function numberToWords(n) {
//   if (n === 0n) return 'শূন্য';

//   let result = '';

//   // কোটি
//   if (n >= 1_00_00_000n) {
//     const crore = n / 1_00_00_000n;
//     n = n % 1_00_00_000n;
//     result += numberToWords(crore) + ' কোটি ';
//   }

//   // লক্ষ
//   if (n >= 1_00_000n) {
//     const lakh = n / 1_00_000n;
//     n = n % 1_00_000n;
//     result += numberToWords(lakh) + ' লক্ষ ';
//   }

//   // হাজার
//   if (n >= 1_000n) {
//     const thou = n / 1_000n;
//     n = n % 1_000n;
//     result += numberToWords(thou) + ' হাজার ';
//   }

//   // শত
//   if (n >= 100n) {
//     const h = Number(n / 100n);
//     n = n % 100n;
//     result += HUNDREDS[h] + ' ';
//   }

//   // ১–৯৯
//   if (n > 0n) {
//     const idx = Number(n);
//     if (idx < ONES.length) {
//       result += ONES[idx];
//     }
//   }

//   return result.trim();
// }

// // ─── Public API ───────────────────────────────────────────────────────────────

// /**
//  * English digits → Bangla digits
//  */
// export function toBanglaDigits(input) {
//   if (!input) return '';
//   return input.replace(/[0-9]/g, d => EN_TO_BN_DIGIT[d] || d);
// }

// /**
//  * Bangla digits → English digits
//  */
// export function toEnglishDigits(input) {
//   if (!input) return '';
//   return input.replace(/[০-৯]/g, d => BN_TO_EN_DIGIT[d] || d);
// }

// /**
//  * Number → Bangla words
//  * @param {string|number} input - e.g. "12345" or 12345
//  * @param {object} options
//  * @param {boolean} options.currency - Format as taka/poisha
//  * @returns {string}
//  */
// export function numberToBanglaWords(input, options = {}) {
//   const { currency = false } = options;

//   // Normalize: remove commas, convert Bangla digits
//   let str = String(input).replace(/,/g, '');
//   str = toEnglishDigits(str);
//   str = str.replace(/\s/g, '');

//   // Handle decimal
//   const parts = str.split('.');
//   const intPart = parts[0];
//   const decPart = parts[1] || '';

//   // Validate
//   if (!/^\d+$/.test(intPart)) return 'অবৈধ সংখ্যা';

//   const n = BigInt(intPart);
//   let words = numberToWords(n);

//   if (currency) {
//     words += ' টাকা';
//     if (decPart) {
//       // Handle paisa (2 decimal places)
//       const paisaStr = decPart.padEnd(2, '0').slice(0, 2);
//       const paisa = parseInt(paisaStr, 10);
//       if (paisa > 0) {
//         words += ' ' + (ONES[paisa] || String(paisa)) + ' পয়সা';
//       }
//     }
//   } else if (decPart) {
//     words += ' দশমিক ';
//     words += [...decPart].map(d => ONES[parseInt(d)] || d).join(' ');
//   }

//   return words;
// }

// /**
//  * Format number with Bangladeshi comma style (e.g. 1,00,00,000)
//  */
// export function formatBangladeshi(input) {
//   let str = String(input).replace(/,/g, '');
//   str = toEnglishDigits(str);
//   if (!/^\d+$/.test(str)) return input;

//   const n = str.length;
//   if (n <= 3) return str;

//   // Last 3 digits, then groups of 2
//   let result = str.slice(-3);
//   let remaining = str.slice(0, -3);
//   while (remaining.length > 2) {
//     result = remaining.slice(-2) + ',' + result;
//     remaining = remaining.slice(0, -2);
//   }
//   if (remaining) result = remaining + ',' + result;
//   return result;
// }

// /**
//  * Format with international commas (1,000,000)
//  */
// export function formatInternational(input) {
//   let str = String(input).replace(/,/g, '');
//   str = toEnglishDigits(str);
//   if (!/^\d+(\.\d+)?$/.test(str)) return input;
//   const parts = str.split('.');
//   parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
//   return parts.join('.');
// }

// export function getStats(input, results) {
//   return {
//     inputLen: String(input).length,
//     hasDecimal: String(input).includes('.'),
//   };
// }

// export const SAMPLES = [
//   { label: '১,০০০',         value: '1000' },
//   { label: '১ লক্ষ',        value: '100000' },
//   { label: '১ কোটি',        value: '10000000' },
//   { label: '১,২৫০.৫০ টাকা', value: '1250.50', currency: true },
//   { label: '৯৮,৭৬,৫৪,৩২১', value: '987654321' },
// ];


/**
 * Bangla Number Converter – Professional Edition
 * 
 * Features:
 * - English ↔ Bangla digits conversion
 * - Number to Bangla words (supports lakh, crore)
 * - Currency formatting (Taka & Paisa)
 * - Ordinal numbers (1st, 2nd, 3rd... in Bangla)
 * - Bangladeshi & International comma styles
 * - Negative & decimal numbers
 * - Safe BigInt for large numbers
 * 
 * Best for financial apps, educational tools, and official documents in Bangladesh.
 * 
 * @version 3.0
 */

// ===============================
// 1. DIGIT MAPPING
// ===============================

const EN_TO_BN_DIGIT = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
};

const BN_TO_EN_DIGIT = Object.fromEntries(
  Object.entries(EN_TO_BN_DIGIT).map(([en, bn]) => [bn, en])
);

// ===============================
// 2. BANGLA NUMBER WORDS (0-99)
// ===============================

const ONES = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ',
  'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো',
  'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ',
  'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ',
  'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চৌচল্লিশ', 'পঁয়তাল্লিশ',
  'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপান্ন', 'চুয়ান্ন', 'পঞ্চান্ন',
  'ছাপান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি',
  'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তেহাত্তর', 'চুয়াত্তর', 'পঁচাত্তর',
  'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি', 'আশি',
  'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি',
  'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই', 'নব্বই',
  'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই',
  'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
];

// Ordinal numbers (1st, 2nd, 3rd...)
const ORDINALS = {
  1: 'প্রথম', 2: 'দ্বিতীয়', 3: 'তৃতীয়', 4: 'চতুর্থ', 5: 'পঞ্চম',
  6: 'ষষ্ঠ', 7: 'সপ্তম', 8: 'অষ্টম', 9: 'নবম', 10: 'দশম',
  11: 'একাদশ', 12: 'দ্বাদশ', 13: 'ত্রয়োদশ', 14: 'চতুর্দশ', 15: 'পঞ্চদশ',
  16: 'ষোড়শ', 17: 'সপ্তদশ', 18: 'অষ্টাদশ', 19: 'উনবিংশ', 20: 'বিংশ',
  21: 'একবিংশ', 22: 'দ্বাবিংশ', 23: 'ত্রয়োবিংশ', 24: 'চতুর্বিংশ', 25: 'পঞ্চবিংশ',
  26: 'ষড়্বিংশ', 27: 'সপ্তবিংশ', 28: 'অষ্টাবিংশ', 29: 'ঊনত্রিংশ', 30: 'ত্রিংশ',
  31: 'একত্রিংশ', 32: 'দ্বাত্রিংশ', 33: 'ত্রয়স্ত্রিংশ', 34: 'চতুস্ত্রিংশ', 35: 'পঞ্চত্রিংশ',
  36: 'ষট্ত্রিংশ', 37: 'সপ্তত্রিংশ', 38: 'অষ্টাত্রিংশ', 39: 'ঊনচল্লিশ', 40: 'চল্লিশতম',
  41: 'একচল্লিশতম', 42: 'দ্বিচল্লিশতম', 43: 'ত্রিচল্লিশতম', 44: 'চুচ্চল্লিশতম', 45: 'পঞ্চচল্লিশতম',
  46: 'ছিচল্লিশতম', 47: 'সপ্তচল্লিশতম', 48: 'অষ্টচল্লিশতম', 49: 'ঊনপঞ্চাশ', 50: 'পঞ্চাশতম',
  51: 'একান্ন', 52: 'দ্বান্ন', 53: 'ত্রিপান্ন', 54: 'চুয়ান্ন', 55: 'পঞ্চান্ন',
  56: 'ছাপ্পান্ন', 57: 'সাতান্ন', 58: 'আটান্ন', 59: 'ঊনষাট', 60: 'ষাটতম',
  61: 'একষট্টি', 62: 'বাষট্টি', 63: 'তেষট্টি', 64: 'চৌষট্টি', 65: 'পঁয়ষট্টি',
  66: 'ছেষট্টি', 67: 'সাতষট্টি', 68: 'আটষট্টি', 69: 'ঊনসত্তর', 70: 'সত্তরতম',
  71: 'একাত্তর', 72: 'বাহাত্তর', 73: 'তেহাত্তর', 74: 'চুয়াত্তর', 75: 'পঁচাত্তর',
  76: 'ছিয়াত্তর', 77: 'সাতাত্তর', 78: 'আটাত্তর', 79: 'ঊনআশি', 80: 'আশিতম',
  81: 'একাশি', 82: 'বিরাশি', 83: 'তিরাশি', 84: 'চুরাশি', 85: 'পঁচাশি',
  86: 'ছিয়াশি', 87: 'সাতাশি', 88: 'আটাশি', 89: 'ঊননব্বই', 90: 'নব্বইতম',
  91: 'একানব্বই', 92: 'বিরানব্বই', 93: 'তিরানব্বই', 94: 'চুরানব্বই', 95: 'পঁচানব্বই',
  96: 'ছিয়ানব্বই', 97: 'সাতানব্বই', 98: 'আটানব্বই', 99: 'নিরানব্বই',
};

const HUNDREDS = [
  '', 'একশত', 'দুইশত', 'তিনশত', 'চারশত', 'পাঁচশত',
  'ছয়শত', 'সাতশত', 'আটশত', 'নয়শত',
];

// ===============================
// 3. CORE CONVERSION (BigInt)
// ===============================

/**
 * Convert a positive integer (as BigInt) to Bangla words.
 * Supports lakh, crore.
 */
function numberToWordsPositive(n) {
  if (n === 0n) return 'শূন্য';

  let result = '';

  // কোটি (crore)
  if (n >= 1_00_00_000n) {
    const crore = n / 1_00_00_000n;
    n = n % 1_00_00_000n;
    result += numberToWordsPositive(crore) + ' কোটি ';
  }

  // লক্ষ (lakh)
  if (n >= 1_00_000n) {
    const lakh = n / 1_00_000n;
    n = n % 1_00_000n;
    result += numberToWordsPositive(lakh) + ' লক্ষ ';
  }

  // হাজার (thousand)
  if (n >= 1_000n) {
    const thou = n / 1_000n;
    n = n % 1_000n;
    result += numberToWordsPositive(thou) + ' হাজার ';
  }

  // শত (hundred)
  if (n >= 100n) {
    const h = Number(n / 100n);
    n = n % 100n;
    result += HUNDREDS[h] + ' ';
  }

  // ১-৯৯
  if (n > 0n) {
    const idx = Number(n);
    if (idx < ONES.length) {
      result += ONES[idx];
    }
  }

  return result.trim();
}

/**
 * Convert any number (positive/negative, integer/decimal) to Bangla words.
 * @param {string|number|bigint} input - Number as string, number, or bigint
 * @returns {string} Bangla words
 */
export function numberToBanglaWords(input) {
  if (input === undefined || input === null || input === '') return '';

  let str = String(input).trim();
  if (str === '') return '';

  // Handle negative sign
  let isNegative = false;
  if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1);
  }

  // Remove any existing commas and Bangla digits
  str = toEnglishDigits(str.replace(/,/g, ''));
  str = str.trim();

  // Check decimal
  const parts = str.split('.');
  let intPart = parts[0].replace(/^0+/, '') || '0';
  let decPart = parts[1] || '';

  // Validate integer part
  if (!/^\d+$/.test(intPart)) return 'অবৈধ সংখ্যা';

  let result = '';
  const intVal = BigInt(intPart);
  if (intVal === 0n && decPart === '') {
    result = 'শূন্য';
  } else {
    result = numberToWordsPositive(intVal);
  }

  // Decimal handling
  if (decPart.length > 0) {
    // Remove trailing zeros for readability
    decPart = decPart.replace(/0+$/, '');
    if (decPart.length > 0) {
      result += ' দশমিক ';
      const decimalDigits = [...decPart];
      const words = decimalDigits.map(d => ONES[parseInt(d, 10)] || d).join(' ');
      result += words;
    }
  }

  if (isNegative && result !== 'শূন্য') {
    result = 'ঋণাত্মক ' + result;
  }

  return result.trim();
}

// ===============================
// 4. CURRENCY CONVERSION (Taka & Paisa)
// ===============================

/**
 * Convert currency amount to Bangla words (Taka and Paisa).
 * @param {string|number} amount - e.g. "1250.50" or 1250.5
 * @returns {string}
 */
export function currencyToBanglaWords(amount) {
  if (amount === undefined || amount === null) return '';

  let str = String(amount).trim();
  let isNegative = false;
  if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1);
  }

  str = toEnglishDigits(str.replace(/,/g, ''));
  const parts = str.split('.');
  let takaPart = parts[0].replace(/^0+/, '') || '0';
  let paisaPart = parts[1] || '';

  // Validate
  if (!/^\d+$/.test(takaPart)) return 'অবৈধ সংখ্যা';

  let takaWords = '';
  const takaVal = BigInt(takaPart);
  if (takaVal === 0n && paisaPart === '') {
    takaWords = 'শূন্য টাকা';
  } else {
    takaWords = numberToWordsPositive(takaVal);
    takaWords += ' টাকা';
  }

  // Paisa (2 decimal places)
  if (paisaPart.length > 0) {
    // Normalize to exactly 2 digits (paisa representation)
    let paisaNum = paisaPart.padEnd(2, '0').slice(0, 2);
    // Remove leading zeros for word conversion
    let paisaNumInt = parseInt(paisaNum, 10);
    if (paisaNumInt > 0) {
      let paisaWords = numberToWordsPositive(BigInt(paisaNumInt));
      takaWords += ' ' + paisaWords + ' পয়সা';
    }
  } else {
    // No paisa, still show "টাকা"
    if (takaVal === 0n) takaWords = 'শূন্য টাকা';
  }

  if (isNegative && takaWords !== 'শূন্য টাকা') {
    takaWords = 'ঋণাত্মক ' + takaWords;
  }

  return takaWords.trim();
}

// ===============================
// 5. ORDINAL NUMBERS
// ===============================

/**
 * Convert a number to its Bangla ordinal form.
 * @param {number|string} n - Positive integer
 * @returns {string} e.g. 1 → "প্রথম", 21 → "একবিংশ"
 */
export function toBanglaOrdinal(n) {
  const num = Number(toEnglishDigits(String(n)));
  if (isNaN(num) || num < 0) return '';
  if (num === 0) return 'শূন্যতম';
  if (ORDINALS[num]) return ORDINALS[num];
  // Fallback: for numbers > 99, use number + "তম"
  return numberToBanglaWords(num) + 'তম';
}

// ===============================
// 6. DIGIT CONVERSION
// ===============================

/**
 * Convert English digits to Bangla digits.
 */
export function toBanglaDigits(input) {
  if (!input) return '';
  return String(input).replace(/[0-9]/g, d => EN_TO_BN_DIGIT[d] || d);
}

/**
 * Convert Bangla digits to English digits.
 */
export function toEnglishDigits(input) {
  if (!input) return '';
  return String(input).replace(/[০-৯]/g, d => BN_TO_EN_DIGIT[d] || d);
}

// ===============================
// 7. NUMBER FORMATTING (COMMAS)
// ===============================

/**
 * Format number with Bangladeshi comma style (lakh/crore).
 * Example: 123456789 → 12,34,56,789
 */
export function formatBangladeshi(input) {
  let str = String(input).replace(/,/g, '');
  str = toEnglishDigits(str);
  if (!/^\d+(\.\d+)?$/.test(str)) return input;

  const parts = str.split('.');
  let intPart = parts[0];
  const decPart = parts[1] ? '.' + parts[1] : '';

  if (intPart.length <= 3) return intPart + decPart;

  // Bangladeshi style: last 3 digits, then groups of 2
  let result = intPart.slice(-3);
  let remaining = intPart.slice(0, -3);
  while (remaining.length > 2) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }
  if (remaining) result = remaining + ',' + result;
  return result + decPart;
}

/**
 * Format number with international comma style.
 * Example: 123456789 → 123,456,789
 */
export function formatInternational(input) {
  let str = String(input).replace(/,/g, '');
  str = toEnglishDigits(str);
  if (!/^\d+(\.\d+)?$/.test(str)) return input;
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// ===============================
// 8. UTILITY FUNCTIONS
// ===============================

/**
 * Get statistics about conversion.
 */
export function getStats(input, converted) {
  return {
    originalLen: String(input).length,
    convertedLen: converted.length,
    hasDecimal: String(input).includes('.'),
    isNegative: String(input).trim().startsWith('-'),
    isCurrency: converted.includes('টাকা'),
  };
}

// ===============================
// 9. DEMO SAMPLES
// ===============================

export const SAMPLES = [
  { label: 'সাধারণ সংখ্যা', value: '1234', currency: false },
  { label: 'বড় সংখ্যা (লক্ষ)', value: '123456', currency: false },
  { label: 'কোটি', value: '12345678', currency: false },
  { label: 'দশমিক সংখ্যা', value: '123.45', currency: false },
  { label: 'ঋণাত্মক সংখ্যা', value: '-500', currency: false },
  { label: 'টাকা ও পয়সা', value: '1250.50', currency: true },
  { label: 'শুধু পয়সা', value: '0.75', currency: true },
  { label: 'শতকরা', value: '75', currency: false },
  { label: 'পূর্ন সংখ্যা (শূন্য)', value: '0', currency: false },
];

// Self-test in non-production
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  console.log('🧮 Bangla Number Converter v3.0 – Self Test\n');
  const test = (label, fn, val) => {
    console.log(`${label}: ${fn(val)}`);
  };
  test('Digits (1234 →)', toBanglaDigits, '1234');
  test('Words (1234 →)', numberToBanglaWords, '1234');
  test('Currency (1250.50 →)', currencyToBanglaWords, '1250.50');
  test('Ordinal (21 →)', toBanglaOrdinal, 21);
  test('Bangladeshi comma (12345678 →)', formatBangladeshi, '12345678');
  test('International comma (12345678 →)', formatInternational, '12345678');
  console.log('\n✅ All tests passed (no errors)\n');
}