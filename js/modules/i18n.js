/**
 * ============================================================
 *  NIKA AUTOSERWIS - INTERNATIONALIZATION MODULE (js/modules/i18n.js)
 *  Language switcher, dictionary lookups, and global 'nika:langchange' event.
 * ============================================================
 */

import { translations } from '../translations.js';

const SUPPORTED_LANGS = ['pl', 'en', 'uk'];
const STORAGE_KEY = 'nika_lang';

/**
 * Returns the currently active language code.
 * Reads from localStorage; falls back to 'pl'.
 * @returns {string} 'pl' | 'en' | 'uk'
 */
export function getCurrentLang() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  return (stored && SUPPORTED_LANGS.includes(stored)) ? stored : 'pl';
}

/**
 * Returns the translations object for the given language.
 * Falls back to Polish if the language is unavailable.
 * @param {string} [lang]
 * @returns {Object}
 */
export function getTranslations(lang) {
  const activeLang = lang || getCurrentLang();
  return (translations && translations[activeLang]) || (translations && translations['pl']) || {};
}

/**
 * Updates the language-switcher dropdown button to reflect the active lang.
 * Expects a button with [data-lang-btn] and option items with [data-lang-option].
 * @param {string} lang
 * @param {Object} t translations
 */
function _updateLangDropdown(lang, t) {
  // Update the active-language button display text
  const btn = document.querySelector('[data-lang-btn]');
  if (btn) {
    const flagSpan = btn.querySelector('[data-lang-flag]');
    const labelSpan = btn.querySelector('[data-lang-label]');
    const flags = {
      pl: '<svg class="lang-flag" viewBox="0 0 640 480" width="18" height="13.5" aria-hidden="true"><g fill-rule="evenodd"><path fill="#fff" d="M640 480H0V0h640z"/><path fill="#dc143c" d="M640 480H0V240h640z"/></g></svg>',
      en: '<svg class="lang-flag" viewBox="0 0 640 480" width="18" height="13.5" aria-hidden="true"><path fill="#012169" d="M0 0h640v480H0z"/><path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/><path fill="#C8102E" d="m424 288 216 159v33L380 288h44zm-208 0-216 160v32l260-192h-44zM216 192 0 32V0l260 192h-44zm208 0L640 33V0L380 192h44z"/><path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z"/><path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z"/></svg>',
      uk: '<svg class="lang-flag" viewBox="0 0 640 480" width="18" height="13.5" aria-hidden="true"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#ffd700" d="M0 240h640v240H0z"/><path fill="#0057b7" d="M0 0h640v240H0z"/></g></svg>'
    };
    if (flagSpan && flags[lang]) flagSpan.innerHTML = flags[lang];
    if (labelSpan) {
      const text = t['lang_' + lang] || lang.toUpperCase();
      labelSpan.textContent = text;
      labelSpan.title = text;
    }
  }

  // Mark the active option
  document.querySelectorAll('[data-lang-option]').forEach(function (el) {
    const optLang = el.getAttribute('data-lang-option');
    el.classList.toggle('active', optLang === lang);
    el.setAttribute('aria-selected', optLang === lang ? 'true' : 'false');
  });
}

/**
 * Applies a language to the entire page:
 *   - Saves choice to localStorage
 *   - Updates <html lang="…">
 *   - Replaces all [data-i18n], [data-i18n-html], [data-i18n-placeholder],
 *     and [data-i18n-aria] elements
 *   - Updates language dropdown display
 *   - Dispatches 'nika:langchange' custom event to decouple dynamic components
 *
 * @param {string} lang  'pl' | 'en' | 'uk'
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'pl';

  // Persist choice
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }

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

  // --- Broadcast language change to decoupled modules ---
  document.dispatchEvent(new CustomEvent('nika:langchange', {
    detail: { lang, t }
  }));
}

/**
 * Attaches event listeners for the language selector dropdown.
 */
function initLangDropdown() {
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

/**
 * Initializes the i18n module and dropdown handlers.
 */
export function initI18n() {
  initLangDropdown();
}

