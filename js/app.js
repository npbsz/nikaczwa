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
  // 1. Language system
  initI18n();

  // 2. Status & schedule
  initStatus(config);
  initSchedule(config);

  // 3. Vacation banner
  initNotice(config);

  // 4. Page navigation & UI
  initNavigation();
  initAddressCopy(config);
  initNavigationButtons(config);

  // 5. External integrations
  initBookings(config);
  initMap(config);

  // 6. Set initial language (triggers 'nika:langchange' to populate dynamic text)
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
