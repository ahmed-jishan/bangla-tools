/**
 * Find & Replace
 * Bangla-aware search and replace:
 *  - Plain text search
 *  - Case-sensitive / insensitive
 *  - Whole word matching
 *  - Regular expression support
 *  - Multiple find-replace pairs (batch mode)
 *  - Match highlighting data
 *  - Replace with capture groups ($1, $2)
 *  - Undo history
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPattern(find, options = {}) {
  const { caseSensitive = false, wholeWord = false, useRegex = false } = options;

  if (!find) return null;

  let pattern = useRegex ? find : escapeRegex(find);

  if (wholeWord && !useRegex) {
    // Word boundary — works for both English and Bangla
    // Bengali words are separated by spaces, so use lookahead/lookbehind
    pattern = `(?<![\\u0980-\\u09FFa-zA-Z0-9])${pattern}(?![\\u0980-\\u09FFa-zA-Z0-9])`;
  }

  const flags = caseSensitive ? 'g' : 'gi';

  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    return null; // Invalid regex
  }
}

// ─── Find ─────────────────────────────────────────────────────────────────────

/**
 * Find all matches with positions
 * @param {string} text
 * @param {string} find
 * @param {object} options
 * @returns {{ matches: Array, count: number, error: string|null }}
 */
export function findMatches(text, find, options = {}) {
  if (!text || !find) return { matches: [], count: 0, error: null };

  const pattern = buildPattern(find, options);
  if (!pattern) return { matches: [], count: 0, error: 'অবৈধ Regular Expression' };

  const matches = [];
  let m;
  let safety = 0;

  pattern.lastIndex = 0;
  while ((m = pattern.exec(text)) !== null && safety < 5000) {
    matches.push({
      index: m.index,
      length: m[0].length,
      value: m[0],
      groups: m.slice(1),
    });
    // Prevent infinite loop on zero-length matches
    if (m[0].length === 0) pattern.lastIndex++;
    safety++;
  }

  return { matches, count: matches.length, error: null };
}

// ─── Replace ──────────────────────────────────────────────────────────────────

/**
 * Replace matches in text
 * @param {string} text
 * @param {string} find
 * @param {string} replace
 * @param {object} options
 * @param {boolean} options.replaceAll - replace all vs first only
 * @returns {{ result: string, count: number, error: string|null }}
 */
export function replaceText(text, find, replace, options = {}) {
  const { replaceAll = true } = options;
  if (!text || !find) return { result: text, count: 0, error: null };

  const patternOpts = { ...options };
  // For replace-first, we still need global to count but only apply once
  const pattern = buildPattern(find, patternOpts);
  if (!pattern) return { result: text, count: 0, error: 'অবৈধ Regular Expression' };

  let count = 0;

  if (!replaceAll) {
    // Replace only first occurrence
    const singlePattern = new RegExp(
      pattern.source,
      pattern.flags.replace('g', '')
    );
    const result = text.replace(singlePattern, (...args) => {
      count++;
      return processReplacement(replace, args);
    });
    return { result, count, error: null };
  }

  pattern.lastIndex = 0;
  const result = text.replace(pattern, (...args) => {
    count++;
    return processReplacement(replace, args);
  });

  return { result, count, error: null };
}

/**
 * Process replacement string with capture group references ($1, $2, $&)
 */
function processReplacement(replace, matchArgs) {
  // matchArgs: [fullMatch, ...groups, offset, originalString]
  let result = replace;
  const fullMatch = matchArgs[0];
  const groups    = matchArgs.slice(1, matchArgs.length - 2);

  // $& → full match
  result = result.replace(/\$&/g, fullMatch);
  // $1, $2... → capture groups
  groups.forEach((g, i) => {
    result = result.replace(new RegExp(`\\$${i + 1}`, 'g'), g || '');
  });
  // Escape sequences: \n \t
  result = result.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  return result;
}

// ─── Batch Replace ────────────────────────────────────────────────────────────

/**
 * Apply multiple find-replace pairs sequentially
 * @param {string} text
 * @param {Array<{find: string, replace: string}>} pairs
 * @param {object} options
 */
export function batchReplace(text, pairs, options = {}) {
  if (!text || !pairs?.length) return { result: text, changes: [] };

  let current = text;
  const changes = [];

  for (const { find, replace } of pairs) {
    if (!find) continue;
    const { result, count, error } = replaceText(current, find, replace, options);
    if (!error && count > 0) {
      changes.push({ find, replace, count });
      current = result;
    }
  }

  return { result: current, changes };
}

// ─── Highlight builder ────────────────────────────────────────────────────────

/**
 * Build HTML with highlights for display
 * (Used in UI to show matches before replacing)
 */
export function buildHighlightedHtml(text, matches) {
  if (!matches?.length) return escapeHtml(text);

  let result = '';
  let lastIdx = 0;

  // Sort by index just in case
  const sorted = [...matches].sort((a, b) => a.index - b.index);

  sorted.forEach((m, i) => {
    result += escapeHtml(text.slice(lastIdx, m.index));
    result += `<mark class="find-match" data-match="${i}">${escapeHtml(m.value)}</mark>`;
    lastIdx = m.index + m.length;
  });

  result += escapeHtml(text.slice(lastIdx));
  return result;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

export const SAMPLES = [
  {
    label: 'বাংলা replace',
    text: 'বাংলাদেশ একটি সুন্দর দেশ। বাংলাদেশের মানুষ ভালো। আমি বাংলাদেশকে ভালোবাসি।',
    find: 'বাংলাদেশ',
    replace: '🇧🇩 বাংলাদেশ',
  },
  {
    label: 'Regex example',
    text: 'আমার phone: 01712345678। তোমার number: 01987654321।',
    find: '01[0-9]{9}',
    replace: '[PHONE]',
    isRegex: true,
  },
  {
    label: 'Batch replace',
    text: 'The color of the color wheel has many colours.',
    find: 'color',
    replace: 'colour',
  },
];