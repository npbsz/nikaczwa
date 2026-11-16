/**
 * ============================================================
 *  NIKA AUTOSERWIS - BRANDS SWIPER MODULE (js/modules/swiper.js)
 *  Native, dependency-free carousel for partner logos.
 * ============================================================
 */

const LOGOS = [
  { file: 'filtron-1.svg', alt: 'Filtron logo' },
  { file: 'hengst-filtration-logo-2020.svg', alt: 'Hengst Filtration logo' },
  { file: 'liqui-moly-1.svg', alt: 'Liqui Moly logo' },
  { file: 'logo-hart_5d9aee0c948023_94441528.webp', alt: 'Hart logo' },
  { file: 'motul-logo-1.svg', alt: 'Motul logo' },
  { file: 'textar-3.svg', alt: 'Textar logo' }
];

const AUTOPLAY_DELAY = 4000;

function getVisibleSlides() {
  if (window.matchMedia('(max-width: 575px)').matches) return 2;
  if (window.matchMedia('(max-width: 900px)').matches) return 3;
  return 4;
}

function createSlides(track, logos, isClone) {
  logos.forEach(function (logo) {
    const slide = document.createElement('li');
    slide.className = 'swiper-slide' + (isClone ? ' swiper-slide--clone' : '');
    if (isClone) slide.setAttribute('aria-hidden', 'true');

    const image = document.createElement('img');
    image.src = 'assets/logos/' + logo.file;
    image.alt = logo.alt;
    image.loading = 'lazy';
    if (isClone) image.setAttribute('aria-hidden', 'true');

    slide.appendChild(image);
    track.appendChild(slide);
  });
}

function updatePosition(track, index, visibleSlides) {
  const slides = track.querySelectorAll('.swiper-slide');
  if (!slides.length) return;

  const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
  const slideWidth = slides[0].getBoundingClientRect().width;
  track.style.transform = 'translateX(-' + (index * (slideWidth + gap)) + 'px)';
  track.setAttribute('data-position', String(index));
  track.setAttribute('aria-label', 'Partner logo ' + (Math.min(index, LOGOS.length - 1) + 1) + ' of ' + LOGOS.length);
}

export function initSwiper() {
  const swiper = document.querySelector('[data-swiper="brands"]');
  if (!swiper) return;

  const track = swiper.querySelector('.swiper-wrapper');
  if (!track) return;

  createSlides(track, LOGOS, false);
  createSlides(track, LOGOS, true);

  let index = 0;
  let visibleSlides = getVisibleSlides();
  let timer = null;
  let paused = false;

  function render() {
    visibleSlides = Math.min(getVisibleSlides(), LOGOS.length);
    index = index % LOGOS.length;
    updatePosition(track, index, visibleSlides);
  }

  function resetToFirstSlide() {
    track.style.transition = 'none';
    index = 0;
    updatePosition(track, index, visibleSlides);
    track.offsetHeight;
    track.style.transition = '';
  }

  function stopAutoplay() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    timer = window.setInterval(function () {
      index += 1;
      updatePosition(track, index, visibleSlides);

      if (index === LOGOS.length) {
        window.setTimeout(resetToFirstSlide, 420);
      }
    }, AUTOPLAY_DELAY);
  }

  function setPaused(value) {
    paused = value;
    if (paused) stopAutoplay();
    else startAutoplay();
  }

  swiper.addEventListener('mouseenter', function () { setPaused(true); });
  swiper.addEventListener('mouseleave', function () { setPaused(false); });
  swiper.addEventListener('focusin', function () { setPaused(true); });
  swiper.addEventListener('focusout', function (event) {
    if (!swiper.contains(event.relatedTarget)) setPaused(false);
  });
  document.addEventListener('visibilitychange', function () {
    setPaused(document.hidden);
  });
  window.addEventListener('resize', render);

  render();
  startAutoplay();
}

if (typeof window !== 'undefined') {
  window.NikaSwiper = { init: initSwiper };
}
