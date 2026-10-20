/**
 * ============================================================
 *  NIKA AUTOSERWIS - GARAGE STATUS MODULE (js/modules/status.js)
 *  Real-time open/closed calculation in Europe/Warsaw timezone,
 *  status badge updating, and 60-second auto-refresh.
 * ============================================================
 */

import { getCurrentLang, getTranslations } from './i18n.js';

let activeConfig = null;

/**
 * Determines whether the garage is currently open, using Warsaw local time
 * and the hours defined in config.business.hours.
 *
 * @param {Object} [cfg] Optional configuration object override
 * @returns {{ open: boolean, text: string }}
 */
export function getGarageStatus(cfg) {
  const config = cfg || activeConfig || window.NIKA_CONFIG || {};
  const lang = getCurrentLang();
  const t = getTranslations(lang);

  // Get current time in Europe/Warsaw timezone
  const now = new Date();
  const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
  const warsaw = new Date(warsawStr);
  const currentDay = warsaw.getDay();     // 0=Sun … 6=Sat
  const currentHour = warsaw.getHours();
  const currentMinute = warsaw.getMinutes();

  // Find today's schedule entry
  const hours = (config.business && config.business.hours) || [];
  const todayEntry = hours.find(function (entry) {
    return entry.daysOfWeek.includes(currentDay);
  });

  let isOpen = false;
  if (todayEntry && todayEntry.openHour !== null && todayEntry.closeHour !== null) {
    const nowDecimal = currentHour + currentMinute / 60;
    isOpen = nowDecimal >= todayEntry.openHour && nowDecimal < todayEntry.closeHour;
  }

  return {
    open: isOpen,
    text: isOpen ? (t.status_open || 'Open Now') : (t.status_closed || 'Closed')
  };
}

/**
 * Updates every `.status-badge` element on the page with the correct
 * open/closed state class and translated text.
 */
export function updateGarageStatus() {
  const status = getGarageStatus();
  document.querySelectorAll('.status-badge').forEach(function (badge) {
    badge.textContent = status.text;
    badge.classList.toggle('status-open', status.open);
    badge.classList.toggle('status-closed', !status.open);
  });
}

/**
 * Recalculates open/closed status every minute so the badge stays
 * accurate without a page reload.
 */
function startStatusRefresh() {
  updateGarageStatus();
  setInterval(updateGarageStatus, 60 * 1000);
}

/**
 * Initializes the status module, subscribes to language changes,
 * and starts the background status refresher.
 *
 * @param {Object} [config]
 */
export function initStatus(config) {
  if (config) activeConfig = config;

  // React to language change events immediately
  document.addEventListener('nika:langchange', function () {
    updateGarageStatus();
  });

  startStatusRefresh();
}

