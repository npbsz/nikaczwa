/**
 * ============================================================
 *  NIKA AUTOSERWIS - SCHEDULE MODULE (js/modules/schedule.js)
 *  Weekly hours table rendering and today's schedule calculation.
 * ============================================================
 */

import { getCurrentLang, getTranslations } from './i18n.js';

let activeConfig = null;

/**
 * Returns today's opening hours as a human-readable string in the
 * current language (e.g. "08:00 - 17:00" or "Zamknięte").
 *
 * @param {Object} [cfg]
 * @returns {string}
 */
export function getTodayHoursText(cfg) {
  const config = cfg || activeConfig || window.NIKA_CONFIG || {};
  const lang = getCurrentLang();
  const t = getTranslations(lang);

  const now = new Date();
  const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
  const warsaw = new Date(warsawStr);
  const currentDay = warsaw.getDay();

  const hours = (config.business && config.business.hours) || [];
  const todayEntry = hours.find(function (entry) {
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
export function renderTodayHours() {
  const text = getTodayHoursText();
  ['today-hours-text', 'hero-today-hours'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

/**
 * Dynamically builds the opening hours table body (#hours-table-body).
 * Highlights the current day's row with class `.today-row`.
 */
export function renderHoursTable() {
  const tbody = document.getElementById('hours-table-body');
  if (!tbody) return;

  const lang = getCurrentLang();
  const t = getTranslations(lang);
  const config = activeConfig || window.NIKA_CONFIG || {};

  // Determine today's day-of-week in Warsaw time
  const now = new Date();
  const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
  const warsaw = new Date(warsawStr);
  const currentDay = warsaw.getDay();

  tbody.innerHTML = ''; // Clear existing rows

  const hours = (config.business && config.business.hours) || [];
  hours.forEach(function (entry) {
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

/**
 * Initializes the schedule module, sets up language change listener,
 * and renders both the table and today's hours.
 *
 * @param {Object} [config]
 */
export function initSchedule(config) {
  if (config) activeConfig = config;

  // Re-render when language changes
  document.addEventListener('nika:langchange', function () {
    renderTodayHours();
    renderHoursTable();
  });

  renderTodayHours();
  renderHoursTable();
}

