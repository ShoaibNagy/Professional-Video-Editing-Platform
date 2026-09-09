(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Theme toggle — identical logic to the Landing Page, kept in sync.
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

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (localStorage.getItem(STORAGE_KEY)) return;
    applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ------------------------------------------------------------------ *
   * Password visibility toggle
   * ------------------------------------------------------------------ */
  var passwordInput = document.getElementById('password');
  var passwordToggle = document.getElementById('passwordToggle');

  passwordToggle.addEventListener('click', function () {
    var isVisible = passwordInput.type === 'text';
    passwordInput.type = isVisible ? 'password' : 'text';
    passwordToggle.setAttribute('aria-pressed', String(!isVisible));
    passwordToggle.querySelector('.visually-hidden').textContent = isVisible ? 'Show password' : 'Hide password';
    passwordInput.focus();
  });

  /* ------------------------------------------------------------------ *
   * Form validation — no backend exists yet, so a valid submission
   * shows an honest status message rather than pretending to log in.
   * Errors are associated to their field via aria-describedby (already
   * in the markup) and aria-invalid is toggled so assistive tech
   * announces the state, per WCAG 3.3.1.
   * ------------------------------------------------------------------ */
  var form = document.getElementById('loginForm');
  var emailInput = document.getElementById('email');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');
  var formStatus = document.getElementById('formStatus');

  function setFieldError(input, errorEl, message) {
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function showStatus(message, tone) {
    formStatus.textContent = message;
    formStatus.hidden = false;
    formStatus.setAttribute('data-tone', tone);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailValid = emailInput.value.trim() !== '' && emailInput.checkValidity();
    var passwordValid = passwordInput.value.trim() !== '';

    setFieldError(emailInput, emailError, emailValid ? '' : 'Enter a valid email address.');
    setFieldError(passwordInput, passwordError, passwordValid ? '' : 'Enter your password.');

    if (!emailValid || !passwordValid) {
      showStatus('Check the highlighted fields below and try again.', 'error');
      (emailValid ? passwordInput : emailInput).focus();
      return;
    }

    showStatus(
      'Looks good \u2014 this is a design prototype, so there\u2019s no live backend to log in to yet.',
      'success'
    );
  });

  // Clear a field's error as soon as the person starts fixing it.
  emailInput.addEventListener('input', function () {
    if (emailInput.getAttribute('aria-invalid') === 'true' && emailInput.checkValidity()) {
      setFieldError(emailInput, emailError, '');
    }
  });
  passwordInput.addEventListener('input', function () {
    if (passwordInput.getAttribute('aria-invalid') === 'true' && passwordInput.value.trim() !== '') {
      setFieldError(passwordInput, passwordError, '');
    }
  });
})();