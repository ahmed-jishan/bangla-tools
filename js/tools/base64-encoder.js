/**
 * Base64 Encoder / Decoder
 * Full Unicode support (handles বাংলা correctly via UTF-8):
 *  - Text → Base64
 *  - Base64 → Text
 *  - URL-safe Base64 (RFC 4648)
 *  - Hex encoding / decoding
 *  - Binary representation
 *  - URL encoding (percent-encoding) for Bangla
 *  - HTML entity encoding
 *  - ROT13 (English only, fun)
 */

// ─── Core Encode/Decode ───────────────────────────────────────────────────────

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Text → Base64 (Unicode-safe via UTF-8)
 */
export function textToBase64(text, urlSafe = false) {
  if (!text) return '';
  try {
    const bytes  = encoder.encode(text);
    const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
    let b64 = btoa(binary);
    if (urlSafe) {
      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    return b64;
  } catch (e) {
    return ''; // encoding error
  }
}

/**
 * Base64 → Text (Unicode-safe)
 */
export function base64ToText(b64, urlSafe = false) {
  if (!b64) return { result: '', error: null };
  try {
    let normalized = b64.trim();
    if (urlSafe) {
      normalized = normalized
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/\s/g, '');
      // Re-pad
      while (normalized.length % 4) normalized += '=';
    }
    normalized = normalized.replace(/\s/g, '');
    const binary = atob(normalized);
    const bytes  = Uint8Array.from(binary, c => c.charCodeAt(0));
    return { result: decoder.decode(bytes), error: null };
  } catch (e) {
    return { result: '', error: 'অবৈধ Base64 string। সঠিক Base64 দিন।' };
  }
}

// ─── Hex ─────────────────────────────────────────────────────────────────────

export function textToHex(text) {
  if (!text) return '';
  const bytes = encoder.encode(text);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(' ');
}

export function hexToText(hex) {
  if (!hex) return { result: '', error: null };
  try {
    const clean = hex.replace(/\s/g, '');
    if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) {
      return { result: '', error: 'অবৈধ Hex string। শুধু 0-9, a-f অক্ষর ব্যবহার করুন।' };
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    return { result: decoder.decode(bytes), error: null };
  } catch (e) {
    return { result: '', error: 'Hex decode ব্যর্থ।' };
  }
}

// ─── URL Encoding ─────────────────────────────────────────────────────────────

export function textToURL(text) {
  if (!text) return '';
  try {
    return encodeURIComponent(text);
  } catch { return ''; }
}

export function urlToText(encoded) {
  if (!encoded) return { result: '', error: null };
  try {
    return { result: decodeURIComponent(encoded.trim()), error: null };
  } catch {
    return { result: '', error: 'অবৈধ URL-encoded string।' };
  }
}

// ─── HTML Entities ────────────────────────────────────────────────────────────

const HTML_ENTITIES = {
  '&': '&amp;',  '<': '&lt;',  '>': '&gt;',
  '"': '&quot;', "'": '&#39;', '/': '&#x2F;',
};

const HTML_DECODE = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k])
);

export function textToHTML(text) {
  if (!text) return '';
  return text.replace(/[&<>"'/]/g, ch => HTML_ENTITIES[ch] || ch);
}

export function htmlToText(html) {
  if (!html) return { result: '', error: null };
  try {
    let result = html;
    // Named entities
    Object.entries(HTML_DECODE).forEach(([entity, char]) => {
      result = result.split(entity).join(char);
    });
    // Numeric entities: &#65; or &#x41;
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    );
    result = result.replace(/&#([0-9]+);/g, (_, dec) =>
      String.fromCodePoint(parseInt(dec, 10))
    );
    return { result, error: null };
  } catch {
    return { result: '', error: 'HTML decode ব্যর্থ।' };
  }
}

// ─── Binary ──────────────────────────────────────────────────────────────────

export function textToBinary(text) {
  if (!text) return '';
  const bytes = encoder.encode(text);
  return Array.from(bytes, b => b.toString(2).padStart(8, '0')).join(' ');
}

export function binaryToText(bin) {
  if (!bin) return { result: '', error: null };
  try {
    const clean = bin.replace(/\s/g, '');
    if (!/^[01]+$/.test(clean) || clean.length % 8 !== 0) {
      return { result: '', error: 'অবৈধ binary string। শুধু 0 এবং 1 ব্যবহার করুন (8-bit groups)।' };
    }
    const bytes = new Uint8Array(clean.length / 8);
    for (let i = 0; i < clean.length; i += 8) {
      bytes[i / 8] = parseInt(clean.slice(i, i + 8), 2);
    }
    return { result: decoder.decode(bytes), error: null };
  } catch {
    return { result: '', error: 'Binary decode ব্যর্থ।' };
  }
}

// ─── ROT13 (English fun) ──────────────────────────────────────────────────────

export function rot13(text) {
  return text.replace(/[a-zA-Z]/g, ch => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getEncodingStats(original, encoded, mode) {
  const origBytes = encoder.encode(original).length;
  const encBytes  = encoded.length;
  const overhead  = origBytes > 0
    ? Math.round(((encBytes - origBytes) / origBytes) * 100)
    : 0;
  return { origBytes, encBytes, overhead, mode };
}

// ─── Encoding Modes Registry ──────────────────────────────────────────────────

export const MODES = {
  base64: {
    label: 'Base64',
    icon: '🔐',
    desc: 'Standard Base64 — সবচেয়ে common encoding',
    encode: (t) => ({ result: textToBase64(t, false), error: null }),
    decode: (t) => base64ToText(t, false),
  },
  base64url: {
    label: 'Base64 URL-safe',
    icon: '🔗',
    desc: 'URL-safe Base64 (RFC 4648) — URL এ ব্যবহারের জন্য',
    encode: (t) => ({ result: textToBase64(t, true), error: null }),
    decode: (t) => base64ToText(t, true),
  },
  hex: {
    label: 'Hexadecimal',
    icon: '🔢',
    desc: 'Hex encoding (UTF-8 bytes as hex)',
    encode: (t) => ({ result: textToHex(t), error: null }),
    decode: (t) => hexToText(t),
  },
  url: {
    label: 'URL Encode',
    icon: '🌐',
    desc: 'Percent-encoding — বাংলা URL এ ব্যবহারের জন্য',
    encode: (t) => ({ result: textToURL(t), error: null }),
    decode: (t) => urlToText(t),
  },
  html: {
    label: 'HTML Entities',
    icon: '🏷️',
    desc: '&amp; &lt; &gt; — HTML safe করার জন্য',
    encode: (t) => ({ result: textToHTML(t), error: null }),
    decode: (t) => htmlToText(t),
  },
  binary: {
    label: 'Binary',
    icon: '💻',
    desc: '01010110 — Binary representation',
    encode: (t) => ({ result: textToBinary(t), error: null }),
    decode: (t) => binaryToText(t),
  },
  rot13: {
    label: 'ROT13',
    icon: '🔄',
    desc: 'ROT13 cipher — English অক্ষর ১৩ ঘরে সরানো',
    encode: (t) => ({ result: rot13(t), error: null }),
    decode: (t) => ({ result: rot13(t), error: null }), // self-inverse
  },
};

export const SAMPLES = [
  { label: 'বাংলা text',        text: 'আমার সোনার বাংলা' },
  { label: 'Mixed',            text: 'Hello বাংলাদেশ 2024' },
  { label: 'URL example',      text: 'https://example.com/search?q=বাংলা' },
  { label: 'Code snippet',     text: 'const x = "বাংলা";' },
];