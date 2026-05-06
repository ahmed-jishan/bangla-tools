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
import { analyzeSentences, SAMPLES as sentSamples }  from './tools/sentence-counter.js';

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

  // Samples
  const samplesEl = el.querySelector('#b2u-samples');
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

  // Live conversion
  const inputEl = el.querySelector('#b2u-input');
  inputEl.addEventListener('input', doConvert);
  el.querySelector('#b2u-convert').addEventListener('click', doConvert);
  el.querySelector('#b2u-copy').addEventListener('click', () => {
    copyText(el.querySelector('#b2u-output').value);
  });
  el.querySelector('#b2u-clear').addEventListener('click', () => {
    inputEl.value = '';
    el.querySelector('#b2u-output').value = '';
    updateStats({});
  });
  el.querySelector('#b2u-swap').addEventListener('click', () => activateTool('unicode-to-bijoy'));

  function doConvert() {
    const input = inputEl.value;
    const output = bijoyToUnicode(input);
    el.querySelector('#b2u-output').value = output;
    const stats = b2uStats(input, output);
    el.querySelector('#b2u-words').textContent = stats.words;
    el.querySelector('#b2u-chars').textContent = stats.chars;
    el.querySelector('#b2u-bengali').textContent = stats.banglaChars;
    el.querySelector('#b2u-orig').textContent = stats.originalLen;
  }

  function updateStats(s) {
    ['words', 'chars', 'bengali', 'orig'].forEach(k => {
      const el2 = el.querySelector(`#b2u-${k}`);
      if (el2) el2.textContent = s[k] ?? 0;
    });
  }
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
          ['wc-graphemes',  'অক্ষর (সঠিক)',     '0', 'green'],
          ['wc-words',      'শব্দ',              '0', 'blue'],
          ['wc-sentences',  'বাক্য',             '0', 'amber'],
          ['wc-paragraphs', 'অনুচ্ছেদ',          '0', 'purple'],
          ['wc-unique',     'অনন্য শব্দ',        '0', 'teal'],
          ['wc-diversity',  'Lexical Diversity', '0%', 'coral'],
          ['wc-bytes',      'Bytes (UTF-8)',      '0', 'gray'],
          ['wc-lines',      'লাইন',              '0', 'gray'],
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
 
    setVal('wc-graphemes',  stats.graphemes.toLocaleString('bn'));
    setVal('wc-words',      stats.words.toLocaleString('bn'));
    setVal('wc-sentences',  stats.sentences.toLocaleString('bn'));
    setVal('wc-paragraphs', stats.paragraphs.toLocaleString('bn'));
    setVal('wc-unique',     stats.uniqueWords.toLocaleString('bn'));
    setVal('wc-diversity',  stats.lexicalDiversity + '%');
    setVal('wc-bytes',      stats.bytes.toLocaleString());
    setVal('wc-lines',      stats.lines.toLocaleString('bn'));
 
    // Language bar
    const langBar = el.querySelector('#wc-lang-bar');
    if (text.trim()) {
      langBar.style.display = 'block';
      const visual = el.querySelector('#wc-lang-visual');
      const legend = el.querySelector('#wc-lang-legend');
      const r = stats.langRatio;
      visual.innerHTML = `
        ${r.bangla  ? `<div style="flex:${r.bangla};  background:#34d399; border-radius:20px;"></div>` : ''}
        ${r.english ? `<div style="flex:${r.english}; background:#4f8ef7; border-radius:20px;"></div>` : ''}
        ${r.digit   ? `<div style="flex:${r.digit};   background:#fbbf24; border-radius:20px;"></div>` : ''}
      `;
      legend.innerHTML = `
        ${r.bangla  ? `<span style="font-size:12px;color:var(--text3)"><span style="color:#34d399">●</span> বাংলা ${r.bangla}%</span>` : ''}
        ${r.english ? `<span style="font-size:12px;color:var(--text3)"><span style="color:#4f8ef7">●</span> English ${r.english}%</span>` : ''}
        ${r.digit   ? `<span style="font-size:12px;color:var(--text3)"><span style="color:#fbbf24">●</span> সংখ্যা ${r.digit}%</span>` : ''}
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
    UNICODE_BENGALI: { icon:'✅', borderColor:'#34d39950', bg:'var(--green-dim)' },
    BIJOY:           { icon:'⚠️', borderColor:'#fbbf2450', bg:'var(--amber-dim)' },
    MIXED:           { icon:'🔴', borderColor:'#f8717150', bg:'var(--red-dim)' },
    AVRO_PHONETIC:   { icon:'⌨️', borderColor:'#4f8ef750', bg:'var(--accent-dim)' },
    ASCII:           { icon:'ℹ️', borderColor:'var(--border2)', bg:'var(--bg3)' },
    UNKNOWN:         { icon:'❓', borderColor:'var(--border2)', bg:'var(--bg3)' },
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
    el.querySelector('#enc-verdict-type').textContent = result.primaryEncoding.replace(/_/g,' ');
    el.querySelector('#enc-verdict-desc').textContent = result.description;
 
    const confEl = el.querySelector('#enc-confidence');
    const confColors = { high:'var(--green-dim)', medium:'var(--amber-dim)', low:'var(--red-dim)' };
    confEl.style.background = confColors[result.confidence];
    confEl.textContent = result.confidenceScore.label;
 
    el.querySelector('#enc-recommendation').textContent = '💡 ' + result.recommendation;
    el.querySelector('#enc-recommendation').style.background = 'rgba(0,0,0,0.1)';
 
    // Char counts
    const countsEl = el.querySelector('#enc-char-counts');
    countsEl.innerHTML = [
      ['unicodeBengali', 'Unicode বাংলা', result.classes.unicodeBengali],
      ['bijoySignature', 'Bijoy chars',   result.classes.bijoySignature],
      ['latinAscii',     'Latin/ASCII',   result.classes.latinAscii],
      ['whitespace',     'Whitespace',    result.classes.whitespace],
      ['totalChars',     'মোট অক্ষর',    result.totalChars],
      ['byteSize',       'Bytes (UTF-8)', result.byteSize],
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
          ${[['words','শব্দ'],['chars','অক্ষর'],['bigrams','বাক্যাংশ'],['collocations','সহাবস্থান']].map(([id,label]) => `
            <button class="freq-tab${id === 'words' ? ' active' : ''}" data-tab="${id}">${label}</button>
          `).join('')}
        </div>
        <div style="display:flex;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;" id="freq-lang">
          ${[['all','সব'],['bangla','বাংলা'],['english','English']].map(([id,label]) => `
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
      rows = [['Rank','Word','Count','Percentage']];
      lastResult.wordFreq.forEach(f => rows.push([f.rank, f.item, f.count, f.pct]));
      filename = 'word_frequency.csv';
    } else if (activeTab === 'chars') {
      rows = [['Rank','Character','Count','Percentage']];
      lastResult.charFreq.forEach(f => rows.push([f.rank, f.item, f.count, f.pct]));
      filename = 'char_frequency.csv';
    } else if (activeTab === 'bigrams') {
      rows = [['Rank','Bigram','Count','Percentage']];
      lastResult.ngram.freq.forEach(f => rows.push([f.rank, f.item, f.count, f.pct]));
      filename = 'bigram_frequency.csv';
    } else if (activeTab === 'collocations') {
      const coll = lastResult.ngram.collocations;
      if (!coll.length) { showToast('কোনো সহাবস্থান পাওয়া যায়নি', true); return; }
      rows = [['Rank','Bigram','Count','PMI']];
      coll.forEach((c, idx) => rows.push([idx+1, c.bigram, c.count, c.pmi]));
      filename = 'collocations.csv';
    }
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
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
      <div class="freq-summary-stat"><span class="freq-summary-label">Zipf fit</span><span class="freq-summary-val">${r.summary.zipfScore !== null ? r.summary.zipfScore+'%' : '—'}</span></div>
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
          <span class="freq-bar-rank">${idx+1}</span>
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
        <div class="freq-bar-track"><div class="freq-bar-fill" style="width:${(e.count/maxCount)*100}%;background:${colorFn(e,i)};"></div></div>
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
    green: { bg:'var(--green-dim)', border:'#34d39960', text:'var(--green)' },
    teal:  { bg:'rgba(20,184,166,.12)', border:'rgba(20,184,166,.4)', text:'#14b8a6' },
    amber: { bg:'var(--amber-dim)', border:'#fbbf2460', text:'var(--amber)' },
    orange:{ bg:'rgba(251,146,60,.12)', border:'rgba(251,146,60,.4)', text:'#fb923c' },
    red:   { bg:'var(--red-dim)', border:'#f8717160', text:'var(--red)' },
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
          ['মোট বাক্য',    r.totalSentences, ''],
          ['মোট শব্দ',     r.totalWords, ''],
          ['গড় দৈর্ঘ্য',   r.avgWords, 'শব্দ/বাক্য'],
          ['মোট clause',   r.totalClauses, ''],
          ['গড় clause',    r.avgClauses, 'প্রতি বাক্য'],
          ['অনুচ্ছেদ',     r.paragraphs.count, ''],
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
          <span style="font-size:18px;">${
            {green:'🟢',teal:'🟢',amber:'🟡',orange:'🟠',red:'🔴'}[r.readability.color]
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
              <div class="sent-type-fill" style="width:${(count/typeMax)*100}%;background:${TYPE_COLORS[type]||'var(--accent)'};"></div>
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
              <div class="dist-bar-fill" style="width:${(d.count/distMax)*100}%;"></div>
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
    resultEl.querySelector('#sent-toggle-detail').addEventListener('click', function() {
      showDetail = !showDetail;
      if (showDetail) {
        detailList.style.display = 'block';
        this.textContent = 'বিস্তারিত লুকাও ↑';
        detailList.innerHTML = r.sentences.map((s, i) => `
          <div class="sent-detail-row">
            <span style="font-size:10.5px;color:var(--text3);font-family:var(--font-mono);">#${i+1}</span>
            <span class="sent-detail-type" style="color:${TYPE_COLORS[s.sentenceType]||'var(--text3)'}">
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
