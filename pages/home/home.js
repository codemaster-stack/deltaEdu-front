/* ================================================================
   home.js — Homepage logic
   Depends on: shared.js (window.Icon, window.fmt, window.apiFetch)
               utilities.js (window.debounce etc.)
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   SERVICES DATA
---------------------------------------------------------------- */
const SERVICES = [
  { icon: '🏫', colour: 'gold',  title: 'School Directory',   desc: 'Browse all registered primary and secondary schools across every LGA in Delta State.',            cta: 'Find Schools',  href: '/pages/schools/schools.html'  },
  { icon: '👩‍🏫', colour: 'green', title: 'Teacher Portal',     desc: 'Access class records, upload learning materials, record attendance and manage CBT exams.',          cta: 'Teacher Login', href: '/pages/login/login.html'      },
  { icon: '🎓', colour: 'blue',  title: 'Student Portal',     desc: 'View results, access learning resources, take CBT exams and track your academic progress.',          cta: 'Student Login', href: '/pages/login/login.html'      },
  { icon: '🏛️', colour: 'gold',  title: 'Ministry Admin',     desc: 'Statewide school management, teacher posting, analytics and policy administration.',                 cta: 'Admin Login',   href: '/pages/login/login.html'      },
  { icon: '📢', colour: 'green', title: 'News & Circulars',   desc: 'Latest ministry announcements, exam timetables, policy updates and school circulars.',               cta: 'Read News',     href: '/pages/news/news.html'        },
  { icon: '📋', colour: 'blue',  title: 'Admissions Guide',   desc: 'Information for parents on how to apply for school admissions across Delta State.',                  cta: 'Learn More',    href: '/pages/about/about.html'      },
];

/* ----------------------------------------------------------------
   NEWS DATA — static fallback until backend is connected
---------------------------------------------------------------- */
const NEWS = [
  { id: 1, featured: true,  colour: 'gold',  icon: '📋', category: 'Examination',    date: '8 March 2025',    title: '2024/2025 WAEC Registration Now Open for All SS3 Students',  excerpt: 'The Ministry announces commencement of WAEC registration for all final-year secondary school students across Delta State. Deadline is April 30th.' },
  { id: 2, featured: false, colour: 'green', icon: '🏫', category: 'Infrastructure', date: '5 March 2025',    title: 'New Classroom Blocks Commissioned in 42 Primary Schools',      excerpt: 'Governor inaugurates modern classroom facilities as part of the Education Infrastructure Drive 2025.' },
  { id: 3, featured: false, colour: 'blue',  icon: '📚', category: 'Training',       date: '1 March 2025',    title: 'Teacher Professional Development Programme Kicks Off',          excerpt: 'Over 3,000 teachers enrolled in the state-wide continuous education initiative.' },
];

/* ----------------------------------------------------------------
   RENDER SERVICES
---------------------------------------------------------------- */
function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  grid.innerHTML = SERVICES.map(s => `
    <a href="${s.href}" class="service-card" aria-label="${s.title}">
      <div class="svc-icon ${s.colour}">${s.icon}</div>
      <div class="svc-title">${s.title}</div>
      <p class="svc-desc">${s.desc}</p>
      <span class="svc-cta">${s.cta} →</span>
    </a>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER NEWS PREVIEW
---------------------------------------------------------------- */
function renderNews(items) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  const featured = items.find(n => n.featured);
  const rest     = items.filter(n => !n.featured).slice(0, 2);
  const ordered  = featured ? [featured, ...rest] : items.slice(0, 3);

  grid.innerHTML = ordered.map((item, i) => {
    const isFeatured = i === 0 && item.featured;
    return `
      <a href="/pages/news/news.html" class="news-card ${isFeatured ? 'featured' : ''}" aria-label="${item.title}">
        <div class="news-card-img nc-${item.colour}">${item.icon}</div>
        <div class="news-card-body">
          <div class="news-card-meta">
            <span class="badge badge-${item.colour === 'gold' ? 'gold' : item.colour === 'green' ? 'green' : 'blue'}">${item.category}</span>
            <span>${Icon.clock} ${item.date}</span>
          </div>
          <h3 class="news-card-title">${item.title}</h3>
          ${isFeatured ? `<p class="news-card-excerpt">${item.excerpt}</p>` : ''}
        </div>
      </a>
    `;
  }).join('');
}

/* ----------------------------------------------------------------
   COUNTER ANIMATION on stats bar
---------------------------------------------------------------- */
function animateCounters() {
  const els = document.querySelectorAll('.sbar-num');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.replace(/[,%K]/g, '');
      const end = parseFloat(raw);
      if (isNaN(end)) return;

      const isPercent = el.textContent.includes('%');
      let start = 0;
      const duration = 1200;

      const step = ts => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 2);
        const current  = Math.floor(eased * end);
        el.textContent = fmt.number(current) + (isPercent ? '%' : '');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = fmt.number(end) + (isPercent ? '%' : '');
      };

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

/* ----------------------------------------------------------------
   TRY TO LOAD LIVE DATA — fall back to static silently
---------------------------------------------------------------- */
async function loadLiveData() {
  try {
    const data = await apiFetch('/public/news?limit=3');
    if (data?.items?.length) renderNews(data.items);
  } catch { /* keep static fallback */ }
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderNews(NEWS);      // show static immediately
  animateCounters();
  loadLiveData();        // upgrade silently when backend is ready
});