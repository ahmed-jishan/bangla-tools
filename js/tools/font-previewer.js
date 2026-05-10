/**
 * Font Previewer
 * Preview Bengali and Latin fonts with custom text:
 *  - All major Bangla web fonts (Google Fonts)
 *  - Font size, weight, line-height controls
 *  - Side-by-side comparison mode
 *  - Download font info
 *  - Pangram / sample text presets
 *  - Dark/light background toggle
 *  - Letter spacing, word spacing controls
 */

// ─── Font Registry ────────────────────────────────────────────────────────────

export const BANGLA_FONTS = [
  {
    id: 'tiro_bangla',
    name: 'Tiro Bangla',
    family: "'Tiro Bangla', serif",
    googleFont: 'Tiro+Bangla:ital@0;1',
    category: 'Serif',
    style: 'ক্লাসিক সেরিফ — বই ও সংবাদপত্রের জন্য',
    supports: ['bangla'],
    weights: [400],
    designer: 'John Hudson',
  },
  {
    id: 'noto_sans_bengali',
    name: 'Noto Sans Bengali',
    family: "'Noto Sans Bengali', sans-serif",
    googleFont: 'Noto+Sans+Bengali:wght@100;300;400;500;600;700;800;900',
    category: 'Sans-serif',
    style: 'পরিষ্কার সান্স-সেরিফ — UI ও ওয়েব ডিজাইনের জন্য',
    supports: ['bangla'],
    weights: [100, 300, 400, 500, 600, 700, 800, 900],
    designer: 'Google',
  },
  {
    id: 'noto_serif_bengali',
    name: 'Noto Serif Bengali',
    family: "'Noto Serif Bengali', serif",
    googleFont: 'Noto+Serif+Bengali:wght@100;200;300;400;500;600;700;800;900',
    category: 'Serif',
    style: 'প্রাতিষ্ঠানিক সেরিফ — দীর্ঘ পাঠের জন্য আদর্শ',
    supports: ['bangla'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    designer: 'Google',
  },
  {
    id: 'hind_siliguri',
    name: 'Hind Siliguri',
    family: "'Hind Siliguri', sans-serif",
    googleFont: 'Hind+Siliguri:wght@300;400;500;600;700',
    category: 'Sans-serif',
    style: 'আধুনিক হিউম্যানিস্ট সান্স — UI ও অ্যাপের জন্য',
    supports: ['bangla', 'latin'],
    weights: [300, 400, 500, 600, 700],
    designer: 'Indian Type Foundry',
  },
  {
    id: 'galada',
    name: 'Galada',
    family: "'Galada', cursive",
    googleFont: 'Galada',
    category: 'Display',
    style: 'ডিসপ্লে ফন্ট — হেডিং ও লোগোর জন্য',
    supports: ['bangla'],
    weights: [400],
    designer: 'Jonny Pinhorn',
  },
  {
    id: 'baloo_da_2',
    name: 'Baloo Da 2',
    family: "'Baloo Da 2', cursive",
    googleFont: 'Baloo+Da+2:wght@400;500;600;700;800',
    category: 'Display',
    style: 'মজাদার রাউন্ডেড — শিশু সাইট ও ইনফর্মাল ডিজাইনে',
    supports: ['bangla', 'latin'],
    weights: [400, 500, 600, 700, 800],
    designer: 'Ek Type',
  },
  {
    id: 'atma',
    name: 'Atma',
    family: "'Atma', cursive",
    googleFont: 'Atma:wght@300;400;500;600;700',
    category: 'Display',
    style: 'হস্তলিপির ছোঁয়া — ক্রিয়েটিভ প্রজেক্টের জন্য',
    supports: ['bangla', 'latin'],
    weights: [300, 400, 500, 600, 700],
    designer: 'Sorkintype',
  },
  {
    id: 'mitra',
    name: 'Mitra Mono',
    family: "'Mitra Mono', monospace",
    googleFont: 'Mitra+Mono',
    category: 'Monospace',
    style: 'মনোস্পেস — কোড ও টার্মিনাল টেক্সটের জন্য',
    supports: ['bangla'],
    weights: [400],
    designer: 'Ek Type',
  },
];

export const LATIN_FONTS = [
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    googleFont: 'Inter:wght@100;300;400;500;600;700;800;900',
    category: 'Sans-serif',
    style: 'Tech UI standard — GitHub, Linear, Notion',
    supports: ['latin'],
    weights: [100, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    googleFont: 'Outfit:wght@100;300;400;500;600;700;800;900',
    category: 'Sans-serif',
    style: 'Modern geometric — dashboards ও SaaS এর জন্য',
    supports: ['latin'],
    weights: [100, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    id: 'dm_sans',
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    googleFont: 'DM+Sans:wght@300;400;500;600;700',
    category: 'Sans-serif',
    style: 'Clean humanist — editorial ও product design',
    supports: ['latin'],
    weights: [300, 400, 500, 600, 700],
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    googleFont: 'Playfair+Display:wght@400;500;600;700;800;900',
    category: 'Serif',
    style: 'Elegant serif — magazine ও blog headings',
    supports: ['latin'],
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    id: 'dm_mono',
    name: 'DM Mono',
    family: "'DM Mono', monospace",
    googleFont: 'DM+Mono:wght@300;400;500',
    category: 'Monospace',
    style: 'Developer font — code ও terminal',
    supports: ['latin'],
    weights: [300, 400, 500],
  },
];

export const ALL_FONTS = [...BANGLA_FONTS, ...LATIN_FONTS];

// ─── Sample Texts ─────────────────────────────────────────────────────────────

export const SAMPLE_TEXTS = {
  bangla: [
    {
      label: 'সাধারণ বাক্য',
      text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
    },
    {
      label: 'বর্ণমালা',
      text: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ\nক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ',
    },
    {
      label: 'সংখ্যা',
      text: '০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯\n১২৩,৪৫৬,৭৮৯ টাকা',
    },
    {
      label: 'যুক্তাক্ষর',
      text: 'ক্ষমা ব্রহ্মা জ্ঞান স্বপ্ন প্রেম শ্রেষ্ঠ ক্লান্ত স্বাধীন',
    },
    {
      label: 'দীর্ঘ অনুচ্ছেদ',
      text: 'বাংলাদেশ একটি সুন্দর দেশ। এই দেশের মানুষ অত্যন্ত পরিশ্রমী এবং সৎ। প্রকৃতির অপার সৌন্দর্যে ভরপুর এই দেশটি বিশ্বের মানচিত্রে একটি গুরুত্বপূর্ণ স্থান অধিকার করে আছে।',
    },
  ],
  latin: [
    {
      label: 'Pangram',
      text: 'The quick brown fox jumps over the lazy dog.',
    },
    {
      label: 'Alphabet',
      text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789',
    },
    {
      label: 'Mixed case',
      text: 'Sphinx of black quartz, judge my vow.',
    },
    {
      label: 'Paragraph',
      text: 'Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed.',
    },
  ],
  mixed: [
    {
      label: 'Mixed script',
      text: 'বাংলাদেশের Technology Sector এবং Digital Economy ২০২৫ সালে অনেক এগিয়ে গেছে।',
    },
    {
      label: 'UI labels',
      text: 'নাম / Name\nইমেইল / Email\nপাসওয়ার্ড / Password\nজমা দিন / Submit',
    },
  ],
};

// ─── Font Loader ──────────────────────────────────────────────────────────────

const loadedFonts = new Set();

export function loadFont(font) {
  if (loadedFonts.has(font.id) || !font.googleFont) return Promise.resolve();
  return new Promise((resolve) => {
    const url = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
    if (document.querySelector(`link[href="${url}"]`)) {
      loadedFonts.add(font.id);
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = url;
    link.onload = () => { loadedFonts.add(font.id); resolve(); };
    link.onerror = () => resolve(); // fail silently
    document.head.appendChild(link);
  });
}

export function loadAllFonts(fonts) {
  return Promise.all(fonts.map(loadFont));
}

export function isFontLoaded(fontId) {
  return loadedFonts.has(fontId);
}