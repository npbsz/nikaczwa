/**
 * ============================================================
 *  NIKA AUTOSERWIS - MAIN APPLICATION ENTRY POINT  (js/app.js)
 *  Native ES6 Modules Orchestrator
 * ============================================================
 */

import { config } from '../config.js';
import { initI18n, getCurrentLang, getTranslations, setLanguage } from './modules/i18n.js';
import { initStatus, getGarageStatus, updateGarageStatus } from './modules/status.js';
import { initSchedule, renderHoursTable, renderTodayHours, getTodayHoursText } from './modules/schedule.js';
import { initBookings } from './modules/bookings.js';
import { initMap, initNavigationButtons, initAddressCopy } from './modules/map.js';
import { initNavigation } from './modules/navigation.js';
import { initNotice, updateNotice, showNotice, hideNotice } from './modules/notice.js';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initStatus(config);
  initSchedule(config);
  initNotice(config);
  initNavigation();
  initAddressCopy(config);
  initNavigationButtons(config);
  initBookings(config);
  initMap(config);
  setLanguage(getCurrentLang());
});

// Backward compatibility: expose window.NikaApp
if (typeof window !== 'undefined') {
  window.NikaApp = {
    getCurrentLang,
    getTranslations,
    setLanguage,
    getGarageStatus,
    updateGarageStatus,
    getTodayHoursText,
    renderHoursTable,
    renderTodayHours,
    initNotice,
    updateNotice,
    showNotice,
    hideNotice
  };
}
