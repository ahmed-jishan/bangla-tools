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

  // Today's data on load
  const today = getTodayAllCalendars();

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

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">

        <div class="date-cal-card" id="dc-gregorian">
          <p class="date-cal-name">🗓 Gregorian</p>
          <p class="date-cal-main" id="dc-greg-main">${today.gregorian.formatted}</p>
          <p class="date-cal-sub" id="dc-greg-bn">${today.gregorian.formattedBangla}</p>
        </div>

        <div class="date-cal-card" id="dc-bangla">
          <p class="date-cal-name">🟢 বাংলা সন</p>
          <p class="date-cal-main bangla-font" id="dc-bn-main">${today.bangla?.formattedFull || '—'}</p>
          <p class="date-cal-sub" id="dc-bn-en">${today.bangla?.formattedEn || '—'}</p>
        </div>

        <div class="date-cal-card" id="dc-hijri">
          <p class="date-cal-name">☪ হিজরি</p>
          <p class="date-cal-main bangla-font" id="dc-hij-main">${today.hijri?.formatted || '—'}</p>
          <p class="date-cal-sub" id="dc-hij-en">${today.hijri?.formattedEn || '—'}</p>
        </div>

      </div>

      <p style="font-size:11.5px; color:var(--text3); margin-top:14px;">
        * বাংলা সন: বাংলা একাডেমি কর্তৃক সংশোধিত বাংলাদেশ সরকারি পঞ্জিকা অনুযায়ী।
        হিজরি: astronomical approximation, ±১-২ দিন পার্থক্য হতে পারে।
      </p>
    </div>
  `;

  // Calendar card styles
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
  `;
  container.appendChild(style);
  container.appendChild(el);

  // Samples
  const samplesEl = el.querySelector('#date-samples');
  dateSamples.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'sample-chip';
    chip.textContent = s.label;
    chip.addEventListener('click', () => {
      const dateStr = s.date || new Date().toISOString().slice(0, 10);
      el.querySelector('#date-input').value = dateStr;
      doConvert(new Date(dateStr));
    });
    samplesEl.appendChild(chip);
  });

  // Click to copy
  ['gregorian', 'bangla', 'hijri'].forEach(key => {
    el.querySelector(`#dc-${key.slice(0, 3) === 'gre' ? 'gregorian' : key}`);
  });
  el.querySelector('#dc-gregorian').addEventListener('click', () => {
    copyText(el.querySelector('#dc-greg-main').textContent);
  });
  el.querySelector('#dc-bangla').addEventListener('click', () => {
    copyText(el.querySelector('#dc-bn-main').textContent);
  });
  el.querySelector('#dc-hijri').addEventListener('click', () => {
    copyText(el.querySelector('#dc-hij-main').textContent);
  });

  el.querySelector('#date-input').addEventListener('change', e => {
    doConvert(new Date(e.target.value));
  });
  el.querySelector('#date-today').addEventListener('click', () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    el.querySelector('#date-input').value = todayStr;
    doConvert(new Date());
  });

  function doConvert(date) {
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
