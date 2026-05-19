/**
 * Bangla Tools Router — Hash-based URL sharing
 * Makes every tool shareable via: bangla-tools/#/tool-id
 * Zero dependencies, works with your existing ES Modules architecture.
 */

export const ROUTER = {
  /**
   * Parse current URL hash and return tool id.
   * Supports #/tool-id, #tool-id, or empty.
   */
  getToolId() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || null;
  },

  /**
   * Update URL hash to match the active tool.
   * Safe to call multiple times — skips if hash already matches.
   */
  set(toolId) {
    if (!toolId) return;
    const hash = `#/${toolId}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  },

  /**
   * Initialize router.
   * @param {Function} onRouteChange — callback(toolId) fired on load & hashchange
   */
  init(onRouteChange) {
    // Handle direct page load with a hash (e.g. bookmark, shared link)
    const initial = this.getToolId();
    if (initial && typeof onRouteChange === 'function') {
      onRouteChange(initial);
    }

    // Handle browser Back/Forward and manual hash edits
    window.addEventListener('hashchange', () => {
      const id = this.getToolId();
      if (id && typeof onRouteChange === 'function') {
        onRouteChange(id);
      }
    });
  }
};