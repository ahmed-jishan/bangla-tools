/**
 * Bangla Text Tools Suite — Main App
 * Handles routing, sidebar, and tool rendering
 */

import { bijoyToUnicode, getStats as b2uStats, SAMPLES as b2uSamples } from './tools/bijoy-to-unicode.js';
import { unicodeToBijoy, getStats as u2bStats, SAMPLES as u2bSamples } from './tools/unicode-to-bijoy.js';
import { avroToUnicode, getStats as avroStats, SAMPLES as avroSamples, QUICK_REFS } from './tools/avro-phonetic.js';
import { romanizeBangla, getStats as romStats, SAMPLES as romSamples } from './tools/romanization.js';
import { toBanglaDigits, toEnglishDigits, numberToBanglaWords, formatBangladeshi, formatInternational, SAMPLES as numSamples } from './tools/number-converter.js';
import { gregorianToBangla, banglaToGregorian, gregorianToHijri, getTodayAllCalendars, formatDateBangla, BANGLA_MONTHS, toBanglaNum, SAMPLES as dateSamples } from './tools/date-converter.js';
import { analyzeText, SAMPLES as wcSamples } from './tools/word-counter.js';
import { estimateReadingTime, AUDIENCE_PRESETS, CONTENT_TYPES, SAMPLES as rtSamples } from './tools/reading-time.js';
import { detectEncoding, inspectCharacters, SAMPLES as encSamples } from './tools/encoding-detector.js';
import { analyzeFrequency, SAMPLES as freqSamples } from './tools/frequency-analyzer.js';
import { analyzeSentences, SAMPLES as sentSamples } from './tools/sentence-counter.js';
import { cleanText, cleanWithPreset, getDiffStats, CLEANERS, PRESETS, SAMPLES as cleanSamples } from './tools/text-cleaner.js';
import { removeDuplicateLines, removeDuplicateWords, removeDuplicateParagraphs, removeFuzzyDuplicates, MODES as dupModes, SAMPLES as dupSamples } from './tools/duplicate-remover.js';
import { convertCase, CONVERTERS, GROUPS, getStats as caseStats, SAMPLES as caseSamples } from './tools/case-converter.js';
import { reverseText, MODES as reverseModes, getStats as revStats, checkPalindrome, SAMPLES as revSamples } from './tools/text-reverser.js';
import { sortLines, SORT_MODES, getStats as sortStats, SAMPLES as sortSamples } from './tools/line-sorter.js';
import { truncateText, truncateWithPreset, getTextInfo, PRESETS as truncPresets, SAMPLES as truncSamples } from './tools/text-truncator.js';
import { TEMPLATE_CATEGORIES, SAMPLES as templateSamples } from './tools/smart-templates.js';
import { CONVERSION_TYPES, batchProcess, getStats, SAMPLES as batchSamples, CUSTOM_PRESETS } from './tools/batch-number-converter.js';
import { findMatches, replaceText, batchReplace, buildHighlightedHtml, SAMPLES as frSamples } from './tools/find-replace.js';
import { generateLoremBangla, THEMES as loremThemes, PRESETS as loremPresets } from './tools/lorem-bangla.js';
import { fixPunctuation, fixWithPreset, FIXES, PRESETS as punctPresets, CATEGORIES as punctCats, SAMPLES as punctSamples } from './tools/punctuation-fixer.js';

// ─── Tool Definitions ───────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'bijoy-to-unicode',
    name: 'Bijoy → Unicode',
    icon: '🔄',
    tag: 'bijoy',
    category: 'conversion',
    desc: 'Bijoy Bayanno encoded text → Unicode Bengali',
    badge: 'HOT',
  },
  {
    id: 'unicode-to-bijoy',
    name: 'Unicode → Bijoy',
    icon: '🔁',
    tag: 'bijoy',
    category: 'conversion',
    desc: 'Unicode Bengali text → Bijoy Bayanno encoding',
  },
  {
    id: 'avro-phonetic',
    name: 'Avro Phonetic',
    icon: '⌨️',
    tag: 'avro',
    category: 'conversion',
    desc: 'English phonetic typing → Unicode Bengali',
    badge: 'NEW',
  },
  {
    id: 'romanization',
    name: 'Romanization',
    icon: '🔤',
    tag: 'unicode',
    category: 'conversion',
    desc: 'বাংলা Unicode → English transliteration',
  },
  {
    id: 'number-converter',
    name: 'Number Converter',
    icon: '🔢',
    tag: 'unicode',
    category: 'utility',
    desc: 'সংখ্যা রূপান্তর — digits, words, currency',
  },
  {
    id: 'date-converter',
    name: 'Date Converter',
    icon: '📅',
    tag: 'unicode',
    category: 'utility',
    desc: 'তারিখ রূপান্তর — বাংলা সন, হিজরি',
    badge: 'NEW',
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    icon: '📊',
    tag: 'unicode',
    category: 'analysis',
    desc: 'শব্দ, অক্ষর, বাক্য — সম্পূর্ণ বিশ্লেষণ',
    badge: 'NEW',
  },
  {
    id: 'reading-time',
    name: 'Reading Time',
    icon: '⏱',
    tag: 'unicode',
    category: 'analysis',
    desc: 'পাঠের সময় অনুমান — দর্শক ও বিষয় অনুযায়ী',
  },
  {
    id: 'encoding-detector',
    name: 'Encoding Detector',
    icon: '🔍',
    tag: 'unicode',
    category: 'analysis',
    desc: 'Bijoy / Unicode / Mixed — encoding চিহ্নিত করো',
  },
  {
    id: 'frequency-analyzer',
    name: 'Frequency Analyzer',
    icon: '📈',
    tag: 'unicode',
    category: 'analysis',
    desc: 'অক্ষর, শব্দ, বাক্যাংশের ব্যবহার কত বার',
  },
  {
    id: 'sentence-counter',
    name: 'Sentence Counter',
    icon: '🧮',
    tag: 'unicode',
    category: 'analysis',
    desc: 'বাক্য গণনা ও গভীর কাঠামো বিশ্লেষণ',
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    icon: '🧹',
    tag: 'unicode',
    category: 'clean',
    desc: 'Invisible chars, extra space, HTML, emoji সরাও',
    badge: 'NEW',
  },
  {
    id: 'duplicate-remover',
    name: 'Duplicate Remover',
    icon: '✂️',
    tag: 'unicode',
    category: 'clean',
    desc: 'Duplicate line, শব্দ, অনুচ্ছেদ সরাও',
    badge: 'NEW',
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    icon: '📐',
    tag: 'unicode',
    category: 'clean',
    desc: 'UPPER, lower, Title, camelCase, snake_case...',
    badge: 'NEW',
  },
  {
    id: 'text-reverser',
    name: 'Text Reverser',
    icon: '↩️',
    tag: 'unicode',
    category: 'writing',
    desc: 'অক্ষর, শব্দ, লাইন, বাক্য উল্টো করো',
  },
  {
    id: 'line-sorter',
    name: 'Line Sorter',
    icon: '🔀',
    tag: 'unicode',
    category: 'writing',
    desc: 'বর্ণানুক্রম, দৈর্ঘ্য, সংখ্যা, random sort',
  },
  {
    id: 'text-truncator',
    name: 'Text Truncator',
    icon: '✂️',
    tag: 'unicode',
    category: 'writing',
    desc: 'অক্ষর, শব্দ, বাক্য, byte — নির্দিষ্ট limit এ কাটো',
  },
  {
    id: 'smart-templates',
    name: 'Templates',
    icon: '📄',
    tag: 'unicode',
    category: 'writing',
    desc: 'ব্যাংক, অফিস, ইমেইল, আমন্ত্রণপত্র — এক-ক্লিকে রেডি টেমপ্লেট',
  },
  {
    id: 'batch-number',
    name: 'Batch Number',
    icon: '🔢',
    tag: 'unicode',
    category: 'writing',
    desc: 'তালিকা‑ভিত্তিক সংখ্যা → বাংলা কথায়, মুদ্রা, কমা ফরম্যাট, ব্যাচ প্রসেসিং',
  },
  {
    id: 'find-replace',
    name: 'Find & Replace',
    icon: '🔎',
    tag: 'unicode',
    category: 'writing',
    desc: 'Regex সহ বাংলা text এ খোঁজো ও বদলাও',
  },
  {
    id: 'lorem-bangla',
    name: 'Lorem Bangla',
    icon: '📝',
    tag: 'unicode',
    category: 'writing',
    desc: 'Meaningful বাংলা placeholder text তৈরি করো',
    badge: 'NEW',
  },
  {
   id: 'punctuation-fixer',
   name: 'Punctuation Fixer',
   icon: '✏️',
   tag: 'unicode',
   category: 'writing',
   desc: 'বাংলা দাঁড়ি, comma, quotes সঠিক করো',
  },

];

const COMING_SOON = [
  { name: 'Word Counter', icon: '📊', category: 'analysis' },
  { name: 'Text Cleaner', icon: '🧹', category: 'clean' },
  { name: 'Find & Replace', icon: '🔎', category: 'writing' },
  //{ name: 'Number Convert', icon: '🔢', category: 'utility' },
];

// ─── State ───────────────────────────────────────────────────────────────────
let currentTool = TOOLS[0].id;

// ─── DOM Helpers ─────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const showToast = (msg = 'Copied!') => {
  const t = $('toast');
  t.querySelector('.toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
};

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied!');
  }
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function buildSidebar() {
  const nav = $('sidebar-nav');
  nav.innerHTML = '';

  // Active tools
  const sect1 = document.createElement('div');
  sect1.className = 'nav-section';
  sect1.innerHTML = `<p class="nav-section-label">Conversion</p>`;
  TOOLS.forEach(tool => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (tool.id === currentTool ? ' active' : '');
    btn.dataset.tool = tool.id;
    btn.innerHTML = `
      <span class="nav-icon">${tool.icon}</span>
      <span>${tool.name}</span>
      ${tool.badge ? `<span class="nav-badge">${tool.badge}</span>` : ''}
    `;
    btn.addEventListener('click', () => activateTool(tool.id));
    sect1.appendChild(btn);
  });
  nav.appendChild(sect1);

  // Coming soon
  const sect2 = document.createElement('div');
  sect2.className = 'nav-section';
  sect2.innerHTML = `<p class="nav-section-label">Coming Soon</p>`;
  COMING_SOON.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'nav-item nav-coming';
    btn.innerHTML = `
      <span class="nav-icon">${t.icon}</span>
      <span>${t.name}</span>
      <span class="nav-badge">soon</span>
    `;
    sect2.appendChild(btn);
  });
  nav.appendChild(sect2);
}

function activateTool(id) {
  currentTool = id;
  buildSidebar();
  renderTool(id);
  // Update topbar
  const tool = TOOLS.find(t => t.id === id);
  $('topbar-title').textContent = tool.name;
  $('topbar-desc').textContent = tool.desc;
  // Close mobile sidebar
  closeMobileSidebar();
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
function openMobileSidebar() {
  $('sidebar').classList.add('open');
  $('sidebar-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebar-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Tool Renderers ───────────────────────────────────────────────────────────
function renderTool(id) {
  const view = $('tool-view');
  view.innerHTML = '';

  if (id === 'bijoy-to-unicode') renderBijoyToUnicode(view);
  else if (id === 'unicode-to-bijoy') renderUnicodeToBijoy(view);
  else if (id === 'avro-phonetic') renderAvro(view);
  else if (id === 'romanization') renderRomanization(view);
  else if (id === 'number-converter') renderNumberConverter(view);
  else if (id === 'date-converter') renderDateConverter(view);
  else if (id === 'word-counter') renderWordCounter(view);
  else if (id === 'reading-time') renderReadingTime(view);
  else if (id === 'encoding-detector') renderEncodingDetector(view);
  else if (id === 'frequency-analyzer') renderFrequencyAnalyzer(view);
  else if (id === 'sentence-counter') renderSentenceCounter(view);
  else if (id === 'text-cleaner') renderTextCleaner(view);
  else if (id === 'duplicate-remover') renderDuplicateRemover(view);
  else if (id === 'case-converter') renderCaseConverter(view);
  else if (id === 'text-reverser') renderTextReverser(view);
  else if (id === 'line-sorter') renderLineSorter(view);
  else if (id === 'text-truncator') renderTextTruncator(view);
  else if (id === 'smart-templates') renderSmartTemplates(view);
  else if (id === 'batch-number') renderBatchNumberConverter(view);
  else if (id === 'find-replace')       renderFindReplace(view);
  else if (id === 'lorem-bangla')       renderLoremBangla(view);
  else if (id === 'punctuation-fixer')  renderPunctuationFixer(view);
  else view.innerHTML = `<p>Tool not found.</p>`;
}

// ── Bijoy → Unicode ──
function renderBijoyToUnicode(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔄</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Bijoy → Unicode Converter</p>
        <p class="tool-header-desc">Bijoy Bayanno (ASCII) encoded text কে Unicode Bengali-তে রূপান্তর করুন</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="b2u-samples"></div>
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">
            Input
            <span class="io-label-tag tag-bijoy">Bijoy ASCII</span>
          </span>
          <textarea id="b2u-input" placeholder="Bijoy text এখানে paste করুন…&#10;উদাহরণ: evsjv, Avgvi †mvbvi evsjv" spellcheck="false"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">
            Output
            <span class="io-label-tag tag-unicode">Unicode বাংলা</span>
          </span>
          <textarea id="b2u-output" readonly placeholder="রূপান্তরিত বাংলা এখানে দেখাবে…"></textarea>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="b2u-convert">⟳ Convert করুন</button>
        <button class="btn btn-ghost" id="b2u-copy">⎘ Copy Output</button>
        <button class="btn btn-ghost" id="b2u-clear">✕ Clear</button>
        <button class="btn btn-ghost" id="b2u-swap" title="Swap to Unicode→Bijoy">⇄ Swap Tool</button>
      </div>
    </div>
    <div class="status-bar" id="b2u-status">
      <span class="stat-item">শব্দ: <span class="stat-val" id="b2u-words">0</span></span>
      <span class="stat-item">অক্ষর: <span class="stat-val" id="b2u-chars">0</span></span>
      <span class="stat-item">বাংলা অক্ষর: <span class="stat-val" id="b2u-bengali">0</span></span>
      <span class="stat-item">Input length: <span class="stat-val" id="b2u-orig">0</span></span>
    </div>
  `;
  container.appendChild(el);

  // ---------- Toast message helper ----------
  let toastEl = null;
  function showToast(msg, isError = false) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast-notif';
      toastEl.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #2e7d32; color: white; padding: 8px 16px; border-radius: 40px;
        font-size: 13px; z-index: 10000; opacity: 0; transition: opacity 0.2s;
        pointer-events: none; font-family: var(--font-ui);
      `;
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? '#d32f2f' : '#2e7d32';
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
  }

  // ---------- Copy to clipboard with toast ----------
  function copyText(text) {
    if (!text) {
      showToast('কপি করার জন্য কোনো টেক্সট নেই', true);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('ক্লিপবোর্ডে কপি হয়েছে!');
    }).catch(() => showToast('কপি করতে ব্যর্থ', true));
  }

  // ---------- Samples ― using imported SAMPLES from module ----------
  const samplesEl = el.querySelector('#b2u-samples');
  // Use the SAMPLES array exported from your improved module
  b2uSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => {
      el.querySelector('#b2u-input').value = s.bijoy;
      doConvert();
    });
    samplesEl.appendChild(chip);
  });

  // ---------- DOM elements ----------
  const inputEl = el.querySelector('#b2u-input');
  const outputEl = el.querySelector('#b2u-output');
  const convertBtn = el.querySelector('#b2u-convert');
  const copyBtn = el.querySelector('#b2u-copy');
  const clearBtn = el.querySelector('#b2u-clear');
  const swapBtn = el.querySelector('#b2u-swap');

  // ---------- Conversion function (uses improved module) ----------
  function doConvert() {
    const input = inputEl.value;
    if (!input.trim()) {
      outputEl.value = '';
      updateStats({ words: 0, chars: 0, banglaChars: 0, originalLen: 0 });
      return;
    }
    const output = bijoyToUnicode(input);
    outputEl.value = output;
    const stats = b2uStats(input, output);
    updateStats(stats);
  }

  function updateStats(stats) {
    el.querySelector('#b2u-words').textContent = stats.words ?? 0;
    el.querySelector('#b2u-chars').textContent = stats.chars ?? 0;
    el.querySelector('#b2u-bengali').textContent = stats.banglaChars ?? 0;
    el.querySelector('#b2u-orig').textContent = stats.originalLen ?? 0;
  }

  // ---------- Event listeners ----------
  inputEl.addEventListener('input', doConvert);
  convertBtn.addEventListener('click', doConvert);
  copyBtn.addEventListener('click', () => copyText(outputEl.value));
  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    outputEl.value = '';
    updateStats({ words: 0, chars: 0, banglaChars: 0, originalLen: 0 });
  });
  swapBtn.addEventListener('click', () => {
    // If you have another tool named 'unicode-to-bijoy', activate it
    if (typeof activateTool === 'function') {
      activateTool('unicode-to-bijoy');
    } else {
      showToast('Unicode → Bijoy tool coming soon', true);
    }
  });

  // Initial empty state
  doConvert();
}

// ── Unicode → Bijoy ──
function renderUnicodeToBijoy(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔁</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Unicode → Bijoy Converter</p>
        <p class="tool-header-desc">Unicode বাংলা text কে Bijoy Bayanno encoding-এ রূপান্তর করুন</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="u2b-samples"></div>
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">
            Input
            <span class="io-label-tag tag-unicode">Unicode বাংলা</span>
          </span>
          <textarea id="u2b-input" placeholder="Unicode বাংলা এখানে টাইপ করুন বা paste করুন…&#10;উদাহরণ: বাংলা, আমার সোনার বাংলা"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">
            Output
            <span class="io-label-tag tag-bijoy">Bijoy ASCII</span>
          </span>
          <textarea id="u2b-output" readonly placeholder="Bijoy encoded text এখানে দেখাবে…" style="font-family: var(--font-mono); font-size: 14px;"></textarea>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="u2b-convert">⟳ Convert করুন</button>
        <button class="btn btn-ghost" id="u2b-copy">⎘ Copy Output</button>
        <button class="btn btn-ghost" id="u2b-clear">✕ Clear</button>
        <button class="btn btn-ghost" id="u2b-swap">⇄ Swap Tool</button>
      </div>
    </div>
    <div class="status-bar">
      <span class="stat-item">শব্দ: <span class="stat-val" id="u2b-words">0</span></span>
      <span class="stat-item">Output chars: <span class="stat-val" id="u2b-chars">0</span></span>
      <span class="stat-item">Input length: <span class="stat-val" id="u2b-orig">0</span></span>
    </div>
  `;
  container.appendChild(el);

  const samplesEl = el.querySelector('#u2b-samples');
  u2bSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => {
      el.querySelector('#u2b-input').value = s.unicode;
      doConvert();
    });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#u2b-input');
  inputEl.addEventListener('input', doConvert);
  el.querySelector('#u2b-convert').addEventListener('click', doConvert);
  el.querySelector('#u2b-copy').addEventListener('click', () => copyText(el.querySelector('#u2b-output').value));
  el.querySelector('#u2b-clear').addEventListener('click', () => {
    inputEl.value = ''; el.querySelector('#u2b-output').value = '';
    ['words', 'chars', 'orig'].forEach(k => el.querySelector(`#u2b-${k}`).textContent = 0);
  });
  el.querySelector('#u2b-swap').addEventListener('click', () => activateTool('bijoy-to-unicode'));

  function doConvert() {
    const input = inputEl.value;
    const output = unicodeToBijoy(input);
    el.querySelector('#u2b-output').value = output;
    const stats = u2bStats(input, output);
    el.querySelector('#u2b-words').textContent = stats.words;
    el.querySelector('#u2b-chars').textContent = stats.chars;
    el.querySelector('#u2b-orig').textContent = stats.originalLen;
  }
}

// ── Avro Phonetic ──
function renderAvro(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">⌨️</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Avro Phonetic Converter</p>
        <p class="tool-header-desc">English phonetic typing → Unicode Bengali | amar → আমার</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="avro-samples"></div>
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">
            Phonetic Input (English)
            <span class="io-label-tag tag-avro">Avro</span>
          </span>
          <textarea id="avro-input" placeholder="English phonetic টাইপ করুন…&#10;উদাহরণ: amar shonar bangla&#10;bangladesh, bhalobasha, akash" spellcheck="false" style="font-family: var(--font-mono); font-size: 14px;"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">
            Output
            <span class="io-label-tag tag-unicode">Unicode বাংলা</span>
          </span>
          <textarea id="avro-output" readonly placeholder="বাংলা এখানে দেখাবে…"></textarea>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="avro-convert">⟳ Convert করুন</button>
        <button class="btn btn-ghost" id="avro-copy">⎘ Copy Output</button>
        <button class="btn btn-ghost" id="avro-clear">✕ Clear</button>
      </div>
    </div>
    <div class="status-bar">
      <span class="stat-item">শব্দ: <span class="stat-val" id="avro-words">0</span></span>
      <span class="stat-item">বাংলা অক্ষর: <span class="stat-val" id="avro-bengali">0</span></span>
    </div>
  `;

  // Quick reference card
  const refCard = document.createElement('div');
  refCard.className = 'tool-card';
  refCard.style.marginTop = '20px';
  refCard.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon" style="font-size:14px;">📖</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Quick Reference</p>
        <p class="tool-header-desc">কোন English typing → কোন বাংলা অক্ষর</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="avro-key-grid" id="avro-keys"></div>
    </div>
  `;

  container.appendChild(el);
  container.appendChild(refCard);

  // Samples
  const samplesEl = el.querySelector('#avro-samples');
  avroSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.style.fontFamily = 'var(--font-bangla)';
    chip.addEventListener('click', () => {
      el.querySelector('#avro-input').value = s.phonetic;
      doConvert();
    });
    samplesEl.appendChild(chip);
  });

  // Quick ref keys
  const keysEl = refCard.querySelector('#avro-keys');
  QUICK_REFS.forEach(r => {
    const chip = document.createElement('button');
    chip.className = 'key-chip';
    chip.innerHTML = `<span class="key-roman">${r.roman}</span><span class="key-sep">→</span><span class="key-bangla">${r.bangla}</span>`;
    chip.title = `Type "${r.roman}" to get ${r.bangla}`;
    chip.addEventListener('click', () => {
      const input = el.querySelector('#avro-input');
      input.value += (input.value && !input.value.endsWith(' ') ? ' ' : '') + r.roman;
      input.focus();
      doConvert();
    });
    keysEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#avro-input');
  inputEl.addEventListener('input', doConvert);
  el.querySelector('#avro-convert').addEventListener('click', doConvert);
  el.querySelector('#avro-copy').addEventListener('click', () => copyText(el.querySelector('#avro-output').value));
  el.querySelector('#avro-clear').addEventListener('click', () => {
    inputEl.value = ''; el.querySelector('#avro-output').value = '';
    ['words', 'bengali'].forEach(k => el.querySelector(`#avro-${k}`).textContent = 0);
  });

  function doConvert() {
    const input = inputEl.value;
    const output = avroToUnicode(input);
    el.querySelector('#avro-output').value = output;
    const stats = avroStats(input, output);
    el.querySelector('#avro-words').textContent = stats.words;
    el.querySelector('#avro-bengali').textContent = stats.banglaChars;
  }
}

// ══════════════════════════════════════════════════════════
// RENDER: Romanization
// ══════════════════════════════════════════════════════════
function renderRomanization(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔤</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Romanization — বাংলা → English</p>
        <p class="tool-header-desc">Unicode Bengali text কে English অক্ষরে লেখো (transliteration)</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="rom-samples"></div>
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">
            Input <span class="io-label-tag tag-unicode">Unicode বাংলা</span>
          </span>
          <textarea id="rom-input" placeholder="বাংলা text এখানে লিখুন বা paste করুন…&#10;উদাহরণ: আমার সোনার বাংলা"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">
            Output <span class="io-label-tag tag-avro">Roman</span>
          </span>
          <textarea id="rom-output" readonly placeholder="Romanized text এখানে দেখাবে…" style="font-family: var(--font-mono); font-size: 14px;"></textarea>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="rom-convert">⟳ Convert করুন</button>
        <button class="btn btn-ghost" id="rom-copy">⎘ Copy</button>
        <button class="btn btn-ghost" id="rom-clear">✕ Clear</button>
      </div>
    </div>
    <div class="status-bar">
      <span class="stat-item">শব্দ: <span class="stat-val" id="rom-words">0</span></span>
      <span class="stat-item">Output chars: <span class="stat-val" id="rom-chars">0</span></span>
    </div>
  `;
  container.appendChild(el);

  const samplesEl = el.querySelector('#rom-samples');
  romSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doConvert(); });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#rom-input');
  inputEl.addEventListener('input', doConvert);
  el.querySelector('#rom-convert').addEventListener('click', doConvert);
  el.querySelector('#rom-copy').addEventListener('click', () => copyText(el.querySelector('#rom-output').value));
  el.querySelector('#rom-clear').addEventListener('click', () => {
    inputEl.value = ''; el.querySelector('#rom-output').value = '';
    el.querySelector('#rom-words').textContent = 0;
    el.querySelector('#rom-chars').textContent = 0;
  });

  function doConvert() {
    const input = inputEl.value;
    const output = romanizeBangla(input);
    el.querySelector('#rom-output').value = output;
    const stats = romStats(input, output);
    el.querySelector('#rom-words').textContent = stats.words;
    el.querySelector('#rom-chars').textContent = stats.chars;
  }
}


// ══════════════════════════════════════════════════════════
// RENDER: Number Converter
// ══════════════════════════════════════════════════════════
function renderNumberConverter(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔢</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Number Converter</p>
        <p class="tool-header-desc">সংখ্যা রূপান্তর — English ↔ বাংলা অঙ্ক, কথায় লেখা, currency</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="num-samples"></div>
      <div style="margin-bottom: 12px;">
        <input
          id="num-input"
          type="text"
          placeholder="সংখ্যা লিখুন — যেমন: 1234567 বা ১২৩৪৫৬৭"
          style="width:100%; padding:12px 14px; background:var(--bg3); border:1px solid var(--border);
                 border-radius:var(--radius); font-size:18px; font-family:var(--font-mono);
                 color:var(--text); outline:none; transition:border-color var(--trans);"
        />
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" id="num-results">
        <div class="num-result-card" id="card-bn-digits">
          <p class="num-result-label">বাংলা অঙ্ক</p>
          <p class="num-result-val" id="val-bn-digits">—</p>
        </div>
        <div class="num-result-card" id="card-en-digits">
          <p class="num-result-label">English অঙ্ক</p>
          <p class="num-result-val" id="val-en-digits">—</p>
        </div>
        <div class="num-result-card" id="card-bd-format">
          <p class="num-result-label">বাংলাদেশি format (কোটি-লক্ষ)</p>
          <p class="num-result-val" id="val-bd-format">—</p>
        </div>
        <div class="num-result-card" id="card-int-format">
          <p class="num-result-label">International format</p>
          <p class="num-result-val" id="val-int-format">—</p>
        </div>
        <div class="num-result-card" style="grid-column:1/-1;" id="card-words">
          <p class="num-result-label">কথায় (বাংলা)</p>
          <p class="num-result-val" style="font-family:var(--font-bangla); font-size:17px; line-height:1.7;" id="val-words">—</p>
        </div>
        <div class="num-result-card" style="grid-column:1/-1;" id="card-currency">
          <p class="num-result-label">টাকায় (কথায়)</p>
          <p class="num-result-val" style="font-family:var(--font-bangla); font-size:17px; line-height:1.7;" id="val-currency">—</p>
        </div>
      </div>
    </div>
  `;

  // Add result card styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .num-result-card {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 16px;
      cursor: pointer;
      transition: border-color var(--trans);
    }
    .num-result-card:hover { border-color: var(--border2); }
    .num-result-card:active { border-color: var(--accent); }
    .num-result-label {
      font-size: 11px; font-weight: 500;
      color: var(--text3); text-transform: uppercase;
      letter-spacing: .06em; margin-bottom: 6px;
    }
    .num-result-val {
      font-size: 15px; font-family: var(--font-mono);
      color: var(--text); word-break: break-all; line-height: 1.5;
    }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#num-samples');
  numSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.style.fontFamily = 'var(--font-bangla)';
    chip.addEventListener('click', () => {
      el.querySelector('#num-input').value = s.value;
      doConvert();
    });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#num-input');
  inputEl.addEventListener('input', doConvert);
  inputEl.addEventListener('focus', e => e.target.style.borderColor = 'var(--accent)');
  inputEl.addEventListener('blur', e => e.target.style.borderColor = 'var(--border)');

  // Click to copy each result card
  ['bn-digits', 'en-digits', 'bd-format', 'int-format', 'words', 'currency'].forEach(key => {
    el.querySelector(`#card-${key}`).addEventListener('click', () => {
      copyText(el.querySelector(`#val-${key}`).textContent);
    });
  });

  function doConvert() {
    const raw = inputEl.value.trim();
    if (!raw) { resetResults(); return; }

    const set = (id, val) => {
      const el2 = el.querySelector(`#val-${id}`);
      if (el2) el2.textContent = val || '—';
    };

    try {
      set('bn-digits', toBanglaDigits(raw));
      set('en-digits', toEnglishDigits(raw));
      set('bd-format', formatBangladeshi(raw));
      set('int-format', formatInternational(raw));
      set('words', numberToBanglaWords(raw));
      set('currency', numberToBanglaWords(raw, { currency: true }));
    } catch (e) {
      set('words', 'অবৈধ সংখ্যা');
    }
  }

  function resetResults() {
    ['bn-digits', 'en-digits', 'bd-format', 'int-format', 'words', 'currency']
      .forEach(k => { const e = el.querySelector(`#val-${k}`); if (e) e.textContent = '—'; });
  }
}


// ══════════════════════════════════════════════════════════
// RENDER: Date Converter
// ══════════════════════════════════════════════════════════
function renderDateConverter(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';

  // Helper: Toast message
  let toastEl = null;
  function showToast(msg, isError = false) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast-notif';
      toastEl.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #2e7d32; color: white; padding: 8px 16px; border-radius: 40px;
        font-size: 13px; z-index: 10000; opacity: 0; transition: opacity 0.2s;
        pointer-events: none; font-family: var(--font-ui);
      `;
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? '#d32f2f' : '#2e7d32';
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
  }

  // Copy text to clipboard with toast
  function copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`"${text}" কপি হয়েছে`);
    }).catch(() => showToast('কপি করতে ব্যর্থ', true));
  }

  // Get today's data using the improved module
  const todayData = getTodayAllCalendars();

  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">📅</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Date Converter</p>
        <p class="tool-header-desc">Gregorian ↔ বাংলা সন ↔ হিজরি তারিখ রূপান্তর</p>
      </div>
    </div>
    <div class="tool-body">

      <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap;">
        <input
          type="date"
          id="date-input"
          value="${new Date().toISOString().slice(0, 10)}"
          style="padding:10px 14px; background:var(--bg3); border:1px solid var(--border);
                 border-radius:var(--radius); font-size:14px; color:var(--text);
                 font-family:var(--font-ui); outline:none; cursor:pointer;
                 transition:border-color var(--trans); color-scheme: dark;"
        />
        <button class="btn btn-primary" id="date-today">আজকের তারিখ</button>
        <div class="sample-row" id="date-samples" style="margin:0;"></div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">

        <div class="date-cal-card" id="dc-gregorian">
          <p class="date-cal-name">🗓 Gregorian</p>
          <p class="date-cal-main" id="dc-greg-main">${todayData.gregorian.formatted}</p>
          <p class="date-cal-sub" id="dc-greg-bn">${todayData.gregorian.formattedBangla}</p>
        </div>

        <div class="date-cal-card" id="dc-bangla">
          <p class="date-cal-name">🟢 বাংলা সন</p>
          <p class="date-cal-main bangla-font" id="dc-bn-main">${todayData.bangla?.formattedFull || '—'}</p>
          <p class="date-cal-sub" id="dc-bn-en">${todayData.bangla?.formattedEn || '—'}</p>
          <div class="date-badge" id="dc-bn-badge" style="margin-top: 8px; font-size: 11px; color: var(--accent);"></div>
        </div>

        <div class="date-cal-card" id="dc-hijri">
          <p class="date-cal-name">☪ হিজরি</p>
          <p class="date-cal-main bangla-font" id="dc-hij-main">${todayData.hijri?.formatted || '—'}</p>
          <p class="date-cal-sub" id="dc-hij-en">${todayData.hijri?.formattedEn || '—'}</p>
        </div>

      </div>

      <p style="font-size:11.5px; color:var(--text3); margin-top:14px;">
        * বাংলা সন: বাংলা একাডেমি কর্তৃক সংশোধিত বাংলাদেশ সরকারি পঞ্জিকা অনুযায়ী।
        হিজরি: জ্যোতির্বৈজ্ঞানিক গণনা, ±১-২ দিন পার্থক্য হতে পারে।
      </p>
    </div>
  `;

  // Add styles for badges (optional)
  const style = document.createElement('style');
  style.textContent = `
    .date-cal-card {
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px 18px;
      cursor: pointer; transition: border-color var(--trans);
    }
    .date-cal-card:hover { border-color: var(--border2); }
    .date-cal-name { font-size: 11px; font-weight: 500; color: var(--text3);
      text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
    .date-cal-main { font-size: 15px; font-weight: 500; color: var(--text); line-height: 1.5; margin-bottom: 4px; }
    .date-cal-sub { font-size: 12px; color: var(--text3); }
    .bangla-font { font-family: var(--font-bangla); font-size: 16px; }
    .date-badge { font-size: 10px; background: var(--accent-dim); display: inline-block;
      padding: 2px 8px; border-radius: 20px; color: var(--accent2); margin-top: 8px; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples: use SAMPLES from your module (imported as SAMPLES or dateSamples)
  const samplesContainer = el.querySelector('#date-samples');
  // If you have SAMPLES from your date converter module, use it. Otherwise fallback.
  const sampleDates = (typeof SAMPLES !== 'undefined') ? SAMPLES : [
    { label: 'আজকের তারিখ', date: null },
    { label: 'পহেলা বৈশাখ', date: '2025-04-14' },
    { label: 'স্বাধীনতা দিবস', date: '2025-03-26' },
    { label: 'বিজয় দিবস', date: '2024-12-16' },
  ];
  sampleDates.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => {
      let dateObj;
      if (s.date === null) {
        dateObj = new Date();
      } else {
        dateObj = new Date(s.date);
      }
      const dateStr = dateObj.toISOString().slice(0, 10);
      el.querySelector('#date-input').value = dateStr;
      doConvert(dateObj);
    });
    samplesContainer.appendChild(chip);
  });

  // Click to copy each card's main date
  el.querySelector('#dc-gregorian').addEventListener('click', () => {
    const text = el.querySelector('#dc-greg-main').textContent;
    copyText(text);
  });
  el.querySelector('#dc-bangla').addEventListener('click', () => {
    const text = el.querySelector('#dc-bn-main').textContent;
    copyText(text);
  });
  el.querySelector('#dc-hijri').addEventListener('click', () => {
    const text = el.querySelector('#dc-hij-main').textContent;
    copyText(text);
  });

  // Date picker change event
  el.querySelector('#date-input').addEventListener('change', e => {
    const date = new Date(e.target.value);
    if (!isNaN(date)) doConvert(date);
  });
  el.querySelector('#date-today').addEventListener('click', () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    el.querySelector('#date-input').value = todayStr;
    doConvert(today);
  });

  function doConvert(date) {
    // Use the improved module functions (all respect BST by default)
    const bangla = gregorianToBangla(date);
    const hijri = gregorianToHijri(date);
    const gregFormatted = date.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const gregBangla = formatDateBangla(date);

    el.querySelector('#dc-greg-main').textContent = gregFormatted;
    el.querySelector('#dc-greg-bn').textContent = gregBangla;
    el.querySelector('#dc-bn-main').textContent = bangla?.formattedFull || '—';
    el.querySelector('#dc-bn-en').textContent = bangla?.formattedEn || '—';
    el.querySelector('#dc-hij-main').textContent = hijri?.formatted || '—';
    el.querySelector('#dc-hij-en').textContent = hijri?.formattedEn || '—';

    // Show season and leap year info for Bangla date
    const badgeDiv = el.querySelector('#dc-bn-badge');
    if (bangla && bangla.season) {
      const leapText = bangla.isLeap ? ' (অধিবর্ষ)' : '';
      badgeDiv.textContent = `${bangla.season} ঋতু${leapText}`;
      badgeDiv.style.display = 'block';
    } else {
      badgeDiv.style.display = 'none';
    }
  }

  // Initial conversion (already set from todayData, but ensure badge shows)
  doConvert(new Date());
}

// RENDER: Word Counter
// ═══════════════════════════════════════════════════════════════════

function renderWordCounter(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">📊</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Word & Character Counter</p>
        <p class="tool-header-desc">বাংলা Unicode সঠিকভাবে গণনা করে — grapheme cluster aware</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="wc-samples"></div>
      <textarea id="wc-input" placeholder="এখানে text লিখুন বা paste করুন…" style="min-height:160px;"></textarea>
 
      <div id="wc-stats-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px; margin-top: 14px;
      ">
        ${[
      ['wc-graphemes', 'অক্ষর (সঠিক)', '0', 'green'],
      ['wc-words', 'শব্দ', '0', 'blue'],
      ['wc-sentences', 'বাক্য', '0', 'amber'],
      ['wc-paragraphs', 'অনুচ্ছেদ', '0', 'purple'],
      ['wc-unique', 'অনন্য শব্দ', '0', 'teal'],
      ['wc-diversity', 'Lexical Diversity', '0%', 'coral'],
      ['wc-bytes', 'Bytes (UTF-8)', '0', 'gray'],
      ['wc-lines', 'লাইন', '0', 'gray'],
    ].map(([id, label, val, color]) => `
          <div class="stat-box stat-${color}" id="${id}">
            <p class="stat-box-label">${label}</p>
            <p class="stat-box-val">${val}</p>
          </div>
        `).join('')}
      </div>
 
      <div id="wc-lang-bar" style="margin-top: 16px; display:none;">
        <p style="font-size:11px; font-weight:500; color:var(--text3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:8px;">ভাষা অনুপাত</p>
        <div style="display:flex; height:8px; border-radius:20px; overflow:hidden; gap:2px;" id="wc-lang-visual"></div>
        <div style="display:flex; gap:16px; margin-top:6px; flex-wrap:wrap;" id="wc-lang-legend"></div>
      </div>
 
      <div id="wc-topwords" style="margin-top:16px; display:none;">
        <p style="font-size:11px; font-weight:500; color:var(--text3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:8px;">সর্বাধিক ব্যবহৃত শব্দ (stop words বাদে)</p>
        <div id="wc-topwords-list" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
      </div>
    </div>
  `;

  // Stat box styles
  const style = document.createElement('style');
  style.textContent = `
    .stat-box { background:var(--bg3); border:1px solid var(--border); border-radius:var(--radius);
      padding:12px 14px; }
    .stat-box-label { font-size:11px; color:var(--text3); font-weight:500; text-transform:uppercase;
      letter-spacing:.05em; margin-bottom:6px; }
    .stat-box-val { font-size:22px; font-weight:600; font-family:var(--font-mono);
      color:var(--text); line-height:1; }
    .stat-green  { border-color: #34d39940; } .stat-green  .stat-box-val { color: var(--green); }
    .stat-blue   { border-color: #4f8ef740; } .stat-blue   .stat-box-val { color: var(--accent2); }
    .stat-amber  { border-color: #fbbf2440; } .stat-amber  .stat-box-val { color: var(--amber); }
    .stat-purple { border-color: #a78bfa40; } .stat-purple .stat-box-val { color: #a78bfa; }
    .stat-teal   { border-color: #34d39930; } .stat-teal   .stat-box-val { color: #34d399; }
    .stat-coral  { border-color: #f8717140; } .stat-coral  .stat-box-val { color: var(--red); }
    .word-freq-chip { background:var(--surface2); border:1px solid var(--border);
      border-radius:var(--radius-sm); padding:4px 10px; font-size:12px; color:var(--text2);
      font-family:var(--font-bangla); display:flex; gap:6px; align-items:center; }
    .word-freq-count { font-family:var(--font-mono); font-size:10px; color:var(--text3); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#wc-samples');
  wcSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doAnalyze(); });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#wc-input');
  inputEl.addEventListener('input', doAnalyze);

  function setVal(id, val) {
    const el2 = el.querySelector(`#${id} .stat-box-val`);
    if (el2) el2.textContent = val;
  }

  function doAnalyze() {
    const text = inputEl.value;
    const stats = analyzeText(text);

    setVal('wc-graphemes', stats.graphemes.toLocaleString('bn'));
    setVal('wc-words', stats.words.toLocaleString('bn'));
    setVal('wc-sentences', stats.sentences.toLocaleString('bn'));
    setVal('wc-paragraphs', stats.paragraphs.toLocaleString('bn'));
    setVal('wc-unique', stats.uniqueWords.toLocaleString('bn'));
    setVal('wc-diversity', stats.lexicalDiversity + '%');
    setVal('wc-bytes', stats.bytes.toLocaleString());
    setVal('wc-lines', stats.lines.toLocaleString('bn'));

    // Language bar
    const langBar = el.querySelector('#wc-lang-bar');
    if (text.trim()) {
      langBar.style.display = 'block';
      const visual = el.querySelector('#wc-lang-visual');
      const legend = el.querySelector('#wc-lang-legend');
      const r = stats.langRatio;
      visual.innerHTML = `
        ${r.bangla ? `<div style="flex:${r.bangla};  background:#34d399; border-radius:20px;"></div>` : ''}
        ${r.english ? `<div style="flex:${r.english}; background:#4f8ef7; border-radius:20px;"></div>` : ''}
        ${r.digit ? `<div style="flex:${r.digit};   background:#fbbf24; border-radius:20px;"></div>` : ''}
      `;
      legend.innerHTML = `
        ${r.bangla ? `<span style="font-size:12px;color:var(--text3)"><span style="color:#34d399">●</span> বাংলা ${r.bangla}%</span>` : ''}
        ${r.english ? `<span style="font-size:12px;color:var(--text3)"><span style="color:#4f8ef7">●</span> English ${r.english}%</span>` : ''}
        ${r.digit ? `<span style="font-size:12px;color:var(--text3)"><span style="color:#fbbf24">●</span> সংখ্যা ${r.digit}%</span>` : ''}
      `;
    } else {
      langBar.style.display = 'none';
    }

    // Top words
    const twEl = el.querySelector('#wc-topwords');
    const twList = el.querySelector('#wc-topwords-list');
    if (stats.topWords.length > 0) {
      twEl.style.display = 'block';
      twList.innerHTML = stats.topWords.map(w =>
        `<div class="word-freq-chip">${w.word}<span class="word-freq-count">${w.count}x</span></div>`
      ).join('');
    } else {
      twEl.style.display = 'none';
    }
  }
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Reading Time
// ═══════════════════════════════════════════════════════════════════

function renderReadingTime(container) {
  let selectedAudience = 'professional';
  let selectedContent = 'article';

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">⏱</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Reading Time Estimator</p>
        <p class="tool-header-desc">পাঠকের ধরন ও বিষয়বস্তু অনুযায়ী পড়ার সময় অনুমান</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="rt-samples"></div>
 
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
        <div>
          <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;">পাঠকের ধরন</p>
          <div id="rt-audience" style="display:flex;flex-direction:column;gap:5px;"></div>
        </div>
        <div>
          <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;">বিষয়বস্তুর ধরন</p>
          <div id="rt-content" style="display:flex;flex-direction:column;gap:5px;"></div>
        </div>
      </div>
 
      <textarea id="rt-input" placeholder="এখানে text paste করুন…" style="min-height:140px;"></textarea>
 
      <div id="rt-result" style="margin-top:16px; display:none;">
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-bottom:12px;">
          <div class="rt-main-card">
            <p class="rt-card-label">📖 পড়ার সময়</p>
            <p class="rt-card-val" id="rt-time-main">—</p>
            <p class="rt-card-sub" id="rt-time-wpm">—</p>
          </div>
          <div class="rt-main-card">
            <p class="rt-card-label">🎙 আবৃত্তি সময় (স্বাভাবিক)</p>
            <p class="rt-card-val" id="rt-speech-normal">—</p>
          </div>
          <div class="rt-main-card">
            <p class="rt-card-label">📄 পৃষ্ঠা / লাইন</p>
            <p class="rt-card-val" id="rt-pages">—</p>
            <p class="rt-card-sub" id="rt-lines-est">—</p>
          </div>
        </div>
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;">
          <p style="font-size:11px;color:var(--text3);margin-bottom:6px;">পড়ার গতি অনুযায়ী</p>
          <div style="display:flex;gap:16px;flex-wrap:wrap;" id="rt-speed-breakdown"></div>
        </div>
      </div>
    </div>
  `;

  const rtStyle = document.createElement('style');
  rtStyle.textContent = `
    .rt-preset-btn { display:flex;align-items:center;gap:7px;padding:7px 10px;
      border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface2);
      color:var(--text2);font-size:12.5px;cursor:pointer;font-family:var(--font-ui);
      transition:all var(--trans);text-align:left;width:100%; }
    .rt-preset-btn:hover { border-color:var(--border2);color:var(--text); }
    .rt-preset-btn.active { border-color:var(--accent);background:var(--accent-dim);color:var(--accent2); }
    .rt-main-card { background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px; }
    .rt-card-label { font-size:11px;color:var(--text3);margin-bottom:6px; }
    .rt-card-val { font-size:18px;font-weight:600;color:var(--text);font-family:var(--font-bangla);line-height:1.3; }
    .rt-card-sub { font-size:11px;color:var(--text3);margin-top:3px; }
    .speed-item { display:flex;flex-direction:column;gap:2px; }
    .speed-label { font-size:11px;color:var(--text3); }
    .speed-val { font-size:14px;font-weight:500;color:var(--text);font-family:var(--font-bangla); }
  `;
  container.appendChild(rtStyle);
  container.appendChild(el);

  // Build audience buttons
  const audEl = el.querySelector('#rt-audience');
  Object.entries(AUDIENCE_PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'rt-preset-btn' + (key === selectedAudience ? ' active' : '');
    btn.innerHTML = `${preset.icon} ${preset.label}`;
    btn.title = preset.description;
    btn.addEventListener('click', () => {
      selectedAudience = key;
      audEl.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      doEstimate();
    });
    audEl.appendChild(btn);
  });

  // Build content type buttons
  const contEl = el.querySelector('#rt-content');
  Object.entries(CONTENT_TYPES).forEach(([key, ct]) => {
    const btn = document.createElement('button');
    btn.className = 'rt-preset-btn' + (key === selectedContent ? ' active' : '');
    btn.innerHTML = `${ct.icon} ${ct.label}`;
    btn.title = ct.description;
    btn.addEventListener('click', () => {
      selectedContent = key;
      contEl.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      doEstimate();
    });
    contEl.appendChild(btn);
  });

  // Samples
  const samplesEl = el.querySelector('#rt-samples');
  rtSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doEstimate(); });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#rt-input');
  inputEl.addEventListener('input', doEstimate);

  function doEstimate() {
    const text = inputEl.value;
    if (!text.trim()) { el.querySelector('#rt-result').style.display = 'none'; return; }

    const result = estimateReadingTime(text, selectedAudience, selectedContent);
    if (!result) return;

    el.querySelector('#rt-result').style.display = 'block';
    el.querySelector('#rt-time-main').textContent = result.readingTime.formatted;
    el.querySelector('#rt-time-wpm').textContent = `${result.wpmUsed} শব্দ/মিনিট · ${result.words} শব্দ`;
    el.querySelector('#rt-speech-normal').textContent = result.speechTime.normal.formatted;
    el.querySelector('#rt-pages').textContent = `${result.pages} পৃষ্ঠা`;
    el.querySelector('#rt-lines-est').textContent = `~${result.a4Lines} লাইন (A4)`;

    el.querySelector('#rt-speed-breakdown').innerHTML = `
      <div class="speed-item"><span class="speed-label">ধীরে পড়লে</span><span class="speed-val">${result.speechTime.slow.formatted}</span></div>
      <div class="speed-item"><span class="speed-label">স্বাভাবিক</span><span class="speed-val">${result.readingTime.formatted}</span></div>
      <div class="speed-item"><span class="speed-label">দ্রুত পড়লে</span><span class="speed-val">${result.speechTime.fast.formatted}</span></div>
    `;
  }
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Encoding Detector
// ═══════════════════════════════════════════════════════════════════

function renderEncodingDetector(container) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔍</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Encoding Detector</p>
        <p class="tool-header-desc">Text কোন encoding এ আছে — Bijoy, Unicode, Mixed, Avro — সঠিকভাবে চিহ্নিত করো</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="enc-samples"></div>
      <textarea id="enc-input" placeholder="যেকোনো বাংলা text paste করুন — Bijoy, Unicode, বা mixed…" style="min-height:140px;"></textarea>
 
      <div id="enc-result" style="margin-top:16px;display:none;">
 
        <div id="enc-verdict" style="border-radius:var(--radius);padding:16px 18px;margin-bottom:14px;border:2px solid;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span id="enc-verdict-icon" style="font-size:22px;flex-shrink:0;">🔍</span>
            <div>
              <p id="enc-verdict-type" style="font-size:16px;font-weight:600;margin-bottom:4px;"></p>
              <p id="enc-verdict-desc" style="font-size:13px;color:var(--text2);line-height:1.6;"></p>
            </div>
            <span id="enc-confidence" style="margin-left:auto;font-size:11px;padding:3px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0;"></span>
          </div>
          <div id="enc-recommendation" style="margin-top:12px;padding:10px 12px;border-radius:var(--radius-sm);font-size:12.5px;"></div>
        </div>
 
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:14px;" id="enc-char-counts"></div>
 
        <div id="enc-normalization" style="margin-bottom:12px;"></div>
        <div id="enc-hidden-chars" style="margin-bottom:12px;"></div>
        <div id="enc-issues" style="margin-bottom:12px;"></div>
 
        <div id="enc-inspector-wrap" style="display:none;">
          <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Character Inspector (প্রথম ৫০টি অক্ষর)</p>
          <div id="enc-inspector" style="display:flex;flex-wrap:wrap;gap:4px;"></div>
        </div>
 
      </div>
    </div>
  `;

  const encStyle = document.createElement('style');
  encStyle.textContent = `
    .enc-count-box { background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);
      padding:10px 12px; }
    .enc-count-label { font-size:10.5px;color:var(--text3);font-weight:500;text-transform:uppercase;
      letter-spacing:.05em;margin-bottom:4px; }
    .enc-count-val { font-size:18px;font-weight:600;font-family:var(--font-mono);color:var(--text); }
    .enc-char-chip { display:inline-flex;flex-direction:column;align-items:center;
      background:var(--surface2);border:1px solid var(--border);border-radius:4px;
      padding:4px 6px;min-width:36px; }
    .enc-char-display { font-family:var(--font-bangla);font-size:16px;line-height:1; }
    .enc-char-code { font-family:var(--font-mono);font-size:8px;color:var(--text3);margin-top:2px; }
    .enc-char-chip.cat-bengali { border-color:#34d39950; }
    .enc-char-chip.cat-bijoy { border-color:#f8717150; background:var(--red-dim); }
    .enc-char-chip.cat-zero-width { border-color:#fbbf2450; background:var(--amber-dim); }
    .enc-char-chip.cat-whitespace { opacity:0.4; }
    .issue-badge { display:flex;align-items:flex-start;gap:8px;padding:10px 12px;
      border-radius:var(--radius-sm);margin-bottom:6px;font-size:13px; }
    .issue-error { background:var(--red-dim);border:1px solid #f8717130; }
    .issue-warning { background:var(--amber-dim);border:1px solid #fbbf2430; }
    .issue-info { background:var(--accent-dim);border:1px solid #4f8ef730; }
  `;
  container.appendChild(encStyle);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#enc-samples');
  encSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doDetect(); });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#enc-input');
  inputEl.addEventListener('input', doDetect);

  const ENCODING_STYLES = {
    UNICODE_BENGALI: { icon: '✅', borderColor: '#34d39950', bg: 'var(--green-dim)' },
    BIJOY: { icon: '⚠️', borderColor: '#fbbf2450', bg: 'var(--amber-dim)' },
    MIXED: { icon: '🔴', borderColor: '#f8717150', bg: 'var(--red-dim)' },
    AVRO_PHONETIC: { icon: '⌨️', borderColor: '#4f8ef750', bg: 'var(--accent-dim)' },
    ASCII: { icon: 'ℹ️', borderColor: 'var(--border2)', bg: 'var(--bg3)' },
    UNKNOWN: { icon: '❓', borderColor: 'var(--border2)', bg: 'var(--bg3)' },
  };

  function doDetect() {
    const text = inputEl.value;
    const resultEl = el.querySelector('#enc-result');
    if (!text.trim()) { resultEl.style.display = 'none'; return; }

    const result = detectEncoding(text);
    if (!result) return;
    resultEl.style.display = 'block';

    const style = ENCODING_STYLES[result.primaryEncoding] || ENCODING_STYLES.UNKNOWN;
    const verdictEl = el.querySelector('#enc-verdict');
    verdictEl.style.borderColor = style.borderColor;
    verdictEl.style.background = style.bg;
    el.querySelector('#enc-verdict-icon').textContent = style.icon;
    el.querySelector('#enc-verdict-type').textContent = result.primaryEncoding.replace(/_/g, ' ');
    el.querySelector('#enc-verdict-desc').textContent = result.description;

    const confEl = el.querySelector('#enc-confidence');
    const confColors = { high: 'var(--green-dim)', medium: 'var(--amber-dim)', low: 'var(--red-dim)' };
    confEl.style.background = confColors[result.confidence];
    confEl.textContent = result.confidenceScore.label;

    el.querySelector('#enc-recommendation').textContent = '💡 ' + result.recommendation;
    el.querySelector('#enc-recommendation').style.background = 'rgba(0,0,0,0.1)';

    // Char counts
    const countsEl = el.querySelector('#enc-char-counts');
    countsEl.innerHTML = [
      ['unicodeBengali', 'Unicode বাংলা', result.classes.unicodeBengali],
      ['bijoySignature', 'Bijoy chars', result.classes.bijoySignature],
      ['latinAscii', 'Latin/ASCII', result.classes.latinAscii],
      ['whitespace', 'Whitespace', result.classes.whitespace],
      ['totalChars', 'মোট অক্ষর', result.totalChars],
      ['byteSize', 'Bytes (UTF-8)', result.byteSize],
    ].map(([key, label, val]) => `
      <div class="enc-count-box">
        <p class="enc-count-label">${label}</p>
        <p class="enc-count-val">${val.toLocaleString()}</p>
      </div>
    `).join('');

    // Normalization
    const normEl = el.querySelector('#enc-normalization');
    if (result.normalization) {
      normEl.innerHTML = `
        <div class="issue-badge issue-info">
          <span>📐</span>
          <span><strong>Normalization: ${result.normalization.form}</strong>
          ${result.normalization.description ? ` — ${result.normalization.description}` : ''}</span>
        </div>`;
    }

    // Hidden chars
    const hiddenEl = el.querySelector('#enc-hidden-chars');
    if (result.zeroWidthChars.length > 0) {
      hiddenEl.innerHTML = result.zeroWidthChars.map(z => `
        <div class="issue-badge ${z.danger === 'high' ? 'issue-error' : 'issue-warning'}">
          <span>${z.danger === 'high' ? '🚨' : '👻'}</span>
          <span><strong>[U+${z.codePoint}] ${z.name}</strong> — ${z.count} বার পাওয়া গেছে।
          ${z.danger === 'high' ? ' এটি text display সমস্যা করতে পারে।' : ''}</span>
        </div>`).join('');
    } else {
      hiddenEl.innerHTML = '';
    }

    // Problematic patterns
    const issuesEl = el.querySelector('#enc-issues');
    if (result.problematicPatterns.length > 0) {
      issuesEl.innerHTML = result.problematicPatterns.map(p => `
        <div class="issue-badge ${p.severity === 'error' ? 'issue-error' : 'issue-warning'}">
          <span>${p.severity === 'error' ? '🔴' : '🟡'}</span>
          <span><strong>${p.label}</strong> (${p.count} বার) — ${p.description}</span>
        </div>`).join('');
    } else {
      issuesEl.innerHTML = `<div class="issue-badge issue-info"><span>✅</span><span>কোনো সমস্যাজনক pattern পাওয়া যায়নি</span></div>`;
    }

    // Character inspector
    const inspWrap = el.querySelector('#enc-inspector-wrap');
    const inspEl = el.querySelector('#enc-inspector');
    if (text.length <= 300) {
      inspWrap.style.display = 'block';
      const chars = inspectCharacters(text, 50);
      inspEl.innerHTML = chars.map(ch => `
        <div class="enc-char-chip cat-${ch.category}" title="${ch.name}\n${ch.codePoint}">
          <span class="enc-char-display">${ch.display}</span>
          <span class="enc-char-code">${ch.codePoint}</span>
        </div>`).join('');
    } else {
      inspWrap.style.display = 'none';
    }
  }
}

function renderFrequencyAnalyzer(container) {
  let activeTab = 'words';        // 'words', 'chars', 'bigrams', 'collocations'
  let showStopWords = false;
  let langFilter = 'all';
  let lastResult = null;

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">📈</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Frequency Analyzer</p>
        <p class="tool-header-desc">অক্ষর · শব্দ · বাক্যাংশ — কোনটা কতবার ব্যবহার হয়েছে</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="freq-samples"></div>
      <textarea id="freq-input" placeholder="বিশ্লেষণ করতে চাওয়া text এখানে paste করো…" style="min-height:140px;"></textarea>

      <div style="display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <div style="display:flex;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;" id="freq-tabs">
          ${[['words', 'শব্দ'], ['chars', 'অক্ষর'], ['bigrams', 'বাক্যাংশ'], ['collocations', 'সহাবস্থান']].map(([id, label]) => `
            <button class="freq-tab${id === 'words' ? ' active' : ''}" data-tab="${id}">${label}</button>
          `).join('')}
        </div>
        <div style="display:flex;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;" id="freq-lang">
          ${[['all', 'সব'], ['bangla', 'বাংলা'], ['english', 'English']].map(([id, label]) => `
            <button class="freq-tab${id === 'all' ? ' active' : ''}" data-lang="${id}">${label}</button>
          `).join('')}
        </div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text2);cursor:pointer;">
          <input type="checkbox" id="freq-stopwords" style="accent-color:var(--accent);width:14px;height:14px;"> Stop words অন্তর্ভুক্ত
        </label>
        <button id="export-csv-btn" style="margin-left:auto;background:var(--accent);border:none;border-radius:var(--radius-sm);padding:6px 12px;color:white;font-size:12px;cursor:pointer;">📥 CSV Export</button>
      </div>

      <div id="freq-summary" style="margin-top:14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;display:flex;gap:20px;flex-wrap:wrap;align-items:center;"></div>

      <div id="freq-chart" style="margin-top:14px;"></div>
      <div id="freq-list" style="margin-top:10px;"></div>
    </div>
  `;

  // Styles (add toast style)
  const style = document.createElement('style');
  style.textContent = `
    .freq-tab { padding:6px 14px;font-size:12.5px;font-family:var(--font-ui);
      background:transparent;border:none;color:var(--text2);cursor:pointer;
      transition:all var(--trans);border-right:1px solid var(--border); }
    .freq-tab:last-child { border-right:none; }
    .freq-tab.active { background:var(--accent-dim);color:var(--accent2);font-weight:500; }
    .freq-tab:hover:not(.active) { background:var(--surface2); }
    .freq-bar-row { display:flex;align-items:center;gap:10px;padding:5px 0;
      border-bottom:1px solid var(--border);cursor:pointer;transition:background var(--trans); }
    .freq-bar-row:hover { background:var(--surface2);border-radius:var(--radius-sm); }
    .freq-bar-rank { font-size:11px;color:var(--text3);font-family:var(--font-mono);
      width:22px;text-align:right;flex-shrink:0; }
    .freq-bar-item { font-family:var(--font-bangla);font-size:15px;color:var(--text);
      min-width:80px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .freq-bar-track { flex:1;background:var(--bg3);border-radius:20px;height:8px;overflow:hidden; }
    .freq-bar-fill  { height:100%;border-radius:20px;background:var(--accent);
      transition:width 0.4s ease; }
    .freq-bar-count { font-size:12px;font-family:var(--font-mono);color:var(--text2);
      width:50px;text-align:right;flex-shrink:0; }
    .freq-bar-pct   { font-size:11px;color:var(--text3);width:40px;text-align:right;flex-shrink:0; }
    .freq-summary-stat { display:flex;flex-direction:column;gap:2px; }
    .freq-summary-label { font-size:10.5px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em; }
    .freq-summary-val   { font-size:16px;font-weight:600;font-family:var(--font-mono);color:var(--text); }
    .toast-notif { position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      background:#2e7d32;color:white;padding:8px 16px;border-radius:40px;
      font-size:13px;z-index:10000;opacity:0;transition:opacity 0.2s;
      pointer-events:none;font-family:var(--font-ui);}
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Toast helper
  let toastEl = null;
  function showToast(msg, isError = false) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast-notif';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? '#d32f2f' : '#2e7d32';
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
  }

  // Samples (assuming freqSamples is defined globally or import)
  const samplesEl = el.querySelector('#freq-samples');
  (typeof freqSamples !== 'undefined' ? freqSamples : []).forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doAnalyze(); });
    samplesEl.appendChild(chip);
  });

  // DOM elements
  const inputEl = el.querySelector('#freq-input');
  const exportBtn = el.querySelector('#export-csv-btn');

  // Tab switching
  el.querySelector('#freq-tabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    activeTab = btn.dataset.tab;
    el.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
    renderResults();
  });

  el.querySelector('#freq-lang').addEventListener('click', e => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    langFilter = btn.dataset.lang;
    el.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang === langFilter));
    doAnalyze();
  });

  el.querySelector('#freq-stopwords').addEventListener('change', e => {
    showStopWords = e.target.checked;
    doAnalyze();
  });

  inputEl.addEventListener('input', doAnalyze);

  // Export CSV for current tab
  exportBtn.addEventListener('click', () => {
    if (!lastResult) { showToast('কোনো বিশ্লেষণ ডাটা নেই', true); return; }
    let rows = [];
    let filename = '';
    if (activeTab === 'words') {
      rows = [['Rank', 'Word', 'Count', 'Percentage']];
      lastResult.wordFreq.forEach(f => rows.push([f.rank, f.item, f.count, f.pct]));
      filename = 'word_frequency.csv';
    } else if (activeTab === 'chars') {
      rows = [['Rank', 'Character', 'Count', 'Percentage']];
      lastResult.charFreq.forEach(f => rows.push([f.rank, f.item, f.count, f.pct]));
      filename = 'char_frequency.csv';
    } else if (activeTab === 'bigrams') {
      rows = [['Rank', 'Bigram', 'Count', 'Percentage']];
      lastResult.ngram.freq.forEach(f => rows.push([f.rank, f.item, f.count, f.pct]));
      filename = 'bigram_frequency.csv';
    } else if (activeTab === 'collocations') {
      const coll = lastResult.ngram.collocations;
      if (!coll.length) { showToast('কোনো সহাবস্থান পাওয়া যায়নি', true); return; }
      rows = [['Rank', 'Bigram', 'Count', 'PMI']];
      coll.forEach((c, idx) => rows.push([idx + 1, c.bigram, c.count, c.pmi]));
      filename = 'collocations.csv';
    }
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV ডাউনলোড শুরু হয়েছে');
  });

  function doAnalyze() {
    const text = inputEl.value;
    if (!text.trim()) {
      el.querySelector('#freq-summary').style.display = 'none';
      el.querySelector('#freq-chart').innerHTML = '';
      return;
    }
    lastResult = analyzeFrequency(text, {
      includeStopWords: showStopWords,
      langFilter,
      nGramSize: 2,
      collocations: true,
      topK: 50
    });
    renderResults();
  }

  function renderResults() {
    if (!lastResult) return;
    const r = lastResult;
    const lex = r.summary.lexicalDiversity;
    const read = r.summary.readability;

    // Summary with extra stats
    const sumEl = el.querySelector('#freq-summary');
    sumEl.style.display = 'flex';
    sumEl.innerHTML = `
      <div class="freq-summary-stat"><span class="freq-summary-label">মোট শব্দ</span><span class="freq-summary-val">${r.summary.totalWords}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">অনন্য শব্দ</span><span class="freq-summary-val">${r.summary.uniqueWords}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">মোট অক্ষর</span><span class="freq-summary-val">${r.summary.totalChars}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">অনন্য অক্ষর</span><span class="freq-summary-val">${r.summary.uniqueChars}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">TTR (Type/Token)</span><span class="freq-summary-val">${lex.typeTokenRatio}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">গড় শব্দ দৈর্ঘ্য</span><span class="freq-summary-val">${read.avgWordLength}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">গড় বাক্য দৈর্ঘ্য</span><span class="freq-summary-val">${read.avgSentenceLength}</span></div>
      <div class="freq-summary-stat"><span class="freq-summary-label">Zipf fit</span><span class="freq-summary-val">${r.summary.zipfScore !== null ? r.summary.zipfScore + '%' : '—'}</span></div>
    `;

    let data, colorFn, isCollocation = false;
    if (activeTab === 'words') {
      data = r.wordFreq;
      colorFn = (_, i) => `hsl(${220 + i * 3}, 70%, 60%)`;
    } else if (activeTab === 'chars') {
      data = r.charFreq;
      colorFn = (e) => {
        const code = e.item.codePointAt(0);
        return (code >= 0x0980 && code <= 0x09FF) ? '#34d399' : '#4f8ef7';
      };
    } else if (activeTab === 'bigrams') {
      data = r.ngram.freq;
      colorFn = (_, i) => `hsl(${280 + i * 4}, 65%, 60%)`;
    } else { // collocations
      const coll = r.ngram.collocations;
      if (!coll.length) {
        el.querySelector('#freq-chart').innerHTML = '<p style="color:var(--text3);padding:20px;">কোনো সহাবস্থান (PMI) পাওয়া যায়নি।</p>';
        return;
      }
      isCollocation = true;
      // Render collocations
      const chartEl = el.querySelector('#freq-chart');
      chartEl.innerHTML = `
        <p style="font-size:11px;font-weight:500;color:var(--text3);margin-bottom:8px;">শক্তিশালী সহাবস্থান (PMI স্কোর অনুযায়ী) — ক্লিক করলে কপি হবে</p>
        <div id="freq-bars"></div>
      `;
      const barsEl = chartEl.querySelector('#freq-bars');
      barsEl.innerHTML = coll.map((c, idx) => `
        <div class="freq-bar-row" data-copy="${c.bigram.replace(/"/g, '&quot;')}">
          <span class="freq-bar-rank">${idx + 1}</span>
          <span class="freq-bar-item">${c.bigram}</span>
          <div class="freq-bar-track"><div class="freq-bar-fill" style="width:${Math.min(100, (c.pmi / 10) * 100)}%;background:#a855f7;"></div></div>
          <span class="freq-bar-count">${c.count}x</span>
          <span class="freq-bar-pct">PMI ${c.pmi}</span>
        </div>
      `).join('');
      attachCopyToRows(barsEl);
      return;
    }

    const top = data.slice(0, 20);
    if (!top.length) {
      el.querySelector('#freq-chart').innerHTML = '<p style="color:var(--text3);padding:20px;">কোনো তথ্য নেই</p>';
      return;
    }
    const maxCount = top[0]?.count || 1;
    const chartEl = el.querySelector('#freq-chart');
    chartEl.innerHTML = `
      <p style="font-size:11px;font-weight:500;color:var(--text3);margin-bottom:8px;">শীর্ষ ${top.length} — ক্লিক করলে কপি হবে</p>
      <div id="freq-bars"></div>
    `;
    const barsEl = chartEl.querySelector('#freq-bars');
    barsEl.innerHTML = top.map((e, i) => `
      <div class="freq-bar-row" data-copy="${e.item.replace(/"/g, '&quot;')}">
        <span class="freq-bar-rank">${e.rank}</span>
        <span class="freq-bar-item">${e.item}</span>
        <div class="freq-bar-track"><div class="freq-bar-fill" style="width:${(e.count / maxCount) * 100}%;background:${colorFn(e, i)};"></div></div>
        <span class="freq-bar-count">${e.count}x</span>
        <span class="freq-bar-pct">${e.pct}%</span>
      </div>
    `).join('');
    attachCopyToRows(barsEl);
  }

  function attachCopyToRows(containerEl) {
    const rows = containerEl.querySelectorAll('.freq-bar-row');
    rows.forEach(row => {
      row.removeEventListener('click', copyHandler);
      row.addEventListener('click', copyHandler);
    });
  }
  function copyHandler(e) {
    const row = e.currentTarget;
    let text = row.getAttribute('data-copy');
    if (!text) text = row.querySelector('.freq-bar-item')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text).then(() => showToast(`"${text}" কপি হয়েছে`))
        .catch(() => showToast('কপি করতে ব্যর্থ', true));
    }
  }

  // initial empty state
  doAnalyze();
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Sentence Counter
// ═══════════════════════════════════════════════════════════════════

function renderSentenceCounter(container) {
  let showDetail = false;

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🧮</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Sentence Counter & Analyzer</p>
        <p class="tool-header-desc">বাক্য গণনা, ধরন, দৈর্ঘ্য বিতরণ ও পাঠযোগ্যতা বিশ্লেষণ</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="sent-samples"></div>
      <textarea id="sent-input" placeholder="বাংলা বা English text এখানে paste করো…" style="min-height:140px;"></textarea>
      <div id="sent-result" style="margin-top:16px;display:none;"></div>
    </div>
  `;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    .sent-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:14px; }
    .sent-stat { background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);
      padding:10px 14px; }
    .sent-stat-label { font-size:10.5px;color:var(--text3);font-weight:500;text-transform:uppercase;
      letter-spacing:.05em;margin-bottom:5px; }
    .sent-stat-val { font-size:20px;font-weight:600;font-family:var(--font-mono);color:var(--text); }
    .sent-stat-sub { font-size:11px;color:var(--text3);margin-top:2px; }
    .sent-type-row { display:flex;align-items:center;gap:10px;padding:6px 0;
      border-bottom:1px solid var(--border); }
    .sent-type-label { font-size:13px;color:var(--text2);min-width:100px; }
    .sent-type-bar { flex:1;background:var(--bg3);border-radius:20px;height:7px;overflow:hidden; }
    .sent-type-fill { height:100%;border-radius:20px;transition:width 0.4s; }
    .sent-type-count { font-size:12px;font-family:var(--font-mono);color:var(--text2);
      width:32px;text-align:right; }
    .readability-badge { display:inline-flex;align-items:center;gap:8px;padding:10px 16px;
      border-radius:var(--radius);font-size:13px;font-weight:500;border:1px solid; }
    .sent-detail-row { padding:8px 10px;border-radius:var(--radius-sm);margin-bottom:5px;
      border-left:3px solid var(--border);background:var(--bg3);font-size:13px;
      color:var(--text2);line-height:1.6;cursor:pointer;transition:border-color var(--trans); }
    .sent-detail-row:hover { border-left-color:var(--accent); }
    .sent-detail-type { font-size:10.5px;padding:2px 8px;border-radius:20px;
      background:var(--surface2);margin-left:6px; }
    .dist-row { display:flex;align-items:center;gap:10px;padding:5px 0; }
    .dist-label { font-size:12.5px;color:var(--text2);min-width:90px; }
    .dist-bar-track { flex:1;background:var(--bg3);border-radius:20px;height:8px;overflow:hidden; }
    .dist-bar-fill { height:100%;background:var(--accent);border-radius:20px;transition:width 0.4s; }
    .dist-count { font-size:12px;font-family:var(--font-mono);color:var(--text3);width:32px;text-align:right; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#sent-samples');
  sentSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doAnalyze(); });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#sent-input');
  inputEl.addEventListener('input', doAnalyze);

  const TYPE_COLORS = {
    'সরল': '#34d399', 'যৌগিক': '#4f8ef7', 'জটিল': '#a78bfa',
    'প্রশ্নবোধক': '#fbbf24', 'বিস্ময়বোধক': '#f87171',
  };

  const READABILITY_COLORS = {
    green: { bg: 'var(--green-dim)', border: '#34d39960', text: 'var(--green)' },
    teal: { bg: 'rgba(20,184,166,.12)', border: 'rgba(20,184,166,.4)', text: '#14b8a6' },
    amber: { bg: 'var(--amber-dim)', border: '#fbbf2460', text: 'var(--amber)' },
    orange: { bg: 'rgba(251,146,60,.12)', border: 'rgba(251,146,60,.4)', text: '#fb923c' },
    red: { bg: 'var(--red-dim)', border: '#f8717160', text: 'var(--red)' },
  };

  function doAnalyze() {
    const text = inputEl.value;
    const resultEl = el.querySelector('#sent-result');
    if (!text.trim()) { resultEl.style.display = 'none'; return; }

    const r = analyzeSentences(text);
    if (!r) { resultEl.style.display = 'none'; return; }
    resultEl.style.display = 'block';

    const rc = READABILITY_COLORS[r.readability.color] || READABILITY_COLORS.amber;
    const typeMax = Math.max(...Object.values(r.typeCounts), 1);
    const distMax = Math.max(...Object.values(r.distribution).map(d => d.count), 1);
    const totalSents = r.totalSentences;

    resultEl.innerHTML = `
      <!-- Stats grid -->
      <div class="sent-grid">
        ${[
        ['মোট বাক্য', r.totalSentences, ''],
        ['মোট শব্দ', r.totalWords, ''],
        ['গড় দৈর্ঘ্য', r.avgWords, 'শব্দ/বাক্য'],
        ['মোট clause', r.totalClauses, ''],
        ['গড় clause', r.avgClauses, 'প্রতি বাক্য'],
        ['অনুচ্ছেদ', r.paragraphs.count, ''],
      ].map(([label, val, sub]) => `
          <div class="sent-stat">
            <p class="sent-stat-label">${label}</p>
            <p class="sent-stat-val">${val}</p>
            ${sub ? `<p class="sent-stat-sub">${sub}</p>` : ''}
          </div>
        `).join('')}
      </div>
 
      <!-- Readability -->
      <div style="margin-bottom:14px;">
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">পাঠযোগ্যতা</p>
        <div class="readability-badge" style="background:${rc.bg};border-color:${rc.border};color:${rc.text};">
          <span style="font-size:18px;">${{ green: '🟢', teal: '🟢', amber: '🟡', orange: '🟠', red: '🔴' }[r.readability.color]
      }</span>
          <div>
            <p style="font-weight:600;">${r.readability.label}</p>
            <p style="font-size:11.5px;opacity:.8;">${r.readability.grade} · গড় ${r.avgWords} শব্দ/বাক্য</p>
          </div>
        </div>
      </div>
 
      <!-- Sentence types -->
      <div style="margin-bottom:16px;">
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">বাক্যের ধরন</p>
        ${Object.entries(r.typeCounts).map(([type, count]) => count > 0 ? `
          <div class="sent-type-row">
            <span class="sent-type-label">${type}</span>
            <div class="sent-type-bar">
              <div class="sent-type-fill" style="width:${(count / typeMax) * 100}%;background:${TYPE_COLORS[type] || 'var(--accent)'};"></div>
            </div>
            <span class="sent-type-count">${count}</span>
          </div>` : '').join('')}
      </div>
 
      <!-- Length distribution -->
      <div style="margin-bottom:16px;">
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">দৈর্ঘ্য বিতরণ</p>
        ${Object.entries(r.distribution).map(([label, d]) => `
          <div class="dist-row">
            <span class="dist-label">${label}</span>
            <div class="dist-bar-track">
              <div class="dist-bar-fill" style="width:${(d.count / distMax) * 100}%;"></div>
            </div>
            <span class="dist-count">${d.count}</span>
          </div>`).join('')}
      </div>
 
      <!-- Longest / shortest -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${[
        ['📏 সবচেয়ে দীর্ঘ বাক্য', r.longest, '#4f8ef750'],
        ['📌 সবচেয়ে ছোট বাক্য', r.shortest, '#34d39950'],
      ].map(([title, sent, color]) => `
          <div style="background:var(--bg3);border:1px solid ${color};border-radius:var(--radius);padding:12px 14px;">
            <p style="font-size:10.5px;color:var(--text3);margin-bottom:6px;">${title} (${sent?.words || 0} শব্দ)</p>
            <p style="font-size:12.5px;color:var(--text2);line-height:1.6;font-family:var(--font-bangla);">
              ${(sent?.text || '').slice(0, 120)}${(sent?.text?.length || 0) > 120 ? '…' : ''}
            </p>
          </div>`).join('')}
      </div>
 
      <!-- Per-sentence detail toggle -->
      <button class="btn btn-ghost btn-sm" id="sent-toggle-detail">
        বিস্তারিত বাক্য তালিকা দেখো (${r.totalSentences}টি) ↓
      </button>
      <div id="sent-detail-list" style="display:none;margin-top:10px;max-height:320px;overflow-y:auto;"></div>
    `;

    // Detail toggle
    const detailList = resultEl.querySelector('#sent-detail-list');
    resultEl.querySelector('#sent-toggle-detail').addEventListener('click', function () {
      showDetail = !showDetail;
      if (showDetail) {
        detailList.style.display = 'block';
        this.textContent = 'বিস্তারিত লুকাও ↑';
        detailList.innerHTML = r.sentences.map((s, i) => `
          <div class="sent-detail-row">
            <span style="font-size:10.5px;color:var(--text3);font-family:var(--font-mono);">#${i + 1}</span>
            <span class="sent-detail-type" style="color:${TYPE_COLORS[s.sentenceType] || 'var(--text3)'}">
              ${s.sentenceType}
            </span>
            <span style="font-size:10.5px;color:var(--text3);"> · ${s.words} শব্দ</span>
            <p style="margin-top:4px;font-family:var(--font-bangla);color:var(--text);">${s.text}</p>
          </div>
        `).join('');
      } else {
        detailList.style.display = 'none';
        this.textContent = `বিস্তারিত বাক্য তালিকা দেখো (${r.totalSentences}টি) ↓`;
      }
    });
  }
}

function renderTextCleaner(container) {
  let selectedOps = new Set(PRESETS.standard.ops);
  let activePreset = 'standard';

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🧹</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Text Cleaner</p>
        <p class="tool-header-desc">Invisible chars, extra space, HTML, emoji — প্রতিটি operation আলাদাভাবে চালু/বন্ধ করো</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="clean-samples"></div>
 
      <!-- Presets -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" id="clean-presets"></div>
 
      <!-- Ops checkboxes by category -->
      <div id="clean-ops-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px;margin-bottom:14px;"></div>
 
      <!-- IO -->
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input <span class="io-label-tag tag-bijoy">dirty</span></span>
          <textarea id="clean-input" placeholder="পরিষ্কার করতে হবে এমন text এখানে paste করো…"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output <span class="io-label-tag tag-unicode">clean</span></span>
          <textarea id="clean-output" readonly placeholder="পরিষ্কার text এখানে দেখাবে…"></textarea>
        </div>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="clean-run">🧹 Clean করো</button>
        <button class="btn btn-ghost"   id="clean-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="clean-clear">✕ Clear</button>
      </div>
 
      <div id="clean-changes" style="margin-top:12px;display:none;"></div>
    </div>
  `;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    .clean-preset-btn { padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);
      background:var(--surface2);color:var(--text2);font-size:12.5px;cursor:pointer;
      font-family:var(--font-ui);transition:all var(--trans);display:flex;gap:5px;align-items:center; }
    .clean-preset-btn.active { background:var(--accent-dim);border-color:var(--accent);color:var(--accent2);font-weight:500; }
    .clean-preset-btn:hover:not(.active) { border-color:var(--border2);color:var(--text); }
    .clean-op-check { display:flex;align-items:flex-start;gap:8px;padding:8px 10px;
      border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;
      transition:border-color var(--trans);background:var(--bg3); }
    .clean-op-check:hover { border-color:var(--border2); }
    .clean-op-check.checked { border-color:var(--accent);background:var(--accent-dim); }
    .clean-op-check input { accent-color:var(--accent);margin-top:2px;flex-shrink:0; }
    .clean-op-label { font-size:12.5px;color:var(--text);line-height:1.3; }
    .clean-op-desc  { font-size:11px;color:var(--text3);margin-top:1px; }
    .clean-change-row { display:flex;align-items:center;gap:8px;padding:5px 10px;
      border-radius:var(--radius-sm);background:var(--green-dim);border:1px solid #34d39930;
      font-size:12.5px;color:var(--text2);margin-bottom:4px; }
    .clean-diff-badge { font-family:var(--font-mono);font-size:11px;padding:2px 8px;
      border-radius:20px;background:var(--green-dim);color:var(--green);margin-left:auto; }
    .cat-section-label { font-size:10.5px;font-weight:500;color:var(--text3);text-transform:uppercase;
      letter-spacing:.06em;grid-column:1/-1;margin-top:8px;margin-bottom:2px; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#clean-samples');
  cleanSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doClean(); });
    samplesEl.appendChild(chip);
  });

  // Preset buttons
  const presetsEl = el.querySelector('#clean-presets');
  Object.entries(PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'clean-preset-btn' + (key === activePreset ? ' active' : '');
    btn.innerHTML = `${preset.icon} ${preset.label}`;
    btn.title = preset.desc;
    btn.addEventListener('click', () => {
      activePreset = key;
      selectedOps = new Set(preset.ops);
      presetsEl.querySelectorAll('.clean-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderOps();
      doClean();
    });
    presetsEl.appendChild(btn);
  });

  // Op checkboxes
  const opsGrid = el.querySelector('#clean-ops-grid');
  const CAT_LABELS = {
    invisible: '👻 Invisible',
    whitespace: '⎵ Whitespace',
    punctuation: '✏️ Punctuation',
    content: '📝 Content',
    normalize: '🔧 Normalize',
  };

  function renderOps() {
    opsGrid.innerHTML = '';
    const byCategory = {};
    Object.entries(CLEANERS).forEach(([key, cleaner]) => {
      if (!byCategory[cleaner.category]) byCategory[cleaner.category] = [];
      byCategory[cleaner.category].push([key, cleaner]);
    });

    Object.entries(byCategory).forEach(([cat, ops]) => {
      const label = document.createElement('div');
      label.className = 'cat-section-label';
      label.textContent = CAT_LABELS[cat] || cat;
      opsGrid.appendChild(label);

      ops.forEach(([key, cleaner]) => {
        const row = document.createElement('div');
        const checked = selectedOps.has(key);
        row.className = 'clean-op-check' + (checked ? ' checked' : '');
        row.innerHTML = `
          <input type="checkbox" id="op-${key}" ${checked ? 'checked' : ''}>
          <div>
            <p class="clean-op-label">${cleaner.label}</p>
            <p class="clean-op-desc">${cleaner.desc}</p>
          </div>
        `;
        row.addEventListener('click', (e) => {
          if (e.target.tagName === 'INPUT') return;
          const cb = row.querySelector('input');
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        });
        row.querySelector('input').addEventListener('change', e => {
          if (e.target.checked) { selectedOps.add(key); row.classList.add('checked'); }
          else { selectedOps.delete(key); row.classList.remove('checked'); }
          activePreset = null;
          presetsEl.querySelectorAll('.clean-preset-btn').forEach(b => b.classList.remove('active'));
          doClean();
        });
        opsGrid.appendChild(row);
      });
    });
  }

  renderOps();

  const inputEl = el.querySelector('#clean-input');
  const outputEl = el.querySelector('#clean-output');
  inputEl.addEventListener('input', doClean);
  el.querySelector('#clean-run').addEventListener('click', doClean);
  el.querySelector('#clean-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#clean-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    el.querySelector('#clean-changes').style.display = 'none';
  });

  function doClean() {
    const text = inputEl.value;
    if (!text.trim()) { outputEl.value = ''; return; }

    const { result, changes } = cleanText(text, [...selectedOps]);
    outputEl.value = result;

    const changesEl = el.querySelector('#clean-changes');
    if (changes.length > 0) {
      changesEl.style.display = 'block';
      const stats = getDiffStats(text, result);
      changesEl.innerHTML = `
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">
          পরিবর্তন (${changes.length} টি operation কাজ করেছে · ${stats.charsRemoved} chars বাদ · ${stats.pctReduction}% ছোট)
        </p>
        ${changes.map(c => `
          <div class="clean-change-row">
            <span>✓</span>
            <span>${c.label}</span>
            <span class="clean-diff-badge">-${c.diff} chars</span>
          </div>`).join('')}
      `;
    } else {
      changesEl.style.display = changes.length > 0 ? 'block' : 'none';
    }
  }
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Duplicate Remover
// ═══════════════════════════════════════════════════════════════════

function renderDuplicateRemover(container) {
  let activeMode = 'lines';
  let caseSensitive = false;
  let ignoreWhitespace = true;
  let sortMode = 'original';
  let fuzzyThreshold = 85;

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">✂️</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Duplicate Remover</p>
        <p class="tool-header-desc">Line, শব্দ, অনুচ্ছেদ — exact বা fuzzy matching এ duplicate সরাও</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="dup-samples"></div>
 
      <!-- Mode selector -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px;" id="dup-modes"></div>
 
      <!-- Options -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:14px;
        padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);">
        <label class="dup-opt-label"><input type="checkbox" id="dup-case"> Case sensitive</label>
        <label class="dup-opt-label"><input type="checkbox" id="dup-ws" checked> Whitespace ignore</label>
        <div id="dup-sort-wrap" style="display:flex;gap:6px;align-items:center;margin-left:auto;">
          <span style="font-size:12px;color:var(--text3);">Sort:</span>
          ${['original', 'alpha', 'freq'].map(s => `
            <button class="dup-sort-btn${s === 'original' ? ' active' : ''}" data-sort="${s}">
              ${s === 'original' ? 'মূল ক্রম' : s === 'alpha' ? 'A-Z' : 'সংখ্যা'}
            </button>`).join('')}
        </div>
      </div>
 
      <!-- Fuzzy threshold (hidden by default) -->
      <div id="dup-fuzzy-wrap" style="display:none;margin-bottom:14px;
        padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);">
        <label style="font-size:12.5px;color:var(--text2);display:flex;align-items:center;gap:10px;">
          মিলের মাত্রা:
          <input type="range" id="dup-threshold" min="50" max="99" value="85" style="flex:1;accent-color:var(--accent);">
          <span id="dup-threshold-val" style="font-family:var(--font-mono);color:var(--accent2);min-width:36px;">85%</span>
        </label>
        <p style="font-size:11px;color:var(--text3);margin-top:4px;">এর বেশি মিল থাকলে duplicate হিসেবে গণ্য হবে</p>
      </div>
 
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input</span>
          <textarea id="dup-input" placeholder="এখানে text paste করো…"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output <span id="dup-stats-badge" class="io-label-tag tag-unicode"></span></span>
          <textarea id="dup-output" readonly placeholder="Duplicate সরানো text এখানে দেখাবে…"></textarea>
        </div>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="dup-run">✂️ Remove করো</button>
        <button class="btn btn-ghost"   id="dup-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="dup-clear">✕ Clear</button>
      </div>
 
      <div id="dup-result-info" style="margin-top:10px;display:none;"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .dup-mode-btn { padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius);
      background:var(--bg3);color:var(--text2);cursor:pointer;font-family:var(--font-ui);
      font-size:13px;text-align:left;transition:all var(--trans); }
    .dup-mode-btn.active { border-color:var(--accent);background:var(--accent-dim);color:var(--accent2); }
    .dup-mode-btn:hover:not(.active) { border-color:var(--border2); }
    .dup-mode-icon { font-size:16px; }
    .dup-opt-label { display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text2);cursor:pointer; }
    .dup-opt-label input { accent-color:var(--accent);width:14px;height:14px; }
    .dup-sort-btn { padding:4px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);
      background:transparent;color:var(--text3);font-size:11.5px;cursor:pointer;font-family:var(--font-ui);
      transition:all var(--trans); }
    .dup-sort-btn.active { background:var(--accent-dim);border-color:var(--accent);color:var(--accent2); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#dup-samples');
  dupSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doRemove(); });
    samplesEl.appendChild(chip);
  });

  // Mode buttons
  const modesEl = el.querySelector('#dup-modes');
  Object.entries(dupModes).forEach(([key, mode]) => {
    const btn = document.createElement('button');
    btn.className = 'dup-mode-btn' + (key === activeMode ? ' active' : '');
    btn.innerHTML = `<span class="dup-mode-icon">${mode.icon}</span> <strong>${mode.label}</strong><br>
      <span style="font-size:11px;color:var(--text3);">${mode.desc}</span>`;
    btn.addEventListener('click', () => {
      activeMode = key;
      modesEl.querySelectorAll('.dup-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector('#dup-fuzzy-wrap').style.display = key === 'fuzzy' ? 'block' : 'none';
      el.querySelector('#dup-sort-wrap').style.display = key === 'lines' ? 'flex' : 'none';
      doRemove();
    });
    modesEl.appendChild(btn);
  });

  // Options
  el.querySelector('#dup-case').addEventListener('change', e => { caseSensitive = e.target.checked; doRemove(); });
  el.querySelector('#dup-ws').addEventListener('change', e => { ignoreWhitespace = e.target.checked; doRemove(); });
  el.querySelector('#dup-threshold').addEventListener('input', e => {
    fuzzyThreshold = parseInt(e.target.value);
    el.querySelector('#dup-threshold-val').textContent = fuzzyThreshold + '%';
    doRemove();
  });
  el.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      sortMode = btn.dataset.sort;
      el.querySelectorAll('[data-sort]').forEach(b => b.classList.toggle('active', b.dataset.sort === sortMode));
      doRemove();
    });
  });

  const inputEl = el.querySelector('#dup-input');
  const outputEl = el.querySelector('#dup-output');
  inputEl.addEventListener('input', doRemove);
  el.querySelector('#dup-run').addEventListener('click', doRemove);
  el.querySelector('#dup-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#dup-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    el.querySelector('#dup-result-info').style.display = 'none';
    el.querySelector('#dup-stats-badge').textContent = '';
  });

  function doRemove() {
    const text = inputEl.value;
    if (!text.trim()) { outputEl.value = ''; return; }

    let result, stats;
    if (activeMode === 'lines') {
      ({ result, stats } = removeDuplicateLines(text, { caseSensitive, ignoreWhitespace, sortMode }));
    } else if (activeMode === 'words') {
      ({ result, stats } = removeDuplicateWords(text, { caseSensitive }));
    } else if (activeMode === 'paragraphs') {
      ({ result, stats } = removeDuplicateParagraphs(text, { caseSensitive }));
    } else {
      ({ result, stats } = removeFuzzyDuplicates(text, fuzzyThreshold / 100));
    }

    outputEl.value = result;
    el.querySelector('#dup-stats-badge').textContent =
      stats.removed > 0 ? `-${stats.removed} duplicate` : 'no duplicates';

    const infoEl = el.querySelector('#dup-result-info');
    if (stats.removed > 0) {
      infoEl.style.display = 'block';
      infoEl.innerHTML = `
        <div style="display:flex;gap:16px;padding:10px 14px;background:var(--green-dim);
          border:1px solid #34d39930;border-radius:var(--radius);font-size:13px;flex-wrap:wrap;">
          <span>মোট: <strong>${stats.total || '—'}</strong></span>
          <span>অনন্য: <strong>${stats.unique || (stats.total - stats.removed)}</strong></span>
          <span style="color:var(--green);">সরানো: <strong>-${stats.removed}</strong></span>
          ${stats.topDuplicates?.length ? `<span style="color:var(--text3);">সবচেয়ে বেশি duplicate: "${stats.topDuplicates[0].key.slice(0, 30)}" (${stats.topDuplicates[0].count}x)</span>` : ''}
        </div>
      `;
    } else {
      infoEl.style.display = 'none';
    }
  }
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Case Converter
// ═══════════════════════════════════════════════════════════════════

function renderCaseConverter(container) {
  let lastInput = '';

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">📐</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Case Converter</p>
        <p class="tool-header-desc">UPPERCASE · lowercase · Title · camelCase · snake_case · এবং আরো</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="case-samples"></div>
      <textarea id="case-input" placeholder="এখানে text লিখুন বা paste করুন…" style="min-height:120px;"></textarea>
 
      <div id="case-results" style="margin-top:14px;"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .case-group-label { font-size:10.5px;font-weight:500;color:var(--text3);text-transform:uppercase;
      letter-spacing:.06em;margin:12px 0 6px; }
    .case-result-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px; }
    .case-result-card { background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);
      padding:10px 14px;cursor:pointer;transition:border-color var(--trans); }
    .case-result-card:hover { border-color:var(--accent); }
    .case-result-card:active { border-color:var(--accent);background:var(--accent-dim); }
    .case-result-label { font-size:10.5px;color:var(--text3);font-weight:500;text-transform:uppercase;
      letter-spacing:.05em;margin-bottom:5px; }
    .case-result-val { font-size:13.5px;color:var(--text);font-family:var(--font-mono);
      word-break:break-all;line-height:1.5; }
    .case-result-bangla { font-family:var(--font-bangla);font-size:15px; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#case-samples');
  caseSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doConvert(); });
    samplesEl.appendChild(chip);
  });

  const inputEl = el.querySelector('#case-input');
  const resultsEl = el.querySelector('#case-results');
  inputEl.addEventListener('input', doConvert);

  function doConvert() {
    const text = inputEl.value;
    lastInput = text;
    if (!text.trim()) { resultsEl.innerHTML = ''; return; }

    const GROUP_ORDER = ['english', 'code', 'bangla', 'fun'];
    const GROUP_COLORS = { english: 'blue', code: 'purple', bangla: 'green', fun: 'amber' };

    resultsEl.innerHTML = GROUP_ORDER.map(groupKey => {
      const group = GROUPS[groupKey];
      const converters = Object.entries(CONVERTERS).filter(([, c]) => c.group === groupKey);
      if (!converters.length) return '';

      const cards = converters.map(([key, conv]) => {
        const result = convertCase(text, key);
        const isBangla = groupKey === 'bangla';
        return `
          <div class="case-result-card" onclick="navigator.clipboard.writeText(${JSON.stringify(result)}).then(()=>showToast('Copied: ${conv.label}'))">
            <p class="case-result-label">${conv.icon} ${conv.label}</p>
            <p class="case-result-val ${isBangla ? 'case-result-bangla' : ''}">${result || '—'}</p>
          </div>
        `;
      }).join('');

      return `
        <p class="case-group-label">${group.label}</p>
        <div class="case-result-grid">${cards}</div>
      `;
    }).join('');
  }
}

function renderTextReverser(container) {
  let activeMode = 'words';

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">↩️</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Text Reverser</p>
        <p class="tool-header-desc">অক্ষর · শব্দ · লাইন · বাক্য — যেকোনো level এ উল্টো করো</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="rev-samples"></div>
 
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:8px;margin-bottom:14px;" id="rev-modes"></div>
 
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input</span>
          <textarea id="rev-input" placeholder="এখানে text লিখুন বা paste করুন…"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output <span id="rev-palindrome-badge" style="display:none;" class="io-label-tag tag-avro">🔄 Palindrome!</span></span>
          <textarea id="rev-output" readonly placeholder="উল্টো text এখানে দেখাবে…"></textarea>
        </div>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="rev-run">↩️ Reverse করো</button>
        <button class="btn btn-ghost"   id="rev-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="rev-swap">⇄ Swap</button>
        <button class="btn btn-ghost"   id="rev-clear">✕ Clear</button>
        <span id="rev-stats" style="font-size:12px;color:var(--text3);margin-left:auto;font-family:var(--font-mono);"></span>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .rev-mode-btn { padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);
      background:var(--bg3);color:var(--text2);cursor:pointer;font-family:var(--font-ui);
      font-size:12.5px;text-align:left;transition:all var(--trans);display:flex;gap:7px;align-items:flex-start; }
    .rev-mode-btn.active { border-color:var(--accent);background:var(--accent-dim);color:var(--accent2); }
    .rev-mode-btn:hover:not(.active) { border-color:var(--border2);color:var(--text); }
    .rev-mode-icon { font-size:15px;flex-shrink:0;margin-top:1px; }
    .rev-mode-text strong { display:block;font-size:13px;margin-bottom:2px; }
    .rev-mode-text span { font-size:11px;color:var(--text3);line-height:1.4; }
    .rev-mode-btn.active .rev-mode-text span { color:var(--accent2);opacity:.8; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#rev-samples');
  revSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doReverse(); });
    samplesEl.appendChild(chip);
  });

  // Mode buttons
  const modesEl = el.querySelector('#rev-modes');
  Object.entries(reverseModes).forEach(([key, mode]) => {
    const btn = document.createElement('button');
    btn.className = 'rev-mode-btn' + (key === activeMode ? ' active' : '');
    btn.innerHTML = `
      <span class="rev-mode-icon">${mode.icon}</span>
      <div class="rev-mode-text">
        <strong>${mode.label}</strong>
        <span>${mode.desc}</span>
      </div>`;
    btn.addEventListener('click', () => {
      activeMode = key;
      modesEl.querySelectorAll('.rev-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      doReverse();
    });
    modesEl.appendChild(btn);
  });

  const inputEl = el.querySelector('#rev-input');
  const outputEl = el.querySelector('#rev-output');

  inputEl.addEventListener('input', doReverse);
  el.querySelector('#rev-run').addEventListener('click', doReverse);
  el.querySelector('#rev-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#rev-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    el.querySelector('#rev-stats').textContent = '';
    el.querySelector('#rev-palindrome-badge').style.display = 'none';
  });
  el.querySelector('#rev-swap').addEventListener('click', () => {
    const tmp = inputEl.value;
    inputEl.value = outputEl.value;
    outputEl.value = tmp;
    doReverse();
  });

  function doReverse() {
    const text = inputEl.value;
    if (!text.trim()) { outputEl.value = ''; return; }
    const result = reverseText(text, activeMode);
    outputEl.value = result;
    const stats = revStats(text, result);
    el.querySelector('#rev-stats').textContent =
      `${stats.words} শব্দ · ${stats.lines} লাইন`;
    const badge = el.querySelector('#rev-palindrome-badge');
    badge.style.display = stats.isPalindrome ? 'inline-block' : 'none';
  }
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Line Sorter
// ═══════════════════════════════════════════════════════════════════

function renderLineSorter(container) {
  let activeMode = 'alpha';
  let isReverse = false;
  let removeBlank = false;
  let doTrim = false;
  let removeDupes = false;

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔀</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Line Sorter</p>
        <p class="tool-header-desc">বর্ণানুক্রম · দৈর্ঘ্য · সংখ্যা · random — Bangla collation সহ</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="sort-samples"></div>
 
      <!-- Sort mode grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:7px;margin-bottom:12px;" id="sort-modes"></div>
 
      <!-- Options bar -->
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;padding:10px 14px;
        background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:14px;">
        <label class="sort-opt"><input type="checkbox" id="sort-reverse"> উল্টো ক্রম (Z→A)</label>
        <label class="sort-opt"><input type="checkbox" id="sort-blank">  Blank line সরাও</label>
        <label class="sort-opt"><input type="checkbox" id="sort-trim">   Trim করো</label>
        <label class="sort-opt"><input type="checkbox" id="sort-dupes">  Duplicate সরাও</label>
      </div>
 
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input</span>
          <textarea id="sort-input" placeholder="প্রতিটি লাইনে একটি item লিখুন বা paste করুন…" style="min-height:200px;"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output <span id="sort-badge" class="io-label-tag tag-unicode"></span></span>
          <textarea id="sort-output" readonly placeholder="Sort করা লাইন এখানে দেখাবে…" style="min-height:200px;"></textarea>
        </div>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="sort-run">🔀 Sort করো</button>
        <button class="btn btn-ghost"   id="sort-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="sort-clear">✕ Clear</button>
        <span id="sort-stats" style="font-size:12px;color:var(--text3);margin-left:auto;font-family:var(--font-mono);"></span>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .sort-mode-btn { padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);
      background:var(--bg3);color:var(--text2);cursor:pointer;font-family:var(--font-ui);
      font-size:12.5px;transition:all var(--trans);display:flex;flex-direction:column;gap:2px; }
    .sort-mode-btn.active { border-color:var(--accent);background:var(--accent-dim);color:var(--accent2); }
    .sort-mode-btn:hover:not(.active) { border-color:var(--border2);color:var(--text); }
    .sort-mode-icon { font-size:16px;margin-bottom:2px; }
    .sort-mode-label { font-size:12.5px;font-weight:500; }
    .sort-mode-desc  { font-size:10.5px;color:var(--text3);line-height:1.3; }
    .sort-mode-btn.active .sort-mode-desc { color:var(--accent2);opacity:.7; }
    .sort-opt { display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text2);cursor:pointer; }
    .sort-opt input { accent-color:var(--accent);width:14px;height:14px; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#sort-samples');
  sortSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doSort(); });
    samplesEl.appendChild(chip);
  });

  // Sort mode buttons
  const modesEl = el.querySelector('#sort-modes');
  Object.entries(SORT_MODES).forEach(([key, mode]) => {
    const btn = document.createElement('button');
    btn.className = 'sort-mode-btn' + (key === activeMode ? ' active' : '');
    btn.innerHTML = `
      <span class="sort-mode-icon">${mode.icon}</span>
      <span class="sort-mode-label">${mode.label}</span>
      <span class="sort-mode-desc">${mode.desc}</span>`;
    btn.addEventListener('click', () => {
      activeMode = key;
      modesEl.querySelectorAll('.sort-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      doSort();
    });
    modesEl.appendChild(btn);
  });

  // Options
  el.querySelector('#sort-reverse').addEventListener('change', e => { isReverse = e.target.checked; doSort(); });
  el.querySelector('#sort-blank').addEventListener('change', e => { removeBlank = e.target.checked; doSort(); });
  el.querySelector('#sort-trim').addEventListener('change', e => { doTrim = e.target.checked; doSort(); });
  el.querySelector('#sort-dupes').addEventListener('change', e => { removeDupes = e.target.checked; doSort(); });

  const inputEl = el.querySelector('#sort-input');
  const outputEl = el.querySelector('#sort-output');

  inputEl.addEventListener('input', doSort);
  el.querySelector('#sort-run').addEventListener('click', doSort);
  el.querySelector('#sort-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#sort-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    el.querySelector('#sort-stats').textContent = '';
    el.querySelector('#sort-badge').textContent = '';
  });

  function doSort() {
    const text = inputEl.value;
    if (!text.trim()) { outputEl.value = ''; return; }
    const { result, stats } = sortLines(text, {
      mode: activeMode,
      reverse: isReverse,
      removeBlankLines: removeBlank,
      trimLines: doTrim,
      removeDuplicates: removeDupes,
    });
    outputEl.value = result;
    el.querySelector('#sort-stats').textContent =
      `${stats.total} → ${stats.sorted} লাইন`;
    el.querySelector('#sort-badge').textContent =
      stats.removed > 0 ? `-${stats.removed} সরানো` : `${stats.sorted} লাইন`;
  }
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Text Truncator
// ═══════════════════════════════════════════════════════════════════

function renderTextTruncator(container) {
  let mode = 'chars';
  let limit = 280;
  let suffix = '…';
  let smart = true;

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">✂️</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Text Truncator</p>
        <p class="tool-header-desc">অক্ষর · শব্দ · বাক্য · লাইন · byte — নির্দিষ্ট limit এ কাটো</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="trunc-samples"></div>
 
      <!-- Presets -->
      <div style="margin-bottom:12px;">
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;">Quick Presets</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="trunc-presets"></div>
      </div>
 
      <!-- Custom controls -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;
        padding:14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);">
        <div>
          <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">Mode</p>
          <select id="trunc-mode" style="width:100%;padding:7px 10px;background:var(--bg2);
            border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);
            font-family:var(--font-ui);font-size:13px;">
            <option value="chars">অক্ষর (Chars)</option>
            <option value="words">শব্দ (Words)</option>
            <option value="sentences">বাক্য (Sentences)</option>
            <option value="lines">লাইন (Lines)</option>
            <option value="bytes">Bytes (UTF-8)</option>
          </select>
        </div>
        <div>
          <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">Limit</p>
          <input type="number" id="trunc-limit" value="280" min="1"
            style="width:100%;padding:7px 10px;background:var(--bg2);border:1px solid var(--border);
            border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-mono);font-size:14px;">
        </div>
        <div>
          <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">Suffix</p>
          <input type="text" id="trunc-suffix" value="…"
            style="width:100%;padding:7px 10px;background:var(--bg2);border:1px solid var(--border);
            border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-ui);font-size:14px;">
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--text2);
        cursor:pointer;margin-bottom:14px;">
        <input type="checkbox" id="trunc-smart" checked style="accent-color:var(--accent);">
        Smart truncate — শব্দের মাঝখানে কাটবে না
      </label>
 
      <!-- Input + live info bar -->
      <div style="position:relative;">
        <textarea id="trunc-input" placeholder="এখানে text paste করুন…" style="min-height:150px;"></textarea>
        <div id="trunc-info-bar" style="position:absolute;bottom:8px;right:10px;
          font-size:11px;font-family:var(--font-mono);color:var(--text3);
          background:var(--bg2);padding:2px 8px;border-radius:var(--radius-sm);
          border:1px solid var(--border);pointer-events:none;"></div>
      </div>
 
      <!-- Output -->
      <div style="margin-top:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span class="io-label">Output <span id="trunc-status-badge" class="io-label-tag" style="display:none;"></span></span>
          <span id="trunc-output-count" style="font-size:11px;color:var(--text3);font-family:var(--font-mono);"></span>
        </div>
        <textarea id="trunc-output" readonly placeholder="Truncated text এখানে দেখাবে…" style="min-height:120px;"></textarea>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="trunc-run">✂️ Truncate করো</button>
        <button class="btn btn-ghost"   id="trunc-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="trunc-clear">✕ Clear</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .trunc-preset-btn { padding:5px 12px;border:1px solid var(--border);border-radius:20px;
      background:var(--surface2);color:var(--text2);font-size:12px;cursor:pointer;
      font-family:var(--font-ui);transition:all var(--trans);white-space:nowrap; }
    .trunc-preset-btn:hover { border-color:var(--border2);color:var(--text); }
    .trunc-preset-btn.active { border-color:var(--accent);background:var(--accent-dim);color:var(--accent2); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#trunc-samples');
  truncSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doTruncate(); });
    samplesEl.appendChild(chip);
  });

  // Preset buttons
  const presetsEl = el.querySelector('#trunc-presets');
  Object.entries(truncPresets).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'trunc-preset-btn';
    btn.innerHTML = `${preset.icon} ${preset.label}`;
    btn.addEventListener('click', () => {
      // Set controls
      modeEl.value = preset.mode;
      limitEl.value = preset.limit;
      suffixEl.value = preset.suffix;
      mode = preset.mode;
      limit = preset.limit;
      suffix = preset.suffix;
      presetsEl.querySelectorAll('.trunc-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      doTruncate();
    });
    presetsEl.appendChild(btn);
  });

  const inputEl = el.querySelector('#trunc-input');
  const outputEl = el.querySelector('#trunc-output');
  const modeEl = el.querySelector('#trunc-mode');
  const limitEl = el.querySelector('#trunc-limit');
  const suffixEl = el.querySelector('#trunc-suffix');

  modeEl.addEventListener('change', e => { mode = e.target.value; doTruncate(); });
  limitEl.addEventListener('input', e => { limit = parseInt(e.target.value) || 1; doTruncate(); });
  suffixEl.addEventListener('input', e => { suffix = e.target.value; doTruncate(); });
  el.querySelector('#trunc-smart').addEventListener('change', e => { smart = e.target.checked; doTruncate(); });
  inputEl.addEventListener('input', doTruncate);
  el.querySelector('#trunc-run').addEventListener('click', doTruncate);
  el.querySelector('#trunc-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#trunc-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    el.querySelector('#trunc-info-bar').textContent = '';
    el.querySelector('#trunc-output-count').textContent = '';
    el.querySelector('#trunc-status-badge').style.display = 'none';
  });

  function doTruncate() {
    const text = inputEl.value;
    if (!text.trim()) { outputEl.value = ''; return; }

    // Live info bar
    const info = getTextInfo(text);
    el.querySelector('#trunc-info-bar').textContent =
      `${info.graphemes}ch · ${info.words}w · ${info.sentences}s · ${info.bytes}B`;

    const result = truncateText(text, { mode, limit, suffix, smart });
    outputEl.value = result.result;

    // Output count
    const outInfo = getTextInfo(result.result);
    el.querySelector('#trunc-output-count').textContent =
      `${outInfo.graphemes} chars · ${outInfo.bytes} bytes`;

    // Status badge
    const badge = el.querySelector('#trunc-status-badge');
    if (result.truncated) {
      badge.style.display = 'inline-block';
      badge.className = 'io-label-tag tag-bijoy';
      badge.textContent = `✂️ ${result.removed || (info.graphemes - outInfo.graphemes)} ${mode} সরানো`;
    } else {
      badge.style.display = 'inline-block';
      badge.className = 'io-label-tag tag-unicode';
      badge.textContent = '✓ Limit এর মধ্যে';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// RENDER: Smart Templates & Snippets
// ═══════════════════════════════════════════════════════════════════

function renderSmartTemplates(container) {
  let currentCategory = 'bank';
  let currentTemplate = null;
  let currentPlaceholders = [];

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">📄</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Smart Templates & Snippets</p>
        <p class="tool-header-desc">এক-ক্লিকে বাংলা স্ট্যান্ডার্ড ফরম্যাট — ইমেইল, ব্যাংক চিঠি, নোটিশ, আমন্ত্রণপত্র</p>
      </div>
    </div>
    <div class="tool-body">
      <!-- Categories row -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;" id="st-categories"></div>

      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <div style="flex: 1.5; min-width:200px;">
          <p style="font-size:12px; font-weight:500; margin-bottom:6px;">টেমপ্লেট তালিকা</p>
          <div id="st-template-list" style="background:var(--bg3); border-radius:var(--radius); border:1px solid var(--border); max-height:300px; overflow-y:auto; padding:6px;"></div>
        </div>
        <div style="flex: 3; min-width:280px;">
          <p style="font-size:12px; font-weight:500; margin-bottom:6px;">প্রিভিউ ও প্লেসহোল্ডার</p>
          <div id="st-preview-area" style="background:var(--bg3); border-radius:var(--radius); border:1px solid var(--border); padding:12px; max-height:300px; overflow-y:auto; white-space:pre-wrap; font-family:var(--font-bangla); font-size:14px;"></div>
        </div>
      </div>

      <div id="st-form-area" style="margin-top:16px; background:var(--bg2); border-radius:var(--radius); padding:12px;"></div>

      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-primary" id="st-insert">📋 ইনসার্ট করুন (অ্যাক্টিভ এডিটরে)</button>
        <button class="btn btn-ghost" id="st-copy">⎘ কপি টু ক্লিপবোর্ড</button>
        <button class="btn btn-ghost" id="st-clear">✕ পরিষ্কার</button>
      </div>
    </div>
  `;

  // Style inline for the template list items
  const style = document.createElement('style');
  style.textContent = `
    .st-template-item { padding:8px; cursor:pointer; border-bottom:1px solid var(--border); transition:background var(--trans); }
    .st-template-item:hover { background:var(--surface2); border-radius:var(--radius-sm); }
    .st-template-item.active { background:var(--accent-dim); color:var(--accent2); border-left:3px solid var(--accent); }
    .st-cat-btn { padding:4px 12px; border:1px solid var(--border); border-radius:20px; background:transparent; color:var(--text2); cursor:pointer; font-size:12px; transition:all var(--trans); }
    .st-cat-btn.active { background:var(--accent); border-color:var(--accent); color:white; }
    .st-cat-btn:hover:not(.active) { border-color:var(--border2); color:var(--text); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Helper: Toast (if global copyText doesn't exist, define here)
  let toastEl = null;
  function showToast(msg, isError = false) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'st-toast';
      toastEl.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #2e7d32; color: white; padding: 8px 16px; border-radius: 40px;
        font-size: 13px; z-index: 10000; opacity: 0; transition: opacity 0.2s;
        pointer-events: none; font-family: var(--font-ui);
      `;
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? '#d32f2f' : '#2e7d32';
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
  }

  // Use global copyText if exists, else this fallback
  const copyToClipboard = (typeof copyText === 'function') ? copyText : (text) => {
    navigator.clipboard.writeText(text).then(() => showToast('কপি হয়েছে!')).catch(() => showToast('ব্যর্থ', true));
  };

  // Render categories
  const categoriesDiv = el.querySelector('#st-categories');
  Object.entries(TEMPLATE_CATEGORIES).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.textContent = `${cat.icon} ${cat.name}`;
    btn.className = 'st-cat-btn' + (key === currentCategory ? ' active' : '');
    btn.addEventListener('click', () => {
      currentCategory = key;
      document.querySelectorAll('#st-categories .st-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadTemplatesForCategory(key);
    });
    categoriesDiv.appendChild(btn);
  });

  function loadTemplatesForCategory(catKey) {
    const cat = TEMPLATE_CATEGORIES[catKey];
    if (!cat) return;
    const listDiv = el.querySelector('#st-template-list');
    listDiv.innerHTML = '';
    cat.templates.forEach(tpl => {
      const item = document.createElement('div');
      item.className = 'st-template-item';
      item.textContent = tpl.name;
      item.dataset.id = tpl.id;
      item.addEventListener('click', () => {
        document.querySelectorAll('#st-template-list .st-template-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectTemplate(tpl);
      });
      listDiv.appendChild(item);
    });
    // Optionally auto-select first template
    if (cat.templates.length) {
      const first = cat.templates[0];
      selectTemplate(first);
      const firstItem = listDiv.querySelector('.st-template-item');
      if (firstItem) firstItem.classList.add('active');
    } else {
      el.querySelector('#st-preview-area').innerHTML = '<p style="color:var(--text3);">এই ক্যাটাগরিতে কোনো টেমপ্লেট নেই।</p>';
      el.querySelector('#st-form-area').innerHTML = '';
      currentTemplate = null;
    }
  }

  function selectTemplate(tpl) {
    currentTemplate = tpl;
    currentPlaceholders = (tpl.placeholders || []).map(p => ({ key: p, value: '' }));
    // Show raw preview
    let previewHtml = `<div style="white-space:pre-wrap;">${escapeHtml(tpl.content)}</div>`;
    el.querySelector('#st-preview-area').innerHTML = previewHtml;

    // Build form
    const formDiv = el.querySelector('#st-form-area');
    if (currentPlaceholders.length) {
      formDiv.innerHTML = `<p style="margin-bottom:8px; font-size:12px;">🔧 নিচের তথ্য পূরণ করুন (Bangla/English):</p>`;
      currentPlaceholders.forEach((ph, idx) => {
        const inputId = `st_ph_${idx}`;
        const row = document.createElement('div');
        row.style.marginBottom = '10px';
        row.innerHTML = `
          <label style="display:block; font-size:12px; margin-bottom:4px;">${ph.key}</label>
          <input type="text" id="${inputId}" placeholder="যেমন: মোহাম্মদ আলী" style="width:100%; padding:6px; background:var(--bg3); border:1px solid var(--border); border-radius:var(--radius-sm);">
        `;
        formDiv.appendChild(row);
        const inputEl = row.querySelector(`#${inputId}`);
        inputEl.addEventListener('input', (e) => {
          currentPlaceholders[idx].value = e.target.value;
          updatePreview();
        });
      });
    } else {
      formDiv.innerHTML = '<p style="color:var(--text3);">এই টেমপ্লেটে কোনো প্লেসহোল্ডার নেই।</p>';
    }
    updatePreview();
  }

  function updatePreview() {
    if (!currentTemplate) return;
    let filled = currentTemplate.content;
    currentPlaceholders.forEach(ph => {
      const regex = new RegExp(`\\[${escapeRegex(ph.key)}\\]`, 'g');
      filled = filled.replace(regex, ph.value || `[${ph.key}]`);
    });
    el.querySelector('#st-preview-area').innerHTML = `<div style="white-space:pre-wrap;">${escapeHtml(filled)}</div>`;
    currentTemplate.filledText = filled;
  }

  function getFinalText() {
    if (!currentTemplate) return '';
    let filled = currentTemplate.content;
    currentPlaceholders.forEach(ph => {
      const regex = new RegExp(`\\[${escapeRegex(ph.key)}\\]`, 'g');
      filled = filled.replace(regex, ph.value || `[${ph.key}]`);
    });
    return filled;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function (m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Buttons
  el.querySelector('#st-insert').addEventListener('click', () => {
    const final = getFinalText();
    if (!final) return showToast('কোনো টেমপ্লেট নির্বাচন করুন', true);
    let activeEditor = document.querySelector('textarea:focus');
    if (!activeEditor) activeEditor = document.querySelector('textarea');
    if (activeEditor) {
      const start = activeEditor.selectionStart;
      const end = activeEditor.selectionEnd;
      const newText = activeEditor.value.substring(0, start) + final + activeEditor.value.substring(end);
      activeEditor.value = newText;
      activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
      showToast('টেমপ্লেটটি এডিটরে যুক্ত হয়েছে');
    } else {
      showToast('কোনো টেক্সট এলিমেন্ট সক্রিয় নেই', true);
    }
  });

  el.querySelector('#st-copy').addEventListener('click', () => {
    const final = getFinalText();
    copyToClipboard(final);
  });

  el.querySelector('#st-clear').addEventListener('click', () => {
    currentTemplate = null;
    currentPlaceholders = [];
    el.querySelector('#st-template-list').innerHTML = '';
    el.querySelector('#st-preview-area').innerHTML = '<p style="color:var(--text3);">বাম থেকে একটি টেমপ্লেট নির্বাচন করুন</p>';
    el.querySelector('#st-form-area').innerHTML = '';
  });

  // Load initial category
  loadTemplatesForCategory(currentCategory);
}

// ═══════════════════════════════════════════════════════════════════
// RENDER: Batch Number & Currency Converter
// ═══════════════════════════════════════════════════════════════════

function renderBatchNumberConverter(container) {
  let activeConversion = 'words_bn';
  let customOptions = {
    prefix: '',
    suffix: '',
    decimals: 0,
    thousands: 'bd',
    currencySymbol: ''
  };

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔢</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Batch Number & Currency Converter</p>
        <p class="tool-header-desc">তালিকা‑ভিত্তিক সংখ্যা → বাংলা কথায়, মুদ্রা, কমা ফরম্যাট, কাস্টম — একসাথে অনেকগুলি লাইন প্রসেস করুন</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="batch-samples"></div>

      <!-- Conversion type grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px,1fr)); gap:8px; margin-bottom:16px;" id="batch-types"></div>

      <!-- Custom format options (hidden unless custom mode selected) -->
      <div id="batch-custom-panel" style="display:none; margin-bottom:16px; padding:12px; background:var(--bg3); border:1px solid var(--border); border-radius:var(--radius);">
        <p style="font-size:12px; font-weight:500; margin-bottom:8px;">⚙️ কাস্টম ফরম্যাট বিকল্প</p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="custom-prefix-enable"> Prefix</label>
          <input type="text" id="custom-prefix" placeholder="যেমন: মোট টাকা " style="width:120px; padding:5px;" disabled>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="custom-suffix-enable"> Suffix</label>
          <input type="text" id="custom-suffix" placeholder="যেমন: টাকা মাত্র" style="width:120px; padding:5px;" disabled>
          <label>দশমিক স্থান:</label>
          <input type="number" id="custom-decimals" value="0" min="0" max="4" style="width:70px;">
          <label>কমা স্টাইল:</label>
          <select id="custom-thousands" style="padding:5px;">
            <option value="none">কমা নেই</option>
            <option value="bd" selected>বাংলাদেশি (১,২৩,৪৫,৬৭৮)</option>
            <option value="intl">আন্তর্জাতিক (১২৩,৪৫৬,৭৮৯)</option>
          </select>
          <label>মুদ্রা প্রতীক:</label>
          <select id="custom-currency">
            <option value="">কোনোটি নয়</option>
            <option value="৳">৳ (টাকা)</option>
            <option value="$">$ (ডলার)</option>
            <option value="€">€ (ইউরো)</option>
          </select>
        </div>
        <div style="margin-top:10px;">
          <p style="font-size:11px; color:var(--text3);">Presets:</p>
          <div style="display:flex; gap:6px; flex-wrap:wrap;" id="custom-presets"></div>
        </div>
      </div>

      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input</span>
          <textarea id="batch-input" placeholder="প্রতি লাইনে একটি সংখ্যা লিখুন…&#10;উদাহরণ:&#10;1200&#10;2500.50&#10;৩৭৫০" style="min-height:200px;"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output</span>
          <textarea id="batch-output" readonly placeholder="রূপান্তরিত ফলাফল এখানে দেখাবে…" style="min-height:200px;"></textarea>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" id="batch-run">⟳ কনভার্ট করুন</button>
        <button class="btn btn-ghost" id="batch-copy">⎘ কপি আউটপুট</button>
        <button class="btn btn-ghost" id="batch-clear">✕ পরিষ্কার</button>
        <button class="btn btn-ghost" id="batch-swap">⇄ ইনপুট ↔ আউটপুট</button>
        <span id="batch-stats" style="font-size:12px; color:var(--text3); margin-left:auto; font-family:var(--font-mono);"></span>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .batch-type-btn { padding:8px 10px; border:1px solid var(--border); border-radius:var(--radius-sm);
      background:var(--bg3); color:var(--text2); cursor:pointer; font-family:var(--font-ui);
      font-size:12px; transition:all var(--trans); display:flex; align-items:center; gap:8px; }
    .batch-type-btn.active { border-color:var(--accent); background:var(--accent-dim); color:var(--accent2); }
    .batch-type-btn:hover:not(.active) { border-color:var(--border2); color:var(--text); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Toast helper
  let toastEl = null;
  function showToast(msg, isError = false) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'batch-toast';
      toastEl.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #2e7d32; color: white; padding: 8px 16px; border-radius: 40px;
        font-size: 13px; z-index: 10000; opacity: 0; transition: opacity 0.2s;
        pointer-events: none; font-family: var(--font-ui);
      `;
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? '#d32f2f' : '#2e7d32';
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
  }

  function copyText(text) {
    if (!text) { showToast('কপি করার কিছু নেই', true); return; }
    navigator.clipboard.writeText(text).then(() => showToast('কপি হয়েছে!')).catch(() => showToast('ব্যর্থ', true));
  }

  // Samples
  // DOM ELEMENTS & doProcess MUST be defined BEFORE samples/buttons use them
  const inputEl = el.querySelector('#batch-input');
  const outputEl = el.querySelector('#batch-output');
  const statsSpan = el.querySelector('#batch-stats');

  function doProcess() {
    const inputText = inputEl.value;
    if (!inputText.trim()) {
      outputEl.value = '';
      statsSpan.textContent = '';
      return;
    }
    const options = {
      conversionType: activeConversion,
      customOptions: activeConversion === 'custom' ? customOptions : {}
    };
    const result = batchProcess(inputText, options);
    outputEl.value = result;
    setBatchStats(inputText, result);
  }

  function setBatchStats(originalText, processedText) {
    if (!originalText.trim() && !processedText.trim()) {
      statsSpan.textContent = '';
      return;
    }
    const stats = getStats(originalText, processedText);
    statsSpan.textContent = `${stats.inputLines} লাইন প্রসেস → ${stats.outputLines} আউটপুট`;
  }


  const samplesEl = el.querySelector('#batch-samples');
  batchSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doProcess(); });
    samplesEl.appendChild(chip);
  });

  // Render conversion type buttons
  const typesContainer = el.querySelector('#batch-types');
  Object.values(CONVERSION_TYPES).forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'batch-type-btn' + (type.id === activeConversion ? ' active' : '');
    btn.innerHTML = `<span>${type.icon}</span> <span>${type.label}</span>`;
    btn.dataset.type = type.id;
    btn.addEventListener('click', () => {
      activeConversion = type.id;
      document.querySelectorAll('#batch-types .batch-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const customPanel = el.querySelector('#batch-custom-panel');
      if (activeConversion === 'custom') {
        customPanel.style.display = 'block';
      } else {
        customPanel.style.display = 'none';
      }
      doProcess();
    });
    typesContainer.appendChild(btn);
  });

  // Custom panel elements
  const customPanel = el.querySelector('#batch-custom-panel');
  const customPrefixEnable = el.querySelector('#custom-prefix-enable');
  const customPrefixInput = el.querySelector('#custom-prefix');
  const customSuffixEnable = el.querySelector('#custom-suffix-enable');
  const customSuffixInput = el.querySelector('#custom-suffix');
  const customDecimals = el.querySelector('#custom-decimals');
  const customThousands = el.querySelector('#custom-thousands');
  const customCurrency = el.querySelector('#custom-currency');
  const customPresetsDiv = el.querySelector('#custom-presets');

  function updateCustomOptions() {
    customOptions.prefix = customPrefixEnable.checked ? customPrefixInput.value : '';
    customOptions.suffix = customSuffixEnable.checked ? customSuffixInput.value : '';
    customOptions.decimals = parseInt(customDecimals.value) || 0;
    customOptions.thousands = customThousands.value;
    customOptions.currencySymbol = customCurrency.value;
  }
  customPrefixEnable.addEventListener('change', () => { customPrefixInput.disabled = !customPrefixEnable.checked; updateCustomOptions(); doProcess(); });
  customSuffixEnable.addEventListener('change', () => { customSuffixInput.disabled = !customSuffixEnable.checked; updateCustomOptions(); doProcess(); });
  customPrefixInput.addEventListener('input', () => { updateCustomOptions(); doProcess(); });
  customSuffixInput.addEventListener('input', () => { updateCustomOptions(); doProcess(); });
  customDecimals.addEventListener('input', () => { updateCustomOptions(); doProcess(); });
  customThousands.addEventListener('change', () => { updateCustomOptions(); doProcess(); });
  customCurrency.addEventListener('change', () => { updateCustomOptions(); doProcess(); });

  // Custom presets
  Object.entries(CUSTOM_PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.textContent = preset.label;
    btn.className = 'trunc-preset-btn'; // reuse style
    btn.style.fontSize = '11px';
    btn.addEventListener('click', () => {
      customPrefixEnable.checked = !!preset.prefix;
      customPrefixInput.value = preset.prefix || '';
      customPrefixInput.disabled = !customPrefixEnable.checked;
      customSuffixEnable.checked = !!preset.suffix;
      customSuffixInput.value = preset.suffix || '';
      customSuffixInput.disabled = !customSuffixEnable.checked;
      customDecimals.value = preset.decimals;
      customThousands.value = preset.thousands || 'none';
      customCurrency.value = preset.currencySymbol || '';
      updateCustomOptions();
      doProcess();
    });
    customPresetsDiv.appendChild(btn);
  });

  inputEl.addEventListener('input', doProcess);
  el.querySelector('#batch-run').addEventListener('click', doProcess);
  el.querySelector('#batch-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#batch-clear').addEventListener('click', () => {
    inputEl.value = '';
    outputEl.value = '';
    statsSpan.textContent = '';
  });
  el.querySelector('#batch-swap').addEventListener('click', () => {
    const tmp = inputEl.value;
    inputEl.value = outputEl.value;
    outputEl.value = tmp;
    setBatchStats(inputEl.value, outputEl.value);
  });

  // initial process (empty)
  doProcess();
}

function renderFindReplace(container) {
  let caseSensitive = false;
  let wholeWord = false;
  let useRegex = false;
  let replaceAll = true;
  let batchMode = false;
  let batchPairs = [{ find: '', replace: '' }];
  let lastMatches = [];

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">🔎</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Find & Replace</p>
        <p class="tool-header-desc">Regular expression সহ বাংলা text এ খোঁজো এবং বদলাও</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="fr-samples"></div>
 
      <!-- Options -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;
        padding:10px 14px;background:var(--bg3);border:1px solid var(--border);
        border-radius:var(--radius);margin-bottom:12px;">
        <label class="fr-opt"><input type="checkbox" id="fr-case">   Case sensitive</label>
        <label class="fr-opt"><input type="checkbox" id="fr-word">   Whole word</label>
        <label class="fr-opt"><input type="checkbox" id="fr-regex">  Regex (.* \\d+)</label>
        <label class="fr-opt"><input type="checkbox" id="fr-all" checked> Replace all</label>
        <label class="fr-opt" style="margin-left:auto;">
          <input type="checkbox" id="fr-batch"> Batch mode
        </label>
      </div>
 
      <!-- Single mode -->
      <div id="fr-single-mode">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
          <div>
            <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">Find</p>
            <input id="fr-find" type="text" placeholder="খুঁজতে চাওয়া text বা regex…"
              style="width:100%;padding:9px 12px;background:var(--bg2);border:1px solid var(--border);
              border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-bangla);font-size:14px;outline:none;">
          </div>
          <div>
            <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">Replace with</p>
            <input id="fr-replace" type="text" placeholder="প্রতিস্থাপন text… ($1 = group 1)"
              style="width:100%;padding:9px 12px;background:var(--bg2);border:1px solid var(--border);
              border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-bangla);font-size:14px;outline:none;">
          </div>
        </div>
      </div>
 
      <!-- Batch mode -->
      <div id="fr-batch-mode" style="display:none;margin-bottom:12px;">
        <div id="fr-batch-pairs"></div>
        <button class="btn btn-ghost btn-sm" id="fr-add-pair" style="margin-top:6px;">+ আরো pair যোগ করো</button>
      </div>
 
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input</span>
          <textarea id="fr-input" placeholder="এখানে text paste করুন…" style="min-height:160px;"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output
            <span id="fr-match-badge" class="io-label-tag tag-amber" style="display:none;"></span>
          </span>
          <textarea id="fr-output" readonly placeholder="ফলাফল এখানে দেখাবে…" style="min-height:160px;"></textarea>
        </div>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-ghost"   id="fr-find-btn">🔍 Find</button>
        <button class="btn btn-primary" id="fr-replace-btn">↩ Replace করো</button>
        <button class="btn btn-ghost"   id="fr-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="fr-clear">✕ Clear</button>
        <span id="fr-error" style="font-size:12px;color:var(--red);margin-left:8px;"></span>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .fr-opt { display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text2);cursor:pointer; }
    .fr-opt input { accent-color:var(--accent);width:14px;height:14px; }
    .fr-input-row { display:flex;align-items:center;gap:8px;margin-bottom:6px; }
    .fr-input-field { flex:1;padding:7px 10px;background:var(--bg2);border:1px solid var(--border);
      border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-bangla);font-size:13px;outline:none; }
    .fr-remove-pair { background:transparent;border:none;cursor:pointer;color:var(--text3);
      font-size:16px;padding:4px;transition:color var(--trans); }
    .fr-remove-pair:hover { color:var(--red); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  const inputEl = el.querySelector('#fr-input');
  const outputEl = el.querySelector('#fr-output');
  const findInput = el.querySelector('#fr-find');
  const repInput = el.querySelector('#fr-replace');

  // Samples
  const samplesEl = el.querySelector('#fr-samples');
  frSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => {
      inputEl.value = s.text;
      findInput.value = s.find || '';
      repInput.value = s.replace || '';
      if (s.isRegex) { useRegex = true; el.querySelector('#fr-regex').checked = true; }
      outputEl.value = '';
    });
    samplesEl.appendChild(chip);
  });

  // Options
  el.querySelector('#fr-case').addEventListener('change', e => { caseSensitive = e.target.checked; });
  el.querySelector('#fr-word').addEventListener('change', e => { wholeWord = e.target.checked; });
  el.querySelector('#fr-regex').addEventListener('change', e => {
    useRegex = e.target.checked;
    el.querySelector('#fr-error').textContent = '';
  });
  el.querySelector('#fr-all').addEventListener('change', e => { replaceAll = e.target.checked; });
  el.querySelector('#fr-batch').addEventListener('change', e => {
    batchMode = e.target.checked;
    el.querySelector('#fr-single-mode').style.display = batchMode ? 'none' : 'block';
    el.querySelector('#fr-batch-mode').style.display = batchMode ? 'block' : 'none';
  });

  // Batch pairs
  function renderBatchPairs() {
    const container2 = el.querySelector('#fr-batch-pairs');
    container2.innerHTML = '';
    batchPairs.forEach((pair, i) => {
      const row = document.createElement('div');
      row.className = 'fr-input-row';
      row.innerHTML = `
        <span style="font-size:11px;color:var(--text3);min-width:16px;">${i + 1}.</span>
        <input class="fr-input-field" placeholder="Find…" value="${pair.find}">
        <span style="color:var(--text3);">→</span>
        <input class="fr-input-field" placeholder="Replace…" value="${pair.replace}">
        <button class="fr-remove-pair">×</button>
      `;
      const [findF, replaceF] = row.querySelectorAll('.fr-input-field');
      findF.addEventListener('input', e => { batchPairs[i].find = e.target.value; });
      replaceF.addEventListener('input', e => { batchPairs[i].replace = e.target.value; });
      row.querySelector('.fr-remove-pair').addEventListener('click', () => {
        if (batchPairs.length > 1) { batchPairs.splice(i, 1); renderBatchPairs(); }
      });
      container2.appendChild(row);
    });
  }
  renderBatchPairs();

  el.querySelector('#fr-add-pair').addEventListener('click', () => {
    batchPairs.push({ find: '', replace: '' });
    renderBatchPairs();
  });

  const opts = () => ({ caseSensitive, wholeWord, useRegex, replaceAll });

  el.querySelector('#fr-find-btn').addEventListener('click', () => {
    const text = inputEl.value;
    const find = findInput.value;
    if (!text || !find) return;
    const { matches, count, error } = findMatches(text, find, opts());
    el.querySelector('#fr-error').textContent = error || '';
    const badge = el.querySelector('#fr-match-badge');
    if (error) { badge.style.display = 'none'; return; }
    badge.style.display = 'inline-block';
    badge.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
    outputEl.value = text; // Show in output for reference
  });

  el.querySelector('#fr-replace-btn').addEventListener('click', () => {
    const text = inputEl.value;
    el.querySelector('#fr-error').textContent = '';
    if (!text) return;

    let result, count, error, changes;

    if (batchMode) {
      ({ result, changes } = batchReplace(text, batchPairs, opts()));
      count = changes.reduce((s, c) => s + c.count, 0);
    } else {
      ({ result, count, error } = replaceText(text, findInput.value, repInput.value, opts()));
    }

    if (error) {
      el.querySelector('#fr-error').textContent = error;
      return;
    }

    outputEl.value = result;
    const badge = el.querySelector('#fr-match-badge');
    badge.style.display = 'inline-block';
    badge.textContent = `${count} replacement${count !== 1 ? 's' : ''}`;
  });

  el.querySelector('#fr-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#fr-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    findInput.value = ''; repInput.value = '';
    el.querySelector('#fr-match-badge').style.display = 'none';
    el.querySelector('#fr-error').textContent = '';
  });
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Lorem Bangla
// ═══════════════════════════════════════════════════════════════════

function renderLoremBangla(container) {
  let type = 'paragraphs';
  let count = 3;
  let theme = 'general';
  let sentPP = 4;

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">📝</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Lorem Bangla Generator</p>
        <p class="tool-header-desc">Meaningful বাংলা placeholder text — অর্থহীন নয়, বাস্তব বিষয়বস্তু থেকে তৈরি</p>
      </div>
    </div>
    <div class="tool-body">
 
      <!-- Quick presets -->
      <div style="margin-bottom:14px;">
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;
          letter-spacing:.06em;margin-bottom:7px;">Quick Presets</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="lorem-presets"></div>
      </div>
 
      <!-- Controls -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;
        padding:14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:14px;">
        <div>
          <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">ধরন</p>
          <select id="lorem-type" style="width:100%;padding:7px 10px;background:var(--bg2);
            border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);
            font-family:var(--font-ui);font-size:13px;">
            <option value="paragraphs">অনুচ্ছেদ</option>
            <option value="sentences">বাক্য</option>
            <option value="words">শব্দ</option>
            <option value="list">তালিকা</option>
            <option value="headings">Headings</option>
          </select>
        </div>
        <div>
          <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">সংখ্যা</p>
          <input type="number" id="lorem-count" value="3" min="1" max="20"
            style="width:100%;padding:7px 10px;background:var(--bg2);border:1px solid var(--border);
            border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-mono);font-size:14px;outline:none;">
        </div>
        <div id="lorem-sent-pp-wrap">
          <p style="font-size:11px;color:var(--text3);margin-bottom:5px;">বাক্য/অনুচ্ছেদ</p>
          <input type="number" id="lorem-spp" value="4" min="1" max="10"
            style="width:100%;padding:7px 10px;background:var(--bg2);border:1px solid var(--border);
            border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-mono);font-size:14px;outline:none;">
        </div>
      </div>
 
      <!-- Theme selector -->
      <div style="margin-bottom:14px;">
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;
          letter-spacing:.06em;margin-bottom:7px;">বিষয়</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="lorem-themes"></div>
      </div>
 
      <!-- Output -->
      <textarea id="lorem-output" readonly placeholder="Generate করা text এখানে দেখাবে…"
        style="min-height:200px;font-family:var(--font-bangla);font-size:15px;line-height:1.9;"></textarea>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="lorem-generate">⟳ Generate করো</button>
        <button class="btn btn-ghost"   id="lorem-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="lorem-refresh">🔀 আরেকবার</button>
        <span id="lorem-stats" style="font-size:12px;color:var(--text3);margin-left:auto;font-family:var(--font-mono);"></span>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .lorem-preset-btn { padding:5px 12px;border:1px solid var(--border);border-radius:20px;
      background:var(--surface2);color:var(--text2);font-size:12px;cursor:pointer;
      font-family:var(--font-ui);transition:all var(--trans); }
    .lorem-preset-btn:hover { border-color:var(--border2);color:var(--text); }
    .lorem-theme-btn { padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);
      background:var(--bg3);color:var(--text2);font-size:12.5px;cursor:pointer;
      font-family:var(--font-ui);transition:all var(--trans); }
    .lorem-theme-btn.active { border-color:var(--accent);background:var(--accent-dim);color:var(--accent2); }
    .lorem-theme-btn:hover:not(.active) { border-color:var(--border2);color:var(--text); }
  `;
  container.appendChild(style);
  container.appendChild(el);

  const outputEl = el.querySelector('#lorem-output');

  // Presets
  Object.entries(loremPresets).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'lorem-preset-btn';
    btn.innerHTML = `${preset.icon} ${preset.label}`;
    btn.addEventListener('click', () => {
      type = preset.type;
      count = preset.count;
      sentPP = preset.sentencesPerPara || 4;
      el.querySelector('#lorem-type').value = type;
      el.querySelector('#lorem-count').value = count;
      el.querySelector('#lorem-spp').value = sentPP;
      doGenerate();
    });
    el.querySelector('#lorem-presets').appendChild(btn);
  });

  // Themes
  const themesEl = el.querySelector('#lorem-themes');
  Object.entries(loremThemes).forEach(([key, thm]) => {
    const btn = document.createElement('button');
    btn.className = 'lorem-theme-btn' + (key === theme ? ' active' : '');
    btn.innerHTML = `${thm.icon} ${thm.label}`;
    btn.addEventListener('click', () => {
      theme = key;
      themesEl.querySelectorAll('.lorem-theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      doGenerate();
    });
    themesEl.appendChild(btn);
  });

  // Controls
  el.querySelector('#lorem-type').addEventListener('change', e => {
    type = e.target.value;
    el.querySelector('#lorem-sent-pp-wrap').style.display = type === 'paragraphs' ? 'block' : 'none';
    doGenerate();
  });
  el.querySelector('#lorem-count').addEventListener('input', e => { count = parseInt(e.target.value) || 1; doGenerate(); });
  el.querySelector('#lorem-spp').addEventListener('input', e => { sentPP = parseInt(e.target.value) || 4; doGenerate(); });

  el.querySelector('#lorem-generate').addEventListener('click', doGenerate);
  el.querySelector('#lorem-refresh').addEventListener('click', doGenerate);
  el.querySelector('#lorem-copy').addEventListener('click', () => copyText(outputEl.value));

  function doGenerate() {
    const result = generateLoremBangla({ type, count, theme, sentencesPerPara: sentPP });
    outputEl.value = result;
    const words = result.trim().split(/\s+/).filter(Boolean).length;
    const chars = [...result].length;
    el.querySelector('#lorem-stats').textContent = `${words} শব্দ · ${chars} অক্ষর`;
  }

  doGenerate(); // Generate on load
}


// ═══════════════════════════════════════════════════════════════════
// RENDER: Punctuation Fixer
// ═══════════════════════════════════════════════════════════════════

function renderPunctuationFixer(container) {
  let selectedOps = new Set(punctPresets.bangla_standard.ops);
  let activePreset = 'bangla_standard';

  const el = document.createElement('div');
  el.className = 'tool-card';
  el.innerHTML = `
    <div class="tool-header">
      <div class="tool-header-icon">✏️</div>
      <div class="tool-header-info">
        <p class="tool-header-title">Punctuation Fixer</p>
        <p class="tool-header-desc">বাংলা দাঁড়ি · comma · quotes · dash — প্রতিটি fix আলাদাভাবে চালু করো</p>
      </div>
    </div>
    <div class="tool-body">
      <div class="sample-row" id="pf-samples"></div>
 
      <!-- Presets -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" id="pf-presets"></div>
 
      <!-- Fix checkboxes by category -->
      <div id="pf-fixes-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px;margin-bottom:14px;"></div>
 
      <div class="io-grid">
        <div class="io-pane">
          <span class="io-label">Input <span class="io-label-tag tag-bijoy">raw</span></span>
          <textarea id="pf-input" placeholder="এখানে text paste করুন…"></textarea>
        </div>
        <div class="io-pane">
          <span class="io-label">Output <span class="io-label-tag tag-unicode">fixed</span></span>
          <textarea id="pf-output" readonly placeholder="Fixed text এখানে দেখাবে…"></textarea>
        </div>
      </div>
 
      <div class="btn-row">
        <button class="btn btn-primary" id="pf-run">✏️ Fix করো</button>
        <button class="btn btn-ghost"   id="pf-copy">⎘ Copy</button>
        <button class="btn btn-ghost"   id="pf-clear">✕ Clear</button>
      </div>
 
      <div id="pf-changes" style="margin-top:12px;display:none;"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pf-preset-btn { padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);
      background:var(--surface2);color:var(--text2);font-size:12.5px;cursor:pointer;
      font-family:var(--font-ui);transition:all var(--trans);display:flex;gap:5px;align-items:center; }
    .pf-preset-btn.active { background:var(--accent-dim);border-color:var(--accent);color:var(--accent2);font-weight:500; }
    .pf-preset-btn:hover:not(.active) { border-color:var(--border2);color:var(--text); }
    .pf-fix-check { display:flex;align-items:flex-start;gap:8px;padding:8px 10px;
      border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;
      transition:border-color var(--trans);background:var(--bg3); }
    .pf-fix-check.checked { border-color:var(--accent);background:var(--accent-dim); }
    .pf-fix-check input { accent-color:var(--accent);margin-top:2px;flex-shrink:0; }
    .pf-fix-label { font-size:12.5px;color:var(--text);line-height:1.3; }
    .pf-fix-desc  { font-size:11px;color:var(--text3);margin-top:1px;font-family:var(--font-mono); }
    .pf-fix-check.checked .pf-fix-desc { color:var(--accent2);opacity:.7; }
    .pf-cat-label { font-size:10.5px;font-weight:500;color:var(--text3);text-transform:uppercase;
      letter-spacing:.06em;grid-column:1/-1;margin-top:8px;margin-bottom:2px; }
    .pf-change-row { display:flex;align-items:center;gap:8px;padding:5px 10px;
      border-radius:var(--radius-sm);background:var(--green-dim);font-size:12.5px;
      color:var(--text2);margin-bottom:4px; }
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#pf-samples');
  punctSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => { inputEl.value = s.text; doFix(); });
    samplesEl.appendChild(chip);
  });

  // Presets
  const presetsEl = el.querySelector('#pf-presets');
  Object.entries(punctPresets).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'pf-preset-btn' + (key === activePreset ? ' active' : '');
    btn.innerHTML = `${preset.icon} ${preset.label}`;
    btn.title = preset.desc;
    btn.addEventListener('click', () => {
      activePreset = key;
      selectedOps = new Set(preset.ops);
      presetsEl.querySelectorAll('.pf-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFixes();
      doFix();
    });
    presetsEl.appendChild(btn);
  });

  // Fix checkboxes
  const fixesGrid = el.querySelector('#pf-fixes-grid');
  function renderFixes() {
    fixesGrid.innerHTML = '';
    const byCat = {};
    Object.entries(FIXES).forEach(([key, fix]) => {
      if (!byCat[fix.category]) byCat[fix.category] = [];
      byCat[fix.category].push([key, fix]);
    });

    Object.entries(byCat).forEach(([cat, fixes]) => {
      const catInfo = punctCats[cat] || { label: cat };
      const label = document.createElement('div');
      label.className = 'pf-cat-label';
      label.textContent = catInfo.label;
      fixesGrid.appendChild(label);

      fixes.forEach(([key, fix]) => {
        const row = document.createElement('div');
        const checked = selectedOps.has(key);
        row.className = 'pf-fix-check' + (checked ? ' checked' : '');
        row.innerHTML = `
          <input type="checkbox" ${checked ? 'checked' : ''}>
          <div>
            <p class="pf-fix-label">${fix.label}</p>
            <p class="pf-fix-desc">${fix.desc}</p>
          </div>`;
        row.addEventListener('click', e => {
          if (e.target.tagName === 'INPUT') return;
          const cb = row.querySelector('input');
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        });
        row.querySelector('input').addEventListener('change', e => {
          if (e.target.checked) { selectedOps.add(key); row.classList.add('checked'); }
          else { selectedOps.delete(key); row.classList.remove('checked'); }
          activePreset = null;
          presetsEl.querySelectorAll('.pf-preset-btn').forEach(b => b.classList.remove('active'));
          doFix();
        });
        fixesGrid.appendChild(row);
      });
    });
  }
  renderFixes();

  const inputEl = el.querySelector('#pf-input');
  const outputEl = el.querySelector('#pf-output');
  inputEl.addEventListener('input', doFix);
  el.querySelector('#pf-run').addEventListener('click', doFix);
  el.querySelector('#pf-copy').addEventListener('click', () => copyText(outputEl.value));
  el.querySelector('#pf-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    el.querySelector('#pf-changes').style.display = 'none';
  });

  function doFix() {
    const text = inputEl.value;
    if (!text.trim()) { outputEl.value = ''; return; }
    const { result, changes } = fixPunctuation(text, [...selectedOps]);
    outputEl.value = result;
    const changesEl = el.querySelector('#pf-changes');
    if (changes.length > 0) {
      changesEl.style.display = 'block';
      changesEl.innerHTML = `
        <p style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;
          letter-spacing:.06em;margin-bottom:6px;">${changes.length}টি fix প্রয়োগ হয়েছে</p>
        ${changes.map(c => `
          <div class="pf-change-row">
            <span>✓</span><span>${c.label}</span>
          </div>`).join('')}
      `;
    } else {
      changesEl.style.display = 'none';
    }
  }
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('bts-theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  updateThemeBtn(saved);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('bts-theme', next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = $('theme-btn');
  if (btn) btn.innerHTML = theme === 'dark' ? '☀ Light mode' : '🌙 Dark mode';
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildSidebar();
  renderTool(currentTool);

  // Set initial topbar
  const first = TOOLS[0];
  $('topbar-title').textContent = first.name;
  $('topbar-desc').textContent = first.desc;

  // Mobile menu
  $('menu-btn').addEventListener('click', openMobileSidebar);
  $('sidebar-overlay').addEventListener('click', closeMobileSidebar);
  $('theme-btn').addEventListener('click', toggleTheme);
});
