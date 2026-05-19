/**
 * Shareable State Router Extension
 * Adds URL state encoding/decoding to the existing router
 * bangla-tools/#/banglish-converter?t=ami%20valo%20achi
 */

import { ROUTER } from './router.js';

const STATE = {
  /**
   * Encode text to base64url-safe string
   */
  encode(text) {
    try {
      return btoa(unescape(encodeURIComponent(text)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch {
      return '';
    }
  },

  /**
   * Decode base64url-safe string back to text
   */
  decode(encoded) {
    try {
      // Restore padding
      const pad = encoded.length % 4;
      if (pad) encoded += '='.repeat(4 - pad);
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return '';
    }
  },

  /**
   * Get state from current URL
   * Returns: { toolId, text } or null
   */
  get() {
    const hash = window.location.hash;
    const match = hash.match(/^#\/([^?]+)(?:\?t=([^&]+))?/);
    if (!match) return null;

    return {
      toolId: match[1],
      text: match[2] ? this.decode(match[2]) : ''
    };
  },

  /**
   * Set state in URL (tool + text)
   */
  set(toolId, text = '') {
    if (!toolId) return;

    let hash = `#/${toolId}`;
    if (text && text.trim()) {
      hash += `?t=${this.encode(text.trim())}`;
    }

    if (window.location.hash !== hash) {
      // Use replaceState to avoid adding to history stack
      // when just updating text (prevents back-button spam)
      history.replaceState(null, '', hash);
    }
  },

  /**
   * Generate a shareable link for current state
   */
  shareableLink(toolId, text = '') {
    const base = window.location.origin + window.location.pathname;
    let url = `${base}#/${toolId}`;
    if (text && text.trim()) {
      url += `?t=${this.encode(text.trim())}`;
    }
    return url;
  },

  /**
   * Copy shareable link to clipboard
   */
  async copyLink(toolId, text = '') {
    const link = this.shareableLink(toolId, text);
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  }
};

// ─── Extended ROUTER with state support ───
export const STATE_ROUTER = {
  ...ROUTER,

  /**
   * Initialize with state support
   * @param {Function} onRouteChange — callback(toolId, text) 
   */
  init(onRouteChange) {
    // Handle direct page load
    const state = STATE.get();
    if (state && typeof onRouteChange === 'function') {
      onRouteChange(state.toolId, state.text);
    }

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const s = STATE.get();
      if (s && typeof onRouteChange === 'function') {
        onRouteChange(s.toolId, s.text);
      }
    });
  },

  /**
   * Update URL with tool + text state
   */
  setState(toolId, text = '') {
    STATE.set(toolId, text);
  },

  /**
   * Get current state
   */
  getState() {
    return STATE.get();
  },

  /**
   * Get shareable link
   */
  getShareableLink(toolId, text = '') {
    return STATE.shareableLink(toolId, text);
  },

  /**
   * Copy link to clipboard
   */
  async copyShareableLink(toolId, text = '') {
    return STATE.copyLink(toolId, text);
  }
};

export { STATE };