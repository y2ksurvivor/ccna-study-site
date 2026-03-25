// ─────────────────────────────────────────────────────────────────────────────
//  Layer8 — Flackbox Deck Engine (Flashcards + Quiz)
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const STORAGE_KEY = 'layer8_flackbox_stats';
  const PANEL_ID    = 'tool-flackbox';

  // ── State ─────────────────────────────────────────────────
  const state = {
    mode:             'flashcard', // 'flashcard' | 'quiz'
    section:          'all',
    sessionCards:     [],
    currentIndex:     0,
    score:            0,
    wrongCards:       [],
    answered:         false,
    streak:           0,
    maxStreak:        0,
    currentOptions:   [],   // MCQ options for quiz
    correctOptionIdx: 0,
  };

  // ── Helpers ───────────────────────────────────────────────
  function el (id) { return document.getElementById(id); }
  function panel () { return el(PANEL_ID); }

  function escapeHtml (str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shuffle (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── localStorage helpers ───────────────────────────────────
  function loadStats () {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function saveStats (stats) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch (_) {}
  }

  function recordResult (cardId, correct) {
    const stats = loadStats();
    if (!stats[cardId]) stats[cardId] = { correct: 0, incorrect: 0 };
    if (correct) stats[cardId].correct++;
    else stats[cardId].incorrect++;
    saveStats(stats);
  }

  // ── Pool building ─────────────────────────────────────────
  function buildPool (sectionFilter) {
    if (sectionFilter === 'all') return FLACKBOX_CARDS.slice();
    return FLACKBOX_CARDS.filter(c => c.section === sectionFilter);
  }

  // Weighted sample: prefer unseen and previously wrong cards
  function weightedSample (pool, n) {
    const stats = loadStats();
    const weighted = pool.map(c => {
      const s = stats[c.id];
      let w = s ? Math.max(0.3, 1 + s.incorrect * 0.5 - s.correct * 0.25) : 1.5;
      return { c, w };
    });

    const result = [];
    const avail  = weighted.slice();
    const count  = Math.min(n, avail.length);

    for (let i = 0; i < count; i++) {
      const total = avail.reduce((s, x) => s + x.w, 0);
      let rand = Math.random() * total;
      let chosen = avail.length - 1;
      for (let j = 0; j < avail.length; j++) {
        rand -= avail[j].w;
        if (rand <= 0) { chosen = j; break; }
      }
      result.push(avail[chosen].c);
      avail.splice(chosen, 1);
    }
    return result;
  }

  // ── Build MCQ options for a card ─────────────────────────
  function buildOptions (card) {
    // Gather distractor pool: same section first, then full deck
    const sameSection = FLACKBOX_CARDS.filter(c => c.section === card.section && c.id !== card.id);
    const otherCards  = FLACKBOX_CARDS.filter(c => c.section !== card.section);
    const distractorPool = shuffle(sameSection.length >= 3 ? sameSection : sameSection.concat(otherCards));

    const distractors = [];
    const usedAnswers = new Set([card.answer.toLowerCase()]);
    for (const c of distractorPool) {
      if (distractors.length >= 3) break;
      if (!usedAnswers.has(c.answer.toLowerCase()) && c.answer.length < 200) {
        distractors.push(c.answer);
        usedAnswers.add(c.answer.toLowerCase());
      }
    }

    // Fill remaining distractors if needed (shouldn't happen with 589 cards)
    while (distractors.length < 3) distractors.push('—');

    const options = shuffle([card.answer, ...distractors]);
    const correctIdx = options.indexOf(card.answer);
    return { options, correctIdx };
  }

  // ── Section list ──────────────────────────────────────────
  function getSections () {
    const seen = new Set();
    const sections = [];
    FLACKBOX_CARDS.forEach(c => {
      if (!seen.has(c.section)) {
        seen.add(c.section);
        sections.push({ section: c.section, unit: c.unit });
      }
    });
    sections.sort((a, b) => a.section - b.section);
    return sections;
  }

  // ─────────────────────────────────────────────────────────
  //  SETUP SCREEN
  // ─────────────────────────────────────────────────────────

  function renderSetup () {
    const sections = getSections();
    const pool     = buildPool(state.section);
    const stats    = loadStats();

    let seen = 0, correct = 0, incorrect = 0;
    pool.forEach(c => {
      const s = stats[c.id];
      if (s) { seen++; correct += s.correct; incorrect += s.incorrect; }
    });
    const coverage = pool.length > 0 ? Math.round((seen / pool.length) * 100) : 0;

    const sectionPills = sections.map(s => {
      const active = state.section === s.section;
      return `<button class="topic-pill${active ? ' selected' : ''}" data-sec="${s.section}">${escapeHtml(s.unit)}</button>`;
    }).join('');

    panel().innerHTML = `
      <div class="study-setup">
        <div class="study-setup-header">
          <h2>Flackbox Deck</h2>
          <p>Concept flashcards from the Flackbox CCNA 200-301 Anki deck.</p>
        </div>

        <div class="setup-section">
          <div class="setup-section-title">Section</div>
          <div class="topic-pills">
            <button class="topic-pill${state.section === 'all' ? ' selected' : ''}" data-sec="all">All Sections</button>
            ${sectionPills}
          </div>
        </div>

        <div class="setup-section">
          <div class="setup-section-title">Your Progress</div>
          <div class="stats-row" id="fbStatsRow">
            <div class="stats-chip chip-accent">
              <span class="stats-chip-value">${pool.length}</span>
              <span class="stats-chip-label">Cards</span>
            </div>
            <div class="stats-chip chip-green">
              <span class="stats-chip-value">${correct}</span>
              <span class="stats-chip-label">Correct</span>
            </div>
            <div class="stats-chip chip-red">
              <span class="stats-chip-value">${incorrect}</span>
              <span class="stats-chip-label">Incorrect</span>
            </div>
            <div class="stats-chip chip-yellow">
              <span class="stats-chip-value">${coverage}%</span>
              <span class="stats-chip-label">Coverage</span>
            </div>
          </div>
        </div>

        <div class="start-buttons">
          <button class="btn-start btn-start-flashcard" id="fbBtnFlashcard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M12 5v14M2 12h20" opacity="0.4"/>
            </svg>
            Flashcards
          </button>
          <button class="btn-start btn-start-quiz" id="fbBtnQuiz">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Quiz Mode
          </button>
        </div>
      </div>
    `;

    // Section pill clicks
    panel().querySelectorAll('.topic-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.sec;
        state.section = raw === 'all' ? 'all' : parseInt(raw, 10);
        panel().querySelectorAll('.topic-pill').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        // Update stats
        const p2 = buildPool(state.section);
        const s2 = loadStats();
        let seen2 = 0, c2 = 0, i2 = 0;
        p2.forEach(c => {
          const s = s2[c.id];
          if (s) { seen2++; c2 += s.correct; i2 += s.incorrect; }
        });
        const cov2 = p2.length > 0 ? Math.round((seen2 / p2.length) * 100) : 0;
        const row = el('fbStatsRow');
        if (row) {
          row.innerHTML = `
            <div class="stats-chip chip-accent"><span class="stats-chip-value">${p2.length}</span><span class="stats-chip-label">Cards</span></div>
            <div class="stats-chip chip-green"><span class="stats-chip-value">${c2}</span><span class="stats-chip-label">Correct</span></div>
            <div class="stats-chip chip-red"><span class="stats-chip-value">${i2}</span><span class="stats-chip-label">Incorrect</span></div>
            <div class="stats-chip chip-yellow"><span class="stats-chip-value">${cov2}%</span><span class="stats-chip-label">Coverage</span></div>
          `;
        }
      });
    });

    const btnFC = el('fbBtnFlashcard');
    const btnQz = el('fbBtnQuiz');
    if (btnFC) btnFC.addEventListener('click', startFlashcards);
    if (btnQz) btnQz.addEventListener('click', startQuiz);
  }

  // ─────────────────────────────────────────────────────────
  //  FLASHCARD MODE
  // ─────────────────────────────────────────────────────────

  function startFlashcards () {
    const pool = buildPool(state.section);
    if (pool.length === 0) { alert('No cards in this section.'); return; }
    state.mode = 'flashcard';
    state.sessionCards   = shuffle(pool);
    state.currentIndex   = 0;
    state.score          = 0;
    state.wrongCards     = [];
    state.streak         = 0;
    state.maxStreak      = 0;
    renderFlashcard();
  }

  function renderFlashcard () {
    const total = state.sessionCards.length;
    const idx   = state.currentIndex;

    if (idx >= total) { renderFlashcardResults(); return; }

    const card = state.sessionCards[idx];
    const pct  = total > 0 ? (idx / total) * 100 : 0;

    panel().innerHTML = `
      <div class="flashcard-area">
        <div class="session-header">
          <button class="session-back-btn" id="fbFcBack">← Setup</button>
          <span class="session-title">${escapeHtml(card.unit)}</span>
          <span class="session-progress-label">${idx + 1} / ${total}</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="flashcard-wrap" id="fbFcWrap" title="Click to flip" role="button" tabindex="0">
          <div class="flashcard" id="fbFlashcard">
            <div class="flashcard-front">
              <span class="flashcard-topic-badge">${escapeHtml(card.unit)}</span>
              <p class="flashcard-question">${escapeHtml(card.question)}</p>
              <div class="flashcard-flip-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
                </svg>
                Click to reveal answer
              </div>
            </div>
            <div class="flashcard-back">
              <span class="flashcard-answer-label">Answer</span>
              <p class="flashcard-answer">${escapeHtml(card.answer)}</p>
            </div>
          </div>
        </div>
        <div class="flashcard-actions hidden" id="fbFcActions">
          <button class="btn-fc btn-fc-again" id="fbFcAgain">↻ Review Again</button>
          <button class="btn-fc btn-fc-got-it" id="fbFcGotIt">✓ Got It</button>
        </div>
      </div>
    `;

    const wrap    = el('fbFcWrap');
    const fcCard  = el('fbFlashcard');
    const actions = el('fbFcActions');

    function flip () {
      fcCard.classList.add('flipped');
      actions.classList.remove('hidden');
      wrap.setAttribute('tabindex', '-1');
    }

    wrap.addEventListener('click', flip);
    wrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    el('fbFcBack').addEventListener('click', renderSetup);

    el('fbFcAgain').addEventListener('click', () => {
      recordResult(card.id, false);
      state.wrongCards.push(card);
      state.streak = 0;
      state.sessionCards.push(card);
      state.currentIndex++;
      renderFlashcard();
    });

    el('fbFcGotIt').addEventListener('click', () => {
      recordResult(card.id, true);
      state.score++;
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
      state.currentIndex++;
      renderFlashcard();
    });
  }

  function renderFlashcardResults () {
    const known    = state.score;
    const learning = state.wrongCards.length;
    const total    = known + learning;
    const mastery  = total > 0 ? Math.round((known / total) * 100) : 0;

    panel().innerHTML = `
      <div class="fc-results">
        <div class="session-header">
          <button class="session-back-btn" id="fbFcResBack">← Setup</button>
          <span class="session-title">Flashcard Results</span>
        </div>
        <div class="fc-results-stats">
          <div class="stats-chip chip-green"><span class="stats-chip-value">${known}</span><span class="stats-chip-label">Got It</span></div>
          <div class="stats-chip chip-red"><span class="stats-chip-value">${learning}</span><span class="stats-chip-label">Still Learning</span></div>
          <div class="stats-chip chip-yellow"><span class="stats-chip-value">${mastery}%</span><span class="stats-chip-label">Mastery</span></div>
          <div class="stats-chip chip-accent"><span class="stats-chip-value">${state.maxStreak}</span><span class="stats-chip-label">Best Streak</span></div>
        </div>
        <div class="results-actions">
          ${state.wrongCards.length > 0 ? `<button class="btn-results btn-results-primary" id="fbFcRetry">↻ Review Missed (${state.wrongCards.length})</button>` : ''}
          <button class="btn-results btn-results-secondary" id="fbFcNew">New Session</button>
        </div>
      </div>
    `;

    el('fbFcResBack').addEventListener('click', renderSetup);
    const retryBtn = el('fbFcRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        state.sessionCards = shuffle(state.wrongCards);
        state.currentIndex = 0;
        state.score = 0;
        state.wrongCards = [];
        state.streak = 0;
        state.maxStreak = 0;
        renderFlashcard();
      });
    }
    el('fbFcNew').addEventListener('click', startFlashcards);
  }

  // ─────────────────────────────────────────────────────────
  //  QUIZ MODE
  // ─────────────────────────────────────────────────────────

  function startQuiz () {
    const pool = buildPool(state.section);
    if (pool.length < 4) { alert('Need at least 4 cards for quiz mode. Try "All Sections".'); return; }
    state.mode = 'quiz';
    state.sessionCards   = weightedSample(pool, 10);
    state.currentIndex   = 0;
    state.score          = 0;
    state.wrongCards     = [];
    state.answered       = false;
    state.streak         = 0;
    state.maxStreak      = 0;
    renderQuizQuestion();
  }

  function renderQuizQuestion () {
    const total = state.sessionCards.length;
    const idx   = state.currentIndex;

    if (idx >= total) { renderQuizResults(); return; }

    const card = state.sessionCards[idx];
    const pct  = total > 0 ? (idx / total) * 100 : 0;
    const { options, correctIdx } = buildOptions(card);

    state.answered       = false;
    state.currentOptions = options;
    state.correctOptionIdx = correctIdx;

    const LETTERS = ['A', 'B', 'C', 'D'];

    panel().innerHTML = `
      <div class="quiz-area">
        <div class="session-header">
          <button class="session-back-btn" id="fbQzBack">← Setup</button>
          <span class="session-title">${escapeHtml(card.unit)}</span>
          <div class="streak-badge" id="fbStreakBadge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            ${state.streak}
          </div>
          <span class="session-progress-label">${idx + 1} / ${total}</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="quiz-question-card">
          <div class="quiz-q-meta">
            <span class="quiz-topic-badge">${escapeHtml(card.unit)}</span>
          </div>
          <p class="quiz-question-text">${escapeHtml(card.question)}</p>
        </div>
        <div class="quiz-options" id="fbQzOptions">
          ${options.map((opt, i) => `
            <button class="quiz-option" data-idx="${i}">
              <span class="quiz-option-letter">${LETTERS[i]}</span>
              <span>${escapeHtml(opt)}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback-banner" id="fbQzFeedback"></div>
        <div class="explanation-box" id="fbExplainBox">
          <button class="explanation-toggle" id="fbExplainToggle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            Show correct answer
            <span class="explanation-toggle-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </button>
          <div class="explanation-body" id="fbExplainBody">
            <div class="explanation-correct-answer">
              <span class="explanation-correct-label">Correct</span>
              <span class="explanation-correct-text">${escapeHtml(card.answer)}</span>
            </div>
          </div>
        </div>
        <div class="quiz-nav">
          <button class="btn-next" id="fbBtnNext" disabled>
            ${idx + 1 < total ? 'Next Question →' : 'See Results →'}
          </button>
        </div>
      </div>
    `;

    el('fbQzOptions').addEventListener('click', e => {
      const btn = e.target.closest('.quiz-option');
      if (!btn || state.answered) return;
      handleQuizAnswer(card, parseInt(btn.dataset.idx, 10));
    });

    el('fbExplainToggle').addEventListener('click', () => el('fbExplainBox').classList.toggle('open'));
    el('fbQzBack').addEventListener('click', renderSetup);
    el('fbBtnNext').addEventListener('click', () => { state.currentIndex++; renderQuizQuestion(); });
  }

  function handleQuizAnswer (card, chosenIdx) {
    state.answered = true;
    const isCorrect = chosenIdx === state.correctOptionIdx;

    recordResult(card.id, isCorrect);

    if (isCorrect) {
      state.score++;
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    } else {
      state.wrongCards.push(card);
      state.streak = 0;
    }

    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === state.correctOptionIdx && isCorrect) {
        btn.classList.add('correct');
      } else if (i === chosenIdx && !isCorrect) {
        btn.classList.add('wrong');
      } else if (i === state.correctOptionIdx && !isCorrect) {
        btn.classList.add('reveal');
      } else {
        btn.classList.add('dimmed');
      }
    });

    const banner = el('fbQzFeedback');
    banner.classList.add('show');
    if (isCorrect) {
      banner.classList.add('correct');
      banner.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Correct!`;
    } else {
      banner.classList.add('wrong');
      banner.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Not quite — see correct answer below`;
      el('fbExplainBox').classList.add('open');
    }

    const badge = el('fbStreakBadge');
    if (badge) {
      badge.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> ${state.streak}`;
      if (isCorrect) { badge.classList.add('bump'); setTimeout(() => badge.classList.remove('bump'), 400); }
    }

    el('fbBtnNext').disabled = false;
  }

  function renderQuizResults () {
    const total   = state.sessionCards.length;
    const score   = state.score;
    const pct     = total > 0 ? Math.round((score / total) * 100) : 0;
    const circleOffset = Math.round(283 - (pct / 100) * 283);
    const circleClass  = pct >= 80 ? 'passing' : pct < 50 ? 'failing' : '';
    const headline = pct >= 80 ? 'Great work! Keep it up.' : pct >= 60 ? 'Good effort — keep studying.' : 'Keep at it — you\'ll get there!';

    panel().innerHTML = `
      <div class="results-view">
        <div class="session-header">
          <button class="session-back-btn" id="fbResBack">← Setup</button>
          <span class="session-title">Quiz Results</span>
        </div>
        <div class="results-hero">
          <div class="results-score-circle ${circleClass}" id="fbScoreCircle">
            <svg viewBox="0 0 100 100">
              <circle class="circle-track" cx="50" cy="50" r="45"/>
              <circle class="circle-fill" id="fbCircleFill" cx="50" cy="50" r="45" style="stroke-dashoffset:${circleOffset}"/>
            </svg>
            <div class="results-score-text">
              <span class="results-score-pct">${pct}%</span>
              <span class="results-score-sub">${score}/${total}</span>
            </div>
          </div>
          <div class="results-summary">
            <h3>${headline}</h3>
            <p>You answered ${score} of ${total} questions correctly.</p>
            ${state.maxStreak >= 3 ? `<div class="results-streak-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Best streak: ${state.maxStreak}</div>` : ''}
          </div>
        </div>
        <div class="results-actions">
          ${state.wrongCards.length > 0 ? `<button class="btn-results btn-results-primary" id="fbResRetry">↻ Retry Missed (${state.wrongCards.length})</button>` : ''}
          <button class="btn-results btn-results-secondary" id="fbResNew">New Quiz</button>
          <button class="btn-results btn-results-secondary" id="fbResSetup">← Back to Setup</button>
        </div>
      </div>
    `;

    setTimeout(() => {
      const fill = el('fbCircleFill');
      if (fill) fill.style.strokeDashoffset = String(circleOffset);
    }, 100);

    el('fbResBack').addEventListener('click', renderSetup);
    el('fbResSetup').addEventListener('click', renderSetup);
    el('fbResNew').addEventListener('click', startQuiz);
    const retryBtn = el('fbResRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        state.sessionCards = state.wrongCards.slice();
        state.currentIndex = 0;
        state.score = 0;
        state.wrongCards = [];
        state.answered = false;
        state.streak = 0;
        state.maxStreak = 0;
        renderQuizQuestion();
      });
    }
  }

  // ── Public API ────────────────────────────────────────────
  window.FlackboxEngine = {
    init: renderSetup,
    startMode: function (mode) {
      renderSetup();
      if (mode === 'fb-flashcard') {
        setTimeout(startFlashcards, 50);
      } else if (mode === 'fb-quiz') {
        setTimeout(startQuiz, 50);
      }
    },
  };

})();
