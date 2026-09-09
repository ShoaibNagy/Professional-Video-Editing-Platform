(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Theme toggle — respects saved preference, then system preference,
   * and persists whatever the person chooses explicitly.
   * ------------------------------------------------------------------ */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var STORAGE_KEY = 'videopm-theme';

  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeToggle.setAttribute('aria-pressed', 'true');
      themeToggle.querySelector('.visually-hidden').textContent = 'Switch to light theme';
    } else {
      root.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed', 'false');
      themeToggle.querySelector('.visually-hidden').textContent = 'Switch to dark theme';
    }
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  // Follow the OS setting live, but only until the person picks explicitly.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (localStorage.getItem(STORAGE_KEY)) return;
    applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeMenu() {
    mobileNav.hidden = true;
    mobileNav.removeAttribute('data-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('.visually-hidden').textContent = 'Open menu';
  }

  function openMenu() {
    mobileNav.hidden = false;
    mobileNav.setAttribute('data-open', 'true');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.querySelector('.visually-hidden').textContent = 'Close menu';
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  mobileNav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) closeMenu();
  });

  /* ------------------------------------------------------------------ *
   * Hero preview — a single, deliberate entrance: the progress bar
   * fills in on load. Skipped entirely if the person prefers reduced
   * motion, per WCAG 2.3.3.
   * ------------------------------------------------------------------ */
  var fill = document.getElementById('heroProgressFill');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TARGET_WIDTH = '66.6%'; // 4 of 6 phases

  if (prefersReducedMotion) {
    fill.style.width = TARGET_WIDTH;
  } else {
    window.requestAnimationFrame(function () {
      setTimeout(function () {
        fill.style.width = TARGET_WIDTH;
      }, 300);
    });
  }

  /* ------------------------------------------------------------------ *
   * In-page navigation — the CSS `scroll-behavior: smooth` +
   * `scroll-padding-top` rules in styles.css already handle the actual
   * smooth, header-offset-aware scroll. This just moves keyboard/screen
   * reader focus to the destination afterwards, since a scroll on its
   * own doesn't tell assistive technology the page context changed.
   * ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var id = link.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;

      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      window.setTimeout(function () {
        target.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 400);
    });
  });
})();