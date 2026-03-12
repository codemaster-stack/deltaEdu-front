/* ================================================================
   DELTA STATE MINISTRY OF EDUCATION
   utilities.js — Reusable helper functions
   ================================================================

   HOW TO USE
   ───────────
   Any page .js file can call these functions directly because
   shared.js loads first (it uses defer, pages use defer too,
   but shared.js is listed first in the HTML).

   All functions are attached to window so they are globally
   available without any import statement.

================================================================ */

'use strict';

/* ----------------------------------------------------------------
   FORM VALIDATION
   Usage:
     const errors = validate({ email: 'bad', password: '' }, {
       email:    ['required', 'email'],
       password: ['required', { minLength: 8 }],
     });
     if (errors) { showFieldErrors(errors); return; }
---------------------------------------------------------------- */
function validate(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = (data[field] || '').toString().trim();

    for (const rule of fieldRules) {
      // required
      if (rule === 'required' && !value) {
        errors[field] = 'This field is required.';
        break;
      }
      // email
      if (rule === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = 'Please enter a valid email address.';
        break;
      }
      // phone (Nigerian format)
      if (rule === 'phone' && value && !/^(\+234|0)[789][01]\d{8}$/.test(value.replace(/\s/g,''))) {
        errors[field] = 'Please enter a valid Nigerian phone number.';
        break;
      }
      // object rules
      if (typeof rule === 'object') {
        if (rule.minLength && value.length < rule.minLength) {
          errors[field] = `Must be at least ${rule.minLength} characters.`;
          break;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors[field] = `Must be no more than ${rule.maxLength} characters.`;
          break;
        }
        if (rule.match && value !== (data[rule.match] || '').toString().trim()) {
          errors[field] = 'Fields do not match.';
          break;
        }
      }
    }
  }

  return Object.keys(errors).length ? errors : null;
}
window.validate = validate;

/* ----------------------------------------------------------------
   SHOW / CLEAR FIELD ERRORS
   Looks for an element with id="field-name-error" next to each input.
   Usage:
     showFieldErrors({ email: 'Invalid email', password: 'Too short' })
     clearFieldErrors(['email', 'password'])
---------------------------------------------------------------- */
function showFieldErrors(errors) {
  clearFieldErrors(Object.keys(errors));
  for (const [field, message] of Object.entries(errors)) {
    const input = document.getElementById(field) ||
                  document.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('input-error');
      const errEl = document.getElementById(`${field}-error`);
      if (errEl) { errEl.textContent = message; errEl.hidden = false; }
    }
  }
  // Focus first errored field
  const firstField = Object.keys(errors)[0];
  document.getElementById(firstField)?.focus();
}
window.showFieldErrors = showFieldErrors;

function clearFieldErrors(fields) {
  fields.forEach(field => {
    const input = document.getElementById(field) ||
                  document.querySelector(`[name="${field}"]`);
    if (input) input.classList.remove('input-error');
    const errEl = document.getElementById(`${field}-error`);
    if (errEl) { errEl.textContent = ''; errEl.hidden = true; }
  });
}
window.clearFieldErrors = clearFieldErrors;

/* ----------------------------------------------------------------
   DEBOUNCE
   Delays calling a function until the user stops typing.
   Usage:
     searchInput.addEventListener('input', debounce(doSearch, 250))
---------------------------------------------------------------- */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
window.debounce = debounce;

/* ----------------------------------------------------------------
   LOCAL STORAGE HELPERS
   Safely gets/sets JSON values from localStorage.
   Usage:
     storage.set('user', { name: 'Ada', role: 'teacher' })
     const user = storage.get('user')
     storage.remove('user')
---------------------------------------------------------------- */
const storage = {
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn('Storage set failed:', e); }
  },
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch (e) { console.warn('Storage remove failed:', e); }
  },
  clear() {
    try { localStorage.clear(); }
    catch (e) { console.warn('Storage clear failed:', e); }
  },
};
window.storage = storage;

/* ----------------------------------------------------------------
   SESSION (AUTH) HELPERS
   Saves and reads the logged-in user from sessionStorage.
   Usage:
     session.save({ id: '...', name: 'Ada', role: 'teacher', token: '...' })
     const user = session.getUser()
     const role = session.getRole()     // 'ministry_admin' | 'principal' | 'teacher' | 'student' | 'parent'
     session.clear()
---------------------------------------------------------------- */
const session = {
  save(userData) {
    try {
      sessionStorage.setItem('edu_user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('edu_access_token', userData.token);
        sessionStorage.setItem('edu_access_token', userData.token);
      }
    } catch (e) { console.warn('Session save failed:', e); }
  },
  getUser() {
    try {
      const raw = sessionStorage.getItem('edu_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  getRole() {
    return this.getUser()?.role || null;
  },
  isLoggedIn() {
    return !!(localStorage.getItem('edu_access_token') ||
              sessionStorage.getItem('edu_access_token'));
  },
  clear() {
    try {
      sessionStorage.removeItem('edu_user');
      sessionStorage.removeItem('edu_access_token');
      localStorage.removeItem('edu_access_token');
    } catch (e) { console.warn('Session clear failed:', e); }
  },
};
window.session = session;

/* ----------------------------------------------------------------
   ROLE → DASHBOARD REDIRECT
   After login, redirect the user to their correct dashboard.
   Usage:  redirectToDashboard('ministry_admin')
---------------------------------------------------------------- */
function redirectToDashboard(role) {
  const map = {
    ministry_admin:  '/pages/ministry-dashboard/dashboard.html',
    principal:       '/pages/ministry-dashboard/dashboard.html',
    headteacher:     '/pages/ministry-dashboard/dashboard.html',
    teacher:         '/pages/ministry-dashboard/dashboard.html',
    student:         '/pages/ministry-dashboard/dashboard.html',
    parent:          '/pages/ministry-dashboard/dashboard.html',
  };
  window.location.replace(map[role] || '/pages/ministry-dashboard/dashboard.html');
}
window.redirectToDashboard = redirectToDashboard;

/* ----------------------------------------------------------------
   LOADING BUTTON STATE
   Shows a spinner in a button while an async action runs.
   Usage:
     const restore = setLoadingBtn(submitBtn, 'Logging in…')
     try { await doSomething(); }
     finally { restore(); }
---------------------------------------------------------------- */
function setLoadingBtn(btn, loadingText = 'Loading…') {
  const original = btn.innerHTML;
  btn.disabled   = true;
  btn.innerHTML  = `<span style="display:inline-flex;align-items:center;gap:.5rem">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="8" y1="2" x2="8" y2="5"/><line x1="8" y1="11" x2="8" y2="14" opacity=".3"/>
      <line x1="2" y1="8" x2="5" y2="8" opacity=".6"/><line x1="11" y1="8" x2="14" y2="8" opacity=".15"/>
      <line x1="3.5" y1="3.5" x2="5.7" y2="5.7" opacity=".8"/><line x1="10.3" y1="10.3" x2="12.5" y2="12.5" opacity=".2"/>
    </svg>${loadingText}
  </span>`;
  return () => {
    btn.disabled  = false;
    btn.innerHTML = original;
  };
}
window.setLoadingBtn = setLoadingBtn;

/* ----------------------------------------------------------------
   PAGINATE
   Slices an array for the current page.
   Usage:
     const page = paginate(allItems, currentPage, 20)
     page.items  → items for this page
     page.total  → total number of pages
     page.count  → total items
---------------------------------------------------------------- */
function paginate(array, page = 1, perPage = 20) {
  const total = Math.ceil(array.length / perPage);
  const start = (page - 1) * perPage;
  return {
    items: array.slice(start, start + perPage),
    total,
    page,
    count: array.length,
    hasNext: page < total,
    hasPrev: page > 1,
  };
}
window.paginate = paginate;

/* ----------------------------------------------------------------
   CONFIRM DIALOG
   Shows a styled confirmation prompt before a destructive action.
   Usage:
     const confirmed = await confirmDialog('Delete this record?', 'This cannot be undone.')
     if (confirmed) deleteRecord()
---------------------------------------------------------------- */
function confirmDialog(title = 'Are you sure?', message = '') {
  return new Promise(resolve => {
    // Remove any existing dialog
    document.getElementById('confirm-dialog-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirm-dialog-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(12,27,46,.55);
      backdrop-filter:blur(4px);z-index:9000;
      display:flex;align-items:center;justify-content:center;padding:1rem;
    `;
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:2rem;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.2)">
        <h3 style="font-family:'Fraunces',serif;font-size:1.2rem;color:#0C1B2E;margin-bottom:.75rem">${title}</h3>
        ${message ? `<p style="font-size:.9rem;color:#2E4F72;margin-bottom:1.5rem;line-height:1.6">${message}</p>` : '<div style="height:1rem"></div>'}
        <div style="display:flex;gap:.75rem;justify-content:flex-end">
          <button id="confirm-no"  style="padding:.6rem 1.2rem;border-radius:8px;border:1.5px solid #DAD6CD;font-size:.9rem;cursor:pointer;background:#fff">Cancel</button>
          <button id="confirm-yes" style="padding:.6rem 1.2rem;border-radius:8px;background:#C0392B;color:#fff;font-size:.9rem;font-weight:500;cursor:pointer;border:none">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('confirm-yes').onclick = () => { overlay.remove(); resolve(true); };
    document.getElementById('confirm-no').onclick  = () => { overlay.remove(); resolve(false); };
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
  });
}
window.confirmDialog = confirmDialog;