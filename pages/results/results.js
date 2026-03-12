/* ================================================================
   results.js — Results Portal
   - Tab switching (Check / Upload / Manage)
   - Check results form — lookup by student ID + exam + PIN
   - Render full result card with subject scores + bar charts
   - Upload results form with drag-and-drop file zone
   - Manage records table with search + filter
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

const GRADE_SCALE = [
  { grade:'A1', range:'75–100', desc:'Excellent',      colour:'var(--green)' },
  { grade:'B2', range:'70–74',  desc:'Very Good',      colour:'var(--green-light)' },
  { grade:'B3', range:'65–69',  desc:'Good',           colour:'var(--blue)' },
  { grade:'C4', range:'60–64',  desc:'Credit',         colour:'var(--blue)' },
  { grade:'C5', range:'55–59',  desc:'Credit',         colour:'var(--gold)' },
  { grade:'C6', range:'50–54',  desc:'Credit',         colour:'var(--gold)' },
  { grade:'D7', range:'45–49',  desc:'Pass',           colour:'var(--gold-hover)' },
  { grade:'E8', range:'40–44',  desc:'Pass',           colour:'var(--navy-300)' },
  { grade:'F9', range:'0–39',   desc:'Fail',           colour:'var(--red)' },
];

/* Sample results database keyed by studentId */
const RESULTS_DB = {
  'DSS/2024/001001': {
    name:     'Chioma Okafor',
    class:    'SSS 2',
    school:   'Government Secondary School, Asaba',
    session:  '2024/2025',
    term:     'Third Term',
    position: 3,
    total:    45,
    remark:   'Chioma has shown excellent dedication this term. Her performance in the sciences is particularly commendable. We encourage her to maintain this standard.',
    subjects: [
      { name:'Mathematics',       ca:28, exam:60, total:88 },
      { name:'English Language',  ca:24, exam:50, total:74 },
      { name:'Physics',           ca:30, exam:61, total:91 },
      { name:'Chemistry',         ca:26, exam:53, total:79 },
      { name:'Economics',         ca:27, exam:56, total:83 },
      { name:'Government',        ca:22, exam:48, total:70 },
      { name:'Literature',        ca:25, exam:47, total:72 },
    ],
  },
  'DSS/2024/001004': {
    name:     'Tunde Adeyemi',
    class:    'SSS 3',
    school:   'Delta State Science Secondary School',
    session:  '2024/2025',
    term:     'Third Term',
    position: 1,
    total:    38,
    remark:   'Tunde is an exceptional student who leads his class with distinction. His scientific aptitude and consistency are model qualities for his peers.',
    subjects: [
      { name:'Mathematics',       ca:30, exam:65, total:95 },
      { name:'English Language',  ca:26, exam:56, total:82 },
      { name:'Physics',           ca:29, exam:61, total:90 },
      { name:'Chemistry',         ca:28, exam:60, total:88 },
      { name:'Biology',           ca:27, exam:51, total:78 },
      { name:'Further Mathematics',ca:30,exam:62, total:92 },
    ],
  },
};

/* Sample manage records */
let ALL_RECORDS = [
  { studentId:'DSS/2024/001001', name:'Chioma Okafor',   class:'SSS 2', subject:'Mathematics',    score:88, exam:'terminal-3', school:'Government Secondary School, Asaba' },
  { studentId:'DSS/2024/001001', name:'Chioma Okafor',   class:'SSS 2', subject:'Physics',         score:91, exam:'terminal-3', school:'Government Secondary School, Asaba' },
  { studentId:'DSS/2024/001001', name:'Chioma Okafor',   class:'SSS 2', subject:'Chemistry',       score:79, exam:'terminal-3', school:'Government Secondary School, Asaba' },
  { studentId:'DSS/2024/001002', name:'Emeka Eze',        class:'SSS 1', subject:'Mathematics',    score:72, exam:'terminal-3', school:'Government Secondary School, Asaba' },
  { studentId:'DSS/2024/001002', name:'Emeka Eze',        class:'SSS 1', subject:'English Language',score:65, exam:'terminal-3', school:'Government Secondary School, Asaba' },
  { studentId:'DSS/2024/001004', name:'Tunde Adeyemi',   class:'SSS 3', subject:'Physics',         score:90, exam:'terminal-3', school:'Delta State Science Secondary School' },
  { studentId:'DSS/2024/001004', name:'Tunde Adeyemi',   class:'SSS 3', subject:'Mathematics',    score:95, exam:'terminal-3', school:'Delta State Science Secondary School' },
  { studentId:'DSS/2024/001007', name:'Amara Nwosu',     class:'SSS 2', subject:'Economics',       score:81, exam:'terminal-2', school:'Girls Secondary School, Agbor' },
  { studentId:'DSS/2024/001007', name:'Amara Nwosu',     class:'SSS 2', subject:'Government',      score:77, exam:'terminal-2', school:'Girls Secondary School, Agbor' },
  { studentId:'DSS/2024/001006', name:'Samuel Oghene',   class:'JSS 1', subject:'Basic Science',   score:68, exam:'terminal-1', school:'Unity Secondary School, Ozoro' },
];

let filteredRecords = [...ALL_RECORDS];

/* Upload history */
const UPLOAD_HISTORY = [
  { name:'SSS 2 Mathematics — Third Term 2024/2025', school:'Govt. Sec. School, Asaba',   date:'2025-03-08', count:45, status:'approved' },
  { name:'SSS 3 Physics — Third Term 2024/2025',     school:'Delta State Science Sec.',    date:'2025-03-07', count:38, status:'approved' },
  { name:'JSS 1 Basic Science — First Term 2024/2025', school:'Unity Sec. School, Ozoro', date:'2025-02-20', count:52, status:'approved' },
  { name:'SSS 1 English — Second Term 2024/2025',    school:'Girls Sec. School, Agbor',    date:'2025-02-14', count:41, status:'pending'  },
];

/* ----------------------------------------------------------------
   GRADING HELPERS
---------------------------------------------------------------- */
function getGrade(score) {
  if (score >= 75) return { g:'A1', colour:'var(--green)'       };
  if (score >= 70) return { g:'B2', colour:'var(--green-light)' };
  if (score >= 65) return { g:'B3', colour:'var(--blue)'        };
  if (score >= 60) return { g:'C4', colour:'var(--blue)'        };
  if (score >= 55) return { g:'C5', colour:'var(--gold)'        };
  if (score >= 50) return { g:'C6', colour:'var(--gold)'        };
  if (score >= 45) return { g:'D7', colour:'var(--navy-300)'    };
  if (score >= 40) return { g:'E8', colour:'var(--navy-300)'    };
  return               { g:'F9', colour:'var(--red)'        };
}

function scoreBarColour(score) {
  if (score >= 75) return 'var(--green)';
  if (score >= 60) return 'var(--blue)';
  if (score >= 50) return 'var(--gold)';
  return 'var(--red)';
}

/* ----------------------------------------------------------------
   POPULATE LGAS
---------------------------------------------------------------- */
function populateLgas() {
  ['af-lga','uf-lga'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    LGAS.forEach(lga => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = lga;
      sel.appendChild(opt);
    });
  });
}

/* ----------------------------------------------------------------
   TAB SWITCHING
---------------------------------------------------------------- */
function switchTab(tabId) {
  document.querySelectorAll('.results-tab').forEach(btn => {
    const on = btn.dataset.tab === tabId;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('.results-tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${tabId}`);
  });
  if (tabId === 'manage') renderRecordsTable(filteredRecords);
}

function initTabs() {
  document.querySelectorAll('.results-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

/* ----------------------------------------------------------------
   GRADE SCALE SIDEBAR
---------------------------------------------------------------- */
function renderGradeScale() {
  const el = document.getElementById('grade-scale');
  if (!el) return;
  el.innerHTML = GRADE_SCALE.map(g => `
    <div class="grade-scale-row">
      <span class="gs-grade" style="color:${g.colour}">${g.grade}</span>
      <span class="gs-range">${g.range}%</span>
      <span class="gs-desc">${g.desc}</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   PIN TOGGLE
---------------------------------------------------------------- */
function initPinToggle() {
  const toggle   = document.getElementById('pin-toggle');
  const input    = document.getElementById('cf-pin');
  const iconSlot = document.getElementById('pin-toggle-icon');
  if (!toggle || !input || !iconSlot) return;

  iconSlot.innerHTML = Icon.eye;
  toggle.addEventListener('click', () => {
    const show        = input.type === 'password';
    input.type        = show ? 'text' : 'password';
    iconSlot.innerHTML = show ? Icon.eyeoff : Icon.eye;
    toggle.setAttribute('aria-label', show ? 'Hide PIN' : 'Show PIN');
  });
}

/* ----------------------------------------------------------------
   CHECK RESULTS FORM
---------------------------------------------------------------- */
function initCheckForm() {
  const form = document.getElementById('check-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const studentId = document.getElementById('cf-student-id').value.trim().toUpperCase();
    const exam      = document.getElementById('cf-exam').value;
    const pin       = document.getElementById('cf-pin').value.trim();

    const errors = validate(
      { 'cf-student-id': studentId, 'cf-exam': exam, 'cf-pin': pin },
      {
        'cf-student-id': ['required'],
        'cf-exam':       ['required'],
        'cf-pin':        ['required', { minLength: 6 }],
      }
    );

    if (errors) { showFieldErrors(errors); return; }
    clearFieldErrors(['cf-student-id','cf-exam','cf-pin']);

    const submitBtn = document.getElementById('cf-submit');
    const restore   = setLoadingBtn(submitBtn, 'Loading…');

    try {
      // Replace with: await apiFetch(`/results/${studentId}?exam=${exam}&pin=${pin}`)
      await new Promise(r => setTimeout(r, 1000));

      const result = RESULTS_DB[studentId];

      if (!result) {
        showFieldErrors({ 'cf-student-id': 'No result found for this Student ID and examination.' });
        restore();
        return;
      }

      renderResultCard(result);
      document.getElementById('result-card-wrap').hidden = false;
      document.getElementById('result-card-wrap').scrollIntoView({ behavior:'smooth', block:'start' });

    } catch {
      showToast('Could not load results. Please try again.', 'error');
    } finally {
      restore();
    }
  });
}

/* ----------------------------------------------------------------
   RENDER RESULT CARD
---------------------------------------------------------------- */
function renderResultCard(r) {
  const card = document.getElementById('result-card');
  if (!card) return;

  const avg     = Math.round(r.subjects.reduce((s,sub) => s + sub.total, 0) / r.subjects.length);
  const highest = Math.max(...r.subjects.map(s => s.total));
  const lowest  = Math.min(...r.subjects.map(s => s.total));

  const subjectRows = r.subjects.map(sub => {
    const g   = getGrade(sub.total);
    const pct = sub.total;
    return `
      <tr>
        <td>${sub.name}</td>
        <td style="text-align:center">${sub.ca}</td>
        <td style="text-align:center">${sub.exam}</td>
        <td style="text-align:center;font-weight:700">${sub.total}</td>
        <td class="score-bar-cell">
          <div class="score-bar-track">
            <div class="score-bar-fill" style="width:0;background:${scoreBarColour(sub.total)}" data-w="${pct}%"></div>
          </div>
        </td>
        <td>
          <span class="badge" style="background:${g.colour}22;color:${g.colour};font-weight:700">${g.g}</span>
        </td>
      </tr>
    `;
  }).join('');

  card.innerHTML = `
    <div class="rc-header">
      <div class="rc-header-content">
        <div class="rc-school-name">${r.school}</div>
        <div class="rc-student-name">${r.name}</div>
        <div class="rc-meta-row">
          <span class="rc-meta-item">Class: <span>${r.class}</span></span>
          <span class="rc-meta-item">Term: <span>${r.term}</span></span>
          <span class="rc-meta-item">Session: <span>${r.session}</span></span>
        </div>
      </div>
    </div>

    <div class="rc-summary">
      <div class="rc-summary-item">
        <span class="rc-summary-num">${avg}%</span>
        <span class="rc-summary-label">Average Score</span>
      </div>
      <div class="rc-summary-item">
        <span class="rc-summary-num">${fmt.number(r.position)}${ordinal(r.position)}</span>
        <span class="rc-summary-label">Position in Class</span>
      </div>
      <div class="rc-summary-item">
        <span class="rc-summary-num">${highest}%</span>
        <span class="rc-summary-label">Highest Score</span>
      </div>
      <div class="rc-summary-item">
        <span class="rc-summary-num">${r.subjects.length}</span>
        <span class="rc-summary-label">Subjects Taken</span>
      </div>
    </div>

    <div class="rc-subjects">
      <div class="rc-subjects-title">Subject Results</div>
      <table class="rc-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th style="text-align:center">CA (30)</th>
            <th style="text-align:center">Exam (70)</th>
            <th style="text-align:center">Total</th>
            <th></th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>${subjectRows}</tbody>
      </table>
    </div>

    <div class="rc-remark">
      <div class="rc-remark-title">Class Teacher's Remark</div>
      <div class="rc-remark-text">"${r.remark}"</div>
    </div>
  `;

  // Animate score bars after DOM paint
  requestAnimationFrame(() => requestAnimationFrame(() => {
    card.querySelectorAll('.score-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.w;
    });
  }));
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function resetCheckForm() {
  document.getElementById('check-form').reset();
  document.getElementById('result-card-wrap').hidden = true;
}
window.resetCheckForm = resetCheckForm;

function printResult() {
  window.print();
}
window.printResult = printResult;

/* ----------------------------------------------------------------
   UPLOAD FORM — drag and drop + file input
---------------------------------------------------------------- */
function initUploadForm() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('uf-file');
  if (!dropZone || !fileInput) return;

  // Click to browse
  dropZone.addEventListener('click',    () => fileInput.click());
  dropZone.addEventListener('keydown',  e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

  // Drag events
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave',() => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  // File selected via input
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    const allowed = ['.csv','.xlsx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      document.getElementById('uf-file-error').textContent = 'Only .csv and .xlsx files are accepted.';
      document.getElementById('uf-file-error').hidden = false;
      return;
    }
    document.getElementById('uf-file-error').hidden = true;
    document.getElementById('drop-zone-inner').innerHTML = `
      <span class="drop-icon">✅</span>
      <span class="drop-selected">${file.name} (${(file.size/1024).toFixed(1)} KB)</span>
      <span class="drop-hint">Click to change file</span>
    `;
  }

  // Form submit
  const form = document.getElementById('upload-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = {
      'uf-school':  document.getElementById('uf-school').value,
      'uf-lga':     document.getElementById('uf-lga').value,
      'uf-class':   document.getElementById('uf-class').value,
      'uf-exam':    document.getElementById('uf-exam').value,
      'uf-subject': document.getElementById('uf-subject').value,
    };

    const errors = validate(fields, {
      'uf-school':  ['required'],
      'uf-lga':     ['required'],
      'uf-class':   ['required'],
      'uf-exam':    ['required'],
      'uf-subject': ['required'],
    });

    if (!fileInput.files[0]) {
      document.getElementById('uf-file-error').textContent = 'Please select a results file to upload.';
      document.getElementById('uf-file-error').hidden = false;
      if (!errors) { /* only file error */ }
    }

    if (errors) { showFieldErrors(errors); return; }
    if (!fileInput.files[0]) return;

    clearFieldErrors(Object.keys(fields));

    const submitBtn = document.getElementById('uf-submit');
    const restore   = setLoadingBtn(submitBtn, 'Uploading…');

    try {
      // Replace with actual FormData + apiFetch('/results/upload', { method:'POST', body: formData })
      await new Promise(r => setTimeout(r, 1600));

      form.reset();
      document.getElementById('drop-zone-inner').innerHTML = `
        <span class="drop-icon">📂</span>
        <span class="drop-text">Drag &amp; drop your file here, or <span class="drop-browse">browse</span></span>
        <span class="drop-hint">Accepted: .csv, .xlsx — Max 5MB</span>
      `;

      // Add to history
      UPLOAD_HISTORY.unshift({
        name:   `${fields['uf-class']} ${fields['uf-subject']} — ${fields['uf-exam']}`,
        school: fields['uf-school'],
        date:   new Date().toISOString().split('T')[0],
        count:  Math.floor(Math.random() * 40) + 20,
        status: 'pending',
      });
      renderUploadHistory();
      showToast('Results uploaded successfully. Pending approval.', 'success');

    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      restore();
    }
  });
}

function downloadTemplate() {
  // In production generate and download a real CSV template
  const csv = 'student_id,student_name,ca_score,exam_score\nDSS/2024/001001,Chioma Okafor,28,60\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'results_template.csv' });
  a.click();
  URL.revokeObjectURL(url);
}
window.downloadTemplate = downloadTemplate;

/* ----------------------------------------------------------------
   UPLOAD HISTORY
---------------------------------------------------------------- */
function renderUploadHistory() {
  const list = document.getElementById('upload-history-list');
  if (!list) return;
  list.innerHTML = UPLOAD_HISTORY.map(u => `
    <div class="upload-history-item">
      <div class="uhi-top">
        <span class="uhi-name">${u.name}</span>
        <span class="badge ${u.status === 'approved' ? 'badge-green' : 'badge-gold'}">${u.status}</span>
      </div>
      <span class="uhi-meta">${u.school} · ${fmt.number(u.count)} students · ${fmt.date(u.date)}</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   MANAGE RECORDS TABLE
---------------------------------------------------------------- */
function renderRecordsTable(records) {
  const tbody    = document.getElementById('records-tbody');
  const emptyEl  = document.getElementById('manage-empty');
  const countEl  = document.getElementById('manage-count');
  const tableWrap= document.querySelector('.records-table-wrap');
  if (!tbody) return;

  countEl.textContent = `${fmt.number(records.length)} record${records.length !== 1 ? 's' : ''}`;

  if (records.length === 0) {
    if (tableWrap) tableWrap.hidden = true;
    emptyEl.hidden = false;
    return;
  }
  if (tableWrap) tableWrap.hidden = false;
  emptyEl.hidden = true;

  tbody.innerHTML = records.map(r => {
    const g   = getGrade(r.score);
    const pct = r.score;
    return `
      <tr>
        <td>${r.name}</td>
        <td class="td-id">${r.studentId}</td>
        <td>${r.class}</td>
        <td>${r.subject}</td>
        <td>
          <div class="score-inline">
            <strong>${r.score}%</strong>
            <div class="score-mini-track">
              <div class="score-mini-fill" style="width:${pct}%;background:${scoreBarColour(r.score)}"></div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge" style="background:${g.colour}22;color:${g.colour};font-weight:700">${g.g}</span>
        </td>
        <td>${r.exam.replace('terminal-3','3rd Term').replace('terminal-2','2nd Term').replace('terminal-1','1st Term')}</td>
        <td class="td-school" title="${r.school}">${r.school}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="editRecord('${r.studentId}','${r.subject}')">Edit</button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterRecords() {
  const query  = document.getElementById('manage-search')?.value.toLowerCase().trim() || '';
  const exam   = document.getElementById('manage-exam-filter')?.value  || 'all';
  const cls    = document.getElementById('manage-class-filter')?.value || 'all';

  return ALL_RECORDS.filter(r => {
    const matchSearch = !query ||
      r.name.toLowerCase().includes(query) ||
      r.studentId.toLowerCase().includes(query);
    return matchSearch &&
      (exam === 'all' || r.exam  === exam) &&
      (cls  === 'all' || r.class === cls);
  });
}

function initManageTab() {
  document.getElementById('manage-search')
    ?.addEventListener('input', debounce(() => {
      filteredRecords = filterRecords();
      renderRecordsTable(filteredRecords);
    }, 220));

  ['manage-exam-filter','manage-class-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      filteredRecords = filterRecords();
      renderRecordsTable(filteredRecords);
    });
  });

  // Inject search icon
  const slot = document.getElementById('manage-search-icon');
  if (slot && !slot.innerHTML) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;
}

window.editRecord = (studentId, subject) => {
  showToast(`Edit result for ${studentId} — ${subject}: coming in Stage 5`, 'info');
};

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateLgas();
  initTabs();
  renderGradeScale();
  initPinToggle();
  initCheckForm();
  initUploadForm();
  renderUploadHistory();
  initManageTab();
  filteredRecords = [...ALL_RECORDS];
  renderRecordsTable(filteredRecords);
});