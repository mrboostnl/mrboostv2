/* ===================================================
   SHARED CHROME — vanilla JS auto-injector
   Injects hamburger nav, FAB+drawer, progressive blur,
   footer (with parallax). Hooks scroll triggers.
   =================================================== */
(function () {
  'use strict';

  const CURRENT_PAGE = (() => {
    const p = location.pathname.split('/').pop() || 'index.html';
    return decodeURIComponent(p);
  })();

  const DOT_MARK_SVG = `
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="2" r="1.4" fill="currentColor" />
      <circle cx="14" cy="8" r="1.4" fill="currentColor" />
      <circle cx="8" cy="14" r="1.4" fill="currentColor" />
      <circle cx="2" cy="8" r="1.4" fill="currentColor" />
    </svg>`;

  const NAV_LINKS = [
    { href: 'index.html',      label: 'Home' },
    { href: 'playground.html', label: 'Playground' },
    { href: 'about.html',      label: 'About' },
    { href: 'contact.html',    label: 'Contact' },
  ];
  /* main-nav is now populated inside buildHeader() */

  const SERVICES = [
    'Webdesign',
    'E-commerce',
    'Branding',
    'Logo design',
    'Photography',
    'Videography',
    'Shortform',
    'Campagnes',
  ];

  /* ---------- HEADER BAR (canonical = homepage) ---------- */
  var LOGO_B_SRC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDQ4IDU2Ij4KICA8ZyBpZD0iR3JvdXBfNDk1MDIiIGRhdGEtbmFtZT0iR3JvdXAgNDk1MDIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02NzAgLTg4KSI+CiAgICA8ZyBpZD0iR3JvdXBfMjc1MiIgZGF0YS1uYW1lPSJHcm91cCAyNzUyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjAwNCAzMS4xMykiPgogICAgICA8ZyBpZD0iR3JvdXBfMjcwMiIgZGF0YS1uYW1lPSJHcm91cCAyNzAyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MjUpIj4KICAgICAgICA8ZyBpZD0iUGF0aF82NTQxNiIgZGF0YS1uYW1lPSJQYXRoIDY1NDE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDMuOTk2IDY0Ljg3KSIgZmlsbD0iI2ViZWFlNSI+CiAgICAgICAgICA8cGF0aCBkPSJNIDEuOTU4MTE3NzIzNDY0OTY2IDQ3LjQ5OTQyMzk4MDcxMjg5IEMgMS4xNTAyNzI5NjU0MzEyMTMgNDcuNDc3MTk5NTU0NDQzMzYgMC41IDQ2LjgxMzExNzk4MDk1NzAzIDAuNSA0NiBMIDAuNSAyIEMgMC41IDEuMTcyODk5OTYxNDcxNTU4IDEuMTcyODk5OTYxNDcxNTU4IDAuNSAyIDAuNSBMIDIuMDQ1MDc5OTQ2NTE3OTQ0IDAuNSBMIDIuMDg5NDQwMTA3MzQ1NTgxIDAuNDkxOTMwMDA3OTM0NTcwMyBMIDQ2LjA0MTg4MTU2MTI3OTMgLTcuNDk5NDIzMDI3MDM4NTc0IEMgNDYuODQ5NzI3NjMwNjE1MjMgLTcuNDc3MjAwNTA4MTE3Njc2IDQ3LjUgLTYuODEzMTE2NTUwNDQ1NTU3IDQ3LjUgLTYgTCA0Ny41IDM4IEMgNDcuNSAzOC44MjcwOTg4NDY0MzU1NSA0Ni44MjcwOTg4NDY0MzU1NSAzOS41IDQ2IDM5LjUgTCA0NS45NTQ5MjE3MjI0MTIxMSAzOS41IEwgNDUuOTEwNTYwNjA3OTEwMTYgMzkuNTA4MDcxODk5NDE0MDYgTCAxLjk1ODExNzcyMzQ2NDk2NiA0Ny40OTk0MjM5ODA3MTI4OSBaIiBzdHJva2U9Im5vbmUiPjwvcGF0aD4KICAgICAgICAgIDxwYXRoIGQ9Ik0gNDYuMDc0OTAxNTgwODEwNTUgLTYuOTk3MjIyOTAwMzkwNjI1IEwgMi4wOTAxNzE4MTM5NjQ4NDQgMSBMIDIgMSBDIDEuNDQ4NjAwNzY5MDQyOTY5IDEgMSAxLjQ0ODYwMDc2OTA0Mjk2OSAxIDIgTCAxIDQ2IEMgMSA0Ni41MjYxOTE3MTE0MjU3OCAxLjQwODU2NTUyMTI0MDIzNCA0Ni45NTg3NzA3NTE5NTMxMiAxLjkyNTA5ODQxOTE4OTQ1MyA0Ni45OTcyMjI5MDAzOTA2MiBMIDQ1LjkwOTgyODE4NjAzNTE2IDM5IEwgNDYgMzkgQyA0Ni41NTEzOTkyMzA5NTcwMyAzOSA0NyAzOC41NTEzOTkyMzA5NTcwMyA0NyAzOCBMIDQ3IC02IEMgNDcgLTYuNTI2MTkxNzExNDI1NzgxIDQ2LjU5MTQzODI5MzQ1NzAzIC02Ljk1ODc3MDc1MTk1MzEyNSA0Ni4wNzQ5MDE1ODA4MTA1NSAtNi45OTcyMjI5MDAzOTA2MjUgTSA0NiAtOCBDIDQ3LjEwNDU2ODQ4MTQ0NTMxIC04IDQ4IC03LjEwNDU2ODQ4MTQ0NTMxMiA0OCAtNiBMIDQ4IDM4IEMgNDggMzkuMTA0NTY4NDgxNDQ1MzEgNDcuMTA0NTY4NDgxNDQ1MzEgNDAgNDYgNDAgTCAyIDQ4IEMgMC44OTU0MzE1MTg1NTQ2ODc1IDQ4IDAgNDcuMTA0NTY4NDgxNDQ1MzEgMCA0NiBMIDAgMiBDIDAgMC44OTU0MzE1MTg1NTQ2ODc1IDAuODk1NDMxNTE4NTU0Njg3NSAwIDIgMCBMIDQ2IC04IFoiIHN0cm9rZT0ibm9uZSIgZmlsbD0iI2NhYzRiOCI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgICAgICA8cGF0aCBpZD0iUGF0aF8zNTMwNCIgZGF0YS1uYW1lPSJQYXRoIDM1MzA0IiBkPSJNMjMuMTU1LDM4Ni42NTZhOS4wNDgsOS4wNDgsMCwwLDAtMy4zNjUtLjg0NiwyMS4xNzYsMjEuMTc2LDAsMCwwLTUuMjUyLjM3OUwyLjUyOSwzODguMywwLDQxNi42bDE0LjY0Ni0yLjU2N2EyNC4yODcsMjQuMjg3LDAsMCwwLDUuODc0LTEuNjkyLDExLjg2NCwxMS44NjQsMCwwLDAsMy42NzYtMi40NTEsNi44OTMsNi44OTMsMCwwLDAsMS43Ni0yLjk1Niw3LjQsNy40LDAsMCwwLC4xNDYtMy4yNjgsNC45MTMsNC45MTMsMCwwLDAtMS43Ni0zLjEyMiw2LjE5NCw2LjE5NCwwLDAsMC0zLjM5NC0xLjI4NGwtMS4yMDYtLjEsMS4xLS41YTguODksOC44OSwwLDAsMCw0LjIyMS0zLjUxMSw2LjYzNyw2LjYzNywwLDAsMCwuODI3LTQuNTYxLDYuMzc0LDYuMzc0LDAsMCwwLS44NTYtMi4yNTZBNC41LDQuNSwwLDAsMCwyMy4xNTUsMzg2LjY1NlptLTYuNjEzLDE5LjczMmE0LjkzOCw0LjkzOCwwLDAsMS0yLjY5NCwxLjIyNWwtNC44NjMuODU2LjQ0Ny00Ljk1LDQuMjMtLjczOWMyLjE2OS0uMzc5LDMuMzk0LjExNywzLjYyNywxLjQ3OEEyLjM2NCwyLjM2NCwwLDAsMSwxNi41NDIsNDA2LjM4OFptLjcxLTEwLjIzMWE0LjQ0NSw0LjQ0NSwwLDAsMS0yLjY3NCwxLjIzNWwtNC42NjguODE3LjQwOC00LjcsNC4wNzUtLjcyYTQuOTQ1LDQuOTQ1LDAsMCwxLDIuMzkyLjAxLDEuNjc3LDEuNjc3LDAsMCwxLDEuMSwxLjM3MUEyLjMzOCwyLjMzOCwwLDAsMSwxNy4yNTIsMzk2LjE1N1oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1NC44ODcgLTMxNi40NjkpIiBmaWxsPSIjMTMxMzEzIj48L3BhdGg+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==";
  var STORY_STAR_SVG = "<svg class=\"story-star\" viewBox=\"0 0 29.705 29.161\" aria-hidden=\"true\">\n        <path d=\"M14.23.591a.6.6,0,0,1,.206-.443.66.66,0,0,1,.832,0,.6.6,0,0,1,.206.443l.508,9.726a.615.615,0,0,0,.127.349.635.635,0,0,0,.625.23.615.615,0,0,0,.323-.183l6.7-7.082a.6.6,0,0,1,.444-.2.661.661,0,0,1,.633.541.6.6,0,0,1-.131.471l-5.9,7.676a.615.615,0,0,0-.13.35.635.635,0,0,0,.332.582.615.615,0,0,0,.368.066l9.625-1.172a.6.6,0,0,1,.472.127.661.661,0,0,1,.142.821.6.6,0,0,1-.4.278L19.784,15.3a.615.615,0,0,0-.325.187.635.635,0,0,0-.115.661.615.615,0,0,0,.242.285l8.152,5.192a.6.6,0,0,1,.284.4.661.661,0,0,1-.411.724.6.6,0,0,1-.487-.04l-8.694-4.366a.615.615,0,0,0-.367-.062.635.635,0,0,0-.509.432.615.615,0,0,0,0,.372l2.894,9.268a.6.6,0,0,1-.039.487.66.66,0,0,1-.781.289.6.6,0,0,1-.347-.344L15.425,19.82a.615.615,0,0,0-.24-.282.635.635,0,0,0-.665,0,.615.615,0,0,0-.24.282l-3.858,8.961a.6.6,0,0,1-.347.344.66.66,0,0,1-.781-.289.6.6,0,0,1-.039-.487l2.894-9.268a.615.615,0,0,0,0-.372.635.635,0,0,0-.509-.432.615.615,0,0,0-.367.062L2.58,22.7a.6.6,0,0,1-.487.04.661.661,0,0,1-.411-.724.6.6,0,0,1,.284-.4l8.152-5.192a.615.615,0,0,0,.242-.285.635.635,0,0,0-.115-.661A.615.615,0,0,0,9.92,15.3L.487,13.166a.6.6,0,0,1-.4-.278.661.661,0,0,1,.142-.821A.6.6,0,0,1,.7,11.94l9.625,1.172a.615.615,0,0,0,.368-.066.635.635,0,0,0,.332-.582.615.615,0,0,0-.13-.35L5,4.438a.6.6,0,0,1-.131-.471A.661.661,0,0,1,5.5,3.427a.6.6,0,0,1,.444.2l6.7,7.082a.615.615,0,0,0,.323.183.635.635,0,0,0,.625-.23.615.615,0,0,0,.127-.349Z\" fill=\"currentColor\" />\n      </svg>";
  function buildHeader() {
    if (document.querySelector('.header')) return null;
    var header = document.createElement('header');
    header.className = 'header';
    var navHtml = NAV_LINKS.map(function (l) {
      return '<a href="' + l.href + '"' + (l.href === CURRENT_PAGE ? ' class="active"' : '') + '>' + l.label + '</a>';
    }).join('');
    header.innerHTML =
      '<div class="header-left">' +
        '<div class="story-badge">' + "<svg class=\"ring-svg\" viewBox=\"0 0 50 50\" aria-hidden=\"true\"><circle class=\"ring-track\" cx=\"25\" cy=\"25\" r=\"23.75\"></circle><circle class=\"ring-progress\" cx=\"25\" cy=\"25\" r=\"23.75\"></circle></svg>" + STORY_STAR_SVG + '</div>' +
        '<div class="story-text" aria-live="polite">' + "<div class=\"story-line is-active\"><span class=\"t1\">Web &amp; Branding</span><span class=\"t2\">Experts</span></div><div class=\"story-line\"><span class=\"t1\">Foto &amp; Video</span><span class=\"t2\">Productie</span></div><div class=\"story-line\"><span class=\"t1\">1.000.000</span><span class=\"t2\">Bereik p/m</span></div><div class=\"story-line\"><span class=\"t1\">70.000+</span><span class=\"t2\">Followers</span></div><div class=\"story-line\"><span class=\"t1\">11 Years</span><span class=\"t2\">Experience</span></div>" + '</div>' +
      '</div>' +
      '<div class="header-center"><a href="index.html" class="logo-b" aria-label="Mr Boost — home"><img src="' + LOGO_B_SRC + '" alt="Mr Boost"></a></div>' +
      '<nav class="main-nav">' + navHtml + '</nav>';
    document.body.insertBefore(header, document.body.firstChild);
    return header;
  }

  /* ---------- STORY TICKER ---------- */
  function startStoryTicker() {
    function start() {
      var lines = [].slice.call(document.querySelectorAll('.story-line'));
      var ring = document.querySelector('.ring-progress');
      if (!lines.length || !ring) return false;
      var idx = lines.findIndex(function (l) { return l.classList.contains('is-active'); });
      if (idx < 0) { idx = 0; lines[0].classList.add('is-active'); }
      var DURATION = 4500; var anim = null;
      function play() {
        if (anim) { try { anim.cancel(); } catch (e) {} }
        anim = ring.animate([{ strokeDashoffset: 149.23 }, { strokeDashoffset: 0 }], { duration: DURATION, easing: 'linear', fill: 'forwards' });
        anim.onfinish = next;
      }
      function next() {
        var cur = lines[idx];
        cur.classList.remove('is-active'); cur.classList.add('is-leaving');
        setTimeout(function () { cur.classList.remove('is-leaving'); }, 650);
        idx = (idx + 1) % lines.length;
        lines[idx].classList.add('is-active');
        play();
      }
      play(); return true;
    }
    if (start()) return;
    var tries = 0;
    var retry = function () { if (start() || ++tries > 600) return; requestAnimationFrame(retry); };
    requestAnimationFrame(retry);
  }

  /* ---------- HAMBURGER NAV ---------- */
  function buildHamburger() {
    const nav = document.createElement('nav');
    nav.className = 'navigation';
    nav.setAttribute('data-navigation-status', 'not-active');
    nav.setAttribute('aria-label', 'Hoofdmenu');
    const liItems = NAV_LINKS.map(({ href, label }) => {
      const isCurrent = CURRENT_PAGE === href;
      const cur = isCurrent ? ' aria-current="page"' : '';
      return `
        <div class="hamburger-nav__li">
          <a href="${href}" class="hamburger-nav__a"${cur}>
            <p class="hamburger-nav__p">${label}</p>
            <div class="hamburger-nav__dot"></div>
          </a>
        </div>`;
    }).join('');
    nav.innerHTML = `
      <div data-navigation-toggle="close" class="navigation__dark-bg"></div>
      <div class="hamburger-nav">
        <div class="hamburger-nav__bg"></div>
        <div class="hamburger-nav__group">
          <p class="hamburger-nav__menu-p">Menu</p>
          <ul class="hamburger-nav__ul">${liItems}</ul>
        </div>
        <div
          data-navigation-toggle="toggle"
          class="hamburger-nav__toggle"
          role="button"
          tabindex="0"
          aria-label="Open menu"
          aria-expanded="false"
        >
          <div class="hamburger-nav__toggle-bar"></div>
          <div class="hamburger-nav__toggle-bar"></div>
        </div>
      </div>`;
    document.body.appendChild(nav);

    const toggleEl = nav.querySelector('[data-navigation-toggle="toggle"]');
    const closeEl = nav.querySelector('[data-navigation-toggle="close"]');
    const setStatus = (status) => {
      nav.setAttribute('data-navigation-status', status);
      const active = status === 'active';
      toggleEl.setAttribute('aria-expanded', active ? 'true' : 'false');
      toggleEl.setAttribute('aria-label', active ? 'Sluit menu' : 'Open menu');
    };
    const toggle = () =>
      setStatus(nav.getAttribute('data-navigation-status') === 'active' ? 'not-active' : 'active');
    const close = () => setStatus('not-active');
    toggleEl.addEventListener('click', toggle);
    toggleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    closeEl.addEventListener('click', close);
    nav.querySelectorAll('.hamburger-nav__a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    return nav;
  }

  /* ---------- START BOOST SCAN FAB ----------
     Links straight to the multi-step Boost Scan page. The old slide-in
     project form has been retired in favour of boost-scan.html. */
  function buildFAB() {
    const qs = window.location.search || '';
    const fab = document.createElement('a');
    fab.href = 'boost-scan.html' + qs;
    fab.className = 'sp-fab';
    fab.setAttribute('aria-label', 'Start Boost Scan');
    fab.innerHTML = `Start Boost Scan <span class="sp-fab__dot-mark">${DOT_MARK_SVG}</span>`;
    document.body.appendChild(fab);

    // Scroll-driven visibility
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const scrolled = (window.scrollY || 0) > 80;
        fab.classList.toggle('is-visible', scrolled);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return { fab };
  }

  /* ---------- HAMBURGER SCROLL VISIBILITY ---------- */
  function bindHamburgerVisibility(nav) {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        var _scrolled = (window.scrollY || 0) > 80;
        nav.classList.toggle('is-visible', _scrolled);
        var _mn = document.querySelector('.main-nav');
        if (_mn) _mn.classList.toggle('is-collapsed', _scrolled);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- PROGRESSIVE BLUR ---------- */
  function buildProgressiveBlur() {
    if (document.querySelector('.progressive-blur')) return null;
    const wrap = document.createElement('div');
    wrap.className = 'progressive-blur';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="progressive-blur__layer is--3"></div>
      <div class="progressive-blur__layer is--5"></div>`;
    document.body.appendChild(wrap);
    (function(){
      var cmBtn = wrap.querySelector('[data-copy-mail]');
      if (!cmBtn) return;
      cmBtn.addEventListener('click', function () {
        var mail = cmBtn.getAttribute('data-copy-mail');
        var label = cmBtn.querySelector('.cfm-label');
        function done(){
          cmBtn.setAttribute('data-copied', 'true');
          if (label) label.textContent = 'Gekopieerd!';
          cmBtn.setAttribute('aria-label', 'E-mailadres gekopieerd');
          clearTimeout(cmBtn._cmT);
          cmBtn._cmT = setTimeout(function () {
            cmBtn.removeAttribute('data-copied');
            if (label) label.textContent = 'Copy mail';
            cmBtn.setAttribute('aria-label', 'Kopieer e-mailadres');
          }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(mail).then(done).catch(done);
        } else {
          var ta = document.createElement('textarea'); ta.value = mail;
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          ta.remove(); done();
        }
      });
    })();
    return wrap;
  }

  /* ---------- FOOTER ---------- */
  function buildFooter() {
    // Skip if a custom footer-wrap already exists (e.g. on index.html)
    if (document.querySelector('[data-footer-parallax]') ||
        document.querySelector('[data-chrome-footer]')) return null;
    const wrap = document.createElement('div');
    wrap.setAttribute('data-chrome-footer', '');
    wrap.setAttribute('data-footer-parallax', '');
    wrap.className = 'chrome-footer-wrap';
    const pageLinks = NAV_LINKS
      .map(({ href, label }) => `<a href="${href}">${label === 'Portfolio' ? 'Cases' : label === 'About' ? 'Over ons' : label}</a>`)
      .join('');
    wrap.innerHTML = `
      <footer data-footer-parallax-inner class="chrome-footer" data-screen-label="99 Footer">
        <div class="chrome-footer-grid">
          <div class="chrome-footer-col chrome-footer-col--contact">
            <p class="chrome-footer-col__eyebrow">Contact</p>
            <div class="chrome-footer-contact-stack">
              <a class="chrome-footer-contact-link" href="mailto:mail@mrboost.nl">mail@mrboost.nl</a>
              <a class="chrome-footer-contact-link" href="tel:+31637344570">06 37 34 45 70</a>
            </div>
          </div>
          <div class="chrome-footer-col">
            <p class="chrome-footer-col__eyebrow">Pagina's</p>
            <div class="chrome-footer-col__links">${pageLinks}</div>
          </div>
          <div class="chrome-footer-col">
            <p class="chrome-footer-col__eyebrow">Socials</p>
            <div class="chrome-footer-col__links">
              <a href="#">Instagram</a>
              <a href="https://www.tiktok.com/@themrboost" target="_blank" rel="noopener">TikTok</a>
              <a href="#">LinkedIn</a>
              <a href="https://www.youtube.com/@Mr-Boost/videos" target="_blank" rel="noopener">YouTube</a>
            </div>
          </div>
        </div>
        <div class="chrome-footer-meta">
          <span class="chrome-footer-meta__copy">© 2026 Mr Boost</span>
          
        </div>
        <div class="chrome-footer-wordmark" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 2164.824 518.642"><path id="Path_65589" data-name="Path 65589" d="M150.612-228.337V-344.285H252.674a158.923,158.923,0,0,1,28.119,2.43,70.236,70.236,0,0,1,23.953,8.679,46.225,46.225,0,0,1,16.663,17.357q6.249,11.109,6.249,28.466,0,31.243-18.746,45.129t-47.907,13.886Zm-109-200.652V66.74H281.834a253.485,253.485,0,0,0,64.917-8.332A173.588,173.588,0,0,0,402.99,32.719a126.511,126.511,0,0,0,39.228-44.782Q456.8-39.488,456.8-76.98q0-46.518-22.565-79.5t-68.388-46.171q33.326-15.969,50.337-40.964t17.01-62.487q0-34.715-11.456-58.321a95.259,95.259,0,0,0-32.285-37.839q-20.829-14.233-49.99-20.482t-64.57-6.249Zm109,411.025V-154.047H269.337q35.409,0,56.933,16.316t21.523,54.5q0,19.44-6.6,31.938a52.411,52.411,0,0,1-17.7,19.788A74.966,74.966,0,0,1,297.8-21.089a145.468,145.468,0,0,1-30.549,3.124ZM562.331-179.042a271.267,271.267,0,0,1,7.29-63.181q7.29-30.549,23.259-54.5a117.985,117.985,0,0,1,41.658-38.186q25.689-14.233,62.487-14.233t62.487,14.233a117.984,117.984,0,0,1,41.658,38.186q15.969,23.953,23.259,54.5a271.267,271.267,0,0,1,7.29,63.181,252.351,252.351,0,0,1-7.29,60.751A164.182,164.182,0,0,1,801.17-65.177a119.211,119.211,0,0,1-41.658,37.839Q733.823-13.1,697.025-13.1T634.538-27.338A119.212,119.212,0,0,1,592.88-65.177a164.182,164.182,0,0,1-23.259-53.114A252.351,252.351,0,0,1,562.331-179.042Zm-109,0q0,54.155,16.663,101.021T517.9,3.558q31.243,34.715,76.72,54.5T697.025,77.848q57.627,0,102.756-19.788t76.373-54.5q31.243-34.715,47.907-81.58t16.663-101.021q0-55.544-16.663-103.1t-47.907-82.969q-31.243-35.409-76.373-55.544T697.025-440.793q-56.933,0-102.409,20.135T517.9-365.114q-31.243,35.409-47.907,82.969T453.326-179.042Zm593.626,0a271.267,271.267,0,0,1,7.29-63.181q7.29-30.549,23.259-54.5a117.983,117.983,0,0,1,41.658-38.186q25.689-14.233,62.487-14.233t62.487,14.233a117.984,117.984,0,0,1,41.658,38.186q15.969,23.953,23.259,54.5a271.261,271.261,0,0,1,7.29,63.181,252.345,252.345,0,0,1-7.29,60.751,164.182,164.182,0,0,1-23.259,53.114,119.211,119.211,0,0,1-41.658,37.839Q1218.444-13.1,1181.646-13.1t-62.487-14.233A119.209,119.209,0,0,1,1077.5-65.177a164.179,164.179,0,0,1-23.259-53.114A252.351,252.351,0,0,1,1046.952-179.042Zm-109,0q0,54.155,16.663,101.021t47.907,81.58q31.243,34.715,76.72,54.5t102.409,19.788q57.627,0,102.756-19.788t76.373-54.5q31.243-34.715,47.907-81.58t16.663-101.021q0-55.544-16.663-103.1t-47.907-82.969q-31.243-35.409-76.373-55.544t-102.756-20.135q-56.933,0-102.409,20.135t-76.72,55.544q-31.243,35.409-47.907,82.969T937.947-179.042Zm580.434,81.233H1412.848q-.694,45.824,16.663,79.15a156.049,156.049,0,0,0,46.865,54.85q29.508,21.523,68.041,31.591a313.2,313.2,0,0,0,79.5,10.067q50.684,0,89.217-11.8t64.57-32.979a137.257,137.257,0,0,0,39.228-50.337q13.192-29.161,13.192-63.181,0-41.658-17.7-68.388t-42.005-42.7q-24.3-15.969-48.948-23.259t-38.534-10.067q-46.518-11.8-75.331-19.44t-45.13-15.275q-16.316-7.637-21.87-16.663t-5.554-23.606q0-15.969,6.943-26.383a60.3,60.3,0,0,1,17.7-17.357,70.577,70.577,0,0,1,23.953-9.72,127.75,127.75,0,0,1,26.383-2.777,185.925,185.925,0,0,1,37.145,3.471,89.527,89.527,0,0,1,30.2,11.8,61.335,61.335,0,0,1,21.176,22.912q7.984,14.58,9.373,36.8h105.533q0-43.047-16.316-73.249A142.246,142.246,0,0,0,1753.054-404q-27.772-19.44-63.528-28.119a315.378,315.378,0,0,0-74.637-8.679,254,254,0,0,0-66.653,9.026A186.084,186.084,0,0,0,1488.526-404a147.838,147.838,0,0,0-42.7,46.865q-16.316,28.119-16.316,66.306,0,34.021,12.844,57.974a122.615,122.615,0,0,0,33.674,39.922,186.066,186.066,0,0,0,47.212,26.036,474.713,474.713,0,0,0,54.155,17.01q27.078,7.637,53.461,13.886a336.078,336.078,0,0,1,47.212,14.58q20.829,8.332,33.673,20.829t12.845,32.632q0,18.746-9.72,30.9a68.166,68.166,0,0,1-24.3,19.093,108.709,108.709,0,0,1-31.244,9.373,217.153,217.153,0,0,1-31.243,2.43,165.705,165.705,0,0,1-41.658-5.207,103.692,103.692,0,0,1-35.062-15.969,78.87,78.87,0,0,1-23.953-28.119Q1518.381-72.814,1518.381-97.809Zm430.465-239.533V66.74h109.005V-337.342h148.58V-428.99H1800.267v91.647Z" transform="translate(-41.607 440.793)"></path></svg></div>
      </footer>
      <div data-footer-parallax-dark class="chrome-footer-wrap__dark"></div>`;
    // Append to end of body so it sits after all page content
    document.body.appendChild(wrap);
    (function(){
      var cmBtn = wrap.querySelector('[data-copy-mail]');
      if (!cmBtn) return;
      cmBtn.addEventListener('click', function () {
        var mail = cmBtn.getAttribute('data-copy-mail');
        var label = cmBtn.querySelector('.cfm-label');
        function done(){
          cmBtn.setAttribute('data-copied', 'true');
          if (label) label.textContent = 'Gekopieerd!';
          cmBtn.setAttribute('aria-label', 'E-mailadres gekopieerd');
          clearTimeout(cmBtn._cmT);
          cmBtn._cmT = setTimeout(function () {
            cmBtn.removeAttribute('data-copied');
            if (label) label.textContent = 'Copy mail';
            cmBtn.setAttribute('aria-label', 'Kopieer e-mailadres');
          }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(mail).then(done).catch(done);
        } else {
          var ta = document.createElement('textarea'); ta.value = mail;
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          ta.remove(); done();
        }
      });
    })();
    return wrap;
  }

  /* ---------- FOOTER PARALLAX + BLUR HIDE WHEN VISIBLE ---------- */
  function setupFooterScroll() {
    const footer = document.querySelector('[data-footer-parallax]');
    const blur = document.querySelector('.progressive-blur');
    if (!footer) return;
    // IntersectionObserver: hide blur + FAB when footer visible
    const io = new IntersectionObserver((entries) => {
      const inView = entries.some((e) => e.isIntersecting);
      document.body.classList.toggle('is-footer-visible', inView);
      if (blur) blur.classList.toggle('is-hidden', inView);
    }, { threshold: 0.05 });
    io.observe(footer);
    // GSAP parallax scrub
    if (window.gsap && window.ScrollTrigger) {
      const inner = footer.querySelector('[data-footer-parallax-inner]');
      const dark = footer.querySelector('[data-footer-parallax-dark]');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: 'clamp(top bottom)',
          end: 'clamp(top top)',
          scrub: true,
        },
      });
      if (inner) tl.from(inner, { yPercent: -25, ease: 'linear' });
      if (dark) tl.from(dark, { opacity: 0.5, ease: 'linear' }, '<');
    }
  }

  /* ---------- RELIABLE NAV (header logo, hamburger links, footer links) ----------
     The per-page crossfade handlers intercept link clicks but fail to navigate on
     some subpages/mobile. We bind a direct, synchronous navigation on every chrome
     link so menu items + the logo ALWAYS go to their page. Query string (preview
     token) is preserved, exactly like the page handlers do. */
  function chromeNavigate(href) {
    if (!href) return;
    var qs = window.location.search;
    var dest = href;
    if (qs && href.indexOf('?') === -1) {
      var hi = href.indexOf('#');
      dest = hi === -1 ? href + qs : href.slice(0, hi) + qs + href.slice(hi);
    }
    window.location.href = dest;
  }
  function wireChromeNav() {
    var sel = '.hamburger-nav__a, a.logo-b, .main-nav a, .chrome-footer-col__links a';
    document.querySelectorAll(sel).forEach(function (a) {
      if (a.__chromeNavBound) return;
      a.__chromeNavBound = true;
      a.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var href = a.getAttribute('href');
        if (!href || /^(https?:|mailto:|tel:|#|\/\/)/i.test(href)) return;
        e.preventDefault();
        chromeNavigate(href);
      });
    });
  }

  /* ---------- PIN BLUR TO THE *VISIBLE* VIEWPORT BOTTOM (iOS Safari) ----------
     position:fixed; bottom:0 anchors to the layout viewport, whose bottom on iOS
     sits behind the dynamic toolbar — leaving a strip of sharp content above the
     bar. We translate the blur down/up so its bottom edge always tracks the truly
     visible bottom (window.visualViewport). No-op on desktop (offset = 0). */
  function pinProgressiveBlur() {
    const blur = document.querySelector('.progressive-blur');
    const vv = window.visualViewport;
    if (!blur || !vv) return;
    let raf = 0;
    function apply() {
      raf = 0;
      // visible bottom (in layout-viewport coords) minus layout height.
      // negative when the toolbar/keyboard shrinks the visible area.
      const offset = (vv.height + vv.offsetTop) - window.innerHeight;
      blur.style.transform = 'translate3d(0,' + offset + 'px,0)';
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(apply); }
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    apply();
  }

  /* ---------- BOOTSTRAP ---------- */
  function start() {
    document.body.classList.add('has-chrome');
    buildHeader();
    startStoryTicker();
    const nav = buildHamburger();
    bindHamburgerVisibility(nav);
    buildFAB();
    buildProgressiveBlur();
    buildFooter();
    wireChromeNav();
    // Defer to next frame so DOM/GSAP are settled
    requestAnimationFrame(() => {
      wireChromeNav();
      setupFooterScroll();
      pinProgressiveBlur();
      // If GSAP is still loading, retry once
      if (!window.gsap || !window.ScrollTrigger) {
        setTimeout(setupFooterScroll, 500);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
