/* ================================================================
   admissions.js — Admissions Portal
   - Tab switching (Apply / Track / Manage)
   - Application form with full validation + reference generation
   - Application tracking by reference number
   - Admin manage table with search + status filter + approve/reject
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

/* Existing applications in the system */
let APPLICATIONS = [
  { ref:'ADM-2025-004821', name:'Chioma Okafor',     class:'SSS 1', school:'Government Secondary School, Asaba',    lga:'Oshimili South', date:'2025-02-28', status:'approved',   guardian:'Mrs. Rose Okafor',   phone:'08031110001' },
  { ref:'ADM-2025-004822', name:'Samuel Oghene',      class:'JSS 1', school:'Unity Secondary School, Ozoro',         lga:'Isoko North',    date:'2025-03-01', status:'pending',    guardian:'Mr. Felix Oghene',   phone:'08061110006' },
  { ref:'ADM-2025-004823', name:'Favour Onyekwere',   class:'Primary 4', school:'Central Primary School, Abraka',    lga:'Ethiope East',   date:'2025-03-02', status:'pending',    guardian:'Mrs. Grace Onyekwere',phone:'08031119999' },
  { ref:'ADM-2025-004824', name:'Emeka Eze',           class:'SSS 2', school:'Government Secondary School, Asaba',    lga:'Oshimili South', date:'2025-03-04', status:'waitlisted', guardian:'Mr. Tony Eze',       phone:'08051110002' },
  { ref:'ADM-2025-004825', name:'Ngozi Chukwu',        class:'Primary 6', school:'Nsukwa Primary School, Kwale',      lga:'Ndokwa West',    date:'2025-03-05', status:'approved',   guardian:'Mrs. Ada Chukwu',    phone:'08011110005' },
  { ref:'ADM-2025-004826', name:'Tunde Adeyemi',       class:'SSS 3', school:'Delta State Science Secondary School',  lga:'Ethiope East',   date:'2025-03-06', status:'rejected',   guardian:'Mr. Bayo Adeyemi',   phone:'08091110004' },
  { ref:'ADM-2025-004827', name:'Peace Ativie',         class:'SSS 1', school:'Girls Secondary School, Agbor',         lga:'Ika South',      date:'2025-03-07', status:'pending',    guardian:'Mrs. Ruth Ativie',   phone:'08071119999' },
  { ref:'ADM-2025-004828', name:'Daniel Ovie',          class:'JSS 2', school:'Technical College, Sapele',              lga:'Sapele',         date:'2025-03-08', status:'approved',   guardian:'Mr. Chris Ovie',     phone:'08041110008' },
];

let filteredApps = [...APPLICATIONS];

/* ----------------------------------------------------------------
   POPULATE LGA DROPDOWN
---------------------------------------------------------------- */
function populateLgas() {
  const sel = document.getElementById('af-lga');
  if (!sel) return;
  LGAS.forEach(lga => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = lga;
    sel.appendChild(opt);
  });
}

/* ----------------------------------------------------------------
   TAB SWITCHING
---------------------------------------------------------------- */
function switchTab(tabId) {
  document.querySelectorAll('.adm-tab').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.adm-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });

  // Inject manage search icon when that tab is first opened
  if (tabId === 'manage') {
    const slot = document.getElementById('manage-search-icon');
    if (slot && !slot.innerHTML) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;
    renderApplicationsTable(filteredApps);
  }
}
window.switchTab = switchTab;

function initTabs() {
  document.querySelectorAll('.adm-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Read ?tab= from URL
  const params = new URLSearchParams(window.location.search);
  const tab    = params.get('tab');
  if (tab) switchTab(tab);
}

/* ----------------------------------------------------------------
   GENERATE REFERENCE NUMBER
---------------------------------------------------------------- */
function generateRef() {
  const num = 4829 + APPLICATIONS.length;
  return `ADM-2025-${String(num).padStart(6,'0')}`;
}

/* ----------------------------------------------------------------
   APPLICATION FORM SUBMIT
---------------------------------------------------------------- */
function initApplyForm() {
  const form = document.getElementById('apply-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = {
      'af-firstname': document.getElementById('af-firstname').value,
      'af-lastname':  document.getElementById('af-lastname').value,
      'af-dob':       document.getElementById('af-dob').value,
      'af-gender':    document.getElementById('af-gender').value,
      'af-state':     document.getElementById('af-state').value,
      'af-class':     document.getElementById('af-class').value,
      'af-type':      document.getElementById('af-type').value,
      'af-lga':       document.getElementById('af-lga').value,
      'af-school1':   document.getElementById('af-school1').value,
      'af-guardian':  document.getElementById('af-guardian').value,
      'af-relation':  document.getElementById('af-relation').value,
      'af-phone':     document.getElementById('af-phone').value,
    };

    const optionalEmail = document.getElementById('af-email').value;

    const errors = validate(fields, {
      'af-firstname': ['required'],
      'af-lastname':  ['required'],
      'af-dob':       ['required'],
      'af-gender':    ['required'],
      'af-state':     ['required'],
      'af-class':     ['required'],
      'af-type':      ['required'],
      'af-lga':       ['required'],
      'af-school1':   ['required'],
      'af-guardian':  ['required'],
      'af-relation':  ['required'],
      'af-phone':     ['required', 'phone'],
    });

    // Validate optional email only if provided
    if (optionalEmail) {
      const emailTest = validate({ 'af-email': optionalEmail }, { 'af-email': ['email'] });
      if (emailTest) Object.assign(errors || (errors || {}), emailTest);
    }

    if (errors) { showFieldErrors(errors); return; }
    clearFieldErrors(Object.keys(fields).concat(['af-email']));

    const submitBtn = document.getElementById('af-submit');
    const restore   = setLoadingBtn(submitBtn, 'Submitting…');

    try {
      // Replace with: await apiFetch('/admissions', { method:'POST', body: { ...fields } })
      await new Promise(r => setTimeout(r, 1400));

      const ref = generateRef();

      // Add to local applications list
      APPLICATIONS.push({
        ref,
        name:     `${fields['af-firstname']} ${fields['af-lastname']}`,
        class:    fields['af-class'],
        school:   fields['af-school1'],
        lga:      fields['af-lga'],
        date:     new Date().toISOString().split('T')[0],
        status:   'pending',
        guardian: fields['af-guardian'],
        phone:    fields['af-phone'],
      });
      filteredApps = [...APPLICATIONS];

      // Show success state
      form.closest('.apply-layout').hidden = true;
      const successEl = document.getElementById('apply-success');
      const refEl     = document.getElementById('ref-number');
      successEl.hidden      = false;
      refEl.textContent     = ref;

      // Pre-fill the track tab with this ref
      const trackInput = document.getElementById('track-ref-input');
      if (trackInput) trackInput.value = ref;

    } catch {
      showToast('Submission failed. Please try again.', 'error');
      restore();
    }
  });
}

function resetApplicationForm() {
  document.getElementById('apply-form').reset();
  const applyLayout = document.querySelector('.apply-layout');
  if (applyLayout) applyLayout.hidden = false;
  document.getElementById('apply-success').hidden = true;
}
window.resetApplicationForm = resetApplicationForm;

/* ----------------------------------------------------------------
   TRACK APPLICATION
---------------------------------------------------------------- */
function initTrackForm() {
  const btn   = document.getElementById('track-btn');
  const input = document.getElementById('track-ref-input');
  if (!btn || !input) return;

  const doTrack = () => {
    const ref = input.value.trim().toUpperCase();

    const errEl = document.getElementById('track-ref-error');
    if (!ref) {
      if (errEl) { errEl.textContent = 'Please enter your reference number.'; errEl.hidden = false; }
      return;
    }
    if (errEl) errEl.hidden = true;

    const app = APPLICATIONS.find(a => a.ref === ref);

    const resultEl = document.getElementById('track-result');
    if (!resultEl) return;

    if (!app) {
      resultEl.hidden = false;
      resultEl.innerHTML = `
        <div style="padding:var(--s5);background:var(--red-pale);border-radius:var(--r-lg);text-align:center;color:var(--red)">
          <div style="font-size:1.8rem;margin-bottom:var(--s2)">🔍</div>
          <strong>No application found</strong>
          <p style="font-size:.875rem;margin-top:var(--s2);color:var(--navy-500)">Check the reference number and try again.</p>
        </div>`;
      return;
    }

    const statusColour = {
      pending:    'badge-gold',
      approved:   'badge-green',
      waitlisted: 'badge-blue',
      rejected:   'badge-grey',
    };

    const steps = [
      { label: 'Application Received',       icon: '📥', state: 'done',    time: fmt.date(app.date) },
      { label: 'Under Review',               icon: '🔍', state: app.status === 'pending' ? 'current' : 'done', time: app.status === 'pending' ? 'In progress' : fmt.date(app.date) },
      { label: app.status === 'rejected' ? 'Application Rejected' : app.status === 'approved' ? 'Approved — Contact School' : app.status === 'waitlisted' ? 'Waitlisted' : 'Decision Pending',
        icon:  app.status === 'rejected' ? '❌' : app.status === 'approved' ? '✅' : app.status === 'waitlisted' ? '⏳' : '⌛',
        state: app.status === 'pending' ? 'pending' : 'current',
        time:  app.status === 'pending' ? 'Awaiting decision' : 'Completed',
      },
      { label: 'Enrolment at School', icon: '🏫', state: app.status === 'approved' ? 'current' : 'pending', time: app.status === 'approved' ? 'Visit your school' : '—' },
    ];

    resultEl.hidden   = false;
    resultEl.innerHTML = `
      <div class="track-result-header">
        <span class="track-result-ref">${app.ref}</span>
        <span class="badge ${statusColour[app.status] || 'badge-grey'}">${app.status}</span>
      </div>
      <div class="track-result-body">
        <div class="track-fields-grid">
          <div class="track-field">
            <span class="track-field-label">Student Name</span>
            <span class="track-field-value">${app.name}</span>
          </div>
          <div class="track-field">
            <span class="track-field-label">Class Applied</span>
            <span class="track-field-value">${app.class}</span>
          </div>
          <div class="track-field">
            <span class="track-field-label">First Choice School</span>
            <span class="track-field-value">${app.school}</span>
          </div>
          <div class="track-field">
            <span class="track-field-label">LGA</span>
            <span class="track-field-value">${app.lga}</span>
          </div>
        </div>

        <div class="status-timeline">
          ${steps.map(step => `
            <div class="timeline-step">
              <div class="timeline-dot ${step.state}">${step.icon}</div>
              <div>
                <div class="timeline-label">${step.label}</div>
                <div class="timeline-time">${step.time}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  btn.addEventListener('click', doTrack);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doTrack(); });
}

/* ----------------------------------------------------------------
   MANAGE TABLE
---------------------------------------------------------------- */
const STATUS_BADGE = {
  pending:    'badge-gold',
  approved:   'badge-green',
  waitlisted: 'badge-blue',
  rejected:   'badge-grey',
};

function renderApplicationsTable(apps) {
  const tbody    = document.getElementById('applications-tbody');
  const emptyEl  = document.getElementById('manage-empty');
  const countEl  = document.getElementById('manage-count');
  const tableWrap= document.querySelector('.applications-table-wrap');

  if (!tbody) return;

  countEl.textContent = `${fmt.number(apps.length)} application${apps.length !== 1 ? 's' : ''}`;

  if (apps.length === 0) {
    tableWrap.hidden = true;
    emptyEl.hidden   = false;
    return;
  }

  tableWrap.hidden = false;
  emptyEl.hidden   = true;

  tbody.innerHTML = apps.map(app => `
    <tr data-ref="${app.ref}">
      <td class="td-ref">${app.ref}</td>
      <td>${app.name}</td>
      <td>${app.class}</td>
      <td class="td-school" title="${app.school}">${app.school}</td>
      <td>${app.lga}</td>
      <td>${fmt.date(app.date)}</td>
      <td><span class="badge ${STATUS_BADGE[app.status] || 'badge-grey'}">${app.status}</span></td>
      <td>
        <div class="action-btns">
          ${app.status === 'pending' ? `
            <button class="btn btn-green btn-sm" onclick="updateStatus('${app.ref}','approved')">Approve</button>
            <button class="btn btn-outline btn-sm" onclick="updateStatus('${app.ref}','waitlisted')">Waitlist</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="updateStatus('${app.ref}','rejected')">Reject</button>
          ` : `
            <button class="btn btn-ghost btn-sm" onclick="updateStatus('${app.ref}','pending')">Reset</button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

/* Approve / Reject / Waitlist */
window.updateStatus = async function(ref, newStatus) {
  const confirmMessages = {
    approved:   'Approve this application?',
    rejected:   'Reject this application? This cannot be undone.',
    waitlisted: 'Move this application to the waitlist?',
    pending:    'Reset this application to pending?',
  };

  const confirmed = await confirmDialog(confirmMessages[newStatus] || 'Update status?');
  if (!confirmed) return;

  // Find and update
  const app = APPLICATIONS.find(a => a.ref === ref);
  if (!app) return;

  app.status   = newStatus;
  filteredApps = filterApplications();
  renderApplicationsTable(filteredApps);
  showToast(`Application ${ref} marked as ${newStatus}.`, 'success');

  // In production: await apiFetch(`/admissions/${ref}/status`, { method:'PATCH', body: { status: newStatus } })
};

function filterApplications() {
  const query  = document.getElementById('manage-search')?.value.toLowerCase().trim() || '';
  const status = document.getElementById('manage-status-filter')?.value || 'all';

  return APPLICATIONS.filter(app => {
    const matchSearch = !query ||
      app.name.toLowerCase().includes(query) ||
      app.ref.toLowerCase().includes(query);
    return matchSearch && (status === 'all' || app.status === status);
  });
}

function initManageTab() {
  document.getElementById('manage-search')
    ?.addEventListener('input', debounce(() => {
      filteredApps = filterApplications();
      renderApplicationsTable(filteredApps);
    }, 220));

  document.getElementById('manage-status-filter')
    ?.addEventListener('change', () => {
      filteredApps = filterApplications();
      renderApplicationsTable(filteredApps);
    });
}

/* ----------------------------------------------------------------
   INJECT SEARCH ICON
---------------------------------------------------------------- */
function injectSearchIcon() {
  const slot = document.getElementById('search-icon-slot');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateLgas();
  injectSearchIcon();
  initTabs();
  initApplyForm();
  initTrackForm();
  initManageTab();

  // Preload manage table data
  filteredApps = [...APPLICATIONS];
});