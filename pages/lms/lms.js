/* ================================================================
   lms.js — Learning Management System
   - Course catalogue with filter tabs + search
   - Course view with lesson sidebar + viewer panel
   - Video placeholder, lesson body (text + key points)
   - Assignment section + mark-complete
   - Progress tracking (per-course, stored in session)
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   COURSE DATA
---------------------------------------------------------------- */
const COURSES = [
  {
    id: 1,
    title:    'Mathematics — SSS 2',
    subject:  'Mathematics',
    level:    'senior',
    levelLabel:'Senior Secondary',
    class:    'SSS 2',
    icon:     '📐',
    colour:   '#1B4F8A',
    teacher:  'Mr. Chukwudi Nwachukwu',
    lessons:  10,
    duration: '5h 20m',
    enrolled: true,
    desc:     'Algebra, trigonometry, statistics and coordinate geometry for Senior Secondary 2 students.',
    modules: [
      {
        title: 'Module 1: Algebra',
        lessons: [
          {
            id: 101, title: 'Simultaneous Equations',    type: 'video', duration: '18 min',
            body: `Simultaneous equations involve two or more equations that share the same unknowns. We solve them by finding values that satisfy all equations at the same time.\n\nThe two main methods covered in this lesson are the <strong>substitution method</strong> and the <strong>elimination method</strong>. Both produce the same result, but one may be more efficient depending on the structure of the equations.`,
            keypoints: [
              'Substitution method: express one variable from one equation, substitute into the other.',
              'Elimination method: multiply equations to align coefficients, then add or subtract.',
              'Always verify your solution by substituting both values back into both original equations.',
              'Word problems can be translated into simultaneous equations by defining variables for unknowns.',
            ],
            assignment: { title: 'Solve 5 pairs of simultaneous equations', due: '7 days', marks: 10 },
          },
          {
            id: 102, title: 'Quadratic Equations',       type: 'video', duration: '22 min',
            body: `A quadratic equation has the standard form ax² + bx + c = 0 where a ≠ 0. There are three methods for solving quadratic equations: <strong>factorisation</strong>, <strong>completing the square</strong>, and using the <strong>quadratic formula</strong>.`,
            keypoints: [
              'The discriminant b² − 4ac tells you the nature of the roots before you solve.',
              'If b² − 4ac > 0: two distinct real roots; = 0: one repeated root; < 0: no real roots.',
              'The quadratic formula works for all quadratic equations regardless of whether they factorise.',
            ],
            assignment: null,
          },
          {
            id: 103, title: 'Polynomials and Factors',   type: 'reading', duration: '12 min',
            body: `A polynomial is an expression of the form aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀. In this lesson we look at how to divide polynomials and apply the <strong>Factor Theorem</strong> and <strong>Remainder Theorem</strong>.`,
            keypoints: [
              'The Factor Theorem: (x − a) is a factor of f(x) if and only if f(a) = 0.',
              'The Remainder Theorem: dividing f(x) by (x − a) gives remainder f(a).',
              'Use synthetic division as a shortcut for polynomial long division.',
            ],
            assignment: { title: 'Factorise three polynomial expressions', due: '5 days', marks: 8 },
          },
        ],
      },
      {
        title: 'Module 2: Trigonometry',
        lessons: [
          {
            id: 104, title: 'SOH-CAH-TOA',              type: 'video', duration: '20 min',
            body: `Trigonometry is the study of the relationships between the sides and angles of triangles. The three primary trigonometric ratios — <strong>sine</strong>, <strong>cosine</strong>, and <strong>tangent</strong> — are the foundation of all further work.`,
            keypoints: [
              'sin θ = Opposite / Hypotenuse',
              'cos θ = Adjacent / Hypotenuse',
              'tan θ = Opposite / Adjacent',
              'Use SOHCAHTOA to remember which ratio to apply.',
              'Angles of elevation and depression are measured from the horizontal.',
            ],
            assignment: null,
          },
          {
            id: 105, title: 'Sine and Cosine Rules',    type: 'video', duration: '25 min',
            body: `For non-right-angled triangles, we use the <strong>Sine Rule</strong> and <strong>Cosine Rule</strong>. These allow us to solve any triangle when given sufficient information about sides and angles.`,
            keypoints: [
              'Sine Rule: a/sin A = b/sin B = c/sin C',
              'Cosine Rule: c² = a² + b² − 2ab cos C',
              'Use the Sine Rule when you know an angle and its opposite side.',
              'Use the Cosine Rule when you know all three sides, or two sides and the included angle.',
            ],
            assignment: { title: 'Bearing and distance problem set', due: '6 days', marks: 12 },
          },
        ],
      },
      {
        title: 'Module 3: Statistics',
        lessons: [
          {
            id: 106, title: 'Mean, Median and Mode',    type: 'reading', duration: '14 min',
            body: `Measures of central tendency summarise a dataset with a single representative value. The three main measures are the <strong>mean</strong> (arithmetic average), <strong>median</strong> (middle value), and <strong>mode</strong> (most frequent value).`,
            keypoints: [
              'Mean is sensitive to extreme values (outliers). Use median when outliers are present.',
              'The median of n values sorted in order is the ½(n+1)th value when n is odd.',
              'A dataset can have more than one mode (bimodal, multimodal) or no mode.',
            ],
            assignment: null,
          },
          {
            id: 107, title: 'Standard Deviation',       type: 'video', duration: '19 min',
            body: `Standard deviation measures the spread of data around the mean. A low standard deviation means values cluster closely around the mean; a high standard deviation means they are spread widely.`,
            keypoints: [
              'Variance = mean of squared deviations from the mean.',
              'Standard deviation = square root of variance.',
              'For grouped data, use midpoints of class intervals in the calculation.',
            ],
            assignment: { title: 'Calculate mean and SD for two datasets', due: '4 days', marks: 10 },
          },
          {
            id: 108, title: 'Frequency Tables & Histograms', type: 'reading', duration: '11 min',
            body: `Frequency tables organise data into classes. Histograms represent this data visually. Unlike bar charts, histograms use <strong>frequency density</strong> on the vertical axis when class widths are unequal.`,
            keypoints: [
              'Frequency density = frequency ÷ class width.',
              'Area of each bar in a histogram represents the frequency of that class.',
              'Cumulative frequency curves (ogives) allow estimation of median and quartiles.',
            ],
            assignment: null,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title:    'English Language — SSS 1',
    subject:  'English Language',
    level:    'senior',
    levelLabel:'Senior Secondary',
    class:    'SSS 1',
    icon:     '📖',
    colour:   '#1A6B4A',
    teacher:  'Mrs. Ngozi Onyekachi',
    lessons:  8,
    duration: '4h 10m',
    enrolled: true,
    desc:     'Comprehension, essay writing, grammar and oral English for Senior Secondary 1 students.',
    modules: [
      {
        title: 'Module 1: Essay Writing',
        lessons: [
          {
            id: 201, title: 'The Expository Essay',     type: 'video', duration: '16 min',
            body: `An expository essay explains, informs, or describes a topic objectively. It does not express the writer's opinion. The structure is <strong>Introduction → Body Paragraphs → Conclusion</strong>.`,
            keypoints: [
              'Each body paragraph must have a clear topic sentence, evidence, and a link sentence.',
              'Use formal register — avoid slang, contractions, and first-person opinion markers.',
              'Good expository essays anticipate and address counter-arguments.',
            ],
            assignment: { title: 'Write a 400-word expository essay', due: '7 days', marks: 20 },
          },
          {
            id: 202, title: 'Argumentative Writing',   type: 'reading', duration: '13 min',
            body: `An argumentative essay takes a clear position and defends it with evidence and logical reasoning. Unlike the expository essay, it is acceptable — indeed required — to express your viewpoint.`,
            keypoints: [
              'State your thesis clearly in the introduction.',
              'Acknowledge the opposing view (concession) and then rebut it.',
              'End with a strong conclusion that does not introduce new points.',
            ],
            assignment: null,
          },
        ],
      },
      {
        title: 'Module 2: Grammar',
        lessons: [
          {
            id: 203, title: 'Parts of Speech',          type: 'video', duration: '20 min',
            body: `There are eight parts of speech in English: nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, and interjections. Understanding these is the foundation of all grammar.`,
            keypoints: [
              'Nouns name persons, places, things or ideas.',
              'Verbs express action, state or existence.',
              'Adjectives modify nouns; adverbs modify verbs, adjectives, or other adverbs.',
              'Conjunctions join words, phrases, or clauses (FANBOYS: for, and, nor, but, or, yet, so).',
            ],
            assignment: { title: 'Identify and classify parts of speech in 10 sentences', due: '3 days', marks: 10 },
          },
          {
            id: 204, title: 'Subject–Verb Agreement',  type: 'reading', duration: '11 min',
            body: `A verb must agree with its subject in number and person. This seems straightforward, but many constructions create confusion — particularly with compound subjects, collective nouns, and intervening phrases.`,
            keypoints: [
              'A singular subject takes a singular verb, and a plural subject takes a plural verb.',
              '"Neither … nor" and "either … or": the verb agrees with the nearer subject.',
              'Collective nouns (team, committee) take singular verbs when acting as one unit.',
            ],
            assignment: null,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title:    'Basic Science — JSS 2',
    subject:  'Basic Science',
    level:    'junior',
    levelLabel:'Junior Secondary',
    class:    'JSS 2',
    icon:     '🔬',
    colour:   '#7B3FA0',
    teacher:  'Mr. Emeka Obi',
    lessons:  6,
    duration: '3h 00m',
    enrolled: false,
    desc:     'Foundations of science — matter, energy, living things, and scientific investigation.',
    modules: [
      {
        title: 'Module 1: Matter',
        lessons: [
          {
            id: 301, title: 'States of Matter',         type: 'video', duration: '15 min',
            body: `Matter exists in three common states: <strong>solid</strong>, <strong>liquid</strong>, and <strong>gas</strong>. Each state has distinct properties related to the arrangement and movement of particles.`,
            keypoints: [
              'Solids: particles tightly packed, fixed shape and volume.',
              'Liquids: particles close but mobile, fixed volume, no fixed shape.',
              'Gases: particles far apart and move freely, no fixed shape or volume.',
              'Changes of state are physical changes — the chemical identity of the substance does not change.',
            ],
            assignment: null,
          },
          {
            id: 302, title: 'Mixtures and Separation',  type: 'reading', duration: '12 min',
            body: `A mixture contains two or more substances that are physically combined but not chemically bonded. Separation methods depend on the physical properties of the components.`,
            keypoints: [
              'Filtration separates an insoluble solid from a liquid.',
              'Evaporation recovers a dissolved solid from a solution.',
              'Distillation separates liquids with different boiling points.',
              'Chromatography separates mixtures of dyes or pigments.',
            ],
            assignment: { title: 'Design an experiment to separate a sand-salt mixture', due: '5 days', marks: 15 },
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title:    'Social Studies — Primary 6',
    subject:  'Social Studies',
    level:    'primary',
    levelLabel:'Primary',
    class:    'Primary 6',
    icon:     '🌍',
    colour:   '#C9922A',
    teacher:  'Mrs. Blessing Efe',
    lessons:  7,
    duration: '2h 45m',
    enrolled: false,
    desc:     'Citizenship, family life, community, government and Nigeria\'s place in the world.',
    modules: [
      {
        title: 'Module 1: Citizenship',
        lessons: [
          {
            id: 401, title: 'Rights and Responsibilities', type: 'video', duration: '14 min',
            body: `A citizen has both <strong>rights</strong> (entitlements guaranteed by law) and <strong>responsibilities</strong> (duties owed to the community and country). Understanding both is essential for responsible citizenship.`,
            keypoints: [
              'Fundamental human rights include the right to life, education, and freedom of expression.',
              'Responsibilities include obeying laws, paying taxes, and respecting others.',
              'The Nigerian Constitution is the supreme law of the land.',
            ],
            assignment: null,
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title:    'ICT — SSS 1',
    subject:  'ICT',
    level:    'senior',
    levelLabel:'Senior Secondary',
    class:    'SSS 1',
    icon:     '💻',
    colour:   '#16A085',
    teacher:  'Mr. Daniel Ejiro',
    lessons:  9,
    duration: '4h 30m',
    enrolled: true,
    desc:     'Introduction to computing, word processing, spreadsheets, the internet and basic programming.',
    modules: [
      {
        title: 'Module 1: Computer Fundamentals',
        lessons: [
          {
            id: 501, title: 'Hardware and Software',     type: 'video', duration: '18 min',
            body: `A computer system consists of <strong>hardware</strong> (physical components) and <strong>software</strong> (programs and operating systems). Together they allow users to input data, process it, and output results.`,
            keypoints: [
              'Input devices: keyboard, mouse, scanner, microphone.',
              'Output devices: monitor, printer, speakers.',
              'The CPU (Central Processing Unit) is the "brain" of the computer.',
              'RAM (Random Access Memory) is temporary; ROM (Read-Only Memory) is permanent.',
            ],
            assignment: { title: 'Label a diagram of a computer system', due: '3 days', marks: 10 },
          },
          {
            id: 502, title: 'Operating Systems',         type: 'reading', duration: '11 min',
            body: `The operating system (OS) is the software that manages hardware resources and provides services for application programs. Common operating systems include <strong>Windows</strong>, <strong>macOS</strong>, and <strong>Linux</strong>.`,
            keypoints: [
              'The OS manages memory, processes, files, and peripheral devices.',
              'A GUI (Graphical User Interface) allows users to interact through icons and menus.',
              'Multitasking OS can run multiple applications simultaneously.',
            ],
            assignment: null,
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title:    'Agricultural Science — JSS 3',
    subject:  'Agricultural Science',
    level:    'junior',
    levelLabel:'Junior Secondary',
    class:    'JSS 3',
    icon:     '🌱',
    colour:   '#1A6B4A',
    teacher:  'Mr. Festus Okwor',
    lessons:  5,
    duration: '2h 30m',
    enrolled: false,
    desc:     'Crop science, animal husbandry, farm management and agricultural practices in Delta State.',
    modules: [
      {
        title: 'Module 1: Crop Production',
        lessons: [
          {
            id: 601, title: 'Land Preparation',          type: 'video', duration: '16 min',
            body: `Before planting crops, the land must be carefully prepared to create the best conditions for plant growth. The main stages of land preparation are <strong>clearing</strong>, <strong>primary tillage</strong>, and <strong>secondary tillage</strong>.`,
            keypoints: [
              'Clearing removes trees, shrubs, and stumps from the land.',
              'Primary tillage (ploughing) breaks up and turns over the topsoil.',
              'Secondary tillage (harrowing) breaks up clods and smoothens the seedbed.',
              'Ridging and bed formation are used for crops like yam and cassava.',
            ],
            assignment: null,
          },
        ],
      },
    ],
  },
];

/* ----------------------------------------------------------------
   PROGRESS (session-level — persists within the page session)
---------------------------------------------------------------- */
const progressStore = {};   // { courseId: Set<lessonId> }

function getProgress(courseId) {
  if (!progressStore[courseId]) progressStore[courseId] = new Set();
  return progressStore[courseId];
}

function markLessonComplete(courseId, lessonId) {
  getProgress(courseId).add(lessonId);
}

function courseProgressPct(course) {
  const total     = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const completed = getProgress(course.id).size;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

/* ----------------------------------------------------------------
   HELPERS
---------------------------------------------------------------- */
function allLessons(course) {
  return course.modules.flatMap(m => m.lessons);
}

function totalLessons(course) {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

/* ----------------------------------------------------------------
   STATS STRIP
---------------------------------------------------------------- */
function renderStatsStrip() {
  const el = document.getElementById('lms-stats-inner');
  if (!el) return;
  const total    = COURSES.length;
  const enrolled = COURSES.filter(c => c.enrolled).length;
  const lessons  = COURSES.reduce((n, c) => n + totalLessons(c), 0);
  const teachers = [...new Set(COURSES.map(c => c.teacher))].length;

  const items = [
    { num: total,    label: 'Total Courses'    },
    { num: enrolled, label: 'Enrolled'         },
    { num: lessons,  label: 'Total Lessons'    },
    { num: teachers, label: 'Teachers'         },
  ];
  el.innerHTML = items.map((item, i) => `
    ${i > 0 ? '<div class="lms-stat-divider" aria-hidden="true"></div>' : ''}
    <div class="lms-stat">
      <span class="lms-stat-num">${item.num}</span>
      <span class="lms-stat-label">${item.label}</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   SCREEN SWITCHING
---------------------------------------------------------------- */
function showCatalogue() {
  document.getElementById('screen-catalogue').hidden = false;
  document.getElementById('screen-course').hidden    = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showCatalogue = showCatalogue;

function showCourseView(courseId) {
  const course = COURSES.find(c => c.id === courseId);
  if (!course) return;
  document.getElementById('screen-catalogue').hidden = true;
  document.getElementById('screen-course').hidden    = false;
  renderCourseView(course);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ----------------------------------------------------------------
   COURSE CATALOGUE
---------------------------------------------------------------- */
let activeFilter = 'all';
let searchQuery  = '';

function filteredCourses() {
  return COURSES.filter(c => {
    const matchFilter =
      activeFilter === 'all'      ? true :
      activeFilter === 'enrolled' ? c.enrolled :
      c.level === activeFilter;
    const matchSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery)   ||
      c.subject.toLowerCase().includes(searchQuery) ||
      c.teacher.toLowerCase().includes(searchQuery);
    return matchFilter && matchSearch;
  });
}

function renderCatalogue() {
  const skeletonEl = document.getElementById('skeleton-grid');
  const gridEl     = document.getElementById('courses-grid');
  const emptyEl    = document.getElementById('courses-empty');
  if (!gridEl) return;

  if (skeletonEl) skeletonEl.hidden = true;
  const courses = filteredCourses();

  if (courses.length === 0) {
    gridEl.hidden  = true;
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  gridEl.hidden  = false;

  gridEl.innerHTML = courses.map(c => {
    const pct = c.enrolled ? courseProgressPct(c) : 0;
    return `
      <article
        class="course-card stagger"
        onclick="showCourseView(${c.id})"
        tabindex="0"
        role="button"
        aria-label="${c.title}"
        onkeydown="if(event.key==='Enter')showCourseView(${c.id})"
      >
        <div class="course-card-cover" style="background:${c.colour}22">
          <span style="position:relative;z-index:1">${c.icon}</span>
        </div>
        <div class="course-card-body">
          <div class="course-level-badge">${c.levelLabel} · ${c.class}</div>
          <div class="course-card-title">${c.title}</div>
          <div class="course-card-desc">${c.desc}</div>
          ${c.enrolled ? `
            <div class="course-progress-wrap">
              <div class="course-progress-label">
                <span>Progress</span><span>${pct}%</span>
              </div>
              <div class="course-progress-track">
                <div class="course-progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="course-card-footer">
          <span class="course-meta-item">${Icon.book} ${totalLessons(c)} lessons</span>
          <span class="course-meta-item">${Icon.clock} ${c.duration}</span>
          ${c.enrolled
            ? `<span class="badge badge-green" style="font-size:.7rem">Enrolled</span>`
            : `<span class="badge badge-grey"  style="font-size:.7rem">Not enrolled</span>`}
        </div>
      </article>
    `;
  }).join('');
}

function initCatalogue() {
  // Filter tabs
  document.querySelectorAll('.lms-filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lms-filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderCatalogue();
    });
  });

  // Search
  const slot = document.getElementById('lms-search-icon');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;

  document.getElementById('lms-search')
    ?.addEventListener('input', debounce(e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderCatalogue();
    }, 200));
}

/* ----------------------------------------------------------------
   COURSE VIEW
---------------------------------------------------------------- */
let activeCourse = null;
let activeLesson = null;

function renderCourseView(course) {
  activeCourse = course;
  activeLesson = null;

  // Hero
  const hero = document.getElementById('course-hero');
  if (hero) hero.style.background = `linear-gradient(135deg, ${course.colour} 0%, ${course.colour}cc 100%)`;

  const heroInner = document.getElementById('course-hero-inner');
  const pct       = courseProgressPct(course);
  const completed = getProgress(course.id).size;
  const total     = totalLessons(course);

  if (heroInner) {
    heroInner.innerHTML = `
      <div class="course-hero-icon" style="background:${course.colour}33">
        ${course.icon}
      </div>
      <div class="course-hero-text">
        <div class="course-hero-level">${course.levelLabel} · ${course.class}</div>
        <h1 class="course-hero-title">${course.title}</h1>
        <div class="course-hero-meta">
          <span class="course-hero-meta-item">${Icon.users} Teacher: <span>${course.teacher}</span></span>
          <span class="course-hero-meta-item">${Icon.book} <span>${total} lessons</span></span>
          <span class="course-hero-meta-item">${Icon.clock} <span>${course.duration}</span></span>
        </div>
      </div>
      <div class="course-hero-progress">
        <div class="chp-label">Your Progress</div>
        <div class="chp-pct">${pct}%</div>
        <div class="chp-track"><div class="chp-fill" style="width:${pct}%"></div></div>
        <div class="chp-sub">${completed} of ${total} lessons complete</div>
      </div>
    `;
  }

  // Lessons meta
  const metaEl = document.getElementById('lessons-meta');
  if (metaEl) metaEl.textContent = `${total} lessons · ${course.modules.length} modules`;

  // Lessons list
  renderLessonsList(course);

  // Reset viewer
  document.getElementById('lesson-placeholder').hidden = false;
  document.getElementById('lesson-content').hidden     = true;
}

function renderLessonsList(course) {
  const list = document.getElementById('lessons-list');
  if (!list) return;

  const progress = getProgress(course.id);
  const typeIcon = { video: '▶', reading: '📄' };

  list.innerHTML = course.modules.map(mod => `
    <div class="lesson-module">
      <div class="lesson-module-header">
        <span>${mod.title}</span>
        <span class="module-count">${mod.lessons.length} lessons</span>
      </div>
      ${mod.lessons.map(lesson => {
        const done    = progress.has(lesson.id);
        const current = activeLesson?.id === lesson.id;
        return `
          <div
            class="lesson-row ${current ? 'active' : ''} ${done ? 'completed' : ''}"
            data-lesson-id="${lesson.id}"
            onclick="openLesson(${course.id}, ${lesson.id})"
            tabindex="0"
            role="button"
            aria-label="${lesson.title}"
            onkeydown="if(event.key==='Enter')openLesson(${course.id},${lesson.id})"
          >
            <div class="lesson-row-icon ${done ? 'done' : current ? 'active' : 'pending'}">
              ${done ? '✅' : typeIcon[lesson.type] || '📄'}
            </div>
            <div class="lesson-row-info">
              <div class="lesson-row-title">${lesson.title}</div>
              <div class="lesson-row-meta">
                <span>${lesson.type}</span>
                <span>·</span>
                <span>${lesson.duration}</span>
              </div>
            </div>
            ${done ? '<span class="lesson-check">✓</span>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   LESSON VIEWER
---------------------------------------------------------------- */
window.openLesson = function(courseId, lessonId) {
  const course  = COURSES.find(c => c.id === courseId);
  const lessons = allLessons(course);
  const lesson  = lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  activeLesson = lesson;
  renderLessonsList(course);   // refresh active state

  const placeholder = document.getElementById('lesson-placeholder');
  const content     = document.getElementById('lesson-content');
  if (!placeholder || !content) return;

  placeholder.hidden = true;
  content.hidden     = false;

  const modName = course.modules.find(m => m.lessons.some(l => l.id === lessonId))?.title || '';

  const paragraphs = lesson.body.split('\n\n').filter(Boolean).map(p =>
    `<p class="lc-text">${p}</p>`
  ).join('');

  const keypointsHTML = lesson.keypoints?.length ? `
    <div class="lc-keypoints">
      <div class="lc-keypoints-title">Key Points</div>
      <div class="lc-keypoints-list">
        ${lesson.keypoints.map(k => `
          <div class="lc-keypoint">
            <div class="lc-keypoint-dot"></div>
            <span>${k}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const assignmentHTML = lesson.assignment ? `
    <div class="lc-assignment">
      <div class="lc-assignment-icon">📝</div>
      <div class="lc-assignment-body">
        <div class="lc-assignment-title">${lesson.assignment.title}</div>
        <div class="lc-assignment-desc">
          Due in ${lesson.assignment.due} · ${lesson.assignment.marks} marks
        </div>
        <button class="btn btn-gold btn-sm" onclick="showToast('Assignment submission coming in Stage 6','info')">
          Submit Assignment →
        </button>
      </div>
    </div>
  ` : '';

  const videoHTML = lesson.type === 'video' ? `
    <div class="lc-video" onclick="showToast('Video player coming in Stage 6','info')">
      <div class="lc-video-play">▶</div>
      <span class="lc-video-label">${lesson.title} · ${lesson.duration}</span>
    </div>
  ` : '';

  // Prev / next lesson navigation
  const idx      = lessons.indexOf(lesson);
  const prevL    = lessons[idx - 1];
  const nextL    = lessons[idx + 1];
  const isDone   = getProgress(courseId).has(lessonId);

  content.innerHTML = `
    <div class="lc-header">
      <div class="lc-breadcrumb">${course.title} › ${modName}</div>
      <h2 class="lc-title">${lesson.title}</h2>
      <div class="lc-meta">
        <span class="lc-meta-item">${lesson.type === 'video' ? '▶ Video' : '📄 Reading'}</span>
        <span class="lc-meta-item">${Icon.clock} ${lesson.duration}</span>
      </div>
    </div>

    ${videoHTML}

    <div class="lc-body">
      ${paragraphs}
      ${keypointsHTML}
      ${assignmentHTML}
    </div>

    <div class="lc-footer">
      <div>
        ${prevL
          ? `<button class="btn btn-outline btn-sm" onclick="openLesson(${courseId},${prevL.id})">← Previous</button>`
          : '<span></span>'
        }
      </div>
      <button
        class="btn ${isDone ? 'btn-outline' : 'btn-gold'} btn-sm lc-complete-btn"
        id="complete-btn"
        onclick="toggleComplete(${courseId},${lessonId})"
      >
        ${isDone ? '✅ Completed' : 'Mark as Complete ✓'}
      </button>
      <div>
        ${nextL
          ? `<button class="btn btn-gold btn-sm" onclick="openLesson(${courseId},${nextL.id})">Next →</button>`
          : '<span></span>'
        }
      </div>
    </div>
  `;
};

/* ----------------------------------------------------------------
   COMPLETE / UNCOMPLETE
---------------------------------------------------------------- */
window.toggleComplete = function(courseId, lessonId) {
  const progress = getProgress(courseId);
  if (progress.has(lessonId)) {
    progress.delete(lessonId);
    showToast('Lesson marked as incomplete.', 'info');
  } else {
    markLessonComplete(courseId, lessonId);
    showToast('Lesson completed! Well done.', 'success');
  }

  // Refresh lesson list, hero progress and complete button
  const course = COURSES.find(c => c.id === courseId);
  renderLessonsList(course);

  // Update hero progress numbers
  const pct       = courseProgressPct(course);
  const completed = getProgress(courseId).size;
  const total     = totalLessons(course);
  const pctEl     = document.querySelector('.chp-pct');
  const fillEl    = document.querySelector('.chp-fill');
  const subEl     = document.querySelector('.chp-sub');
  if (pctEl)  pctEl.textContent  = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (subEl)  subEl.textContent  = `${completed} of ${total} lessons complete`;

  // Update button state
  const btn  = document.getElementById('complete-btn');
  const done = getProgress(courseId).has(lessonId);
  if (btn) {
    btn.className   = `btn ${done ? 'btn-outline' : 'btn-gold'} btn-sm lc-complete-btn`;
    btn.textContent = done ? '✅ Completed' : 'Mark as Complete ✓';
  }
};

/* ----------------------------------------------------------------
   LOAD (with simulated API delay + fallback)
---------------------------------------------------------------- */
async function loadCourses() {
  try {
    // Replace with: const data = await apiFetch('/lms/courses')
    await new Promise(r => setTimeout(r, 600));
    // COURSES already loaded as static fallback
  } catch { /* use static */ }

  document.getElementById('skeleton-grid').hidden = true;
  renderCatalogue();
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderStatsStrip();
  initCatalogue();
  loadCourses();
});