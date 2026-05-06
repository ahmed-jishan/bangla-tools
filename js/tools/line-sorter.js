/**
 * Line Sorter
 * Sort lines with full Bangla Unicode collation support:
 *  - Alphabetical (A→Z / Z→A) — Bangla Unicode order
 *  - By word count
 *  - By character count
 *  - Numerical sort (handles Bengali digits too)
 *  - Random shuffle
 *  - By line length
 *  - Natural sort (handles mixed numbers: item2 < item10)
 *  - Reverse any sort
 *  - Remove blank lines option
 *  - Trim whitespace option
 */

// ─── Bangla Digit Normalizer ──────────────────────────────────────────────────

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

function normalizeBanglaDigits(str) {
  return str.replace(/[০-৯]/g, d => BN_DIGITS.indexOf(d).toString());
}

function extractLeadingNumber(str) {
  const normalized = normalizeBanglaDigits(str.trim());
  const match = normalized.match(/^-?[\d,]+\.?\d*/);
  if (match) return parseFloat(match[0].replace(/,/g, ''));
  return null;
}

// ─── Collation ────────────────────────────────────────────────────────────────

// Bangla Unicode collation — approximate sort key
// Bengali script block: U+0980–U+09FF
// We rely on Intl.Collator for proper Unicode-aware sorting
const banglaCollator = new Intl.Collator('bn', {
  sensitivity: 'base',
  numeric: false,
  ignorePunctuation: false,
});

const naturalCollator = new Intl.Collator('bn', {
  sensitivity: 'base',
  numeric: true, // This enables natural sort (item2 < item10)
});

// ─── Sort Functions ───────────────────────────────────────────────────────────

function sortAlpha(lines, reverse = false) {
  const sorted = [...lines].sort((a, b) => banglaCollator.compare(a, b));
  return reverse ? sorted.reverse() : sorted;
}

function sortNatural(lines, reverse = false) {
  const sorted = [...lines].sort((a, b) => naturalCollator.compare(a, b));
  return reverse ? sorted.reverse() : sorted;
}

function sortByLength(lines, reverse = false) {
  // Sort by character count (grapheme-aware approximation)
  const sorted = [...lines].sort((a, b) => {
    const la = [...a].length; // rough grapheme count
    const lb = [...b].length;
    return la - lb;
  });
  return reverse ? sorted.reverse() : sorted;
}

function sortByWordCount(lines, reverse = false) {
  const sorted = [...lines].sort((a, b) => {
    const wa = a.trim().split(/\s+/).filter(Boolean).length;
    const wb = b.trim().split(/\s+/).filter(Boolean).length;
    return wa - wb;
  });
  return reverse ? sorted.reverse() : sorted;
}

function sortNumerically(lines, reverse = false) {
  const withNums = lines.map(line => ({
    line,
    num: extractLeadingNumber(line),
  }));

  const hasNums  = withNums.filter(x => x.num !== null);
  const noNums   = withNums.filter(x => x.num === null);

  hasNums.sort((a, b) => a.num - b.num);
  if (reverse) hasNums.reverse();

  return [...hasNums.map(x => x.line), ...noNums.map(x => x.line)];
}

function sortRandom(lines) {
  const arr = [...lines];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sortByLastWord(lines, reverse = false) {
  const sorted = [...lines].sort((a, b) => {
    const lastA = a.trim().split(/\s+/).pop() || '';
    const lastB = b.trim().split(/\s+/).pop() || '';
    return banglaCollator.compare(lastA, lastB);
  });
  return reverse ? sorted.reverse() : sorted;
}

function moveBlankLinesTo(lines, position = 'end') {
  const blank    = lines.filter(l => !l.trim());
  const nonBlank = lines.filter(l => l.trim());
  return position === 'end' ? [...nonBlank, ...blank] : [...blank, ...nonBlank];
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const SORT_MODES = {
  alpha: {
    label: 'বর্ণানুক্রম (A→Z)',
    icon: '🔤',
    desc: 'Unicode Bengali collation — বাংলা ও English উভয় সঠিকভাবে',
    fn: (lines, rev) => sortAlpha(lines, rev),
  },
  natural: {
    label: 'Natural sort',
    icon: '🔢',
    desc: 'item2 < item10 — mixed text+number correctly sorted',
    fn: (lines, rev) => sortNatural(lines, rev),
  },
  length: {
    label: 'দৈর্ঘ্য অনুযায়ী',
    icon: '📏',
    desc: 'ছোট থেকে বড় (অক্ষর সংখ্যা অনুযায়ী)',
    fn: (lines, rev) => sortByLength(lines, rev),
  },
  wordcount: {
    label: 'শব্দ সংখ্যা অনুযায়ী',
    icon: '📊',
    desc: 'কম শব্দ থেকে বেশি শব্দের লাইন',
    fn: (lines, rev) => sortByWordCount(lines, rev),
  },
  numeric: {
    label: 'সংখ্যা অনুযায়ী',
    icon: '🔢',
    desc: 'লাইনের শুরুতে থাকা সংখ্যা দিয়ে sort করো',
    fn: (lines, rev) => sortNumerically(lines, rev),
  },
  lastword: {
    label: 'শেষ শব্দ অনুযায়ী',
    icon: '⬅️',
    desc: 'প্রতিটি লাইনের শেষ শব্দ দিয়ে sort',
    fn: (lines, rev) => sortByLastWord(lines, rev),
  },
  random: {
    label: 'Random shuffle',
    icon: '🎲',
    desc: 'লাইনগুলো এলোমেলো করো',
    fn: (lines) => sortRandom(lines),
  },
};

/**
 * Main sort function
 * @param {string} text
 * @param {object} options
 * @param {string} options.mode - key from SORT_MODES
 * @param {boolean} options.reverse
 * @param {boolean} options.removeBlankLines
 * @param {boolean} options.trimLines
 * @param {boolean} options.removeDuplicates - remove duplicate lines before sort
 * @returns {{ result: string, stats: object }}
 */
export function sortLines(text, options = {}) {
  const {
    mode = 'alpha',
    reverse = false,
    removeBlankLines = false,
    trimLines = false,
    removeDuplicates = false,
  } = options;

  if (!text) return { result: '', stats: { total: 0, sorted: 0 } };

  let lines = text.split('\n');
  const totalOriginal = lines.length;

  if (trimLines) {
    lines = lines.map(l => l.trim());
  }

  if (removeBlankLines) {
    lines = lines.filter(l => l.trim().length > 0);
  }

  if (removeDuplicates) {
    const seen = new Set();
    lines = lines.filter(l => {
      const key = l.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const sortFn = SORT_MODES[mode]?.fn || SORT_MODES.alpha.fn;
  const sorted = sortFn(lines, reverse);

  return {
    result: sorted.join('\n'),
    stats: {
      total:    totalOriginal,
      sorted:   sorted.length,
      removed:  totalOriginal - sorted.length,
      mode,
      reversed: reverse,
    },
  };
}

export function getStats(input, output) {
  return {
    inputLines:  input.split('\n').length,
    outputLines: output.split('\n').length,
    inputWords:  input.trim().split(/\s+/).filter(Boolean).length,
  };
}

export const SAMPLES = [
  {
    label: 'বাংলা তালিকা',
    text: `মেঘনা নদী
পদ্মা নদী
যমুনা নদী
আমাজন নদী
নীলনদ নদী
ব্রহ্মপুত্র নদী`,
  },
  {
    label: 'Mixed list',
    text: `Bangladesh
আমেরিকা
China
ভারত
Japan
বাংলাদেশ
Russia`,
  },
  {
    label: 'Numbered list',
    text: `10. দশম আইটেম
2. দ্বিতীয় আইটেম
1. প্রথম আইটেম
20. বিশতম আইটেম
3. তৃতীয় আইটেম`,
  },
  {
    label: 'Random শব্দ',
    text: `কলা
আপেল
আম
কমলা
পেয়ারা
লিচু
জাম`,
  },
];