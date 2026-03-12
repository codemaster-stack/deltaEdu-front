/* ================================================================
   students.js — Student Management
   - Load students (API + static fallback)
   - Search + 5 filters (LGA, level, class, gender, status)
   - Grid / Table view toggle
   - Student profile modal with tabs (Info, Results, Attendance)
   - Enrol new student form modal
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

const PRIMARY_CLASSES   = ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6'];
const SECONDARY_CLASSES = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const ALL_CLASSES       = [...PRIMARY_CLASSES, ...SECONDARY_CLASSES];

const STUDENTS = [
  { id:1,  studentId:'DSS/2024/001001', name:'Chisom Okonkwo',     gender:'female', dob:'2010-04-12', class:'SS 2',      school:'Government Secondary School, Asaba',     lga:'Oshimili South', level:'secondary', status:'active',      guardian:'Mr. C. Okonkwo',  phone:'08031234567' },
  { id:2,  studentId:'DSS/2024/001002', name:'Emeka Ufuoma',        gender:'male',   dob:'2009-08-23', class:'SS 3',      school:'Delta State Science Secondary School',    lga:'Ethiope East',   level:'secondary', status:'active',      guardian:'Mrs. R. Ufuoma',  phone:'08051234567' },
  { id:3,  studentId:'DSP/2024/002001', name:'Blessing Efiewi',     gender:'female', dob:'2014-01-05', class:'Primary 5', school:'Community Primary School, Warri',          lga:'Warri South',    level:'primary',   status:'active',      guardian:'Mr. K. Efiewi',   phone:'08071234567' },
  { id:4,  studentId:'DSS/2024/001003', name:'Tochukwu Nwosu',      gender:'male',   dob:'2010-11-17', class:'SS 2',      school:'Girls Secondary School, Agbor',            lga:'Ika South',      level:'secondary', status:'transferred', guardian:'Mrs. N. Nwosu',   phone:'08091234567' },
  { id:5,  studentId:'DSP/2024/002002', name:'Adaeze Ibe',           gender:'female', dob:'2015-03-29', class:'Primary 4', school:'Nsukwa Primary School, Kwale',             lga:'Ndokwa West',    level:'primary',   status:'active',      guardian:'Mr. O. Ibe',      phone:'08011234567' },
  { id:6,  studentId:'DSS/2024/001004', name:'Kingsley Salami',      gender:'male',   dob:'2008-07-14', class:'SS 3',      school:'Technical College, Sapele',                lga:'Sapele',         level:'secondary', status:'graduated',   guardian:'Mrs. F. Salami',  phone:'08061234567' },
  { id:7,  studentId:'DSP/2024/002003', name:'Ufuoma Atsiasa',       gender:'female', dob:'2013-09-02', class:'Primary 6', school:'Ughelli Model Primary School',             lga:'Ughelli North',  level:'primary',   status:'active',      guardian:'Mr. P. Atsiasa',  phone:'08021234567' },
  { id:8,  studentId:'DSS/2024/001005', name:'Oghenekevwe Ijale',    gender:'male',   dob:'2011-12-20', class:'JSS 3',     school:'Unity Secondary School, Ozoro',            lga:'Isoko North',    level:'secondary', status:'active',      guardian:'Mrs. T. Ijale',   phone:'08041234567' },
  { id:9,  studentId:'DSS/2024/001006', name:'Amarachi Anigbo',      gender:'female', dob:'2009-05-08', class:'SS 2',      school:'Government Comprehensive School, Agbor',   lga:'Ika South',      level:'secondary', status:'active',      guardian:'Mr. B. Anigbo',   phone:'08081234567' },
  { id:10, studentId:'DSP/2024/002004', name:'Chukwudi Enenmo',      gender:'male',   dob:'2014-02-16', class:'Primary 5', school:'Central Primary School, Abraka',           lga:'Ethiope East',   level:'primary',   status:'active',      guardian:'Mrs. A. Enenmo',  phone:'08031239999' },
  { id:11, studentId:'DSS/2024/001007', name:'Ifeoma Amadi',         gender:'female', dob:'2011-06-30', class:'JSS 2',     school:"St. Patrick's Secondary School, Asaba",    lga:'Oshimili South', level:'secondary', status:'active',      guardian:'Rev. P. Amadi',   phone:'08051239999' },
  { id:12, studentId:'DSP/2024/002005', name:'Ebuka Okoro',          gender:'male',   dob:'2016-10-11', class:'Primary 2', school:'Girls Secondary School, Agbor',            lga:'Ika South',      level:'primary',   status:'withdrawn',   guardian:'Mrs. G. Okoro',   phone:'08071239999' },
];

const MOCK_RESULTS = [
  { subject:'Mathematics',     ca:28, exam:62, total:90, grade:'A1' },
  { subject:'English Language',ca:25, exam:55, total:80, grade:'B2' },
  { subject:'Basic Science',   ca:22, exam:50, total:72, grade:'C4' },
  { subject:'Social Studies',  ca:27, exam:58, total:85, grade:'B3' },
  { subject:'ICT',             ca:30, exam:65, total:95, grade:'A1' },
];

const AVATAR_COLOURS = ['#1A6B4A','#C9922A','#1B4F8A','#7B3FA0','#C0392B','#16A085'];
const avatarColour = id => AVATAR_COLOURS[id % AVATAR_COLOURS.length];

/* ----------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
let allStudents = [...STUDENTS];
let filtered    = [...STUDENTS];
let viewMode    = 'grid';

/* ----------------------------------------------------------------
   POPULATE DROPDOWNS
---------------------------------------------------------------- */
function populateDropdowns() {
  const lgaSel   = document.getElementById('filter-lga');
  const classSel = document.getElementById('filter-class');

  LGAS.forEach(lga => {
    const opt = document.createElement('option');
    opt.value = lga; opt.textContent = lga;
    lgaSel?.appendChild(opt);
  });
  ALL_CLASSES.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls; opt.textContent = cls;
    classSel?.appendChild(opt);
  });
}

/* ----------------------------------------------------------------
   SUMMARY STRIP
---------------------------------------------------------------- */
function renderSummaryStrip(students) {
  const strip = document.getElementById('summary-strip');
  if (!strip) return;
  const total     = students.length;
  const active    = students.filter(s => s.status === 'active').length;
  const primary   = students.filter(s => s.level === 'primary').length;
  const secondary = students.filter(s => s.level === 'secondary').length;
  const female    = students.filter(s => s.gender === 'female').length;

  strip.innerHTML = [
    { num: fmt.number(total),     label:'Total Students'  },
    { num: fmt.number(active),    label:'Active'          },
    { num: fmt.number(primary),   label:'Primary Level'   },
    { num: fmt.number(secondary), label:'Secondary Level' },
    { num: fmt.number(female),    label:'Female Students' },
  ].map((item, i) => `
    ${i > 0 ? '<div class="summary-divider" aria-hidden="true"></div>' : ''}
    <div class="summary-item">
      <span class="summary-num">${item.num}</span>
      <span class="summary-label">${item.label}</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   FILTER STATS
---------------------------------------------------------------- */
function renderFilterStats(students) {
  const el = document.getElementById('filter-stats');
  if (!el) return;
  const active = students.filter(s => s.status === 'active').length;
  const grads  = students.filter(s => s.status === 'graduated').length;
  el.innerHTML = `
    <div class="filter-stat-row"><span class="filter-stat-label">Showing</span><span class="filter-stat-val">${fmt.number(students.length)}</span></div>
    <div class="filter-stat-row"><span class="filter-stat-label">Active</span><span class="filter-stat-val">${fmt.number(active)}</span></div>
    <div class="filter-stat-row"><span class="filter-stat-label">Graduated</span><span class="filter-stat-val">${fmt.number(grads)}</span></div>
  `;
}

/* ----------------------------------------------------------------
   HELPERS
---------------------------------------------------------------- */
function statusBadge(status) {
  const map = { active:'badge-green', graduated:'badge-blue', transferred:'badge-gold', withdrawn:'badge-grey' };
  return `<span class="badge ${map[status] || 'badge-grey'}">${status}</span>`;
}

function initials(name) {
  const parts = name.split(' ').filter(Boolean);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/* ----------------------------------------------------------------
   RENDER GRID
---------------------------------------------------------------- */
function renderGrid(students) {
  const grid = document.getElementById('students-grid');
  if (!grid) return;
  grid.innerHTML = students.map(s => `
    <article class="student-card" tabindex="0" aria-label="${s.name}"
      onclick="openStudentProfile(${s.id})"
      onkeydown="if(event.key==='Enter')openStudentProfile(${s.id})">
      <div class="student-card-top">
        <div class="student-avatar" style="background:${avatarColour(s.id)}">${initials(s.name)}</div>
        <div>
          <div class="student-name">${s.name}</div>
          <div class="student-id">${s.studentId}</div>
        </div>
      </div>
      <div class="student-card-meta">
        <div class="student-meta-row">${Icon.book} ${s.class} &middot; ${s.level === 'primary' ? 'Primary' : 'Secondary'}</div>
        <div class="student-meta-row">${Icon.pin}  ${s.lga} LGA</div>
        <div class="student-meta-row">${Icon.users} ${s.school}</div>
      </div>
      <div class="student-card-footer">
        ${statusBadge(s.status)}
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openStudentProfile(${s.id})">View →</button>
      </div>
    </article>
  `).join('');
  grid.classList.add('stagger');
}

/* ----------------------------------------------------------------
   RENDER TABLE
---------------------------------------------------------------- */
function renderTable(students) {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;
  tbody.innerHTML = students.map(s => `
    <tr>
      <td><div class="td-name">
        <span class="table-avatar" style="background:${avatarColour(s.id)}">${initials(s.name)[0]}</span>
        ${s.name}
      </div></td>
      <td class="td-mono">${s.studentId}</td>
      <td>${s.class}</td>
      <td class="td-school" title="${s.school}">${s.school}</td>
      <td>${s.lga}</td>
      <td><span class="badge ${s.gender === 'female' ? 'badge-gold' : 'badge-blue'}">${s.gender}</span></td>
      <td>${statusBadge(s.status)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openStudentProfile(${s.id})">View →</button></td>
    </tr>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER (dispatch)
---------------------------------------------------------------- */
function renderStudents(students) {
  const gridEl  = document.getElementById('students-grid');
  const tableEl = document.getElementById('students-table');
  const emptyEl = document.getElementById('empty-state');
  const countEl = document.getElementById('results-count');

  countEl.textContent = `${fmt.number(students.length)} student${students.length !== 1 ? 's' : ''}`;

  if (students.length === 0) {
    gridEl.hidden = true; tableEl.hidden = true; emptyEl.hidden = false; return;
  }
  emptyEl.hidden = true;
  if (viewMode === 'grid') {
    tableEl.hidden = true; gridEl.hidden = false; renderGrid(students);
  } else {
    gridEl.hidden = true; tableEl.hidden = false; renderTable(students);
  }
  renderFilterStats(students);
}

/* ----------------------------------------------------------------
   FILTER
---------------------------------------------------------------- */
function applyFilters() {
  const query  = document.getElementById('student-search').value.toLowerCase().trim();
  const lga    = document.getElementById('filter-lga').value;
  const level  = document.getElementById('filter-level').value;
  const cls    = document.getElementById('filter-class').value;
  const gender = document.getElementById('filter-gender').value;
  const status = document.getElementById('filter-status').value;

  filtered = allStudents.filter(s => {
    const matchSearch = !query ||
      s.name.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query) ||
      s.school.toLowerCase().includes(query);
    return matchSearch &&
      (lga    === 'all' || s.lga    === lga)    &&
      (level  === 'all' || s.level  === level)  &&
      (cls    === 'all' || s.class  === cls)    &&
      (gender === 'all' || s.gender === gender) &&
      (status === 'all' || s.status === status);
  });
  renderStudents(filtered);
}

function clearAllFilters() {
  ['student-search','filter-lga','filter-level','filter-class','filter-gender','filter-status']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = el.tagName === 'INPUT' ? '' : 'all'; });
  filtered = [...allStudents];
  renderStudents(filtered);
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
    renderStudents(filtered);
  });
  listBtn?.addEventListener('click', () => {
    viewMode = 'list';
    listBtn.classList.add('active');    listBtn.setAttribute('aria-pressed','true');
    gridBtn.classList.remove('active'); gridBtn.setAttribute('aria-pressed','false');
    renderStudents(filtered);
  });
}

/* ----------------------------------------------------------------
   MODAL
---------------------------------------------------------------- */
function openModal(titleText, bodyHTML) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent = titleText;
  document.getElementById('modal-body').innerHTML    = bodyHTML;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  overlay.querySelector('button, input, select')?.focus();
}

window.closeModal = function() {
  document.getElementById('modal-overlay').hidden = true;
  document.body.style.overflow = '';
};

function initModalClose() {
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ----------------------------------------------------------------
   STUDENT PROFILE MODAL
---------------------------------------------------------------- */
window.openStudentProfile = function(id) {
  const s = allStudents.find(s => s.id === id);
  if (!s) return;

  const age = new Date().getFullYear() - new Date(s.dob).getFullYear();

  const resultsRows = MOCK_RESULTS.map(r => `
    <div class="result-row">
      <span class="result-subject">${r.subject}</span>
      <span class="result-score">${r.total}</span>
      <span class="result-grade">
        <span class="badge ${r.total >= 75 ? 'badge-green' : r.total >= 50 ? 'badge-gold' : 'badge-red'}">${r.grade}</span>
      </span>
      <span style="font-size:.78rem;color:var(--navy-300);text-align:right">CA:${r.ca} | Ex:${r.exam}</span>
    </div>
  `).join('');

  const bodyHTML = `
    <div class="student-profile-header">
      <div class="student-profile-avatar" style="background:${avatarColour(s.id)}">${initials(s.name)}</div>
      <div>
        <div class="student-profile-name">${s.name}</div>
        <div class="student-profile-id">${s.studentId}</div>
        <div style="margin-top:var(--s2)">${statusBadge(s.status)}</div>
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" data-tab="info">Info</button>
      <button class="modal-tab"        data-tab="results">Results</button>
      <button class="modal-tab"        data-tab="attendance">Attendance</button>
    </div>

    <div class="modal-tab-panel active" id="tab-info">
      <div class="profile-fields">
        <div><div class="profile-field-label">Class</div><div class="profile-field-value">${s.class}</div></div>
        <div><div class="profile-field-label">Level</div><div class="profile-field-value" style="text-transform:capitalize">${s.level}</div></div>
        <div><div class="profile-field-label">School</div><div class="profile-field-value">${s.school}</div></div>
        <div><div class="profile-field-label">LGA</div><div class="profile-field-value">${s.lga}</div></div>
        <div><div class="profile-field-label">Gender</div><div class="profile-field-value" style="text-transform:capitalize">${s.gender}</div></div>
        <div><div class="profile-field-label">Age</div><div class="profile-field-value">${age} years</div></div>
        <div><div class="profile-field-label">Date of Birth</div><div class="profile-field-value">${fmt.date(s.dob)}</div></div>
        <div><div class="profile-field-label">Guardian</div><div class="profile-field-value">${s.guardian}</div></div>
        <div><div class="profile-field-label">Guardian Phone</div><div class="profile-field-value">${s.phone}</div></div>
      </div>
    </div>

    <div class="modal-tab-panel" id="tab-results">
      <div class="results-preview">
        <div class="result-row result-headers">
          <span>Subject</span><span style="text-align:center">Total</span>
          <span style="text-align:center">Grade</span><span style="text-align:right">Breakdown</span>
        </div>
        ${resultsRows}
      </div>
      <p style="font-size:.78rem;color:var(--navy-300);margin-top:var(--s3)">* Sample data. Full results available when backend is connected.</p>
    </div>

    <div class="modal-tab-panel" id="tab-attendance">
      <div style="text-align:center;padding:var(--s7) var(--s4)">
        <div style="font-size:3rem;margin-bottom:var(--s3)">📅</div>
        <h4 style="font-family:var(--font-display);color:var(--navy);margin-bottom:var(--s2)">Attendance Records</h4>
        <p style="color:var(--navy-300);font-size:.9rem">Full attendance tracking available when the backend is connected.</p>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="transferStudent(${s.id})">Transfer</button>
      <button class="btn btn-outline" onclick="recordWithdrawal(${s.id})">Withdraw</button>
      <button class="btn btn-gold"    onclick="editStudent(${s.id})">Edit Record</button>
    </div>
  `;

  openModal(s.name, bodyHTML);

  setTimeout(() => {
    document.querySelectorAll('.modal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
      });
    });
  }, 0);
};

window.transferStudent  = () => showToast('Student transfer coming in Stage 5', 'info');
window.recordWithdrawal = () => showToast('Withdrawal recording coming in Stage 5', 'info');
window.editStudent      = () => showToast('Edit student record coming in Stage 5', 'info');

/* ----------------------------------------------------------------
   ENROL STUDENT FORM
---------------------------------------------------------------- */
function openEnrolModal() {
  const lgaOpts   = LGAS.map(l => `<option value="${l}">${l}</option>`).join('');
  const classOpts = ALL_CLASSES.map(c => `<option value="${c}">${c}</option>`).join('');

  const bodyHTML = `
    <form class="enrol-form" id="enrol-form" novalidate>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="en-firstname">First Name *</label>
          <input type="text" id="en-firstname" class="form-control" placeholder="e.g. Chisom" />
          <span class="field-error" id="en-firstname-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="en-lastname">Last Name *</label>
          <input type="text" id="en-lastname" class="form-control" placeholder="e.g. Okonkwo" />
          <span class="field-error" id="en-lastname-error" hidden></span>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="en-gender">Gender *</label>
          <select id="en-gender" class="form-control form-select">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <span class="field-error" id="en-gender-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="en-dob">Date of Birth *</label>
          <input type="date" id="en-dob" class="form-control" />
          <span class="field-error" id="en-dob-error" hidden></span>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="en-class">Class *</label>
          <select id="en-class" class="form-control form-select">
            <option value="">Select class</option>${classOpts}
          </select>
          <span class="field-error" id="en-class-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="en-lga">LGA *</label>
          <select id="en-lga" class="form-control form-select">
            <option value="">Select LGA</option>${lgaOpts}
          </select>
          <span class="field-error" id="en-lga-error" hidden></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="en-school">School *</label>
        <input type="text" id="en-school" class="form-control" placeholder="Full school name" />
        <span class="field-error" id="en-school-error" hidden></span>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="en-guardian">Guardian Name *</label>
          <input type="text" id="en-guardian" class="form-control" placeholder="Parent / Guardian" />
          <span class="field-error" id="en-guardian-error" hidden></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="en-phone">Guardian Phone *</label>
          <input type="tel" id="en-phone" class="form-control" placeholder="08012345678" />
          <span class="field-error" id="en-phone-error" hidden></span>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-gold" id="en-submit">Enrol Student</button>
      </div>
    </form>
  `;

  openModal('Enrol New Student', bodyHTML);

  setTimeout(() => {
    document.getElementById('enrol-form')?.addEventListener('submit', async e => {
      e.preventDefault();

      const fields = {
        'en-firstname': document.getElementById('en-firstname').value,
        'en-lastname':  document.getElementById('en-lastname').value,
        'en-gender':    document.getElementById('en-gender').value,
        'en-dob':       document.getElementById('en-dob').value,
        'en-class':     document.getElementById('en-class').value,
        'en-lga':       document.getElementById('en-lga').value,
        'en-school':    document.getElementById('en-school').value,
        'en-guardian':  document.getElementById('en-guardian').value,
        'en-phone':     document.getElementById('en-phone').value,
      };

      const errors = validate(fields, {
        'en-firstname': ['required'],
        'en-lastname':  ['required'],
        'en-gender':    ['required'],
        'en-dob':       ['required'],
        'en-class':     ['required'],
        'en-lga':       ['required'],
        'en-school':    ['required'],
        'en-guardian':  ['required'],
        'en-phone':     ['required', 'phone'],
      });

      if (errors) { showFieldErrors(errors); return; }
      clearFieldErrors(Object.keys(fields));

      const btn     = document.getElementById('en-submit');
      const restore = setLoadingBtn(btn, 'Enrolling…');

      try {
        // Replace with: await apiFetch('/students', { method:'POST', body: fields })
        await new Promise(r => setTimeout(r, 1200));

        const level  = PRIMARY_CLASSES.includes(fields['en-class']) ? 'primary' : 'secondary';
        const prefix = level === 'primary' ? 'DSP' : 'DSS';

        const newStudent = {
          id:        allStudents.length + 1,
          studentId: `${prefix}/2025/${String(allStudents.length + 1).padStart(6,'0')}`,
          name:      `${fields['en-firstname']} ${fields['en-lastname']}`,
          gender:    fields['en-gender'],
          dob:       fields['en-dob'],
          class:     fields['en-class'],
          school:    fields['en-school'],
          lga:       fields['en-lga'],
          level,
          status:    'active',
          guardian:  fields['en-guardian'],
          phone:     fields['en-phone'],
        };

        allStudents.unshift(newStudent);
        filtered = [...allStudents];
        renderStudents(filtered);
        renderSummaryStrip(allStudents);
        closeModal();
        showToast(`${newStudent.name} enrolled successfully.`, 'success');

      } catch {
        showToast('Enrolment failed. Please try again.', 'error');
        restore();
      }
    });
  }, 0);
}

/* ----------------------------------------------------------------
   LOAD DATA
---------------------------------------------------------------- */
async function loadStudents() {
  document.getElementById('skeleton-grid').hidden = false;
  document.getElementById('students-grid').hidden  = true;

  try {
    const data = await apiFetch('/students');
    if (data?.students?.length) { allStudents = data.students; filtered = [...allStudents]; }
  } catch { /* use static */ }

  document.getElementById('skeleton-grid').hidden = true;
  renderStudents(filtered);
  renderSummaryStrip(allStudents);
  renderFilterStats(allStudents);
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();

  const slot = document.getElementById('search-icon-slot');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;

  document.getElementById('student-search')?.addEventListener('input', debounce(applyFilters, 220));

  ['filter-lga','filter-level','filter-class','filter-gender','filter-status']
    .forEach(id => document.getElementById(id)?.addEventListener('change', applyFilters));

  document.getElementById('clear-all-filters')?.addEventListener('click', clearAllFilters);
  document.getElementById('empty-clear')?.addEventListener('click', clearAllFilters);
  document.getElementById('add-student-btn')?.addEventListener('click', openEnrolModal);

  initViewToggle();
  initModalClose();
  loadStudents();
});