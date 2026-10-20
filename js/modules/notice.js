/**
 * ============================================================
 *  NIKA AUTOSERWIS - NOTICE MODULE (js/modules/notice.js)
 *  Vacation / announcement banner management and language updates.
 * ============================================================
 */

import { getCurrentLang, getTranslations } from './i18n.js';

let activeConfig = null;
let dismissAttached = false;

/**
 * Finds the `.notice-banner` element in the DOM.
 * @returns {HTMLElement|null}
 */
function getBanner() {
  return document.querySelector('.notice-banner');
}

/**
 * Writes translated badge + message into the banner without changing
 * its visibility state.
 *
 * @param {HTMLElement} banner
 * @param {string} lang
 */
function applyContent(banner, lang) {
  const config = activeConfig || window.NIKA_CONFIG || {};
  const vn = config.vacationNotice;
  if (!vn) return;

  const t = getTranslations(lang);

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

/**
 * Attaches the dismiss button click listener once.
 * @param {HTMLElement} banner
 */
function attachDismiss(banner) {
  if (dismissAttached) return;
  const btn = banner.querySelector('.notice-dismiss');
  if (btn) {
    btn.addEventListener('click', function () {
      hideNotice();
    });
    dismissAttached = true;
  }
}

/**
 * Programmatically shows the notice banner.
 */
export function showNotice() {
  const banner = getBanner();
  if (!banner) return;
  const lang = getCurrentLang();
  applyContent(banner, lang);
  attachDismiss(banner);
  banner.classList.add('active');
}

/**
 * Programmatically hides the notice banner.
 */
export function hideNotice() {
  const banner = getBanner();
  if (banner) banner.classList.remove('active');
}

/**
 * Re-renders the notice banner text to match the current language.
 * Does not alter banner visibility.
 */
export function updateNotice() {
  const banner = getBanner();
  if (!banner || !banner.classList.contains('active')) return;
  const lang = getCurrentLang();
  applyContent(banner, lang);
}

/**
 * Initialises the vacation notice banner from configuration.
 *
 * @param {Object} [config]
 */
export function initNotice(config) {
  if (config) activeConfig = config;

  const banner = getBanner();
  if (!banner) return;

  const currentConfig = activeConfig || window.NIKA_CONFIG || {};
  if (!currentConfig.vacationNotice || !currentConfig.vacationNotice.active) {
    hideNotice();
  } else {
    showNotice();
  }

  // Subscribe to language change events
  document.addEventListener('nika:langchange', function () {
    updateNotice();
  });
}

// Backward compatibility: expose window.NikaNotice
if (typeof window !== 'undefined') {
  window.NikaNotice = {
    init: initNotice,
    update: updateNotice,
    show: showNotice,
    hide: hideNotice
  };
}

