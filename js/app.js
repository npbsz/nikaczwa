/**
 * ============================================================
 *  NIKA AUTOSERWIS - MAIN APPLICATION SCRIPT  (js/app.js)
 *
 *  Dependencies (must be loaded before this file):
 *    - config.js   → window.NIKA_CONFIG
 *    - js/i18n.js  → window.NIKA_I18N
 *    - js/notice.js → window.NikaNotice  (loaded after this file is fine)
 *
 *  No external libraries required.
 * ============================================================
 */

(function () {
  'use strict';

  // ============================================================
  //  SECTION 1 – LANGUAGE SYSTEM
  // ============================================================

  const SUPPORTED_LANGS = ['pl', 'en', 'uk'];
  const STORAGE_KEY = 'nika_lang';

  /**
   * Returns the currently active language code.
   * Reads from localStorage; falls back to 'pl'.
   * @returns {string} 'pl' | 'en' | 'uk'
   */
  function getCurrentLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored && SUPPORTED_LANGS.includes(stored)) ? stored : 'pl';
  }

  /**
   * Returns the translations object for the given language.
   * Falls back to Polish if the language is unavailable.
   * @param {string} lang
   * @returns {Object}
   */
  function getTranslations(lang) {
    return (window.NIKA_I18N && window.NIKA_I18N[lang]) || window.NIKA_I18N['pl'] || {};
  }

  /**
   * Applies a language to the entire page:
   *   - Saves choice to localStorage
   *   - Updates <html lang="…">
   *   - Replaces all [data-i18n], [data-i18n-html], [data-i18n-placeholder],
   *     and [data-i18n-aria] elements
   *   - Re-renders dynamic sections that depend on the language
   *
   * @param {string} lang  'pl' | 'en' | 'uk'
   */
  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = 'pl';

    // Persist choice
    localStorage.setItem(STORAGE_KEY, lang);

    // Update <html lang>
    document.documentElement.lang = lang;

    const t = getTranslations(lang);

    // --- [data-i18n] → textContent ---
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // --- [data-i18n-html] → innerHTML (use sparingly, trusted strings only) ---
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // --- [data-i18n-placeholder] → placeholder attribute ---
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    // --- [data-i18n-aria] → aria-label attribute ---
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    // --- Update language dropdown button label ---
    _updateLangDropdown(lang, t);

    // --- Re-render dynamic sections ---
    updateGarageStatus();
    renderHoursTable();
    renderTodayHours();

    // --- Update notice banner text ---
    if (window.NikaNotice) window.NikaNotice.update();
  }

  /**
   * Updates the language-switcher dropdown button to reflect the active lang.
   * Expects a button with [data-lang-btn] and option items with [data-lang-option].
   * @param {string} lang
   * @param {Object} t  translations
   */
  function _updateLangDropdown(lang, t) {
    // Update the active-language button display text
    const btn = document.querySelector('[data-lang-btn]');
    if (btn) {
      const flagSpan = btn.querySelector('[data-lang-flag]');
      const labelSpan = btn.querySelector('[data-lang-label]');
      const flags = { pl: '🇵🇱', en: '🇬🇧', uk: '🇺🇦' };
      if (flagSpan) flagSpan.textContent = flags[lang] || '';
      if (labelSpan) labelSpan.textContent = t['lang_' + lang] || lang.toUpperCase();
    }

    // Mark the active option
    document.querySelectorAll('[data-lang-option]').forEach(function (el) {
      const optLang = el.getAttribute('data-lang-option');
      el.classList.toggle('active', optLang === lang);
      el.setAttribute('aria-selected', optLang === lang ? 'true' : 'false');
    });
  }

  // ============================================================
  //  SECTION 2 – OPEN / CLOSED STATUS BADGE
  // ============================================================

  /**
   * Determines whether the garage is currently open, using Warsaw local time
   * and the hours defined in NIKA_CONFIG.business.hours.
   *
   * @returns {{ open: boolean, text: string }}
   */
  function getGarageStatus() {
    const lang = getCurrentLang();
    const t = getTranslations(lang);
    const config = window.NIKA_CONFIG;

    // Get current time in Europe/Warsaw timezone
    const now = new Date();
    const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
    const warsaw = new Date(warsawStr);
    const currentDay = warsaw.getDay();     // 0=Sun … 6=Sat
    const currentHour = warsaw.getHours();
    const currentMinute = warsaw.getMinutes();

    // Find today's schedule entry
    const todayEntry = (config.business.hours || []).find(function (entry) {
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
  function updateGarageStatus() {
    const status = getGarageStatus();
    document.querySelectorAll('.status-badge').forEach(function (badge) {
      badge.textContent = status.text;
      badge.classList.toggle('status-open', status.open);
      badge.classList.toggle('status-closed', !status.open);
    });
  }

  // ============================================================
  //  SECTION 3 – TODAY'S HOURS
  // ============================================================

  /**
   * Returns today's opening hours as a human-readable string in the
   * current language (e.g. "08:00 – 18:00" or "Zamknięte").
   * @returns {string}
   */
  function getTodayHoursText() {
    const lang = getCurrentLang();
    const t = getTranslations(lang);
    const config = window.NIKA_CONFIG;

    const now = new Date();
    const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
    const warsaw = new Date(warsawStr);
    const currentDay = warsaw.getDay();

    const todayEntry = (config.business.hours || []).find(function (entry) {
      return entry.daysOfWeek.includes(currentDay);
    });

    if (!todayEntry) return t.location_closed_text || 'Closed';

    // `time` can be a plain string or a {pl,en,uk} object (for closed days)
    if (typeof todayEntry.time === 'object') {
      return todayEntry.time[lang] || todayEntry.time['pl'] || (t.location_closed_text || 'Closed');
    }
    return todayEntry.time;
  }

  /**
   * Inserts today's hours into elements with id `today-hours-text`
   * and `hero-today-hours`.
   */
  function renderTodayHours() {
    const text = getTodayHoursText();
    ['today-hours-text', 'hero-today-hours'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  }

  // ============================================================
  //  SECTION 4 – VACATION NOTICE BANNER
  //  (Also exposed via window.NikaNotice in notice.js)
  // ============================================================

  /**
   * Initialises the vacation notice banner from NIKA_CONFIG.
   * Called once on DOMContentLoaded. notice.js may also call this.
   */
  function initNotice() {
    const config = window.NIKA_CONFIG;
    const banner = document.querySelector('.notice-banner');
    if (!banner) return;

    if (!config.vacationNotice || !config.vacationNotice.active) {
      banner.classList.remove('active');
      return;
    }

    _applyNoticeContent(banner);
    banner.classList.add('active');

    // Dismiss button
    const dismissBtn = banner.querySelector('.notice-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.classList.remove('active');
      });
    }
  }

  /**
   * Updates the notice banner text to match the current language.
   * Safe to call even if the banner is hidden or inactive.
   */
  function updateNotice() {
    const banner = document.querySelector('.notice-banner');
    if (!banner) return;
    const config = window.NIKA_CONFIG;
    if (!config.vacationNotice || !config.vacationNotice.active) return;
    _applyNoticeContent(banner);
  }

  /**
   * Internal: writes translated badge + message text into the banner DOM.
   * @param {HTMLElement} banner
   */
  function _applyNoticeContent(banner) {
    const lang = getCurrentLang();
    const vn = window.NIKA_CONFIG.vacationNotice;
    const t = getTranslations(lang);

    const badgeEl = banner.querySelector('.notice-badge');
    const msgEl = banner.querySelector('.notice-message');
    const dismissEl = banner.querySelector('.notice-dismiss');

    if (badgeEl) badgeEl.textContent = (vn.badge && vn.badge[lang]) || vn.badge['pl'] || '';
    if (msgEl) msgEl.textContent = (vn.message && vn.message[lang]) || vn.message['pl'] || '';
    if (dismissEl) dismissEl.textContent = t.notice_dismiss || '×';
  }

  // ============================================================
  //  SECTION 5 – MOBILE NAVIGATION (HAMBURGER MENU)
  // ============================================================

  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;

    // Toggle menu open/closed
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when any nav link is clicked
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on click outside
    document.addEventListener('click', function (e) {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================================
  //  SECTION 6 – SMOOTH SCROLL (with sticky-header offset)
  // ============================================================

  const HEADER_OFFSET = 80; // px – adjust if your header is taller/shorter

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  // ============================================================
  //  SECTION 7 – ADDRESS COPY BUTTON
  // ============================================================

  function initAddressCopy() {
    document.querySelectorAll('.copy-address').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const address = window.NIKA_CONFIG.business.address.full;
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

  // ============================================================
  //  SECTION 8 – HOURS TABLE
  // ============================================================

  /**
   * Dynamically builds the opening hours table body (#hours-table-body).
   * Highlights the current day's row with class `.today-row`.
   */
  function renderHoursTable() {
    const tbody = document.getElementById('hours-table-body');
    if (!tbody) return;

    const lang = getCurrentLang();
    const t = getTranslations(lang);
    const config = window.NIKA_CONFIG;

    // Determine today's day-of-week in Warsaw time
    const now = new Date();
    const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
    const warsaw = new Date(warsawStr);
    const currentDay = warsaw.getDay();

    tbody.innerHTML = ''; // Clear existing rows

    (config.business.hours || []).forEach(function (entry) {
      const tr = document.createElement('tr');

      // Is today's day covered by this entry?
      const isToday = entry.daysOfWeek.includes(currentDay);
      if (isToday) tr.classList.add('today-row');

      // Day name cell
      const tdDay = document.createElement('td');
      tdDay.className = 'hours-day';
      const dayLabel = (typeof entry.days === 'object')
        ? (entry.days[lang] || entry.days['pl'])
        : entry.days;

      // Append a "Today" badge for the current day's row
      if (isToday) {
        const todayBadge = document.createElement('span');
        todayBadge.className = 'today-badge';
        todayBadge.textContent = t.location_today || 'Today';
        tdDay.appendChild(todayBadge);
        tdDay.appendChild(document.createTextNode(' ' + dayLabel));
      } else {
        tdDay.textContent = dayLabel;
      }

      // Hours cell
      const tdTime = document.createElement('td');
      tdTime.className = 'hours-time';
      let timeText;
      if (typeof entry.time === 'object') {
        // Closed-day entries store localised strings
        timeText = entry.time[lang] || entry.time['pl'] || (t.location_closed_text || 'Closed');
        tdTime.classList.add('hours-closed');
      } else {
        timeText = entry.time;
      }
      tdTime.textContent = timeText;

      tr.appendChild(tdDay);
      tr.appendChild(tdTime);
      tbody.appendChild(tr);
    });
  }

  // ============================================================
  //  SECTION 9 – MICROSOFT BOOKINGS IFRAME LOADING STATE
  // ============================================================

  function initBookingsIframe() {
    const iframe = document.getElementById('bookings-iframe');
    const overlay = document.getElementById('bookings-loading');
    if (!iframe) return;

    // Set the src from config (avoids hard-coding in HTML)
    const bookingsUrl = window.NIKA_CONFIG && window.NIKA_CONFIG.integrations.microsoftBookingsUrl;
    if (bookingsUrl) {
      iframe.src = bookingsUrl;
      // Also wire up the fallback "open in new window" link
      var fallbackBtn = document.getElementById('booking-fallback-btn');
      if (fallbackBtn) fallbackBtn.href = bookingsUrl;
    }

    // Show overlay until iframe content loads
    if (overlay) overlay.style.display = 'flex';

    iframe.addEventListener('load', function () {
      if (overlay) {
        overlay.style.opacity = '0';
        // Remove from layout after fade (if CSS transition defined)
        setTimeout(function () {
          overlay.style.display = 'none';
        }, 300);
      }
      iframe.style.opacity = '1';
    });
  }

  // ============================================================
  //  SECTION 10 – LANGUAGE DROPDOWN CLICK HANDLERS
  // ============================================================

  function initLangDropdown() {
    // Open / close dropdown on button click
    const langBtn = document.querySelector('[data-lang-btn]');
    const langDropdown = document.querySelector('.lang-dropdown');

    if (langBtn && langDropdown) {
      function toggleDropdown(e) {
        if (e) e.stopPropagation();
        const isOpen = langDropdown.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      function closeDropdown() {
        langDropdown.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      }

      langBtn.addEventListener('click', toggleDropdown);

      // Close dropdown on outside click
      document.addEventListener('click', closeDropdown);

      // Close on escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDropdown();
      });
    }

    // Handle option selection
    document.querySelectorAll('[data-lang-option]').forEach(function (el) {
      function selectOption(e) {
        if (e) e.stopPropagation();
        const chosenLang = el.getAttribute('data-lang-option');
        setLanguage(chosenLang);
        if (langDropdown) {
          langDropdown.classList.remove('open');
          if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
        }
      }

      el.addEventListener('click', selectOption);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption(e);
        }
      });
    });
  }

  // ============================================================
  //  SECTION 11 – GOOGLE MAPS EMBED
  // ============================================================

  function initMapEmbed() {
    const mapIframe = document.getElementById('map-iframe');
    if (!mapIframe) return;
    const config = window.NIKA_CONFIG;
    if (config && config.integrations && config.integrations.mapsEmbedUrl) {
      mapIframe.src = config.integrations.mapsEmbedUrl;
    }
  }

  // ============================================================
  //  SECTION 12 – NAVIGATE BUTTON
  // ============================================================

  function initNavigateButtons() {
    document.querySelectorAll('[data-navigate-btn]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const query = window.NIKA_CONFIG.integrations.mapsDestinationQuery;
        const url = 'https://www.google.com/maps/dir/?api=1&destination=' + query;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
  }

  // ============================================================
  //  SECTION 13 – STATUS BADGE AUTO-REFRESH
  // ============================================================

  /**
   * Recalculates open/closed status every minute so the badge stays
   * accurate without a page reload.
   */
  function startStatusRefresh() {
    // Immediately update, then repeat every 60 s
    updateGarageStatus();
    setInterval(updateGarageStatus, 60 * 1000);
  }

  // ============================================================
  //  INIT – runs when the DOM is fully parsed
  // ============================================================

  document.addEventListener('DOMContentLoaded', function () {

    // 1. Apply the user's preferred language (or default 'pl')
    setLanguage(getCurrentLang());

    // 2. Garage open/closed badge (starts auto-refresh loop)
    startStatusRefresh();

    // 3. Today's hours in hero & location sections
    renderTodayHours();

    // 4. Vacation notice banner
    initNotice();

    // 5. Mobile hamburger navigation
    initMobileNav();

    // 6. Smooth scroll for all #anchor links
    initSmoothScroll();

    // 7. Address copy button
    initAddressCopy();

    // 8. Opening hours table
    renderHoursTable();

    // 9. Microsoft Bookings iframe
    initBookingsIframe();

    // 10. Language dropdown
    initLangDropdown();

    // 11. Google Maps embed
    initMapEmbed();

    // 12. Navigate buttons (open Google Maps directions)
    initNavigateButtons();

  });

  // ============================================================
  //  PUBLIC API  (accessible by other scripts, e.g. notice.js)
  // ============================================================
  window.NikaApp = {
    getCurrentLang: getCurrentLang,
    getTranslations: getTranslations,
    setLanguage: setLanguage,
    getGarageStatus: getGarageStatus,
    updateGarageStatus: updateGarageStatus,
    getTodayHoursText: getTodayHoursText,
    renderHoursTable: renderHoursTable,
    renderTodayHours: renderTodayHours,
    initNotice: initNotice,
    updateNotice: updateNotice,
  };

})();
