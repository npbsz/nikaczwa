/**
 * ============================================================
 *  NIKA AUTOSERWIS - NOTICE MODULE  (js/notice.js)
 *
 *  Provides window.NikaNotice = { init, update, show, hide }
 *
 *  Reads:
 *    - window.NIKA_CONFIG.vacationNotice  (active, badge, message)
 *    - window.NikaApp.getCurrentLang()    (from app.js)
 *    - window.NikaApp.getTranslations()   (from app.js)
 *
 *  Load order:  config.js → i18n.js → app.js → notice.js
 *  (notice.js may also be loaded before app.js – it guards all
 *   references with existence checks and uses a DOMContentLoaded
 *   fallback so it always initialises correctly.)
 * ============================================================
 */

(function () {
  'use strict';

  // ── Internal helpers ─────────────────────────────────────────

  /**
   * Returns the current language, delegating to NikaApp when available.
   * @returns {string} 'pl' | 'en' | 'uk'
   */
  function _getLang() {
    if (window.NikaApp && typeof window.NikaApp.getCurrentLang === 'function') {
      return window.NikaApp.getCurrentLang();
    }
    // Fallback: read localStorage directly
    const stored = localStorage.getItem('nika_lang');
    return (['pl', 'en', 'uk'].includes(stored)) ? stored : 'pl';
  }

  /**
   * Returns the translations object for the given language.
   * @param {string} lang
   * @returns {Object}
   */
  function _getTranslations(lang) {
    if (window.NikaApp && typeof window.NikaApp.getTranslations === 'function') {
      return window.NikaApp.getTranslations(lang);
    }
    // Fallback: read i18n directly
    return (window.NIKA_I18N && window.NIKA_I18N[lang]) || {};
  }

  /**
   * Finds the `.notice-banner` element in the DOM.
   * @returns {HTMLElement|null}
   */
  function _getBanner() {
    return document.querySelector('.notice-banner');
  }

  /**
   * Writes translated badge + message into the banner without changing
   * its visibility.
   * @param {HTMLElement} banner
   * @param {string} lang
   */
  function _applyContent(banner, lang) {
    const vn = window.NIKA_CONFIG && window.NIKA_CONFIG.vacationNotice;
    if (!vn) return;

    const t = _getTranslations(lang);

    // Badge label
    const badgeEl = banner.querySelector('.notice-badge');
    if (badgeEl) {
      badgeEl.textContent = (vn.badge && (vn.badge[lang] || vn.badge['pl'])) || '';
    }

    // Main message
    const msgEl = banner.querySelector('.notice-message');
    if (msgEl) {
      msgEl.textContent = (vn.message && (vn.message[lang] || vn.message['pl'])) || '';
    }

    // Dismiss button label
    const dismissEl = banner.querySelector('.notice-dismiss');
    if (dismissEl) {
      dismissEl.textContent = t.notice_dismiss || '×';
      dismissEl.setAttribute('aria-label', t.notice_dismiss || '×');
    }
  }

  // ── Dismiss handler (attached once) ──────────────────────────

  let _dismissAttached = false;

  function _attachDismiss(banner) {
    if (_dismissAttached) return;
    const btn = banner.querySelector('.notice-dismiss');
    if (btn) {
      btn.addEventListener('click', function () {
        NikaNotice.hide();
      });
      _dismissAttached = true;
    }
  }

  // ── Public API ────────────────────────────────────────────────

  /**
   * Initialises the vacation notice banner.
   *
   * - If `NIKA_CONFIG.vacationNotice.active` is false  → hides the banner.
   * - If true → populates content in the current language and shows it.
   *
   * Safe to call multiple times (idempotent).
   */
  function init() {
    const banner = _getBanner();
    if (!banner) return; // Banner element not present in this page

    const config = window.NIKA_CONFIG;
    if (!config || !config.vacationNotice || !config.vacationNotice.active) {
      hide();
      return;
    }

    const lang = _getLang();
    _applyContent(banner, lang);
    _attachDismiss(banner);
    banner.classList.add('active');
  }

  /**
   * Re-renders the notice banner text to match the current language.
   * Does NOT change the visibility of the banner.
   */
  function update() {
    const banner = _getBanner();
    if (!banner) return;
    if (!banner.classList.contains('active')) return; // Nothing to update if hidden

    const lang = _getLang();
    _applyContent(banner, lang);
  }

  /**
   * Programmatically shows the notice banner (even if `active` was false).
   * Useful for testing or manual overrides.
   */
  function show() {
    const banner = _getBanner();
    if (!banner) return;
    const lang = _getLang();
    _applyContent(banner, lang);
    _attachDismiss(banner);
    banner.classList.add('active');
  }

  /**
   * Programmatically hides the notice banner.
   */
  function hide() {
    const banner = _getBanner();
    if (banner) banner.classList.remove('active');
  }

  // ── Bootstrap ─────────────────────────────────────────────────

  // If the DOM is already ready, init immediately; otherwise wait.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Export ────────────────────────────────────────────────────

  window.NikaNotice = {
    init: init,
    update: update,
    show: show,
    hide: hide,
  };

})();
