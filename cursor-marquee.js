/* ===================================================
   CURSOR MARQUEE — Osmo Supply resource, self-injecting
   Shows a small marquee "pill" that follows the cursor and
   reveals a text label when hovering a photo.

   - Explicit label: add [data-cursor-marquee-text="..."] to any element.
   - Auto-labels content photos that aren't explicitly tagged.
   - Skips: videos, logos/icons, nav/header/footer/drawer, small images,
     and anything inside [data-cursor-skip].
   - Idle state is fully hidden, so the effect only appears over photos.
   =================================================== */
(function () {
  'use strict';
  if (window.__cursorMarqueeLoaded) return;
  window.__cursorMarqueeLoaded = true;

  var DEFAULT_TEXT = 'MR BOOST®';

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById('cursor-marquee-css')) return;
    var css = `
.cursor-marquee {
  z-index: 9000; pointer-events: none;
  justify-content: center; align-items: center; display: flex;
  position: fixed; top: 0; left: 0;
  transform: translate(-50%, -50%);
}
.cursor-marquee__card {
  color: #0a0a0a; background-color: #e9e8e3;
  justify-content: center; align-items: center; display: flex;
  position: absolute; overflow: hidden;
  transition: all 0.4s cubic-bezier(.75, 0, .25, 1);
  transform: translateY(0%) rotate(0.001deg);
  clip-path: inset(calc(50% - 0.25em) round 50em);
  will-change: clip-path; opacity: 0;
  font-family: var(--body, 'Helvetica Neue', Helvetica, Arial, sans-serif);
  font-size: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.28);
}
[data-cursor-marquee-status="active"] .cursor-marquee__card {
  clip-path: inset(0 round 50em);
  transform: translateY(-25%) rotate(0.001deg);
  opacity: 1;
}
@keyframes translateXCursor { to { transform: translateX(-100%); } }
.cursor-marquee__text-span {
  white-space: nowrap; transform-origin: 0;
  padding: 0.55em 0.95em; font-size: 1em; line-height: 1;
  display: block; position: relative;
  font-weight: 600; letter-spacing: -0.005em;
  animation: translateXCursor 10s linear infinite paused;
  transition: opacity 0.15s ease-in-out 0.25s; opacity: 0;
}
[data-cursor-marquee-status="active"] .cursor-marquee__text-span {
  transition: opacity 0.15s ease-in-out 0s; opacity: 1;
}
.cursor-marquee__text-span.is--duplicate { position: absolute; left: 100%; }
@media (hover: none), (pointer: coarse) { .cursor-marquee { display: none !important; } }
`;
    var style = document.createElement('style');
    style.id = 'cursor-marquee-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- Cursor DOM ---------- */
  function injectCursor() {
    if (document.querySelector('[data-cursor-marquee-status]')) return;
    var wrap = document.createElement('div');
    wrap.className = 'cursor-marquee';
    wrap.setAttribute('data-cursor-marquee-status', '');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<div class="cursor-marquee__card">' +
      '<span data-cursor-marquee-text-target class="cursor-marquee__text-span"></span>' +
      '<span data-cursor-marquee-text-target class="cursor-marquee__text-span is--duplicate"></span>' +
      '</div>';
    document.body.appendChild(wrap);
  }

  /* ---------- Auto-tag content photos ---------- */
  var EXCLUDE_SEL = 'header, footer, nav, .header, .chrome-footer, .chrome-footer-wrap, ' +
    '.sp-drawer, .sp-fab, .navigation, .hamburger-nav, .logo-b, .logo-mark, ' +
    '[data-cursor-skip], .cursor-marquee';

  function autoTagPhotos() {
    var imgs = document.querySelectorAll('img');
    imgs.forEach(function (img) {
      if (img.closest('[data-cursor-marquee-text]')) return;   // explicit ancestor wins
      if (img.closest(EXCLUDE_SEL)) return;
      if (img.closest('video, .tile')) return;                 // skip video tiles
      var src = img.getAttribute('src') || '';
      if (/logo|icon|sprite|\.svg/i.test(src)) return;
      var w = img.offsetWidth, h = img.offsetHeight;
      if (Math.min(w, h) < 120) return;                        // skip logos / tiny imgs
      img.setAttribute('data-cursor-marquee-text', DEFAULT_TEXT);
    });
  }

  /* ---------- Osmo init ---------- */
  function initCursorMarqueeEffect() {
    var hoverOutDelay = 0.4;
    var followDuration = 0.4;
    var speedMultiplier = 5;

    var cursor = document.querySelector('[data-cursor-marquee-status]');
    if (!cursor) return;
    var targets = cursor.querySelectorAll('[data-cursor-marquee-text-target]');

    var xTo = gsap.quickTo(cursor, 'x', { duration: followDuration, ease: 'power3' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: followDuration, ease: 'power3' });

    var pauseTimeout = null;
    var activeEl = null;
    var lastX = 0;
    var lastY = 0;

    function playFor(el) {
      if (!el) return;
      if (pauseTimeout) clearTimeout(pauseTimeout);
      var text = el.getAttribute('data-cursor-marquee-text') || '';
      var sec = (text.length || 1) / speedMultiplier;
      targets.forEach(function (t) {
        t.textContent = text;
        t.style.animationPlayState = 'running';
        t.style.animationDuration = sec + 's';
      });
      cursor.setAttribute('data-cursor-marquee-status', 'active');
      activeEl = el;
    }

    function pauseLater() {
      cursor.setAttribute('data-cursor-marquee-status', 'not-active');
      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(function () {
        targets.forEach(function (t) { t.style.animationPlayState = 'paused'; });
      }, hoverOutDelay * 1000);
      activeEl = null;
    }

    function checkTarget() {
      var el = document.elementFromPoint(lastX, lastY);
      var hit = el && el.closest('[data-cursor-marquee-text]');
      if (hit !== activeEl) {
        if (activeEl) pauseLater();
        if (hit) playFor(hit);
      }
    }

    window.addEventListener('pointermove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      xTo(lastX);
      yTo(lastY);
      checkTarget();
    }, { passive: true });

    window.addEventListener('scroll', function () {
      xTo(lastX);
      yTo(lastY);
      checkTarget();
    }, { passive: true });

    setTimeout(function () {
      cursor.setAttribute('data-cursor-marquee-status', 'not-active');
    }, 500);
  }

  /* ---------- Bootstrap ---------- */
  function boot() {
    injectCSS();
    injectCursor();
    autoTagPhotos();
    setTimeout(autoTagPhotos, 1200);   // catch late-rendered images

    if (window.gsap) {
      initCursorMarqueeEffect();
    } else {
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        if (window.gsap) { clearInterval(iv); initCursorMarqueeEffect(); }
        else if (tries > 50) { clearInterval(iv); }
      }, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
