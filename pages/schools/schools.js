/* ================================================================
   schools.js — School Directory: load, search, filter, render
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   STATIC DATA — replaced by API when backend is live
---------------------------------------------------------------- */
const LGAS = [
  'Aniocha North','Aniocha South','Bomadi','Burutu',
  'Ethiope East','Ethiope West','Ika North-East','Ika South',
  'Isoko North','Isoko South','Ndokwa East','Ndokwa West',
  'Okpe','Oshimili North','Oshimili South','Patani','Sapele',
  'Udu','Ughelli North','Ughelli South','Ukwuani','Uvwie',
  'Warri North','Warri South','Warri South-West',
];

const SCHOOLS = [
  { id:1,  name:'Government Secondary School, Asaba',      type:'secondary', lga:'Oshimili South',  students:1240, teachers:48, head:'Mr. C. Okonkwo',  status:'active'   },
  { id:2,  name:'Community Primary School, Warri',          type:'primary',   lga:'Warri South',     students:680,  teachers:22, head:'Mrs. A. Efiewi',  status:'active'   },
  { id:3,  name:'Delta State Science Secondary School',     type:'secondary', lga:'Ethiope East',    students:980,  teachers:54, head:'Dr. E. Nwosu',    status:'active'   },
  { id:4,  name:'Girls Secondary School, Agbor',            type:'secondary', lga:'Ika South',       students:870,  teachers:39, head:'Mrs. F. Okoro',   status:'active'   },
  { id:5,  name:'Central Primary School, Abraka',           type:'primary',   lga:'Ethiope East',    students:540,  teachers:18, head:'Mr. J. Enenmo',   status:'active'   },
  { id:6,  name:"St. Patrick's Secondary School, Asaba",    type:'secondary', lga:'Oshimili South',  students:1100, teachers:52, head:'Rev. P. Amadi',   status:'active'   },
  { id:7,  name:'Nsukwa Primary School, Kwale',             type:'primary',   lga:'Ndokwa West',     students:390,  teachers:14, head:'Mrs. G. Ibe',     status:'active'   },
  { id:8,  name:'Technical College, Sapele',                type:'secondary', lga:'Sapele',          students:760,  teachers:35, head:'Engr. D. Salami', status:'active'   },
  { id:9,  name:'Ughelli Model Primary School',             type:'primary',   lga:'Ughelli North',   students:610,  teachers:20, head:'Mrs. O. Ufuoma',  status:'active'   },
  { id:10, name:'Unity Secondary School, Ozoro',            type:'secondary', lga:'Isoko North',     students:920,  teachers:43, head:'Mr. B. Ijale',    status:'active'   },
  { id:11, name:'Infant Jesus Primary School, Warri',       type:'primary',   lga:'Warri South',     students:720,  teachers:25, head:'Sr. M. Francis',  status:'active'   },
  { id:12, name:'Government Comprehensive School, Agbor',   type:'secondary', lga:'Ika South',       students:1050, teachers:47, head:'Mrs. C. Anigbo',  status:'inactive' },
];

/* ----------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
let allSchools = [];
let filtered   = [];

/* ----------------------------------------------------------------
   POPULATE LGA DROPDOWN
---------------------------------------------------------------- */
function populateLgas() {
  const sel = document.getElementById('lga-filter');
  if (!sel) return;
  LGAS.forEach(lga => {
    const opt = document.createElement('option');
    opt.value = lga;
    opt.textContent = lga;
    sel.appendChild(opt);
  });
}

/* ----------------------------------------------------------------
   RENDER SCHOOL CARDS
---------------------------------------------------------------- */
function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function schoolCardHTML(s) {
  const isActive = s.status === 'active';
  return `
    <article class="school-card" aria-label="${s.name}" tabindex="0">
      <div class="school-card-top">
        <div class="school-initials ${s.type}">${initials(s.name)}</div>
        <div>
          <div class="school-name">${s.name}</div>
          <span class="badge ${s.type === 'primary' ? 'badge-gold' : 'badge-green'}" style="margin-top:.3rem">
            ${s.type === 'primary' ? 'Primary' : 'Secondary'}
          </span>
        </div>
      </div>

      <div class="school-meta">
        <div class="school-meta-row">${Icon.pin}  ${s.lga} LGA</div>
        <div class="school-meta-row">${Icon.users} ${fmt.number(s.students)} students &middot; ${s.teachers} teachers</div>
        <div class="school-meta-row">${Icon.book}  ${s.head}</div>
      </div>

      <div class="school-card-footer">
        <span class="badge ${isActive ? 'badge-green' : 'badge-grey'}">
          ${isActive ? '● Active' : '○ Inactive'}
        </span>
        <button class="btn btn-ghost btn-sm" onclick="viewSchool(${s.id})" aria-label="View ${s.name}">
          Details →
        </button>
      </div>
    </article>
  `;
}

function renderGrid(schools) {
  const grid       = document.getElementById('schools-grid');
  const emptyState = document.getElementById('empty-state');
  const label      = document.getElementById('results-label');

  if (!grid) return;

  label.textContent = `${fmt.number(schools.length)} school${schools.length !== 1 ? 's' : ''} found`;

  if (schools.length === 0) {
    grid.hidden       = true;
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    grid.hidden       = false;
    grid.innerHTML    = schools.map(schoolCardHTML).join('');
    grid.classList.add('stagger');
  }
}

/* ----------------------------------------------------------------
   FILTER
---------------------------------------------------------------- */
function applyFilters() {
  const query = document.getElementById('school-search').value.toLowerCase().trim();
  const type  = document.getElementById('type-filter').value;
  const lga   = document.getElementById('lga-filter').value;

  filtered = allSchools.filter(s =>
    s.name.toLowerCase().includes(query) &&
    (type === 'all' || s.type === type) &&
    (lga  === 'all' || s.lga  === lga)
  );

  renderGrid(filtered);
}

function clearFilters() {
  document.getElementById('school-search').value = '';
  document.getElementById('type-filter').value   = 'all';
  document.getElementById('lga-filter').value    = 'all';
  applyFilters();
}

/* ----------------------------------------------------------------
   VIEW SCHOOL DETAIL (full page — Stage 5)
---------------------------------------------------------------- */
window.viewSchool = function(id) {
  showToast('Full school profile page coming in Stage 5', 'info');
};

/* ----------------------------------------------------------------
   LOAD DATA
---------------------------------------------------------------- */
async function loadSchools() {
  const skeletonGrid = document.getElementById('skeleton-grid');
  const schoolsGrid  = document.getElementById('schools-grid');

  // Show skeleton, hide real grid
  skeletonGrid.hidden = false;
  schoolsGrid.hidden  = true;

  try {
    const data = await apiFetch('/public/schools');
    allSchools = data?.schools || SCHOOLS;
  } catch {
    // No backend yet — use demo data silently
    allSchools = SCHOOLS;
  }

  // Always hide skeleton and show real data
  skeletonGrid.hidden = true;
  filtered = [...allSchools];
  renderGrid(filtered);
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateLgas();

  // Inject search icon
  const slot = document.getElementById('search-icon-slot');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;

  // Wire filters
  const searchInput = document.getElementById('school-search');
  searchInput?.addEventListener('input', debounce(applyFilters, 220));
  document.getElementById('type-filter')?.addEventListener('change', applyFilters);
  document.getElementById('lga-filter')?.addEventListener('change',  applyFilters);
  document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
  document.getElementById('empty-clear')?.addEventListener('click',   clearFilters);

  loadSchools();
});