(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Theme toggle — identical logic across all three pages.
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
   * Live password requirements
   * Each <li data-rule="..."> is checked as the person types. The
   * visually-hidden "Not yet met:" / "Met:" prefix keeps the state
   * available to screen readers on demand without forcing a live
   * announcement on every keystroke, which would be noisy.
   * ------------------------------------------------------------------ */
  var requirementItems = document.querySelectorAll('.password-requirements li');
  var rules = {
    length: function (value) { return value.length >= 8; },
    number: function (value) { return /\d/.test(value); },
  };

  function updateRequirements() {
    var value = passwordInput.value;
    requirementItems.forEach(function (item) {
      var rule = item.getAttribute('data-rule');
      var met = rules[rule] ? rules[rule](value) : false;
      item.setAttribute('data-met', String(met));
      item.querySelector('.visually-hidden').textContent = met ? 'Met: ' : 'Not yet met: ';
    });
  }

  function passwordMeetsAllRules() {
    return Object.keys(rules).every(function (rule) { return rules[rule](passwordInput.value); });
  }

  passwordInput.addEventListener('input', updateRequirements);

  /* ------------------------------------------------------------------ *
   * Form validation
   * ------------------------------------------------------------------ */
  var form = document.getElementById('registerForm');
  var fullNameInput = document.getElementById('fullName');
  var emailInput = document.getElementById('email');
  var teamNameInput = document.getElementById('teamName');
  var termsInput = document.getElementById('terms');
  var formStatus = document.getElementById('formStatus');

  var errors = {
    fullName: document.getElementById('fullNameError'),
    email: document.getElementById('emailError'),
    teamName: document.getElementById('teamNameError'),
    password: document.getElementById('passwordError'),
    terms: document.getElementById('termsError'),
  };

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

    var checks = [
      { input: fullNameInput, error: errors.fullName, valid: fullNameInput.value.trim() !== '', message: 'Enter your full name.' },
      { input: emailInput, error: errors.email, valid: emailInput.value.trim() !== '' && emailInput.checkValidity(), message: 'Enter a valid work email address.' },
      { input: teamNameInput, error: errors.teamName, valid: teamNameInput.value.trim() !== '', message: 'Enter your team or studio name.' },
      { input: passwordInput, error: errors.password, valid: passwordMeetsAllRules(), message: 'Password doesn\u2019t meet the requirements above yet.' },
      { input: termsInput, error: errors.terms, valid: termsInput.checked, message: 'You need to agree to the Terms of Service and Privacy Policy to continue.' },
    ];

    var firstInvalid = null;
    checks.forEach(function (check) {
      setFieldError(check.input, check.error, check.valid ? '' : check.message);
      if (!check.valid && !firstInvalid) firstInvalid = check.input;
    });

    updateRequirements();

    if (firstInvalid) {
      showStatus('Check the highlighted fields below and try again.', 'error');
      firstInvalid.focus();
      return;
    }

    showStatus(
      'Looks good \u2014 this is a design prototype, so there\u2019s no live backend to create an account on yet.',
      'success'
    );
  });

  // Clear each field's error as soon as the person starts fixing it.
  fullNameInput.addEventListener('input', function () {
    if (fullNameInput.getAttribute('aria-invalid') === 'true' && fullNameInput.value.trim() !== '') {
      setFieldError(fullNameInput, errors.fullName, '');
    }
  });
  emailInput.addEventListener('input', function () {
    if (emailInput.getAttribute('aria-invalid') === 'true' && emailInput.checkValidity()) {
      setFieldError(emailInput, errors.email, '');
    }
  });
  teamNameInput.addEventListener('input', function () {
    if (teamNameInput.getAttribute('aria-invalid') === 'true' && teamNameInput.value.trim() !== '') {
      setFieldError(teamNameInput, errors.teamName, '');
    }
  });
  passwordInput.addEventListener('input', function () {
    if (passwordInput.getAttribute('aria-invalid') === 'true' && passwordMeetsAllRules()) {
      setFieldError(passwordInput, errors.password, '');
    }
  });
  termsInput.addEventListener('change', function () {
    if (termsInput.checked) setFieldError(termsInput, errors.terms, '');
  });
})();