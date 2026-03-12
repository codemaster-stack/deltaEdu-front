/* ================================================================
   teachers.js — Teacher Registry
   - Load teachers (API + static fallback)
   - Search, filter (LGA, subject, level, status, gender)
   - Grid view / List (table) view toggle
   - View teacher profile in modal
   - Add new teacher form in modal
   - Summary strip stats
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   STATIC DATA
---------------------------------------------------------------- */
const LGAS = [
  'Aniocha North','Aniocha South','Bomadi','Burutu',
  'Ethiope East','Ethiope West','Ika North-East','Ika South',
  'Isoko North','Isoko South','Ndokwa East','Ndokwa West',
  'Okpe','Oshimili North','Oshimili South','Patani','Sapele',
  'Udu','Ughelli North','Ughelli South','Ukwuani','Uvwie',
  'Warri North','Warri South','Warri South-West',
];

const TEACHERS = [
  { id:1,  name:'Mrs. Adaeze Okonkwo',      gender:'female', subject:'Mathematics',       school:'Government Secondary School, Asaba',  lga:'Oshimili South', level:'secondary', status:'active',      years: 12, phone:'08031234567' },
  { id:2,  name:'Mr. Emmanuel Ufuoma',       gender:'male',   subject:'Physics',            school:'Delta State Science Secondary School', lga:'Ethiope East',   level:'secondary', status:'active',      years: 8,  phone:'08051234567' },
  { id:3,  name:'Mrs. Blessing Efiewi',      gender:'female', subject:'English Language',   school:'Community Primary School, Warri',      lga:'Warri South',    level:'primary',   status:'active',      years: 15, phone:'08071234567' },
  { id:4,  name:'Mr. Chukwuemeka Nwosu',     gender:'male',   subject:'Chemistry',          school:'Girls Secondary School, Agbor',        lga:'Ika South',      level:'secondary', status:'on-leave',    years: 6,  phone:'08091234567' },
  { id:5,  name:'Mrs. Grace Ibe',            gender:'female', subject:'Social Studies',     school:'Nsukwa Primary School, Kwale',         lga:'Ndokwa West',    level:'primary',   status:'active',      years: 10, phone:'08011234567' },
  { id:6,  name:'Mr. David Salami',          gender:'male',   subject:'ICT',                school:'Technical College, Sapele',            lga:'Sapele',         level:'secondary', status:'active',      years: 4,  phone:'08061234567' },
  { id:7,  name:'Mrs. Obiageli Ufuoma',      gender:'female', subject:'Biology',            school:'Ughelli Model Primary School',         lga:'Ughelli North',  level:'primary',   status:'active',      years: 9,  phone:'08021234567' },
  { id:8,  name:'Mr. Benjamin Ijale',        gender:'male',   subject:'Government',         school:'Unity Secondary School, Ozoro',        lga:'Isoko North',    level:'secondary', status:'active',      years: 11, phone:'08041234567' },
  { id:9,  name:'Mrs. Chidinma Anigbo',      gender:'female', subject:'Economics',          school:'Government Comprehensive School, Agbor', lga:'Ika South',    level:'secondary', status:'transferred', years: 7,  phone:'08081234567' },
  { id:10, name:'Mr. Festus Enenmo',         gender:'male',   subject:'Agricultural Science',school:'Central Primary School, Abraka',      lga:'Ethiope East',   level:'primary',   status:'active',      years: 13, phone:'08031239999' },
  { id:11, name:'Mrs. Patricia Amadi',       gender:'female', subject:'Literature',         school:"St. Patrick's Secondary School, Asaba", lga:'Oshimili South',level:'secondary', status:'active',      years: 5,  phone:'08051239999' },
  { id:12, name:'Mr. Sunday Okoro',          gender:'male',   subject:'Physical Education', school:'Girls Secondary School, Agbor',        lga:'Ika South',      level:'secondary', status:'retired',     years: 35, phone:'08071239999' },
];

/* Avatar colour palette */
const AVATAR_COLOURS = ['#C9922A','#1A6B4A','#1B4F8A','#7B3FA0','#C0392B','#16A085'];
const avatarColour = id => AVATAR_COLOURS[id % AVATAR_COLOURS.length];

/* ----------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
let allTeachers = [...TEACHERS];
let filtered    = [...TEACHERS];
let viewMode    = 'grid'; // 'grid' | 'list'

/* ----------------------------------------------------------------
   POPULATE LGA DROPDOWN
---------------------------------------------------------------- */
function populateLgas() {
  const sel = document.getElementById('filter-lga');
  if (!sel) return;
  LGAS.forEach(lga => {
    const opt = document.createElement('option');
    opt.value = lga;
    opt.textContent = lga;
    sel.appendChild(opt);
  });
}

/* ----------------------------------------------------------------
   SUMMARY STRIP
---------------------------------------------------------------- */
function renderSummaryStrip(teachers) {
  const strip = document.getElementById('summary-strip');
  if (!strip) return;

  const total      = teachers.length;
  const active     = teachers.filter(t => t.status === 'active').length;
  const primary    = teachers.filter(t => t.level === 'primary').length;
  const secondary  = teachers.filter(t => t.level === 'secondary').length;
  const female     = teachers.filter(t => t.gender === 'female').length;

  const items = [
    { num: fmt.number(total),     label: 'Total Teachers'    },
    { num: fmt.number(active),    label: 'Active'            },
    { num: fmt.number(primary),   label: 'Primary Level'     },
    { num: fmt.number(secondary), label: 'Secondary Level'   },
    { num: fmt.number(female),    label: 'Female Teachers'   },
  ];

  strip.innerHTML = items.map((item, i) => `
    ${i > 0 ? '<div class="summary-divider" aria-hidden="true"></div>' : ''}
    <div class="summary-item">
      <span class="summary-num">${item.num}</span>
      <span class="summary-label">${item.label}</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   FILTER STATS (bottom of filter panel)
---------------------------------------------------------------- */
function renderFilterStats(teachers) {
  const el = document.getElementById('filter-stats');
  if (!el) return;

  const active     = teachers.filter(t => t.status === 'active').length;
  const onLeave    = teachers.filter(t => t.status === 'on-leave').length;
  const transferred= teachers.filter(t => t.status === 'transferred').length;

  el.innerHTML = `
    <div class="filter-stat-row">
      <span class="filter-stat-label">Showing</span>
      <span class="filter-stat-val">${fmt.number(teachers.length)}</span>
    </div>
    <div class="filter-stat-row">
      <span class="filter-stat-label">Active</span>
      <span class="filter-stat-val">${fmt.number(active)}</span>
    </div>
    <div class="filter-stat-row">
      <span class="filter-stat-label">On Leave</span>
      <span class="filter-stat-val">${fmt.number(onLeave)}</span>
    </div>
    <div class="filter-stat-row">
      <span class="filter-stat-label">Transferred</span>
      <span class="filter-stat-val">${fmt.number(transferred)}</span>
    </div>
  `;
}

/* ----------------------------------------------------------------
   STATUS BADGE HTML
---------------------------------------------------------------- */
function statusBadge(status) {
  const map = {
    'active':      'badge-green',
    'on-leave':    'badge-gold',
    'transferred': 'badge-blue',
    'retired':     'badge-grey',
  };
  return `<span class="badge ${map[status] || 'badge-grey'}">${status}</span>`;
}

/* ----------------------------------------------------------------
   RENDER GRID VIEW
---------------------------------------------------------------- */
function renderGrid(teachers) {
  const grid = document.getElementById('teachers-grid');
  if (!grid) return;

  grid.innerHTML = teachers.map(t => `
    <article
      class="teacher-card"
      data-id="${t.id}"
      tabindex="0"
      aria-label="${t.name}"
      onclick="openTeacherProfile(${t.id})"
      onkeydown="if(event.key==='Enter')openTeacherProfile(${t.id})"
    >
      <div class="teacher-card-top">
        <div class="teacher-avatar" style="background:${avatarColour(t.id)}">
          ${t.name.split(' ').filter(Boolean).slice(-1)[0][0]}${t.name.split(' ').filter(Boolean).slice(-2)[0][0]}
        </div>
        <div>
          <div class="teacher-name">${t.name}</div>
          <div class="teacher-subject">${t.subject}</div>
        </div>
      </div>

      <div class="teacher-card-meta">
        <div class="teacher-meta-row">${Icon.pin}  ${t.lga} LGA</div>
        <div class="teacher-meta-row">${Icon.book} ${t.school}</div>
        <div class="teacher-meta-row">${Icon.users} ${t.level === 'primary' ? 'Primary' : 'Secondary'} · ${t.years} yrs experience</div>
      </div>

      <div class="teacher-card-footer">
        ${statusBadge(t.status)}
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openTeacherProfile(${t.id})">
          View →
        </button>
      </div>
    </article>
  `).join('');

  grid.classList.add('stagger');
}

/* ----------------------------------------------------------------
   RENDER TABLE VIEW
---------------------------------------------------------------- */
function renderTable(teachers) {
  const tbody = document.getElementById('teachers-tbody');
  if (!tbody) return;

  tbody.innerHTML = teachers.map(t => `
    <tr>
      <td>
        <div class="td-name">
          <span class="table-avatar" style="background:${avatarColour(t.id)}">
            ${t.name.split(' ').filter(Boolean).slice(-1)[0][0]}
          </span>
          ${t.name}
        </div>
      </td>
      <td>${t.subject}</td>
      <td class="td-school" title="${t.school}">${t.school}</td>
      <td>${t.lga}</td>
      <td><span class="badge ${t.level === 'primary' ? 'badge-gold' : 'badge-green'}">${t.level}</span></td>
      <td>${statusBadge(t.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openTeacherProfile(${t.id})">View →</button>
      </td>
    </tr>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER (switches between grid and table)
---------------------------------------------------------------- */
function renderTeachers(teachers) {
  const gridEl   = document.getElementById('teachers-grid');
  const tableEl  = document.getElementById('teachers-table');
  const emptyEl  = document.getElementById('empty-state');
  const countEl  = document.getElementById('results-count');

  countEl.textContent = `${fmt.number(teachers.length)} teacher${teachers.length !== 1 ? 's' : ''}`;

  if (teachers.length === 0) {
    gridEl.hidden  = true;
    tableEl.hidden = true;
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  if (viewMode === 'grid') {
    tableEl.hidden = true;
    gridEl.hidden  = false;
    renderGrid(teachers);
  } else {
    gridEl.hidden  = true;
    tableEl.hidden = false;
    renderTable(teachers);
  }

  renderFilterStats(teachers);
}

/* ----------------------------------------------------------------
   FILTER LOGIC
---------------------------------------------------------------- */
function applyFilters() {
  const query   = document.getElementById('teacher-search').value.toLowerCase().trim();
  const lga     = document.getElementById('filter-lga').value;
  const subject = document.getElementById('filter-subject').value;
  const level   = document.getElementById('filter-level').value;
  const status  = document.getElementById('filter-status').value;
  const gender  = document.getElementById('filter-gender').value;

  filtered = allTeachers.filter(t => {
    const matchSearch = !query ||
      t.name.toLowerCase().includes(query) ||
      t.school.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query);

    return matchSearch &&
      (lga     === 'all' || t.lga     === lga)     &&
      (subject === 'all' || t.subject === subject) &&
      (level   === 'all' || t.level   === level)   &&
      (status  === 'all' || t.status  === status)  &&
      (gender  === 'all' || t.gender  === gender);
  });

  renderTeachers(filtered);
}

function clearAllFilters() {
  document.getElementById('teacher-search').value  = '';
  document.getElementById('filter-lga').value      = 'all';
  document.getElementById('filter-subject').value  = 'all';
  document.getElementById('filter-level').value    = 'all';
  document.getElementById('filter-status').value   = 'all';
  document.getElementById('filter-gender').value   = 'all';
  filtered = [...allTeachers];
  renderTeachers(filtered);
}

/* ----------------------------------------------------------------
   VIEW TOGGLE
---------------------------------------------------------------- */
function initViewToggle() {
  const gridBtn = document.getElementById('view-grid');
  const listBtn = document.getElementById('view-list');

  gridBtn?.addEventListener('click', () => {
    viewMode = 'grid';
    gridBtn.classList.add('active');    gridBtn.setAttribute('aria-pressed','true');
    listBtn.classList.remove('active'); listBtn.setAttribute('aria-pressed','false');
    renderTeachers(filtered);
  });

  listBtn?.addEventListener('click', () => {
    viewMode = 'list';
    listBtn.classList.add('active');    listBtn.setAttribute('aria-pressed','true');
    gridBtn.classList.remove('active'); gridBtn.setAttribute('aria-pressed','false');
    renderTeachers(filtered);
  });
}

/* ----------------------------------------------------------------
   MODAL — OPEN / CLOSE
---------------------------------------------------------------- */
function openModal(titleText, bodyHTML) {
  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const body    = document.getElementById('modal-body');
  if (!overlay) return;

  title.textContent = titleText;
  body.innerHTML    = bodyHTML;
  overlay.hidden    = false;
  document.body.style.overflow = 'hidden';

  // Focus trap — first focusable element
  overlay.querySelector('button, input, select, textarea, a')?.focus();
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.hidden = true;
  document.body.style.overflow = '';
}

function initModalClose() {
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ----------------------------------------------------------------
   VIEW TEACHER PROFILE
---------------------------------------------------------------- */
window.openTeacherProfile = function(id) {
  const t = allTeachers.find(t => t.id === id);
  if (!t) return;

  const initials = t.name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('');

  const bodyHTML = `
    <div class="teacher-profile-header">
      <div class="teacher-profile-avatar" style="background:${avatarColour(t.id)}">${initials}</div>
      <div>
        <div class="teacher-profile-name">${t.name}</div>
        <div class="teacher-profile-subject">${t.subject} Teacher</div>
        <div style="margin-top:var(--s2)">${statusBadge(t.status)}</div>
      </div>
    </div>

    <div class="profile-fields">
      <div>
        <div class="profile-field-label">School</div>
        <div class="profile-field-value">${t.school}</div>
      </div>
      <div>
        <div class="profile-field-label">LGA</div>
        <div class="profile-field-value">${t.lga}</div>
      </div>
      <div>
        <div class="profile-field-label">Level</div>
        <div class="profile-field-value" style="text-transform:capitalize">${t.level}</div>
      </div>
      <div>
        <div class="profile-field-label">Gender</div>
        <div class="profile-field-value" style="text-transform:capitalize">${t.gender}</div>
      </div>
      <div>
        <div class="profile-field-label">Years of Service</div>
        <div class="profile-field-value">${t.years} years</div>
      </div>
      <div>
        <div class="profile-field-label">Phone</div>
        <div class="profile-field-value">${t.phone}</div>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="initiateTransfer(${t.id})">Transfer Teacher</button>
      <button class="btn btn-outline" onclick="showLeaveForm(${t.id})">Record Leave</button>
      <button class="btn btn-gold"    onclick="editTeacher(${t.id})">Edit Record</button>
    </div>
  `;

  openModal(t.name, bodyHTML);
};

/* Placeholder actions — wired to backend in Stage 4 */
window.initiateTransfer = id => showToast('Teacher transfer module coming in Stage 4', 'info');
window.showLeaveForm    = id => showToast('Leave management coming in Stage 4', 'info');
window.editTeacher      = id => showToast('Edit teacher record coming in Stage 4', 'info');

/* ----------------------------------------------------------------
   ADD TEACHER FORM
---------------------------------------------------------------- */
function openAddTeacherModal() {
  const bodyHTML = `
    <form class="add-teacher-form" id="add-teacher-form" novalidate>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="at-firstname">First Name *</label>
          <input type="text" id="at-firstname" class="form-control" placeholder="e.g. Adaeze" required />
          <span class="field-error" id="at-firstname-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="at-lastname">Last Name *</label>
          <input type="text" id="at-lastname" class="form-control" placeholder="e.g. Okonkwo" required />
          <span class="field-error" id="at-lastname-error" hidden></span>
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="at-gender">Gender *</label>
          <select id="at-gender" class="form-control form-select" required>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <span class="field-error" id="at-gender-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="at-phone">Phone *</label>
          <input type="tel" id="at-phone" class="form-control" placeholder="08012345678" required />
          <span class="field-error" id="at-phone-error" hidden></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="at-subject">Subject *</label>
        <select id="at-subject" class="form-control form-select" required>
          <option value="">Select subject</option>
          <option>Mathematics</option><option>English Language</option>
          <option>Physics</option><option>Chemistry</option><option>Biology</option>
          <option>Economics</option><option>Government</option><option>Literature</option>
          <option>History</option><option>ICT</option><option>Social Studies</option>
          <option>Basic Science</option><option>Agricultural Science</option>
          <option>Physical Education</option>
        </select>
        <span class="field-error" id="at-subject-error" hidden></span>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="at-level">School Level *</label>
          <select id="at-level" class="form-control form-select" required>
            <option value="">Select level</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
          <span class="field-error" id="at-level-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="at-lga">LGA *</label>
          <select id="at-lga" class="form-control form-select" required>
            <option value="">Select LGA</option>
            ${LGAS.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
          <span class="field-error" id="at-lga-error" hidden></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="at-school">School *</label>
        <input type="text" id="at-school" class="form-control" placeholder="Full school name" required />
        <span class="field-error" id="at-school-error" hidden></span>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-gold"    id="at-submit">Save Teacher</button>
      </div>

    </form>
  `;

  openModal('Add New Teacher', bodyHTML);

  // Wire form submit after modal HTML is injected
  setTimeout(() => {
    document.getElementById('add-teacher-form')?.addEventListener('submit', submitAddTeacher);
  }, 0);
}

async function submitAddTeacher(e) {
  e.preventDefault();

  const fields = {
    'at-firstname': document.getElementById('at-firstname').value,
    'at-lastname':  document.getElementById('at-lastname').value,
    'at-gender':    document.getElementById('at-gender').value,
    'at-phone':     document.getElementById('at-phone').value,
    'at-subject':   document.getElementById('at-subject').value,
    'at-level':     document.getElementById('at-level').value,
    'at-lga':       document.getElementById('at-lga').value,
    'at-school':    document.getElementById('at-school').value,
  };

  const errors = validate(fields, {
    'at-firstname': ['required'],
    'at-lastname':  ['required'],
    'at-gender':    ['required'],
    'at-phone':     ['required', 'phone'],
    'at-subject':   ['required'],
    'at-level':     ['required'],
    'at-lga':       ['required'],
    'at-school':    ['required'],
  });

  if (errors) { showFieldErrors(errors); return; }
  clearFieldErrors(Object.keys(fields));

  const submitBtn = document.getElementById('at-submit');
  const restore   = setLoadingBtn(submitBtn, 'Saving…');

  try {
    // Replace with: await apiFetch('/teachers', { method:'POST', body: fields })
    await new Promise(r => setTimeout(r, 1200));

    // Add to local list optimistically
    const newTeacher = {
      id:      allTeachers.length + 1,
      name:    `${fields['at-firstname']} ${fields['at-lastname']}`,
      gender:  fields['at-gender'],
      subject: fields['at-subject'],
      school:  fields['at-school'],
      lga:     fields['at-lga'],
      level:   fields['at-level'],
      status:  'active',
      years:   0,
      phone:   fields['at-phone'],
    };

    allTeachers.unshift(newTeacher);
    filtered = [...allTeachers];
    renderTeachers(filtered);
    renderSummaryStrip(allTeachers);
    closeModal();
    showToast(`${newTeacher.name} added successfully.`, 'success');

  } catch {
    showToast('Failed to save. Please try again.', 'error');
    restore();
  }
}

/* ----------------------------------------------------------------
   LOAD DATA
---------------------------------------------------------------- */
async function loadTeachers() {
  document.getElementById('skeleton-grid').hidden = false;
  document.getElementById('teachers-grid').hidden  = true;

  try {
    const data = await apiFetch('/teachers');
    if (data?.teachers?.length) {
      allTeachers = data.teachers;
      filtered    = [...allTeachers];
    }
  } catch {
    // use static fallback
  }

  document.getElementById('skeleton-grid').hidden = true;
  renderTeachers(filtered);
  renderSummaryStrip(allTeachers);
  renderFilterStats(allTeachers);
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateLgas();

  // Inject search icon
  const slot = document.getElementById('search-icon-slot');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;

  // Search
  document.getElementById('teacher-search')
    ?.addEventListener('input', debounce(applyFilters, 220));

  // Filter dropdowns
  ['filter-lga','filter-subject','filter-level','filter-status','filter-gender']
    .forEach(id => document.getElementById(id)?.addEventListener('change', applyFilters));

  // Clear buttons
  document.getElementById('clear-all-filters')?.addEventListener('click', clearAllFilters);
  document.getElementById('empty-clear')?.addEventListener('click', clearAllFilters);

  // Add teacher button
  document.getElementById('add-teacher-btn')?.addEventListener('click', openAddTeacherModal);

  // View toggle
  initViewToggle();

  // Modal close
  initModalClose();

  // Load data
  loadTeachers();
});