/* ================================================================
   about.js — About page: values, leadership, contact form
   ================================================================ */

'use strict';

const VALUES = [
  { icon:'📚', title:'Academic Excellence',  desc:'Setting and maintaining high educational standards across all registered schools in Delta State.' },
  { icon:'⚖️', title:'Equity & Inclusion',   desc:'Ensuring every child, regardless of location or background, has access to quality education.' },
  { icon:'🔬', title:'Innovation',            desc:'Embracing technology and modern pedagogy to prepare students for a rapidly changing world.' },
  { icon:'🌍', title:'Community Partnership', desc:'Collaborating with parents, communities and stakeholders to build stronger schools.' },
  { icon:'🏆', title:'Accountability',        desc:'Transparent management of public resources, teachers and educational outcomes.' },
  { icon:'🌱', title:'Sustainability',        desc:'Building durable infrastructure that serves Delta State generations into the future.' },
];

const LEADERSHIP = [
  { name:'Hon. Commissioner',         role:'Commissioner for Education',        avatar:'👨‍💼', bg:'#D6E4F5' },
  { name:'Permanent Secretary',       role:'Perm. Sec., Ministry of Education', avatar:'👩‍💼', bg:'#D6EFE5' },
  { name:'Director, Basic Education', role:'Director — Basic & Secondary Edu.', avatar:'👨‍🏫', bg:'#FDF3E0' },
];

const CONTACT_INFO = [
  { icon: Icon?.mappin || '📍', label: 'Address', value: 'Ministry of Education Secretariat<br>Government House Road, Asaba<br>Delta State, Nigeria' },
  { icon: Icon?.phone  || '📞', label: 'Phone',   value: '+234 (0) 803 000 0000' },
  { icon: Icon?.mail   || '✉️', label: 'Email',   value: 'info@deltaedu.gov.ng' },
];

/* ----------------------------------------------------------------
   RENDER VALUES
---------------------------------------------------------------- */
function renderValues() {
  const grid = document.getElementById('values-grid');
  if (!grid) return;
  grid.innerHTML = VALUES.map(v => `
    <div class="value-card">
      <div class="value-icon">${v.icon}</div>
      <div class="value-title">${v.title}</div>
      <p class="value-desc">${v.desc}</p>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER LEADERSHIP
---------------------------------------------------------------- */
function renderLeadership() {
  const grid = document.getElementById('leadership-grid');
  if (!grid) return;
  grid.innerHTML = LEADERSHIP.map(l => `
    <div class="leader-card">
      <div class="leader-avatar" style="background:${l.bg}">${l.avatar}</div>
      <div class="leader-info">
        <div class="leader-name">${l.name}</div>
        <div class="leader-role">${l.role}</div>
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   RENDER CONTACT INFO ITEMS
---------------------------------------------------------------- */
function renderContactInfo() {
  const el = document.getElementById('contact-info');
  if (!el) return;
  el.innerHTML = CONTACT_INFO.map(item => `
    <div class="contact-info-item">
      <div class="ci-icon">${item.icon}</div>
      <div>
        <div class="ci-label">${item.label}</div>
        <div class="ci-value">${item.value}</div>
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   CONTACT FORM
---------------------------------------------------------------- */
function initContactForm() {
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('cf-submit');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
      'cf-name':    document.getElementById('cf-name').value,
      'cf-email':   document.getElementById('cf-email').value,
      'cf-subject': document.getElementById('cf-subject').value,
      'cf-message': document.getElementById('cf-message').value,
    };

    // Validate using utilities.js
    const errors = validate(data, {
      'cf-name':    ['required'],
      'cf-email':   ['required', 'email'],
      'cf-subject': ['required'],
      'cf-message': ['required'],
    });

    if (errors) { showFieldErrors(errors); return; }
    clearFieldErrors(['cf-name','cf-email','cf-subject','cf-message']);

    const restore = setLoadingBtn(submitBtn, 'Sending…');

    try {
      // Simulate API call — replace with:
      // await apiFetch('/public/contact', { method:'POST', body: data })
      await new Promise(r => setTimeout(r, 1400));

      form.reset();
      submitBtn.textContent      = '✓ Message Sent';
      submitBtn.style.background = 'var(--green)';
      showToast('Message sent! We will respond within 2–3 business days.', 'success');

      setTimeout(() => {
        submitBtn.innerHTML        = 'Send Message →';
        submitBtn.style.background = '';
        restore();
      }, 5000);

    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      restore();
    }
  });
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderValues();
  renderLeadership();
  renderContactInfo();
  initContactForm();
});