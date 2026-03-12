/* ================================================================
   cbt.js — Computer Based Testing Engine
   Three screens:
     1. Landing / login
     2. Exam in progress (timer, question navigator, flagging)
     3. Score / review screen

   Flow: login → verify token → show exam → countdown timer
         → navigate questions → flag → submit → show score + review
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   EXAM CATALOGUE
   In production: loaded via GET /cbt/exams
---------------------------------------------------------------- */
const EXAM_CATALOGUE = [
  {
    code:     'MATH-SS2-T3',
    title:    'Mathematics — SSS 2, Third Term',
    subject:  'Mathematics',
    class:    'SSS 2',
    duration: 45,            // minutes
    token:    'DELTA2025',   // demo token — replace with server-side auth
    questions: [
      {
        id: 1, text: 'Simplify: (2x³y²) × (3x²y)',
        options: ['6x⁵y³','5x⁵y³','6x⁶y³','5x⁶y'],
        answer: 0,
      },
      {
        id: 2, text: 'Find the value of x in the equation: 3x − 7 = 14',
        options: ['x = 5','x = 7','x = 21','x = 3'],
        answer: 1,
      },
      {
        id: 3, text: 'The sum of the interior angles of a hexagon is:',
        options: ['540°','720°','360°','900°'],
        answer: 1,
      },
      {
        id: 4, text: 'What is the gradient of the line passing through (2, 3) and (6, 11)?',
        options: ['1','3','2','4'],
        answer: 2,
      },
      {
        id: 5, text: 'Factorise: x² + 5x + 6',
        options: ['(x+1)(x+6)','(x+2)(x+3)','(x+3)(x+2)','(x+2)(x+3)'],
        answer: 1,
      },
      {
        id: 6, text: 'A circle has a radius of 7 cm. Its area is: (use π = 22/7)',
        options: ['154 cm²','44 cm²','49 cm²','308 cm²'],
        answer: 0,
      },
      {
        id: 7, text: 'If log₁₀(x) = 2, what is x?',
        options: ['20','100','10','1000'],
        answer: 1,
      },
      {
        id: 8, text: 'What is the LCM of 12 and 18?',
        options: ['6','36','72','216'],
        answer: 1,
      },
      {
        id: 9, text: 'Convert 0.375 to a fraction in its simplest form.',
        options: ['3/8','3/7','7/8','1/3'],
        answer: 0,
      },
      {
        id: 10, text: 'A rectangle has length 12 cm and width 5 cm. What is the length of its diagonal?',
        options: ['13 cm','17 cm','10 cm','11 cm'],
        answer: 0,
      },
    ],
  },
  {
    code:     'ENG-SS1-T3',
    title:    'English Language — SSS 1, Third Term',
    subject:  'English Language',
    class:    'SSS 1',
    duration: 40,
    token:    'DELTA2025',
    questions: [
      {
        id: 1, text: 'Choose the word closest in meaning to "eloquent":',
        options: ['Quiet','Articulate','Rude','Confused'],
        answer: 1,
      },
      {
        id: 2, text: 'Identify the figure of speech in: "The classroom was a zoo."',
        options: ['Simile','Hyperbole','Metaphor','Personification'],
        answer: 2,
      },
      {
        id: 3, text: 'Select the correct sentence:',
        options: [
          'Neither the students nor the teacher are ready.',
          'Neither the students nor the teacher is ready.',
          'Neither the students nor the teacher were ready.',
          'Neither the students nor the teacher was ready.',
        ],
        answer: 1,
      },
      {
        id: 4, text: 'The plural of "criterion" is:',
        options: ['Criterions','Criteria','Criterias','Criterium'],
        answer: 1,
      },
      {
        id: 5, text: 'In "She ran quickly," the word "quickly" is a:',
        options: ['Adjective','Noun','Adverb','Verb'],
        answer: 2,
      },
    ],
  },
];

/* ----------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
let currentExam     = null;
let studentInfo     = { id: '', name: 'Candidate' };
let answers         = {};    // { questionIndex: optionIndex }
let flagged         = new Set();
let currentQuestion = 0;
let timerInterval   = null;
let secondsLeft     = 0;
let examSubmitted   = false;

/* ----------------------------------------------------------------
   SCREEN HELPERS
---------------------------------------------------------------- */
function showScreen(id) {
  document.querySelectorAll('.cbt-screen').forEach(s => {
    s.hidden = s.id !== id;
  });
}

/* ----------------------------------------------------------------
   AVAILABLE EXAMS LIST (landing screen)
---------------------------------------------------------------- */
function renderAvailableExams() {
  const list = document.getElementById('cbt-available-list');
  if (!list) return;
  list.innerHTML = EXAM_CATALOGUE.map(e => `
    <div class="available-exam-item">
      <div>
        <div class="aei-name">${e.title}</div>
        <div class="aei-meta">Code: <strong style="color:var(--gold-light);font-family:monospace">${e.code}</strong></div>
      </div>
      <span class="aei-duration">⏱ ${e.duration} min</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   TOKEN TOGGLE (landing)
---------------------------------------------------------------- */
function initTokenToggle() {
  const toggle   = document.getElementById('token-toggle');
  const input    = document.getElementById('cbt-token');
  const iconSlot = document.getElementById('token-toggle-icon');
  if (!toggle || !input || !iconSlot) return;

  iconSlot.innerHTML = Icon.eye;
  toggle.addEventListener('click', () => {
    const show         = input.type === 'password';
    input.type         = show ? 'text' : 'password';
    iconSlot.innerHTML = show ? Icon.eyeoff : Icon.eye;
    toggle.setAttribute('aria-label', show ? 'Hide token' : 'Show token');
  });
}

/* ----------------------------------------------------------------
   LOGIN / VERIFY
---------------------------------------------------------------- */
function initLoginForm() {
  const form = document.getElementById('cbt-login-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const studentId = document.getElementById('cbt-student-id').value.trim().toUpperCase();
    const examCode  = document.getElementById('cbt-exam-code').value.trim().toUpperCase();
    const token     = document.getElementById('cbt-token').value.trim();

    const errors = validate(
      { 'cbt-student-id': studentId, 'cbt-exam-code': examCode, 'cbt-token': token },
      {
        'cbt-student-id': ['required'],
        'cbt-exam-code':  ['required'],
        'cbt-token':      ['required'],
      }
    );
    if (errors) { showFieldErrors(errors); return; }
    clearFieldErrors(['cbt-student-id','cbt-exam-code','cbt-token']);

    const btn     = document.getElementById('cbt-login-btn');
    const restore = setLoadingBtn(btn, 'Verifying…');

    try {
      // Simulate API verify: POST /cbt/verify { studentId, examCode, token }
      await new Promise(r => setTimeout(r, 900));

      const exam = EXAM_CATALOGUE.find(e => e.code === examCode);
      if (!exam) {
        showFieldErrors({ 'cbt-exam-code': 'Exam code not found. Check and try again.' });
        restore();
        return;
      }
      if (token !== exam.token) {
        showFieldErrors({ 'cbt-token': 'Invalid access token. Contact your teacher.' });
        restore();
        return;
      }

      currentExam     = exam;
      studentInfo.id  = studentId;
      answers         = {};
      flagged         = new Set();
      currentQuestion = 0;
      examSubmitted   = false;

      startExam();

    } catch {
      showToast('Login failed. Please try again.', 'error');
      restore();
    }
  });
}

/* ----------------------------------------------------------------
   START EXAM
---------------------------------------------------------------- */
function startExam() {
  showScreen('screen-exam');

  // Top bar
  document.getElementById('exam-title').textContent     = currentExam.title;
  document.getElementById('exam-candidate').textContent = `Student ID: ${studentInfo.id}`;
  document.getElementById('total-count').textContent    = currentExam.questions.length;

  // Timer
  secondsLeft = currentExam.duration * 60;
  renderTimer();
  timerInterval = setInterval(tickTimer, 1000);

  // Build question nav
  buildNavGrid();

  // Show first question
  renderQuestion(0);

  // Submit button
  document.getElementById('submit-exam-btn')
    ?.addEventListener('click', confirmSubmit);
}

/* ----------------------------------------------------------------
   TIMER
---------------------------------------------------------------- */
function renderTimer() {
  const mins  = Math.floor(secondsLeft / 60);
  const secs  = secondsLeft % 60;
  const el    = document.getElementById('timer-display');
  const wrap  = document.getElementById('exam-timer');
  if (!el) return;
  el.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  wrap.classList.toggle('timer-warning', secondsLeft <= 300 && secondsLeft > 60);
  wrap.classList.toggle('timer-danger',  secondsLeft <= 60);
}

function tickTimer() {
  if (secondsLeft <= 0) {
    clearInterval(timerInterval);
    showToast('Time is up! Your exam has been submitted automatically.', 'info', 5000);
    submitExam();
    return;
  }
  secondsLeft--;
  renderTimer();
}

/* ----------------------------------------------------------------
   QUESTION NAVIGATOR
---------------------------------------------------------------- */
function buildNavGrid() {
  const grid = document.getElementById('exam-nav-grid');
  if (!grid) return;
  grid.innerHTML = currentExam.questions.map((q, i) => `
    <button
      class="qnum-btn ${i === currentQuestion ? 'current' : ''}"
      data-index="${i}"
      aria-label="Question ${i+1}"
      onclick="goToQuestion(${i})"
    >${i+1}</button>
  `).join('');
}

function updateNavGrid() {
  const btns = document.querySelectorAll('.qnum-btn');
  btns.forEach((btn, i) => {
    btn.className = 'qnum-btn';
    if (answers[i] !== undefined)  btn.classList.add('answered');
    if (flagged.has(i))            btn.classList.add('flagged');
    if (i === currentQuestion)     btn.classList.add('current');
  });
}

window.goToQuestion = function(index) {
  currentQuestion = index;
  renderQuestion(index);
  updateNavGrid();
};

/* ----------------------------------------------------------------
   RENDER QUESTION
---------------------------------------------------------------- */
function renderQuestion(index) {
  const q    = currentExam.questions[index];
  const card = document.getElementById('question-card');
  if (!card || !q) return;

  const selectedOption = answers[index];
  const isFlagged      = flagged.has(index);
  const optLetters     = ['A','B','C','D','E'];

  card.innerHTML = `
    <div class="question-header">
      <span class="question-num">Question ${index + 1} of ${currentExam.questions.length}</span>
      ${isFlagged ? '<span class="flag-indicator">⚑ Flagged</span>' : ''}
      <span class="question-marks">2 marks</span>
    </div>
    <div class="question-body">
      <p class="question-text">${q.text}</p>
      <div class="options-list" role="radiogroup" aria-label="Answer options">
        ${q.options.map((opt, i) => `
          <label class="option-label ${selectedOption === i ? 'selected' : ''}" data-option="${i}">
            <input type="radio" name="q${q.id}" value="${i}" ${selectedOption === i ? 'checked' : ''} />
            <span class="option-key">${optLetters[i]}</span>
            <span class="option-text">${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  // Option click handlers
  card.querySelectorAll('.option-label').forEach(label => {
    label.addEventListener('click', () => {
      const optIdx = parseInt(label.dataset.option);
      selectAnswer(index, optIdx);
    });
  });

  // Update nav buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const flagBtn = document.getElementById('flag-btn');

  prevBtn.disabled   = index === 0;
  nextBtn.textContent = index === currentExam.questions.length - 1 ? 'Review ✓' : 'Next →';
  flagBtn.textContent = isFlagged ? '⚑ Unflag' : '⚑ Flag';
  flagBtn.style.color = isFlagged ? '#E67E22' : '';

  updateProgress();
}

function selectAnswer(questionIndex, optionIndex) {
  answers[questionIndex] = optionIndex;
  updateProgress();
  updateNavGrid();
  renderQuestion(questionIndex);
}

function updateProgress() {
  const answered = Object.keys(answers).length;
  const total    = currentExam.questions.length;
  document.getElementById('answered-count').textContent = answered;
  document.getElementById('progress-fill').style.width  = `${(answered / total) * 100}%`;
}

/* ----------------------------------------------------------------
   NAVIGATION BUTTONS
---------------------------------------------------------------- */
function initNavButtons() {
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentQuestion > 0) goToQuestion(currentQuestion - 1);
  });

  document.getElementById('next-btn')?.addEventListener('click', () => {
    const last = currentExam.questions.length - 1;
    if (currentQuestion < last) {
      goToQuestion(currentQuestion + 1);
    } else {
      confirmSubmit();
    }
  });

  document.getElementById('flag-btn')?.addEventListener('click', () => {
    if (flagged.has(currentQuestion)) {
      flagged.delete(currentQuestion);
    } else {
      flagged.add(currentQuestion);
    }
    updateNavGrid();
    renderQuestion(currentQuestion);
  });
}

/* ----------------------------------------------------------------
   SUBMIT
---------------------------------------------------------------- */
async function confirmSubmit() {
  const unanswered = currentExam.questions.length - Object.keys(answers).length;
  const msg = unanswered > 0
    ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
    : 'Submit your exam? You cannot make changes after submission.';

  const confirmed = await confirmDialog(msg);
  if (confirmed) submitExam();
}

function submitExam() {
  if (examSubmitted) return;
  examSubmitted = true;
  clearInterval(timerInterval);
  showScoreScreen();
}

/* ----------------------------------------------------------------
   SCORE SCREEN
---------------------------------------------------------------- */
function showScoreScreen() {
  showScreen('screen-results');

  const questions = currentExam.questions;
  let correct     = 0;

  const reviewItems = questions.map((q, i) => {
    const chosen    = answers[i];
    const isCorrect = chosen === q.answer;
    if (isCorrect) correct++;
    const optLetters = ['A','B','C','D','E'];
    return { q, chosen, isCorrect, optLetters };
  });

  const total   = questions.length;
  const pct     = Math.round((correct / total) * 100);
  const wrong   = total - correct - (Object.keys(answers).length < total ? total - Object.keys(answers).length : 0);
  const skipped = total - Object.keys(answers).length;

  const gradeInfo = getGradeInfo(pct);

  const wrap = document.getElementById('score-wrap');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="score-card">
      <div class="score-header">
        <span class="score-emoji">${gradeInfo.emoji}</span>
        <div class="score-pct" style="color:${gradeInfo.colour}">${pct}%</div>
        <div class="score-grade" style="color:${gradeInfo.colour}">${gradeInfo.label}</div>
        <div class="score-exam-name">${currentExam.title}</div>
      </div>

      <div class="score-summary">
        <div class="score-summary-item">
          <div class="ss-num" style="color:var(--green)">${correct}</div>
          <div class="ss-label">Correct</div>
        </div>
        <div class="score-summary-item">
          <div class="ss-num" style="color:var(--red)">${wrong}</div>
          <div class="ss-label">Wrong</div>
        </div>
        <div class="score-summary-item">
          <div class="ss-num" style="color:var(--navy-300)">${skipped}</div>
          <div class="ss-label">Skipped</div>
        </div>
      </div>

      <div class="score-review">
        <div class="score-review-title">Question Review</div>
        <div class="review-list">
          ${reviewItems.map((item, i) => `
            <div class="review-item ${item.isCorrect ? 'correct' : 'wrong'}">
              <div class="review-q">${i+1}. ${item.q.text}</div>
              <div class="review-ans">
                <span class="review-your">
                  Your answer: <span>${item.chosen !== undefined ? `${item.optLetters[item.chosen]}. ${item.q.options[item.chosen]}` : 'Not answered'}</span>
                </span>
                ${!item.isCorrect ? `<span class="review-correct-ans">✓ ${item.optLetters[item.q.answer]}. ${item.q.options[item.q.answer]}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="score-actions">
      <button class="btn btn-gold" onclick="location.reload()">Take Another Exam</button>
      <button class="btn btn-outline" onclick="window.print()">🖨 Print Results</button>
      <a href="../results/results.html" class="btn btn-ghost">View Full Results →</a>
    </div>
  `;
}

function getGradeInfo(pct) {
  if (pct >= 75) return { label: 'Excellent — A1', emoji: '🏆', colour: 'var(--gold)' };
  if (pct >= 65) return { label: 'Very Good — B',  emoji: '🎉', colour: 'var(--green)' };
  if (pct >= 50) return { label: 'Credit — C',     emoji: '👍', colour: 'var(--blue)' };
  if (pct >= 40) return { label: 'Pass — D/E',     emoji: '✅', colour: 'var(--navy-300)' };
  return              { label: 'Fail — F9',     emoji: '📚', colour: 'var(--red)' };
}

/* ----------------------------------------------------------------
   KEYBOARD NAVIGATION
---------------------------------------------------------------- */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (document.getElementById('screen-exam').hidden) return;

    const key = e.key;
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      const last = currentExam.questions.length - 1;
      if (currentQuestion < last) goToQuestion(currentQuestion + 1);
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      if (currentQuestion > 0) goToQuestion(currentQuestion - 1);
    } else if (['1','2','3','4','a','b','c','d'].includes(key.toLowerCase())) {
      const map  = {'1':0,'a':0,'2':1,'b':1,'3':2,'c':2,'4':3,'d':3};
      const optIdx = map[key.toLowerCase()];
      if (optIdx !== undefined && optIdx < currentExam.questions[currentQuestion].options.length) {
        selectAnswer(currentQuestion, optIdx);
      }
    }
  });
}

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderAvailableExams();
  initTokenToggle();
  initLoginForm();
  initNavButtons();
  initKeyboard();
});