/**
 * Text Diff Viewer
 * Compare two texts and highlight differences:
 *  - Word-level diff (best for Bangla prose)
 *  - Character-level diff (fine-grained)
 *  - Line-level diff (for code/lists)
 *  - Side-by-side and inline view modes
 *  - Statistics: added, removed, unchanged
 *  - Grapheme-aware for Bengali
 */

// ─── LCS (Longest Common Subsequence) ────────────────────────────────────────

/**
 * Compute LCS table for two token arrays
 * Returns diff operations: { type: 'equal'|'insert'|'delete', value }
 */
function computeDiff(oldTokens, newTokens) {
  const m = oldTokens.length;
  const n = newTokens.length;

  // For large inputs, use a simplified approach to avoid O(mn) memory
  if (m * n > 200000) {
    return simpleDiff(oldTokens, newTokens);
  }

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = oldTokens[i - 1] === newTokens[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to get diff
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      result.unshift({ type: 'equal', value: oldTokens[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'insert', value: newTokens[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'delete', value: oldTokens[i - 1] });
      i--;
    }
  }
  return result;
}

/**
 * Simplified diff for large inputs (line-by-line Myers-like)
 */
function simpleDiff(oldTokens, newTokens) {
  const oldSet = new Set(oldTokens);
  const result = [];
  const newUsed = new Set();

  // Basic: mark what's in both
  const oldMap = new Map();
  oldTokens.forEach((t, i) => {
    if (!oldMap.has(t)) oldMap.set(t, []);
    oldMap.get(t).push(i);
  });

  newTokens.forEach(t => {
    if (oldMap.has(t) && !newUsed.has(t)) {
      result.push({ type: 'equal', value: t });
      newUsed.add(t);
    } else {
      result.push({ type: 'insert', value: t });
    }
  });

  return result;
}

// ─── Tokenizers ───────────────────────────────────────────────────────────────

const hasSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter;

function tokenizeByWord(text) {
  // Split preserving whitespace as tokens
  return text.split(/(\s+)/).filter(t => t.length > 0);
}

function tokenizeByLine(text) {
  return text.split('\n');
}

function tokenizeByChar(text) {
  if (hasSegmenter) {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return [...seg.segment(text)].map(s => s.segment);
  }
  return [...text];
}

// ─── Diff Runners ─────────────────────────────────────────────────────────────

/**
 * Run diff at specified granularity
 * @param {string} oldText
 * @param {string} newText
 * @param {'word'|'line'|'char'} mode
 * @returns {Array<{type, value}>}
 */
export function diffTexts(oldText, newText, mode = 'word') {
  if (oldText === newText) {
    const tokens = mode === 'line'
      ? tokenizeByLine(oldText)
      : mode === 'char'
        ? tokenizeByChar(oldText)
        : tokenizeByWord(oldText);
    return tokens.map(v => ({ type: 'equal', value: v }));
  }

  let oldTokens, newTokens;
  switch (mode) {
    case 'line':
      oldTokens = tokenizeByLine(oldText);
      newTokens = tokenizeByLine(newText);
      break;
    case 'char':
      oldTokens = tokenizeByChar(oldText);
      newTokens = tokenizeByChar(newText);
      break;
    default: // word
      oldTokens = tokenizeByWord(oldText);
      newTokens = tokenizeByWord(newText);
  }

  return computeDiff(oldTokens, newTokens);
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export function getDiffStats(diff) {
  let added = 0, removed = 0, unchanged = 0;
  diff.forEach(d => {
    const len = d.value.length;
    if (d.type === 'insert')  added    += len;
    if (d.type === 'delete')  removed  += len;
    if (d.type === 'equal')   unchanged += len;
  });
  const total = added + removed + unchanged;
  return {
    added,
    removed,
    unchanged,
    total,
    similarity: total > 0
      ? Math.round((unchanged / (total)) * 100)
      : 100,
    addedTokens:   diff.filter(d => d.type === 'insert').length,
    removedTokens: diff.filter(d => d.type === 'delete').length,
    equalTokens:   diff.filter(d => d.type === 'equal').length,
  };
}

// ─── HTML Renderers ───────────────────────────────────────────────────────────

/**
 * Render inline diff as HTML string
 */
export function renderInlineDiff(diff, mode = 'word') {
  const sep = mode === 'line' ? '\n' : '';
  return diff.map(d => {
    const escaped = escHtml(d.value);
    if (d.type === 'insert') return `<ins class="diff-ins">${escaped}</ins>`;
    if (d.type === 'delete') return `<del class="diff-del">${escaped}</del>`;
    return `<span class="diff-eq">${escaped}</span>`;
  }).join(sep);
}

/**
 * Render old side (deletions highlighted)
 */
export function renderOldSide(diff) {
  return diff
    .filter(d => d.type !== 'insert')
    .map(d => {
      const escaped = escHtml(d.value);
      if (d.type === 'delete') return `<del class="diff-del">${escaped}</del>`;
      return `<span class="diff-eq">${escaped}</span>`;
    }).join('');
}

/**
 * Render new side (insertions highlighted)
 */
export function renderNewSide(diff) {
  return diff
    .filter(d => d.type !== 'delete')
    .map(d => {
      const escaped = escHtml(d.value);
      if (d.type === 'insert') return `<ins class="diff-ins">${escaped}</ins>`;
      return `<span class="diff-eq">${escaped}</span>`;
    }).join('');
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export const SAMPLES = [
  {
    label: 'বাংলা সংশোধন',
    old: 'আমার সোনার বাংলা আমি তোমায় ভালোবাসি।\nচিরদিন তোমার আকাশ তোমার বাতাস।',
    new: 'আমার সোনার বাংলাদেশ আমি তোমাকে ভালোবাসি।\nচিরকাল তোমার আকাশ তোমার বাতাস।',
  },
  {
    label: 'English edit',
    old: 'The quick brown fox jumps over the lazy dog.',
    new: 'The quick red fox leaps over the sleeping dog.',
  },
  {
    label: 'Code diff',
    old: 'function hello() {\n  console.log("Hello");\n  return true;\n}',
    new: 'function hello(name) {\n  console.log("Hello " + name);\n  return false;\n}',
  },
];