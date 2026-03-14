/* ================================================================
   news.js — News page: load articles, category tabs, filter
   ================================================================ */

'use strict';

const NEWS_ARTICLES = [
  { id:1, category:'Examination',   date:'2025-03-08', icon:'📋', colour:'gold',  title:'2024/2025 WAEC Registration Now Open for All SS3 Students',         excerpt:'The Ministry announces commencement of WAEC registration for all final-year secondary school students. Deadline is April 30th, 2025.' },
  { id:2, category:'Infrastructure',date:'2025-03-05', icon:'🏫', colour:'green', title:'New Classroom Blocks Commissioned in 42 Primary Schools',            excerpt:'Governor inaugurates modern classroom facilities across 42 primary schools as part of the Education Infrastructure Drive 2025.' },
  { id:3, category:'Training',      date:'2025-03-01', icon:'📚', colour:'blue',  title:'Teacher Professional Development Programme Kicks Off',               excerpt:'Over 3,000 teachers have enrolled in the state-wide continuous education and skills development initiative.' },
  { id:4, category:'Results',       date:'2025-02-22', icon:'🎓', colour:'gold',  title:'2025 Common Entrance Examination Results Released',                  excerpt:'Results for the Delta State Common Entrance Examination into Junior Secondary Schools are now available on the portal.' },
  { id:5, category:'Technology',    date:'2025-02-18', icon:'💻', colour:'blue',  title:'Digital Portal Training Workshop for School Administrators',          excerpt:'Principals and Headteachers across the state completed a two-day digital literacy workshop to onboard the new Education Portal.' },
  { id:6, category:'Policy',        date:'2025-02-10', icon:'📄', colour:'gold',  title:'Ministry Releases Updated Teacher Posting Guidelines',               excerpt:'The updated guidelines for teacher postings and transfers take effect from the 2025/2026 academic session.' },
  { id:7, category:'Examination',   date:'2025-01-28', icon:'📝', colour:'green', title:'NECO Internal Examination Timetable Released',                       excerpt:'The schedule for the 2025 Senior School Certificate Examination (SSCE) Internal is now available for download.' },
  { id:8, category:'Infrastructure',date:'2025-01-14', icon:'🏗️', colour:'grey',  title:'Renovation Works Begin in 18 Secondary Schools Across Delta North',  excerpt:'Contractors have mobilised to sites across 18 secondary schools in the Delta North senatorial district.' },
];

const CATEGORIES = ['All', ...new Set(NEWS_ARTICLES.map(n => n.category))];
let activeCategory = 'All';

/* ----------------------------------------------------------------
   RENDER CATEGORY TABS + SIDEBAR CATS
---------------------------------------------------------------- */
function renderCategories() {
  const tabsEl    = document.getElementById('cat-tabs');
  const sideEl    = document.getElementById('sidebar-cats');

  const counts = {};
  NEWS_ARTICLES.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });

  if (tabsEl) {
    tabsEl.innerHTML = CATEGORIES.map(cat => `
      <button class="cat-tab ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}"
        aria-pressed="${cat === activeCategory}">${cat}</button>
    `).join('');
  }

  if (sideEl) {
    sideEl.innerHTML = CATEGORIES.filter(c => c !== 'All').map(cat => `
      <button class="sidebar-cat ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
        <span>${cat}</span>
        <span class="sidebar-cat-count">${counts[cat] || 0}</span>
      </button>
    `).join('');
  }
}

/* ----------------------------------------------------------------
   RENDER ARTICLES
---------------------------------------------------------------- */
function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' });
}

function articleHTML(a) {
  return `
    <article class="article-card" role="listitem" tabindex="0" aria-label="${a.title}"
      onclick="readArticle(${a.id})" onkeydown="if(event.key==='Enter')readArticle(${a.id})">
      <div class="article-thumb at-${a.colour}">${a.icon}</div>
      <div class="article-body">
        <div class="article-meta">
          <span class="badge badge-${a.colour === 'gold' ? 'gold' : a.colour === 'green' ? 'green' : a.colour === 'blue' ? 'blue' : 'grey'}">${a.category}</span>
          <span>${Icon.clock} ${fmtDate(a.date)}</span>
        </div>
        <h2 class="article-title">${a.title}</h2>
        <p class="article-excerpt">${a.excerpt}</p>
        <p class="article-read-more">Read more →</p>
      </div>
    </article>
  `;
}

function renderArticles(category) {
  const list   = document.getElementById('articles-list');
  const empty  = document.getElementById('no-articles');
  if (!list) return;

  const items = category === 'All'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter(a => a.category === category);

  if (items.length === 0) {
    list.hidden  = true;
    empty.hidden = false;
    empty.classList.add('visible');
  } else {
    empty.hidden = true;
    empty.classList.remove('visible');
    list.hidden      = false;
    list.innerHTML   = items.map(articleHTML).join('');
  }
}

/* ----------------------------------------------------------------
   SELECT CATEGORY (syncs both tabs and sidebar)
---------------------------------------------------------------- */
function selectCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(b => {
    const on = b.dataset.cat === cat;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.sidebar-cat').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  renderArticles(cat);
}

// Delegate all [data-cat] clicks — covers tabs AND sidebar buttons
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-cat]');
  if (btn) selectCategory(btn.dataset.cat);
});

/* ----------------------------------------------------------------
   READ ARTICLE (full view — Stage 4)
---------------------------------------------------------------- */
window.readArticle = function(id) {
  showToast('Full article view coming in Stage 4', 'info');
};

/* ----------------------------------------------------------------
   LOAD (with API upgrade path)
---------------------------------------------------------------- */
async function loadArticles() {
  document.getElementById('articles-skeleton').hidden = false;
  document.getElementById('articles-list').hidden     = true;

  try {
    const data = await apiFetch('/public/news');
    if (data?.items?.length) {
      NEWS_ARTICLES.length = 0;
      NEWS_ARTICLES.push(...data.items);
    }
  } catch { /* use static */ }

  document.getElementById('articles-skeleton').hidden = true;
  renderCategories();
  renderArticles(activeCategory);
}

document.addEventListener('DOMContentLoaded', loadArticles);