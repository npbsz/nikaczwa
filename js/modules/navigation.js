/**
 * ============================================================
 *  NIKA AUTOSERWIS - NAVIGATION MODULE (js/modules/navigation.js)
 *  Mobile hamburger menu toggle and offset smooth scrolling.
 * ============================================================
 */

const HEADER_OFFSET = 80; // px – header height compensation

/**
 * Initializes mobile hamburger menu open/close behavior.
 */
export function initMobileNav() {
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

/**
 * Initializes smooth scrolling with sticky header offset compensation.
 */
export function initSmoothScroll() {
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

/**
 * Initializes all navigation features (mobile nav and smooth scrolling).
 */
export function initNavigation() {
  initMobileNav();
  initSmoothScroll();
}

