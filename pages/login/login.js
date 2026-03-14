/* ================================================================
   login.js — Login page logic
   - Role tabs (Staff / Student / Parent)
   - Form validation
   - Password show/hide toggle
   - POST to /auth/login API
   - Save token + redirect to correct dashboard by role
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   ROLE CONFIG
   Controls the email label placeholder and what the API receives
---------------------------------------------------------------- */
const ROLES = {
  staff:   { label: 'Staff Email',   placeholder: 'you@deltaedu.gov.ng',  idField: 'email' },
  student: { label: 'Student ID',    placeholder: 'e.g. DSS/2024/001234', idField: 'studentId' },
  parent:  { label: 'Email / Phone', placeholder: 'your email or phone',  idField: 'identifier' },
};

let currentRole = 'staff';

/* ----------------------------------------------------------------
   ROLE TABS
---------------------------------------------------------------- */
function initRoleTabs() {
  const tabs = document.querySelectorAll('.role-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');

      // Update role
      currentRole = tab.dataset.role;
      updateFormForRole(currentRole);

      // Clear any errors when switching role
      clearFieldErrors(['login-email', 'login-password']);
      hideGeneralError();
    });
  });
}

function updateFormForRole(role) {
  const config       = ROLES[role];
  const labelEl      = document.getElementById('email-label-text');
  const inputEl      = document.getElementById('login-email');

  if (labelEl) labelEl.textContent   = config.label;
  if (inputEl) {
    inputEl.placeholder = config.placeholder;
    // Student uses text ID not email
    inputEl.type = role === 'student' ? 'text' : 'email';
    inputEl.autocomplete = role === 'student' ? 'username' : 'email';
  }
}

/* ----------------------------------------------------------------
   PASSWORD SHOW / HIDE TOGGLE
---------------------------------------------------------------- */
function initPasswordToggle() {
  const toggle   = document.getElementById('pw-toggle');
  const input    = document.getElementById('login-password');
  const iconSlot = document.getElementById('pw-toggle-icon');

  if (!toggle || !input) return;

  // Set initial icon
  iconSlot.innerHTML = Icon.eye;

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type       = isPassword ? 'text' : 'password';
    iconSlot.innerHTML = isPassword ? Icon.eyeoff : Icon.eye;
    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    input.focus();
  });
}

/* ----------------------------------------------------------------
   EMAIL ICON INJECT
---------------------------------------------------------------- */
function injectEmailIcon() {
  const slot = document.getElementById('email-icon');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.mail}</span>`;
}

/* ----------------------------------------------------------------
   GENERAL ERROR (wrong credentials, server error)
---------------------------------------------------------------- */
function showGeneralError(message) {
  const box  = document.getElementById('login-error');
  const text = document.getElementById('login-error-text');
  if (!box || !text) return;
  text.textContent = message;
  box.hidden = false;
}

function hideGeneralError() {
  const box = document.getElementById('login-error');
  if (box) box.hidden = true;
}

/* ----------------------------------------------------------------
   FORGOT PASSWORD
---------------------------------------------------------------- */
function initForgotPassword() {
  document.getElementById('forgot-link')?.addEventListener('click', e => {
    e.preventDefault();
    showToast('Password reset — contact your school administrator or email support@deltaedu.gov.ng', 'info', 6000);
  });
}

/* ----------------------------------------------------------------
   SESSION EXPIRED NOTICE
   If URL has ?session=expired show the notice banner
---------------------------------------------------------------- */
function checkSessionExpired() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('session') === 'expired') {
    document.getElementById('session-notice').hidden = false;
  }
}

/* ----------------------------------------------------------------
   FORM SUBMIT — validate → POST to API → save token → redirect
---------------------------------------------------------------- */
function initLoginForm() {
  const form      = document.getElementById('login-form');
  const submitBtn = document.getElementById('login-submit');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideGeneralError();

    const emailVal    = document.getElementById('login-email').value.trim();
    const passwordVal = document.getElementById('login-password').value;
    const remember    = document.getElementById('remember-me').checked;

    /* ── CLIENT-SIDE VALIDATION ── */
    const rules = {
      'login-email':    ['required', ...(currentRole !== 'student' ? ['email'] : [])],
      'login-password': ['required', { minLength: 6 }],
    };

    const errors = validate(
      { 'login-email': emailVal, 'login-password': passwordVal },
      rules
    );

    if (errors) {
      showFieldErrors(errors);
      return;
    }
    clearFieldErrors(['login-email', 'login-password']);

    /* ── CALL API ── */
    const restore = setLoadingBtn(submitBtn, 'Signing in…');

    try {
      /*
        When your backend is ready, this apiFetch call goes to:
        POST /auth/login
        Body: { identifier: emailVal, password: passwordVal, role: currentRole }

        The backend returns:
        { token: '...', user: { id, name, role, schoolId, ... } }
      */
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: {
          identifier: emailVal,
          password:   passwordVal,
          role:       currentRole,
        },
      });

      if (!data) return; // apiFetch handles 401 redirect

      /* ── SAVE SESSION ── */
      session.save({
        id:       data.user.id,
        name:     data.user.name,
        role:     data.user.role,
        schoolId: data.user.schoolId || null,
        token:    data.token,
      });

      // If "remember me" → also save to localStorage (persists after tab close)
      if (remember) {
        localStorage.setItem('edu_access_token', data.token);
      }

      showToast(`Welcome back, ${data.user.name}!`, 'success');

      /* ── REDIRECT TO CORRECT DASHBOARD ── */
      // Check if there's a ?return= param (user was sent here from a protected page)
      const params     = new URLSearchParams(window.location.search);
      const returnPath = params.get('return');

      if (returnPath) {
        window.location.replace(decodeURIComponent(returnPath));
      } else {
        redirectToDashboard(data.user.role);
      }

    } catch (err) {
      // API returned an error (wrong password, account locked etc.)
      const message = err.message || 'Invalid credentials. Please try again.';
      showGeneralError(message);
      restore();
    }
  });
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  injectEmailIcon();
  initRoleTabs();
  initPasswordToggle();
  initForgotPassword();
  checkSessionExpired();
  initLoginForm();

  // Auto-select role tab from URL parameter
  const roleParam = new URLSearchParams(window.location.search).get('role');
  if (roleParam) {
    currentRole = roleParam;
    document.querySelectorAll('.role-tab').forEach(t => {
      const isMatch = t.dataset.role === roleParam;
      t.classList.toggle('active', isMatch);
      t.setAttribute('aria-pressed', String(isMatch));
    });
    updateFormForRole(roleParam);
  }
});