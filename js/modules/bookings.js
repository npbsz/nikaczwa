/**
 * ============================================================
 *  NIKA AUTOSERWIS - BOOKINGS MODULE (js/modules/bookings.js)
 *  Microsoft 365 Bookings iframe loading state, watchdog timer,
 *  and offline fallback notice.
 * ============================================================
 */

let activeConfig = null;

/**
 * Initialises the Microsoft Bookings iframe, loading overlay, error watchdog,
 * and retry functionality.
 *
 * @param {Object} [config]
 */
export function initBookings(config) {
  if (config) activeConfig = config;

  const iframe = document.getElementById('bookings-iframe');
  const overlay = document.getElementById('bookings-loading');
  const errorNotice = document.getElementById('bookings-error-notice');
  const fallbackContainer = document.querySelector('.booking-fallback');
  const fallbackBtn = document.getElementById('booking-fallback-btn');
  if (!iframe) return;

  const currentConfig = activeConfig || window.NIKA_CONFIG || {};
  const bookingsUrl = currentConfig.integrations && currentConfig.integrations.microsoftBookingsUrl;

  let loadTimeout = null;
  let isConnected = false;

  function showBookingError() {
    if (loadTimeout) clearTimeout(loadTimeout);
    if (overlay) overlay.style.display = 'none';
    iframe.style.display = 'none';
    if (errorNotice) errorNotice.hidden = false;
    if (fallbackContainer) fallbackContainer.style.display = 'none';
  }

  function showBookingSuccess() {
    if (loadTimeout) clearTimeout(loadTimeout);
    isConnected = true;
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(function () {
        overlay.style.display = 'none';
      }, 300);
    }
    iframe.style.display = 'block';
    iframe.style.opacity = '1';
    if (errorNotice) errorNotice.hidden = true;
    if (fallbackContainer) fallbackContainer.style.display = 'flex';
  }

  function attemptLoad() {
    // Check if URL is placeholder / missing / template domain
    const isUnconfigured = !bookingsUrl ||
      bookingsUrl.includes('example.com') ||
      bookingsUrl.includes('your-bookings-page');

    if (isUnconfigured) {
      showBookingError();
      return;
    }

    // Valid URL configured: setup links
    if (fallbackBtn) fallbackBtn.href = bookingsUrl;
    if (errorNotice) errorNotice.hidden = true;
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
    }
    iframe.style.display = 'block';
    iframe.style.opacity = '0';

    // Watchdog: If Microsoft takes more than 7 seconds to respond, show notice
    if (loadTimeout) clearTimeout(loadTimeout);
    loadTimeout = setTimeout(function () {
      if (!isConnected) {
        showBookingError();
      }
    }, 7000);

    // Trigger load
    iframe.src = bookingsUrl;
  }

  iframe.addEventListener('load', function () {
    showBookingSuccess();
  });

  iframe.addEventListener('error', function () {
    showBookingError();
  });

  attemptLoad();
}
