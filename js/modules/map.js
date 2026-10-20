/**
 * ============================================================
 *  NIKA AUTOSERWIS - MAP MODULE (js/modules/map.js)
 *  Google Maps embed, mobile turn-by-turn navigation, and address copying.
 * ============================================================
 */

import { getCurrentLang, getTranslations } from './i18n.js';

let activeConfig = null;

/**
 * Initializes the Google Maps embed iframe src.
 *
 * @param {Object} [config]
 */
export function initMap(config) {
  if (config) activeConfig = config;
  const currentConfig = activeConfig || window.NIKA_CONFIG || {};

  const mapIframe = document.getElementById('map-iframe');
  if (!mapIframe) return;

  if (currentConfig.integrations && currentConfig.integrations.mapsEmbedUrl) {
    mapIframe.src = currentConfig.integrations.mapsEmbedUrl;
  }
}

/**
 * Attaches click handlers to navigation buttons to open directions
 * in Google Maps or the user's native navigation app.
 *
 * @param {Object} [config]
 */
export function initNavigationButtons(config) {
  if (config) activeConfig = config;
  const currentConfig = activeConfig || window.NIKA_CONFIG || {};

  document.querySelectorAll('[data-navigate-btn]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const query = (currentConfig.integrations && currentConfig.integrations.mapsDestinationQuery) || '';
      const url = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
}

/**
 * Attaches clipboard copy functionality to all elements with class `.copy-address`.
 *
 * @param {Object} [config]
 */
export function initAddressCopy(config) {
  if (config) activeConfig = config;
  const currentConfig = activeConfig || window.NIKA_CONFIG || {};

  document.querySelectorAll('.copy-address').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const address = (currentConfig.business && currentConfig.business.address && currentConfig.business.address.full) || '';
      if (!address) return;

      navigator.clipboard.writeText(address).then(function () {
        const lang = getCurrentLang();
        const t = getTranslations(lang);
        const originalText = btn.textContent;

        btn.textContent = t.info_copied || 'Copied!';
        btn.disabled = true;

        // Restore original label after 2 s
        setTimeout(function () {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2000);
      }).catch(function (err) {
        console.warn('[NikaApp] Clipboard write failed:', err);
      });
    });
  });
}

