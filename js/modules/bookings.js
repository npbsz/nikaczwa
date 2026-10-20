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
  const retryBtn = document.getElementById('booking-retry-btn');
  const externalBtn = document.getElementById('booking-error-external-btn');
  const phoneLink = document.getElementById('booking-error-phone-link');
  const phoneDisplay = document.getElementById('booking-error-phone-display');

  if (!iframe) return;

  const currentConfig = activeConfig || window.NIKA_CONFIG || {};
  const bookingsUrl = currentConfig.integrations && currentConfig.integrations.microsoftBookingsUrl;
  const phone = (currentConfig.business && currentConfig.business.phone) || '+48606791204';
  const phoneDisp = (currentConfig.business && currentConfig.business.phoneDisplay) || '+48 606 791 204';

  if (phoneLink) phoneLink.href = 'tel:' + phone;
  if (phoneDisplay) phoneDisplay.textContent = phoneDisp;

  let loadTimeout = null;
  let isConnected = false;

  function showBookingError() {
    if (loadTimeout) clearTimeout(loadTimeout);
    if (overlay) overlay.style.display = 'none';
    iframe.style.display = 'none';
    if (errorNotice) errorNotice.style.display = 'flex';
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
    if (errorNotice) errorNotice.style.display = 'none';
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
    if (externalBtn) externalBtn.href = bookingsUrl;

    if (errorNotice) errorNotice.style.display = 'none';
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

  if (retryBtn) {
    retryBtn.addEventListener('click', function (e) {
      e.preventDefault();
      isConnected = false;
      attemptLoad();
    });
  }

  attemptLoad();
}

