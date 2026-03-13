'use strict';

/* ----------------------------------------------------------------
   ENVIRONMENT — swap backend URL here for production
---------------------------------------------------------------- */
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api/v1'
  : 'https://api.deltaedu.gov.ng/api/v1';

/* ----------------------------------------------------------------
   NAVIGATION ITEMS
   Add new pages here — navbar and footer update everywhere
---------------------------------------------------------------- */
const NAV_ITEMS = [
  { label: 'Home',    path: '/pages/home/home.html'    },
  { label: 'Schools', path: '/pages/schools/schools.html' },
  { label: 'News',    path: '/pages/news/news.html'    },
  { label: 'About',   path: '/pages/about/about.html'  },
];

/* ----------------------------------------------------------------
   LOGO SVG — inline so no image request needed
---------------------------------------------------------------- */
const LOGO_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="22" cy="22" r="20" stroke="currentColor" stroke-width="2.2"/>
  <path d="M11 29 L22 11 L33 29 Z" fill="currentColor" opacity="0.88"/>
  <circle cx="22" cy="25" r="4.5" fill="#C9922A"/>
  <line x1="11" y1="33" x2="33" y2="33" stroke="#C9922A" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/* ----------------------------------------------------------------
   BUILD NAVBAR HTML
---------------------------------------------------------------- */
function buildNavbar() {
  const links = NAV_ITEMS.map(item =>
    `<a href="${item.path}" class="navbar-link" data-nav>${item.label}</a>`
  ).join('');

  const mobileLinks = NAV_ITEMS.map(item =>
    `<a href="${item.path}" class="navbar-link" data-nav>${item.label}</a>`
  ).join('');

  return `
    <nav id="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar-inner">

        <a href="/pages/home/home.html" class="navbar-logo" aria-label="Delta State Ministry of Education — Home">
          <div class="navbar-logo-icon" style="color:var(--navy)">${LOGO_SVG}</div>
          <div class="navbar-logo-text">
            <span class="navbar-logo-name">Delta State</span>
            <span class="navbar-logo-dept">Ministry of Education</span>
          </div>
        </a>

        <div class="navbar-links" role="list">
          ${links}
          <a href="/pages/login/login.html" class="navbar-login">Portal Login</a>
        </div>

        <button
          class="navbar-toggle"
          id="navbar-toggle"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="navbar-drawer"
        >
          <span></span><span></span><span></span>
        </button>

      </div>

      <div class="navbar-drawer" id="navbar-drawer" aria-hidden="true">
        ${mobileLinks}
        <a href="/pages/login/login.html" class="navbar-login">Portal Login</a>
      </div>
    </nav>
  `;
}

/* ----------------------------------------------------------------
   BUILD FOOTER HTML
---------------------------------------------------------------- */
function buildFooter() {
  const portalLinks = NAV_ITEMS.map(item =>
    `<a href="${item.path}">${item.label}</a>`
  ).join('');

  return `
    <footer id="footer" role="contentinfo">
      <div class="footer-top">

        <div class="footer-brand">
          <div class="footer-logo-wrap" style="color:rgba(255,255,255,0.78)">${LOGO_SVG}</div>
          <div>
            <p class="footer-brand-name">Delta State Ministry of Education</p>
            <p class="footer-tagline">Advancing Education Across Delta State</p>
          </div>
          <p class="footer-desc">
            Official digital portal for managing primary and secondary education across all 25 LGAs of Delta State, Nigeria.
          </p>
        </div>

        <div class="footer-cols">
          <div class="footer-col">
            <span class="footer-col-title">Portal</span>
            ${portalLinks}
          </div>
          <div class="footer-col">
            <span class="footer-col-title">Services</span>
            <a href="/pages/login/login.html">Staff Login</a>
            <a href="/pages/login/login.html">Student Login</a>
            <a href="/pages/admissions/admissions.html">Admissions</a>
            <a href="/pages/results/results.html">Check Results</a>
          </div>
          <div class="footer-col">
            <span class="footer-col-title">Contact</span>
            <p>Ministry of Education Secretariat<br>Government House Road<br>Asaba, Delta State</p>
            <p>info@deltaedu.gov.ng</p>
            <p>+234 (0) 803 000 0000</p>
          </div>
        </div>

      </div>

      <div class="footer-bottom">
        <p>&copy; <span id="footer-year"></span> Delta State Ministry of Education. All rights reserved.</p>
        <p>Digital Education Portal v1.0</p>
      </div>
    </footer>

    <div id="toast-container" aria-live="polite" aria-atomic="false"></div>
  `;
}

/* ----------------------------------------------------------------
   INJECT NAVBAR AND FOOTER INTO PAGE
---------------------------------------------------------------- */
function injectShell() {
  const navbarMount = document.getElementById('navbar-mount');
  const footerMount = document.getElementById('footer-mount');

  if (navbarMount) navbarMount.innerHTML = buildNavbar();
  if (footerMount) footerMount.innerHTML = buildFooter();

  // Set copyright year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ----------------------------------------------------------------
   HIGHLIGHT ACTIVE NAV LINK
   Compares each link's href to the current page URL
---------------------------------------------------------------- */
function setActiveLink() {
  const currentPath = window.location.pathname;

  document.querySelectorAll('[data-nav]').forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    const isActive = currentPath === linkPath;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });
}

/* ----------------------------------------------------------------
   MOBILE NAV — open/close drawer
---------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('navbar-toggle');
  const drawer = document.getElementById('navbar-drawer');
  if (!toggle || !drawer) return;

  // Toggle open/close
  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close when any link inside is clicked
  drawer.addEventListener('click', e => {
    if (e.target.tagName === 'A') closeDrawer();
  });

  // Close when user clicks anywhere outside the nav
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !drawer.contains(e.target)) {
      closeDrawer();
    }
  });

  function closeDrawer() {
    drawer.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }
}

/* ----------------------------------------------------------------
   SCROLL SHADOW ON NAVBAR
---------------------------------------------------------------- */
function initScrollShadow() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const update = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ----------------------------------------------------------------
   AUTH GUARD
   If a page has  <meta name="requires-auth" content="true">
   and no token is stored, redirect to login.
---------------------------------------------------------------- */
function runAuthGuard() {
  const meta = document.querySelector('meta[name="requires-auth"]');
  if (!meta || meta.getAttribute('content') !== 'true') return;

  const token = localStorage.getItem('edu_access_token') ||
                sessionStorage.getItem('edu_access_token');

  if (!token) {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.replace(`/pages/login/login.html?return=${returnTo}`);
  }
}

/* ----------------------------------------------------------------
   BODY REVEAL — prevents flash of unstyled content
---------------------------------------------------------------- */
function revealPage() {
  document.body.classList.add('ready');
  const content = document.getElementById('page-content');
  if (content) content.classList.add('page-enter');
}

/* ================================================================
   GLOBAL UTILITIES
   These are attached to window so every page .js can use them
   without importing anything.
================================================================ */

/* ----------------------------------------------------------------
   showToast(message, type)
   type: 'success' | 'error' | 'info'
   Usage from any page JS:   showToast('Saved!', 'success')
---------------------------------------------------------------- */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}
window.showToast = showToast;

/* ----------------------------------------------------------------
   apiFetch(endpoint, options)
   Wraps fetch() with auth headers + JSON parsing + error handling
   Usage:  const data = await apiFetch('/public/schools')
           const res  = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
---------------------------------------------------------------- */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('edu_access_token') ||
                sessionStorage.getItem('edu_access_token');

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  if (options.body && config.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  // Token expired — clear and redirect
  if (res.status === 401) {
    localStorage.removeItem('edu_access_token');
    sessionStorage.removeItem('edu_access_token');
    window.location.replace('/pages/login/login.html?session=expired');
    return null;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}
window.apiFetch = apiFetch;
window.API_BASE = API_BASE;

/* ----------------------------------------------------------------
   fmt — number and date formatting helpers
   Usage:  fmt.number(24600)  →  "24,600"
           fmt.compact(412000) →  "412K"
           fmt.date('2025-03-08') → "8 March 2025"
---------------------------------------------------------------- */
const fmt = {
  number:   n => Number(n).toLocaleString('en-NG'),
  compact:  n => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M'
                 : n >= 1_000   ? (n/1_000).toFixed(0)+'K'
                 : String(n),
  date: str => new Date(str).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  }),
  truncate: (str, max = 120) => str.length > max
    ? str.slice(0, max).trimEnd() + '…' : str,
};
window.fmt = fmt;

/* ----------------------------------------------------------------
   Icon — inline SVG strings
   Usage in any page JS:   Icon.search   Icon.arrow   Icon.pin
---------------------------------------------------------------- */
const Icon = {
  search: `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7.5" cy="7.5" r="5"/><line x1="11.5" y1="11.5" x2="16" y2="16"/></svg>`,
  arrow:  `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="7.5" x2="13" y2="7.5"/><polyline points="9,3.5 13,7.5 9,11.5"/></svg>`,
  pin:    `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4z"/><circle cx="7" cy="5.5" r="1.4" fill="currentColor" stroke="none"/></svg>`,
  users:  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="5.5" cy="4.5" r="2.2"/><path d="M1 12c0-2.5 2-4.5 4.5-4.5S10 9.5 10 12"/><circle cx="11" cy="4.5" r="1.8"/><path d="M13 12c0-2-1.3-3.5-2.7-3.5"/></svg>`,
  book:   `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2h10a1 1 0 011 1v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"/><line x1="1" y1="5.5" x2="13" y2="5.5"/></svg>`,
  clock:  `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="5"/><polyline points="6.5,3.5 6.5,6.5 9,8"/></svg>`,
  check:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5,8 6.5,12 13.5,4"/></svg>`,
  eye:    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="9" cy="9" r="2.5"/></svg>`,
  eyeoff: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="2" y1="2" x2="16" y2="16"/><path d="M10.6 10.6A2.5 2.5 0 017.4 7.4M6.5 4.2A7.5 7.5 0 019 3c5 0 8 6 8 6a13.5 13.5 0 01-2.5 3.5M4.7 4.7C2.9 5.9 1 9 1 9s3 6 8 6a7.5 7.5 0 003.3-.8"/></svg>`,
  mail:   `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="2" y="4" width="14" height="10" rx="2"/><polyline points="2,4 9,11 16,4"/></svg>`,
  phone:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5.5 2h2.7l1.4 3.6-2.3 1.4a9 9 0 004.2 4.2l1.4-2.3 3.6 1.4v2.7a1.4 1.4 0 01-1.4 1.5C7.4 14.5 3.5 10.6 3.5 3.4A1.4 1.4 0 014.9 2z"/></svg>`,
  mappin: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M9 2C6.2 2 4 4.2 4 7c0 5 5 9 5 9s5-4 5-9c0-2.8-2.2-5-5-5z"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/></svg>`,
};
window.Icon = Icon;

/* ----------------------------------------------------------------
   BOOT — runs automatically on every page
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  injectShell();    // inject navbar + footer HTML
  setActiveLink();  // highlight current page in nav
  initMobileNav();  // wire hamburger button
  initScrollShadow(); // add shadow on scroll
  runAuthGuard();   // redirect if page requires login
  revealPage();     // fade body in + animate page content
});