/* ================================================================
   dashboard.js — Ministry Dashboard logic
   - Load user from session
   - Render KPI cards
   - Render donut chart (schools by type)
   - Render bar chart (enrolment by LGA)
   - Render recent activity feed
   - Render quick action buttons
   - Sidebar section switching
   - Mobile sidebar toggle
   - Logout
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   STATIC DATA — replaced by API when backend is live
---------------------------------------------------------------- */
const KPI_DATA = [
  { label: 'Total Schools',   value: 1248,   change: '+12',   trend: 'up',   icon: '🏫', colour: 'gold'  },
  { label: 'Active Teachers', value: 24600,  change: '+340',  trend: 'up',   icon: '👩‍🏫', colour: 'green' },
  { label: 'Enrolled Students',value: 412000, change: '+5.2%', trend: 'up',   icon: '🎓', colour: 'blue'  },
  { label: 'LGAs Covered',    value: 25,     change: '100%',  trend: 'flat', icon: '📍', colour: 'navy'  },
];

const DONUT_DATA = [
  { label: 'Primary Schools',   value: 780, colour: '#C9922A' },
  { label: 'Secondary Schools', value: 468, colour: '#1A6B4A' },
];

const BAR_DATA = [
  { lga: 'Warri South',    students: 38400 },
  { lga: 'Oshimili South', students: 32100 },
  { lga: 'Sapele',         students: 28500 },
  { lga: 'Ethiope East',   students: 24300 },
  { lga: 'Ughelli North',  students: 22800 },
  { lga: 'Ika South',      students: 19600 },
  { lga: 'Isoko South',    students: 17200 },
  { lga: 'Uvwie',          students: 15900 },
];

const ACTIVITY_DATA = [
  { icon: '👩‍🏫', colour: 'green', desc: '42 new teacher postings processed for Oshimili South LGA.',        time: '2 hours ago'   },
  { icon: '🏫',  colour: 'gold',  desc: 'Government Secondary School, Asaba — enrolment updated to 1,240.', time: '4 hours ago'   },
  { icon: '📝',  colour: 'blue',  desc: 'WAEC registration data uploaded for 8,420 SS3 students.',          time: 'Yesterday'     },
  { icon: '📋',  colour: 'gold',  desc: 'New admissions batch approved — 1,200 JSS1 placements.',           time: '2 days ago'    },
  { icon: '💻',  colour: 'blue',  desc: 'CBT mock exam completed — 3,412 students, Ethiope East.',          time: '3 days ago'    },
  { icon: '📢',  colour: 'grey',  desc: 'Ministry circular on teacher appraisal published.',                time: '1 week ago'    },
];

const QUICK_ACTIONS = [
  { icon: '➕', label: 'Add School',       href: '#schools'    },
  { icon: '👤', label: 'Add Teacher',      href: '#teachers'   },
  { icon: '📤', label: 'Upload Results',   href: '#results'    },
  { icon: '📢', label: 'Post Circular',    href: '#'           },
  { icon: '📊', label: 'View Reports',     href: '#analytics'  },
  { icon: '⚙️', label: 'Settings',         href: '#'           },
];

/* ----------------------------------------------------------------
   GREET USER
---------------------------------------------------------------- */
function renderGreeting() {
  const hour = new Date().getHours();
  const timeEl = document.getElementById('greeting-time');
  const nameEl = document.getElementById('greeting-name');

  if (timeEl) {
    timeEl.textContent = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  }

  // Try to get user from session
  const user = session?.getUser?.();
  const displayName = user?.name?.split(' ')[0] || 'Admin';

  if (nameEl) nameEl.textContent = displayName;

  // Update sidebar user card
  const avatarEl = document.getElementById('dash-user-avatar');
  const userNameEl = document.getElementById('dash-user-name');
  const userRoleEl = document.getElementById('dash-user-role');

  if (avatarEl)   avatarEl.textContent   = displayName[0].toUpperCase();
  if (userNameEl) userNameEl.textContent = user?.name || 'Ministry Admin';
  if (userRoleEl) userRoleEl.textContent = (user?.role || 'ministry_admin').replace(/_/g, ' ');
}

/* ----------------------------------------------------------------
   RENDER DATE IN TOPBAR
---------------------------------------------------------------- */
function renderDate() {
  const el = document.getElementById('dash-date');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ----------------------------------------------------------------
   RENDER KPI CARDS
---------------------------------------------------------------- */
function renderKPIs(data) {
  const grid = document.getElementById('kpi-grid');
  if (!grid) return;

  grid.innerHTML = data.map(k => `
    <div class="kpi-card ${k.colour}">
      <div class="kpi-top">
        <div class="kpi-icon ${k.colour}">${k.icon}</div>
        <span class="kpi-change ${k.trend}">${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '—'} ${k.change}</span>
      </div>
      <div class="kpi-value">${fmt.compact(k.value)}</div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER DONUT CHART (pure SVG — no library needed)
---------------------------------------------------------------- */
function renderDonut(data) {
  const wrap = document.getElementById('donut-wrap');
  if (!wrap) return;

  const total  = data.reduce((s, d) => s + d.value, 0);
  const radius = 60;
  const cx     = 80;
  const cy     = 80;
  const stroke = 22;

  let offset = 0;
  const circumference = 2 * Math.PI * radius;

  const paths = data.map(d => {
    const pct   = d.value / total;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    const path  = `
      <circle
        cx="${cx}" cy="${cy}" r="${radius}"
        fill="none"
        stroke="${d.colour}"
        stroke-width="${stroke}"
        stroke-dasharray="${dash} ${gap}"
        stroke-dashoffset="${-offset * circumference}"
        stroke-linecap="butt"
      />`;
    offset += pct;
    return path;
  }).join('');

  const legend = data.map(d => `
    <div class="donut-legend-item">
      <div class="donut-legend-left">
        <div class="donut-dot" style="background:${d.colour}"></div>
        <span class="donut-legend-label">${d.label}</span>
      </div>
      <span class="donut-legend-val">${fmt.number(d.value)}</span>
    </div>
  `).join('');

  wrap.innerHTML = `
    <div class="donut-svg-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <!-- Background ring -->
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none"
          stroke="var(--surface)" stroke-width="${stroke}"/>
        ${paths}
      </svg>
      <div class="donut-center-text">
        <span class="donut-center-num">${fmt.compact(total)}</span>
        <span class="donut-center-label">Schools</span>
      </div>
    </div>
    <div class="donut-legend">${legend}</div>
  `;
}

/* ----------------------------------------------------------------
   RENDER BAR CHART (pure CSS bars — no library needed)
---------------------------------------------------------------- */
function renderBarChart(data) {
  const wrap = document.getElementById('bar-chart-wrap');
  if (!wrap) return;

  const max = Math.max(...data.map(d => d.students));

  wrap.innerHTML = data.map(d => {
    const pct = ((d.students / max) * 100).toFixed(1);
    return `
      <div class="bar-row">
        <span class="bar-label">${d.lga}</span>
        <div class="bar-track">
          <div class="bar-fill" data-width="${pct}%" style="width:0"></div>
        </div>
        <span class="bar-val">${fmt.compact(d.students)}</span>
      </div>
    `;
  }).join('');

  // Animate bars in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wrap.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    });
  });
}

/* ----------------------------------------------------------------
   RENDER ACTIVITY FEED
---------------------------------------------------------------- */
function renderActivity(data) {
  const list = document.getElementById('activity-list');
  if (!list) return;

  list.innerHTML = data.map(item => `
    <div class="activity-item">
      <div class="activity-dot ${item.colour}">${item.icon}</div>
      <div class="activity-text">
        <div class="activity-desc">${item.desc}</div>
        <div class="activity-time">${item.time}</div>
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER QUICK ACTIONS
---------------------------------------------------------------- */
function renderQuickActions(actions) {
  const grid = document.getElementById('quick-actions-grid');
  if (!grid) return;

  grid.innerHTML = actions.map(a => `
    <a href="${a.href}" class="qa-btn" aria-label="${a.label}">
      <span class="qa-btn-icon">${a.icon}</span>
      <span class="qa-btn-label">${a.label}</span>
    </a>
  `).join('');

  // Wire internal section links
  grid.querySelectorAll('[href^="#"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const target = btn.getAttribute('href').slice(1);
      if (target) { e.preventDefault(); switchSection(target); }
    });
  });
}

/* ----------------------------------------------------------------
   SECTION SWITCHING
---------------------------------------------------------------- */
function switchSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));

  // Show target
  const target = document.getElementById(`section-${sectionId}`);
  if (target) target.classList.add('active');

  // Update nav links
  document.querySelectorAll('.dash-nav-link[data-section]').forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });

  // Update topbar title
  const titleEl = document.getElementById('dash-topbar-title');
  const activeLink = document.querySelector(`.dash-nav-link[data-section="${sectionId}"]`);
  if (titleEl && activeLink) {
    titleEl.textContent = activeLink.textContent.trim();
  }

  // Close mobile sidebar
  closeSidebar();

  // Update URL hash without reloading
  history.replaceState(null, '', `#${sectionId}`);
}

function initSectionNav() {
  document.querySelectorAll('.dash-nav-link[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchSection(link.dataset.section);
    });
  });

  // Load section from URL hash on page load
  const hash = window.location.hash.slice(1);
  if (hash) switchSection(hash);
}

/* ----------------------------------------------------------------
   MOBILE SIDEBAR TOGGLE
---------------------------------------------------------------- */
function openSidebar() {
  document.getElementById('dash-sidebar')?.classList.add('open');
  document.getElementById('dash-overlay')?.classList.add('visible');
  document.getElementById('dash-overlay')?.removeAttribute('aria-hidden');
}

function closeSidebar() {
  document.getElementById('dash-sidebar')?.classList.remove('open');
  document.getElementById('dash-overlay')?.classList.remove('visible');
  document.getElementById('dash-overlay')?.setAttribute('aria-hidden', 'true');
}

function initMobileSidebar() {
  document.getElementById('dash-menu-btn')?.addEventListener('click', openSidebar);
  document.getElementById('dash-overlay')?.addEventListener('click', closeSidebar);
}

/* ----------------------------------------------------------------
   LOGOUT
---------------------------------------------------------------- */
function initLogout() {
  document.getElementById('logout-link')?.addEventListener('click', async e => {
    e.preventDefault();
    const confirmed = await confirmDialog(
      'Sign out?',
      'You will be returned to the login page.'
    );
    if (!confirmed) return;

    session.clear();
    showToast('Signed out successfully.', 'success', 2000);
    setTimeout(() => {
      window.location.replace('/pages/login/login.html');
    }, 800);
  });
}

/* ----------------------------------------------------------------
   LOAD LIVE DATA (upgrade from static when backend is ready)
---------------------------------------------------------------- */
async function loadLiveData() {
  try {
    const data = await apiFetch('/dashboard/overview');
    if (!data) return;

    if (data.kpis)     renderKPIs(data.kpis);
    if (data.donut)    renderDonut(data.donut);
    if (data.barChart) renderBarChart(data.barChart);
    if (data.activity) renderActivity(data.activity);
  } catch {
    // Keep static data — no error shown to user
  }
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderGreeting();
  renderDate();
  renderKPIs(KPI_DATA);
  renderDonut(DONUT_DATA);
  renderBarChart(BAR_DATA);
  renderActivity(ACTIVITY_DATA);
  renderQuickActions(QUICK_ACTIONS);
  initSectionNav();
  initMobileSidebar();
  initLogout();
  loadLiveData(); // silent upgrade when API is live
});