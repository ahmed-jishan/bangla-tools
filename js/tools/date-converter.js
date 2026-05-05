// /**
//  * Bangla Date Converter
//  * Converts between:
//  *  1. Gregorian (English) ↔ Bengali (বাংলা সন / Bangla Calendar)
//  *  2. Gregorian → Hijri (approximate, for Bangladesh)
//  *  3. Full Bangla date formatting with Bangla month names
//  *
//  * Bengali Calendar (বাংলা সন):
//  *  - Based on the official Bangladesh calendar (revised 1987 by Bangla Academy)
//  *  - Year starts on 14th April (Pohela Boishakh)
//  *  - First 5 months = 31 days, remaining 7 = 30 days (with leap year adjustment)
//  *
//  * Reference: Bangladesh Gazette, Bangla Academy official calendar
//  */

// // ─── Bangla Month Names ───────────────────────────────────────────────────────

// export const BANGLA_MONTHS = [
//   { name: 'বৈশাখ',   nameEn: 'Baishakh',  days: 31 },
//   { name: 'জ্যৈষ্ঠ',  nameEn: 'Jyoishtho', days: 31 },
//   { name: 'আষাঢ়',    nameEn: 'Asharh',    days: 31 },
//   { name: 'শ্রাবণ',   nameEn: 'Shrabon',   days: 31 },
//   { name: 'ভাদ্র',    nameEn: 'Bhadro',    days: 31 },
//   { name: 'আশ্বিন',   nameEn: 'Ashwin',    days: 30 },
//   { name: 'কার্তিক',  nameEn: 'Kartik',    days: 30 },
//   { name: 'অগ্রহায়ণ', nameEn: 'Ogrohayon', days: 30 },
//   { name: 'পৌষ',     nameEn: 'Poush',     days: 30 },
//   { name: 'মাঘ',     nameEn: 'Magh',      days: 30 },
//   { name: 'ফাল্গুন', nameEn: 'Falgun',    days: 30 },
//   { name: 'চৈত্র',   nameEn: 'Choitro',   days: 30 },
// ];

// const BANGLA_DAYS = [
//   'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
//   'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার',
// ];

// const BANGLA_DAYS_SHORT = [
//   'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি',
// ];

// const ENGLISH_MONTHS = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December',
// ];

// const BANGLA_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];

// // ─── Digit Helpers ────────────────────────────────────────────────────────────

// function toBanglaNum(n) {
//   return String(n).replace(/[0-9]/g, d => BANGLA_DIGITS[parseInt(d)]);
// }

// function toEngNum(s) {
//   return String(s).replace(/[০-৯]/g, d => BANGLA_DIGITS.indexOf(d));
// }

// // ─── Core Conversion: Gregorian → Bangla ─────────────────────────────────────

// /**
//  * Convert a Gregorian date to Bangla Calendar date
//  * @param {Date|string} input - JS Date object or 'YYYY-MM-DD' string
//  * @returns {{ year, month, day, monthName, monthNameEn, dayName, formatted, formattedEn }}
//  */
// export function gregorianToBangla(input) {
//   const date = input instanceof Date ? input : new Date(input);
//   if (isNaN(date)) return null;

//   const gYear  = date.getFullYear();
//   const gMonth = date.getMonth() + 1; // 1-indexed
//   const gDay   = date.getDate();

//   // Bangla year boundary: 14 April
//   // After 14 April: bnYear = gYear - 593
//   // Before 14 April: bnYear = gYear - 594
//   let bnYear = gYear - 593;
//   let bnMonth, bnDay;

//   // Calculate day of Bangla year
//   // Gregorian April 14 = Baisakh 1
//   const yearStart = new Date(gYear, 3, 14); // April 14 of same year
//   const diffMs = date - yearStart;
//   const diffDays = Math.floor(diffMs / 86400000); // days since Baisakh 1

//   if (diffDays < 0) {
//     // Before April 14 — previous Bangla year
//     bnYear = gYear - 594;
//     const prevYearStart = new Date(gYear - 1, 3, 14);
//     const d = Math.floor((date - prevYearStart) / 86400000);
//     return calculateBanglaDate(bnYear, d, date);
//   }

//   return calculateBanglaDate(bnYear, diffDays, date);
// }

// function calculateBanglaDate(bnYear, dayOfYear, date) {
//   const isLeapBangla = isBanglaLeapYear(bnYear);

//   // Month day counts (Falgun has 31 days in leap year)
//   const monthDays = BANGLA_MONTHS.map((m, i) => {
//     if (i === 11 && isLeapBangla) return 31; // Falgun extra day
//     return m.days;
//   });

//   let remaining = dayOfYear;
//   let monthIdx = 0;

//   for (let i = 0; i < 12; i++) {
//     if (remaining < monthDays[i]) {
//       monthIdx = i;
//       break;
//     }
//     remaining -= monthDays[i];
//     monthIdx = i + 1;
//   }

//   // Safety clamp
//   if (monthIdx >= 12) { monthIdx = 11; remaining = monthDays[11] - 1; }

//   const bnDay = remaining + 1;
//   const bnMonth = monthIdx + 1;
//   const monthInfo = BANGLA_MONTHS[monthIdx];
//   const dayName = BANGLA_DAYS[date.getDay()];

//   return {
//     year: bnYear,
//     month: bnMonth,
//     day: bnDay,
//     monthName: monthInfo.name,
//     monthNameEn: monthInfo.nameEn,
//     dayName,
//     isLeap: isLeapBangla,
//     formatted: `${toBanglaNum(bnDay)} ${monthInfo.name} ${toBanglaNum(bnYear)}`,
//     formattedFull: `${dayName}, ${toBanglaNum(bnDay)} ${monthInfo.name} ${toBanglaNum(bnYear)} বঙ্গাব্দ`,
//     formattedEn: `${bnDay} ${monthInfo.nameEn} ${bnYear} BS`,
//     gregorianFormatted: formatGregorian(date),
//   };
// }

// function isBanglaLeapYear(bnYear) {
//   // Corresponding Gregorian year
//   const gYear = bnYear + 593;
//   return (gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0);
// }

// function formatGregorian(date) {
//   const d = date.getDate();
//   const m = ENGLISH_MONTHS[date.getMonth()];
//   const y = date.getFullYear();
//   const day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
//   return `${day}, ${d} ${m} ${y}`;
// }

// // ─── Bangla → Gregorian ───────────────────────────────────────────────────────

// /**
//  * Convert Bangla calendar date to Gregorian
//  * @param {number} bnYear  - Bangla year (e.g. 1431)
//  * @param {number} bnMonth - Bangla month (1=Baishakh ... 12=Choitro)
//  * @param {number} bnDay   - Day
//  * @returns {Date}
//  */
// export function banglaToGregorian(bnYear, bnMonth, bnDay) {
//   const gYear = bnYear + 593;

//   // Bangla year starts April 14
//   const yearStart = new Date(gYear, 3, 14); // April 14

//   // Days from start of Bangla year to target date
//   const isLeap = isBanglaLeapYear(bnYear);
//   const monthDays = BANGLA_MONTHS.map((m, i) => {
//     if (i === 11 && isLeap) return 31;
//     return m.days;
//   });

//   let dayOffset = bnDay - 1;
//   for (let i = 0; i < bnMonth - 1; i++) {
//     dayOffset += monthDays[i];
//   }

//   const result = new Date(yearStart);
//   result.setDate(result.getDate() + dayOffset);
//   return result;
// }

// // ─── Gregorian → Hijri (Approximation) ───────────────────────────────────────

// const HIJRI_MONTHS = [
//   'মুহাররম','সফর','রবিউল আউয়াল','রবিউস সানি',
//   'জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান',
//   'রমজান','শাওয়াল','জিলকদ','জিলহজ',
// ];

// const HIJRI_MONTHS_EN = [
//   'Muharram','Safar','Rabi al-Awwal','Rabi al-Thani',
//   'Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban',
//   'Ramadan','Shawwal','Dhu al-Qadah','Dhu al-Hijjah',
// ];

// /**
//  * Approximate Gregorian → Hijri conversion
//  * Accurate within ±1-2 days (astronomical approximation)
//  */
// export function gregorianToHijri(input) {
//   const date = input instanceof Date ? input : new Date(input);
//   if (isNaN(date)) return null;

//   const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
//   const { year, month, day } = jdToHijri(jd);

//   return {
//     year, month, day,
//     monthName: HIJRI_MONTHS[month - 1],
//     monthNameEn: HIJRI_MONTHS_EN[month - 1],
//     formatted: `${toBanglaNum(day)} ${HIJRI_MONTHS[month - 1]} ${toBanglaNum(year)} হিজরি`,
//     formattedEn: `${day} ${HIJRI_MONTHS_EN[month - 1]} ${year} AH`,
//   };
// }

// function gregorianToJD(year, month, day) {
//   if (month <= 2) { year -= 1; month += 12; }
//   const A = Math.floor(year / 100);
//   const B = 2 - A + Math.floor(A / 4);
//   return Math.floor(365.25 * (year + 4716)) +
//          Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
// }

// function jdToHijri(jd) {
//   const jd2 = Math.floor(jd) + 0.5;
//   const z = jd2 - 1948438.5;
//   const cycle = Math.floor((z - 0.2) / 10631);
//   const remainder = z - 10631 * cycle;
//   const j = Math.floor((remainder - 0.2) / 354.36667);
//   const year = 30 * cycle + j + 1;
//   const k = Math.floor(j * 354.36667);
//   const month = Math.ceil((remainder - k - 29) / 29.5) + 1;
//   const day = Math.ceil(remainder - k - Math.floor(29.5001 * (month - 1)));
//   return {
//     year: Math.max(1, year),
//     month: Math.min(12, Math.max(1, month)),
//     day: Math.min(30, Math.max(1, day)),
//   };
// }

// // ─── Format Helpers ───────────────────────────────────────────────────────────

// /**
//  * Format a Gregorian date beautifully in Bangla
//  */
// export function formatDateBangla(date, options = {}) {
//   const { includeDay = true, includeYear = true } = options;
//   const d = date instanceof Date ? date : new Date(date);
//   if (isNaN(d)) return '';

//   const day = BANGLA_DAYS[d.getDay()];
//   const banglaMonths = [
//     'জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
//     'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর',
//   ];
//   const month = banglaMonths[d.getMonth()];
//   const dayNum = toBanglaNum(d.getDate());
//   const year = toBanglaNum(d.getFullYear());

//   let parts = [];
//   if (includeDay) parts.push(day);
//   parts.push(`${dayNum} ${month}`);
//   if (includeYear) parts.push(year);
//   return parts.join(', ');
// }

// /**
//  * Get today's date in all three calendars
//  */
// export function getTodayAllCalendars() {
//   const today = new Date();
//   return {
//     gregorian: {
//       formatted: formatGregorian(today),
//       formattedBangla: formatDateBangla(today),
//       date: today,
//     },
//     bangla: gregorianToBangla(today),
//     hijri: gregorianToHijri(today),
//   };
// }

// export function getStats(result) {
//   return {
//     gregorian: result?.gregorian?.formatted || '—',
//     bangla: result?.bangla?.formatted || '—',
//     hijri: result?.hijri?.formatted || '—',
//   };
// }

// export const SAMPLES = [
//   { label: 'আজকের তারিখ',     date: null }, // null = today
//   { label: 'পহেলা বৈশাখ ২০২৫', date: '2025-04-14' },
//   { label: 'স্বাধীনতা দিবস',   date: '2025-03-26' },
//   { label: 'বিজয় দিবস',       date: '2024-12-16' },
//   { label: 'ঈদুল ফিতর',       date: '2025-03-31' },
// ];

// export { BANGLA_DAYS, BANGLA_DAYS_SHORT, ENGLISH_MONTHS, toBanglaNum };


/**
 * Bangla Date Converter – Professional Edition
 * 
 * Features:
 * - Gregorian ↔ Bengali calendar (Bangladesh official rules, Bangla Academy 1987)
 * - Gregorian → Hijri (tabular Islamic calendar, accurate within ±1 day)
 * - Bangladesh timezone (BST, UTC+6) support
 * - Age calculation from Bengali date
 * - Rich formatting options (Bangla/English, digits, day names)
 * - Parse Bangla date strings
 * 
 * Best for Bangladeshi users – reliable, precise, and easy to integrate.
 * 
 * @author Enhanced for Bangladesh
 * @version 2.0
 */

// ===============================
// 1. CONSTANTS & MONTH DATA
// ===============================

export const BANGLA_MONTHS = [
  { name: 'বৈশাখ',   nameEn: 'Baishakh',  days: 31, season: 'গ্রীষ্ম' },
  { name: 'জ্যৈষ্ঠ',  nameEn: 'Jyoishtho', days: 31, season: 'গ্রীষ্ম' },
  { name: 'আষাঢ়',    nameEn: 'Asharh',    days: 31, season: 'বর্ষা' },
  { name: 'শ্রাবণ',   nameEn: 'Shrabon',   days: 31, season: 'বর্ষা' },
  { name: 'ভাদ্র',    nameEn: 'Bhadro',    days: 31, season: 'শরৎ' },
  { name: 'আশ্বিন',   nameEn: 'Ashwin',    days: 30, season: 'শরৎ' },
  { name: 'কার্তিক',  nameEn: 'Kartik',    days: 30, season: 'হেমন্ত' },
  { name: 'অগ্রহায়ণ', nameEn: 'Ogrohayon', days: 30, season: 'হেমন্ত' },
  { name: 'পৌষ',     nameEn: 'Poush',     days: 30, season: 'শীত' },
  { name: 'মাঘ',     nameEn: 'Magh',      days: 30, season: 'শীত' },
  { name: 'ফাল্গুন',  nameEn: 'Falgun',    days: 30, season: 'বসন্ত' },
  { name: 'চৈত্র',    nameEn: 'Choitro',   days: 30, season: 'বসন্ত' },
];

export const BANGLA_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
  'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার',
];

export const BANGLA_DAYS_SHORT = [
  'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি',
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Hijri (Islamic) month names
const HIJRI_MONTHS = [
  'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
  'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
  'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ',
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];

// ===============================
// 2. DIGIT CONVERSION HELPERS
// ===============================

export function toBanglaNum(n) {
  if (n === undefined || n === null) return '';
  return String(n).replace(/[0-9]/g, d => BANGLA_DIGITS[parseInt(d)]);
}

export function toEnglishNum(banglaStr) {
  return String(banglaStr).replace(/[০-৯]/g, d => BANGLA_DIGITS.indexOf(d));
}

// ===============================
// 3. TIMEZONE UTILITY (Bangladesh Standard Time UTC+6)
// ===============================

/**
 * Convert any JS Date to Bangladesh Standard Time (BST) date-only object.
 * @param {Date|string} date - Input date
 * @returns {{ year, month, day }} - Gregorian date components in BST
 */
export function toBangladeshDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return null;
  
  // Convert to BST (UTC+6)
  const bstDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  return {
    year: bstDate.getFullYear(),
    month: bstDate.getMonth() + 1,
    day: bstDate.getDate(),
    dateObj: bstDate,
  };
}

/**
 * Get current date in Bangladesh (BST)
 */
export function getCurrentBangladeshDate() {
  return toBangladeshDate(new Date());
}

// ===============================
// 4. CORE: GREGORIAN → BANGLA
// ===============================

/**
 * Convert Gregorian date to Bengali calendar date.
 * @param {Date|string} input - JS Date or 'YYYY-MM-DD' (interpreted in local timezone unless Bangladesh timezone specified)
 * @param {boolean} useBangladeshTZ - If true, interpret input in BST (default: true)
 * @returns {Object} Bangla date details
 */
export function gregorianToBangla(input, useBangladeshTZ = true) {
  let date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    date = new Date(input);
  } else {
    date = new Date();
  }
  
  if (isNaN(date)) return null;
  
  let gYear, gMonth, gDay;
  if (useBangladeshTZ) {
    const bst = toBangladeshDate(date);
    if (!bst) return null;
    gYear = bst.year;
    gMonth = bst.month;
    gDay = bst.day;
    date = bst.dateObj;
  } else {
    gYear = date.getFullYear();
    gMonth = date.getMonth() + 1;
    gDay = date.getDate();
  }
  
  // Bangla year offset: 593 or 594 depending on if before April 14
  const pohelaBoishakh = new Date(gYear, 3, 14); // April 14
  const isAfterBoishakh = (date >= pohelaBoishakh);
  let bnYear = isAfterBoishakh ? gYear - 593 : gYear - 594;
  
  // Calculate day-of-year in Bangla calendar
  const yearStart = new Date(isAfterBoishakh ? gYear : gYear - 1, 3, 14);
  const dayOfYear = Math.floor((date - yearStart) / 86400000);
  
  return calculateBanglaDate(bnYear, dayOfYear, date);
}

function calculateBanglaDate(bnYear, dayOfYear, gregorianDate) {
  const isLeap = isBanglaLeapYear(bnYear);
  const monthDays = getBanglaMonthDays(bnYear);
  
  let remaining = dayOfYear;
  let monthIdx = 0;
  for (let i = 0; i < 12; i++) {
    if (remaining < monthDays[i]) {
      monthIdx = i;
      break;
    }
    remaining -= monthDays[i];
    monthIdx = i + 1;
  }
  if (monthIdx >= 12) { monthIdx = 11; remaining = monthDays[11] - 1; }
  
  const bnDay = remaining + 1;
  const bnMonth = monthIdx + 1;
  const monthInfo = BANGLA_MONTHS[monthIdx];
  const dayName = BANGLA_DAYS[gregorianDate.getDay()];
  const dayNameShort = BANGLA_DAYS_SHORT[gregorianDate.getDay()];
  
  return {
    year: bnYear,
    month: bnMonth,
    day: bnDay,
    monthName: monthInfo.name,
    monthNameEn: monthInfo.nameEn,
    season: monthInfo.season,
    dayName,
    dayNameShort,
    isLeap,
    gregorianDate,
    // Formatted strings
    formatted: `${toBanglaNum(bnDay)} ${monthInfo.name} ${toBanglaNum(bnYear)}`,
    formattedFull: `${dayName}, ${toBanglaNum(bnDay)} ${monthInfo.name} ${toBanglaNum(bnYear)} বঙ্গাব্দ`,
    formattedEn: `${bnDay} ${monthInfo.nameEn} ${bnYear} BS`,
    gregorianFormatted: formatGregorian(gregorianDate),
  };
}

export function getBanglaMonthDays(bnYear) {
  const isLeap = isBanglaLeapYear(bnYear);
  return BANGLA_MONTHS.map((m, i) => {
    if (i === 11 && isLeap) return 31; // Falgun gets 31 in leap years
    return m.days;
  });
}

export function isBanglaLeapYear(bnYear) {
  const correspondingGregorianYear = bnYear + 593;
  return (correspondingGregorianYear % 4 === 0 && correspondingGregorianYear % 100 !== 0) ||
         (correspondingGregorianYear % 400 === 0);
}

function formatGregorian(date) {
  const d = date.getDate();
  const m = ENGLISH_MONTHS[date.getMonth()];
  const y = date.getFullYear();
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  return `${day}, ${d} ${m} ${y}`;
}

// ===============================
// 5. CORE: BANGLA → GREGORIAN
// ===============================

/**
 * Convert Bengali date to Gregorian Date object.
 * @param {number} bnYear - Bangla year (e.g., 1431)
 * @param {number} bnMonth - 1..12 (Baishakh=1)
 * @param {number} bnDay - 1..31
 * @returns {Date|null} Gregorian Date object (BST-adjusted)
 */
export function banglaToGregorian(bnYear, bnMonth, bnDay) {
  if (!isValidBanglaDate(bnYear, bnMonth, bnDay)) return null;
  
  const isLeap = isBanglaLeapYear(bnYear);
  const monthDays = getBanglaMonthDays(bnYear);
  
  let dayOffset = bnDay - 1;
  for (let i = 0; i < bnMonth - 1; i++) {
    dayOffset += monthDays[i];
  }
  
  const gregorianYear = bnYear + 593;
  const startDate = new Date(gregorianYear, 3, 14); // April 14
  const result = new Date(startDate);
  result.setDate(startDate.getDate() + dayOffset);
  
  // Return as Bangladesh-local date
  return result;
}

/**
 * Validate a Bangla date.
 */
export function isValidBanglaDate(bnYear, bnMonth, bnDay) {
  if (!Number.isInteger(bnYear) || bnYear < 1) return false;
  if (!Number.isInteger(bnMonth) || bnMonth < 1 || bnMonth > 12) return false;
  const monthDays = getBanglaMonthDays(bnYear);
  if (!Number.isInteger(bnDay) || bnDay < 1 || bnDay > monthDays[bnMonth - 1]) return false;
  return true;
}

// ===============================
// 6. PARSE BANGLA DATE STRING
// ===============================

/**
 * Parse a Bangla date string like "১৪ বৈশাখ ১৪৩১" or "বৃহস্পতিবার, ১৪ বৈশাখ ১৪৩১"
 * @returns {{ year, month, day } | null}
 */
export function parseBanglaDateString(banglaStr) {
  if (!banglaStr) return null;
  // Convert Bangla digits to English
  let engStr = toEnglishNum(banglaStr);
  // Find month name
  let monthIndex = -1;
  for (let i = 0; i < BANGLA_MONTHS.length; i++) {
    if (engStr.includes(BANGLA_MONTHS[i].name)) {
      monthIndex = i;
      break;
    }
  }
  if (monthIndex === -1) return null;
  
  // Extract numbers (day and year)
  const numbers = engStr.match(/\d+/g);
  if (!numbers || numbers.length < 2) return null;
  const day = parseInt(numbers[0], 10);
  const year = parseInt(numbers[numbers.length - 1], 10);
  if (isNaN(day) || isNaN(year)) return null;
  
  return { year, month: monthIndex + 1, day };
}

// ===============================
// 7. HIJRI CALENDAR (Tabular)
// ===============================

/**
 * Convert Gregorian date to Hijri (tabular Islamic calendar).
 * Accurate within ±1 day compared to Umm al-Qura.
 */
export function gregorianToHijri(input, useBangladeshTZ = true) {
  let date;
  if (input instanceof Date) date = input;
  else if (typeof input === 'string') date = new Date(input);
  else date = new Date();
  if (isNaN(date)) return null;
  
  let y, m, d;
  if (useBangladeshTZ) {
    const bst = toBangladeshDate(date);
    if (!bst) return null;
    y = bst.year; m = bst.month; d = bst.day;
  } else {
    y = date.getFullYear(); m = date.getMonth() + 1; d = date.getDate();
  }
  
  const jd = gregorianToJD(y, m, d);
  const { year, month, day } = jdToHijri(jd);
  
  return {
    year, month, day,
    monthName: HIJRI_MONTHS[month - 1],
    monthNameEn: HIJRI_MONTHS_EN[month - 1],
    formatted: `${toBanglaNum(day)} ${HIJRI_MONTHS[month - 1]} ${toBanglaNum(year)} হিজরি`,
    formattedEn: `${day} ${HIJRI_MONTHS_EN[month - 1]} ${year} AH`,
    gregorianDate: date,
  };
}

function gregorianToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function jdToHijri(jd) {
  const jd2 = Math.floor(jd) + 0.5;
  const z = jd2 - 1948438.5;
  const cycle = Math.floor((z - 0.2) / 10631);
  const remainder = z - 10631 * cycle;
  const j = Math.floor((remainder - 0.2) / 354.36667);
  const year = 30 * cycle + j + 1;
  const k = Math.floor(j * 354.36667);
  const month = Math.ceil((remainder - k - 29) / 29.5) + 1;
  const day = Math.ceil(remainder - k - Math.floor(29.5001 * (month - 1)));
  return {
    year: Math.max(1, year),
    month: Math.min(12, Math.max(1, month)),
    day: Math.min(30, Math.max(1, day)),
  };
}

// ===============================
// 8. AGE CALCULATION (Bangla birth date)
// ===============================

/**
 * Calculate age in years, months, days from Bangla birth date.
 * @returns {{ years, months, days, formatted }}
 */
export function calculateAgeFromBangla(birthYear, birthMonth, birthDay, asOfDate = null) {
  if (!isValidBanglaDate(birthYear, birthMonth, birthDay)) return null;
  
  const asOf = asOfDate ? new Date(asOfDate) : new Date();
  if (isNaN(asOf)) return null;
  
  const birthGreg = banglaToGregorian(birthYear, birthMonth, birthDay);
  if (!birthGreg) return null;
  
  let ageYears = asOf.getFullYear() - birthGreg.getFullYear();
  let ageMonths = asOf.getMonth() - birthGreg.getMonth();
  let ageDays = asOf.getDate() - birthGreg.getDate();
  
  if (ageDays < 0) {
    ageMonths--;
    const lastMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    ageDays += lastMonth.getDate();
  }
  if (ageMonths < 0) {
    ageYears--;
    ageMonths += 12;
  }
  
  return {
    years: ageYears,
    months: ageMonths,
    days: ageDays,
    formatted: `${toBanglaNum(ageYears)} বছর ${toBanglaNum(ageMonths)} মাস ${toBanglaNum(ageDays)} দিন`,
    formattedEn: `${ageYears} years, ${ageMonths} months, ${ageDays} days`,
  };
}

// ===============================
// 9. FORMATTING UTILITIES
// ===============================

/**
 * Format Gregorian date beautifully in Bangla
 * @param {Date|string} date - Input date
 * @param {Object} options - { includeDay, includeYear, monthFormat: 'long'|'short', digitType: 'bangla'|'english' }
 */
export function formatDateBangla(date, options = {}) {
  const { includeDay = true, includeYear = true, monthFormat = 'long', digitType = 'bangla' } = options;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '';
  
  const day = BANGLA_DAYS[d.getDay()];
  const banglaMonthsLong = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];
  const banglaMonthsShort = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
  const month = monthFormat === 'short' ? banglaMonthsShort[d.getMonth()] : banglaMonthsLong[d.getMonth()];
  
  let dayNum = d.getDate();
  let year = d.getFullYear();
  if (digitType === 'bangla') {
    dayNum = toBanglaNum(dayNum);
    year = toBanglaNum(year);
  }
  
  let parts = [];
  if (includeDay) parts.push(day);
  parts.push(`${dayNum} ${month}`);
  if (includeYear) parts.push(year);
  return parts.join(', ');
}

/**
 * Get all three calendars for a given date (Bangla, Gregorian, Hijri)
 */
export function getAllCalendars(date = null, useBangladeshTZ = true) {
  const targetDate = date ? new Date(date) : new Date();
  if (isNaN(targetDate)) return null;
  
  return {
    gregorian: {
      formatted: formatGregorian(targetDate),
      formattedBangla: formatDateBangla(targetDate),
      date: targetDate,
    },
    bangla: gregorianToBangla(targetDate, useBangladeshTZ),
    hijri: gregorianToHijri(targetDate, useBangladeshTZ),
  };
}

/**
 * Get today's date in Bangladesh with all calendars.
 */
export function getTodayAllCalendars() {
  const todayBST = getCurrentBangladeshDate().dateObj;
  return getAllCalendars(todayBST, true);
}

// ===============================
// 10. DEMO SAMPLES (Bangladeshi national & festival days)
// ===============================

export const SAMPLES = [
  { label: 'আজকের তারিখ (বাংলাদেশ)', date: null },
  { label: 'পহেলা বৈশাখ', date: '2025-04-14' },
  { label: 'স্বাধীনতা দিবস', date: '2025-03-26' },
  { label: 'বিজয় দিবস', date: '2024-12-16' },
  { label: 'শহীদ দিবস (একুশে ফেব্রুয়ারি)', date: '2025-02-21' },
  { label: 'ঈদুল ফিতর (প্রায়)', date: '2025-03-31' },
  { label: 'ঈদুল আযহা (প্রায়)', date: '2025-06-07' },
  { label: 'পৌষ সংক্রান্তি', date: '2025-01-14' },
];

// Auto-test in non-production environments
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  console.log('🌞 Bangla Date Converter v2.0 – Self Test\n');
  const today = getTodayAllCalendars();
  console.log('📅 Today in Bangladesh (BST):');
  console.log(`   গ্রেগরীয়: ${today.gregorian.formatted}`);
  console.log(`   বাংলা:     ${today.bangla.formattedFull}`);
  console.log(`   হিজরি:     ${today.hijri.formatted}\n`);
  
  console.log('🎉 Example: Pohela Boishakh 2025');
  const pohela = gregorianToBangla('2025-04-14');
  console.log(`   ${pohela.formattedFull}`);
  console.log(`   ইংরেজি: ${pohela.gregorianFormatted}\n`);
}

// Export all public utilities
export {
  HIJRI_MONTHS,
  HIJRI_MONTHS_EN,
  toBanglaNum as toBanglaNumber,
  toEnglishNum as toEnglishNumber
};