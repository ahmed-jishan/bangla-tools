/**
 * Duplicate Remover
 * Remove duplicates at multiple levels:
 *  - Duplicate lines (exact + case-insensitive + trimmed)
 *  - Duplicate words within a line
 *  - Duplicate paragraphs
 *  - Near-duplicate lines (fuzzy similarity)
 *  - Keeps original order by default
 *  - Sort options: original order, alphabetical, by frequency
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(str, options = {}) {
  let s = str;
  if (!options.caseSensitive) s = s.toLowerCase();
  if (options.ignoreWhitespace) s = s.replace(/\s+/g, ' ').trim();
  if (options.ignorePunctuation) s = s.replace(/[।॥.!?,;:"""''()\[\]{}'`\-–—]/g, '').trim();
  return s;
}

/**
 * Simple Jaccard similarity between two strings (word-level)
 * Returns 0–1 (1 = identical)
 */
function jaccardSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

// ─── Duplicate Line Removal ───────────────────────────────────────────────────

/**
 * Remove duplicate lines
 * @param {string} text
 * @param {object} options
 * @param {boolean} options.caseSensitive
 * @param {boolean} options.ignoreWhitespace - treat "a b" and "a  b" as same
 * @param {boolean} options.ignorePunctuation
 * @param {boolean} options.ignoreBlankLines - remove all blank lines first
 * @param {'original'|'alpha'|'freq'} options.sortMode
 * @returns {{ result: string, stats: object }}
 */
export function removeDuplicateLines(text, options = {}) {
  const {
    caseSensitive = false,
    ignoreWhitespace = true,
    ignorePunctuation = false,
    ignoreBlankLines = false,
    sortMode = 'original',
  } = options;

  if (!text) return { result: '', stats: { total: 0, unique: 0, removed: 0 } };

  let lines = text.split('\n');

  if (ignoreBlankLines) {
    lines = lines.filter(l => l.trim().length > 0);
  }

  const seen = new Map();  // normalizedKey → first index
  const freq = new Map();  // normalizedKey → count
  const kept = [];

  lines.forEach((line, idx) => {
    const key = normalize(line, { caseSensitive, ignoreWhitespace, ignorePunctuation });
    freq.set(key, (freq.get(key) || 0) + 1);
    if (!seen.has(key)) {
      seen.set(key, idx);
      kept.push({ line, key, origIdx: idx });
    }
  });

  let output;
  if (sortMode === 'alpha') {
    kept.sort((a, b) => a.key.localeCompare(b.key, 'bn'));
    output = kept.map(e => e.line).join('\n');
  } else if (sortMode === 'freq') {
    kept.sort((a, b) => (freq.get(b.key) || 0) - (freq.get(a.key) || 0));
    output = kept.map(e => e.line).join('\n');
  } else {
    output = kept.map(e => e.line).join('\n');
  }

  return {
    result: output,
    stats: {
      total:   lines.length,
      unique:  kept.length,
      removed: lines.length - kept.length,
      topDuplicates: [...freq.entries()]
        .filter(([, v]) => v > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => ({ key, count })),
    },
  };
}

// ─── Fuzzy Duplicate Removal ──────────────────────────────────────────────────

/**
 * Remove near-duplicate lines using Jaccard similarity
 * @param {string} text
 * @param {number} threshold - 0.0 to 1.0 (e.g. 0.8 = 80% similar → duplicate)
 */
export function removeFuzzyDuplicates(text, threshold = 0.85) {
  if (!text) return { result: '', stats: { total: 0, removed: 0 } };

  const lines = text.split('\n').filter(l => l.trim());
  const kept  = [];
  const removed = [];

  for (const line of lines) {
    const isDuplicate = kept.some(k => jaccardSimilarity(k, line) >= threshold);
    if (!isDuplicate) kept.push(line);
    else removed.push(line);
  }

  return {
    result: kept.join('\n'),
    removedLines: removed,
    stats: { total: lines.length, unique: kept.length, removed: removed.length },
  };
}

// ─── Duplicate Word Removal (within line/text) ────────────────────────────────

/**
 * Remove duplicate consecutive words
 * e.g. "বাংলা বাংলা দেশ" → "বাংলা দেশ"
 */
export function removeDuplicateWords(text, options = {}) {
  const { caseSensitive = false, consecutiveOnly = false } = options;

  if (!text) return { result: '', stats: { removed: 0 } };

  let removed = 0;

  const result = text.split('\n').map(line => {
    const words = line.split(/(\s+)/); // preserve spacing
    if (consecutiveOnly) {
      // Only remove consecutive dupes: "আমি আমি যাই" → "আমি যাই"
      const out = [];
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (/^\s+$/.test(w)) { out.push(w); continue; }
        const prev = out.filter(x => !/^\s+$/.test(x)).slice(-1)[0];
        const norm = caseSensitive ? w : w.toLowerCase();
        const prevNorm = caseSensitive ? prev : prev?.toLowerCase();
        if (norm === prevNorm) { removed++; continue; }
        out.push(w);
      }
      return out.join('');
    } else {
      // Remove all dupes within line
      const seen = new Set();
      const out  = [];
      for (const w of words) {
        if (/^\s+$/.test(w)) { out.push(w); continue; }
        const key = caseSensitive ? w : w.toLowerCase();
        if (seen.has(key)) { removed++; continue; }
        seen.add(key);
        out.push(w);
      }
      return out.join('');
    }
  }).join('\n');

  return { result, stats: { removed } };
}

// ─── Duplicate Paragraph Removal ─────────────────────────────────────────────

export function removeDuplicateParagraphs(text, options = {}) {
  const { caseSensitive = false } = options;
  if (!text) return { result: '', stats: { total: 0, removed: 0 } };

  const paras = text.split(/\n\s*\n/);
  const seen = new Set();
  const kept = [];
  let removed = 0;

  paras.forEach(p => {
    const key = normalize(p, { caseSensitive, ignoreWhitespace: true });
    if (!seen.has(key)) {
      seen.add(key);
      kept.push(p);
    } else {
      removed++;
    }
  });

  return {
    result: kept.join('\n\n'),
    stats: { total: paras.length, unique: kept.length, removed },
  };
}

export const MODES = {
  lines: {
    label: 'Duplicate লাইন সরাও',
    icon: '📄',
    desc: 'একই লাইন একাধিকবার থাকলে রাখো শুধু প্রথমটি',
  },
  words: {
    label: 'Duplicate শব্দ সরাও',
    icon: '🔤',
    desc: 'একই line এ একই শব্দ বারবার আসলে একটি রাখো',
  },
  paragraphs: {
    label: 'Duplicate অনুচ্ছেদ সরাও',
    icon: '📃',
    desc: 'একই paragraph একাধিকবার থাকলে একটি রাখো',
  },
  fuzzy: {
    label: 'Similar লাইন সরাও (Fuzzy)',
    icon: '🧲',
    desc: '৮৫%+ মিল থাকলে duplicate হিসেবে গণ্য করো',
  },
};

export const SAMPLES = [
  {
    label: 'Duplicate lines',
    text: `বাংলাদেশ একটি সুন্দর দেশ।
বাংলাদেশ একটি সুন্দর দেশ।
এখানে নদী আছে।
বাংলাদেশ একটি সুন্দর দেশ।
পাখি গান গায়।
এখানে নদী আছে।`,
  },
  {
    label: 'Duplicate words',
    text: `আমি আমি বাংলাদেশ ভালোবাসি ভালোবাসি।
আকাশ নীল নীল রঙের।
নদী বহে বহে যায়।`,
  },
  {
    label: 'Fuzzy duplicates',
    text: `বাংলাদেশ একটি সুন্দর দেশ।
বাংলাদেশ একটি অনেক সুন্দর দেশ।
এখানে নদী আছে।
এখানে অনেক নদী রয়েছে।
পাখি গান গায়।`,
  },
];