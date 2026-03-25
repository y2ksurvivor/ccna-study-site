// ─────────────────────────────────────────────────────────────────────────────
//  Layer8 — Command Recall
//  Show a scenario → user types the IOS command from memory
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const PANEL_ID    = 'tool-typerace';
  const SESSION_SIZE = 10;

  const state = {
    session:    [],
    currentIdx: 0,
    answered:   false,
    correct:    0,
    incorrect:  0,
    skips:      0,
    streak:     0,
    maxStreak:  0,
    section:    'all',
  };

  // ── Helpers ───────────────────────────────────────────────
  function el (id)  { return document.getElementById(id); }
  function panel () { return el(PANEL_ID); }

  function shuffle (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function esc (s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function promptFor (p) {
    return p.mode === 'config' ? 'Router(config)#' : 'Router#';
  }

  function getSections () {
    const seen = new Set();
    const out  = [];
    PUZZLES.forEach(p => {
      if (!seen.has(p.section)) {
        seen.add(p.section);
        out.push({ section: p.section, unit: p.unit });
      }
    });
    out.sort((a, b) => a.section - b.section);
    return out;
  }

  function buildPool () {
    return state.section === 'all'
      ? PUZZLES.slice()
      : PUZZLES.filter(p => p.section === state.section);
  }

  // ── Setup screen ──────────────────────────────────────────
  function renderSetup () {
    const sections = getSections();
    const pool     = buildPool();
    const size     = Math.min(SESSION_SIZE, pool.length);

    const pills = sections.map(s => {
      const on = state.section === s.section;
      return `<button class="topic-pill${on ? ' selected' : ''}" data-sec="${s.section}">${esc(s.unit)}</button>`;
    }).join('');

    panel().innerHTML = `
      <div class="study-setup">
        <div class="study-setup-header">
          <h2>Command Recall</h2>
          <p>Read the scenario. Type the full IOS command from memory and press Enter.</p>
        </div>

        <div class="setup-section">
          <div class="setup-section-title">Section</div>
          <div class="topic-pills">
            <button class="topic-pill${state.section === 'all' ? ' selected' : ''}" data-sec="all">All Sections</button>
            ${pills}
          </div>
        </div>

        <div class="setup-section">
          <div class="setup-section-title">Session</div>
          <p class="cr-pool-meta">${pool.length} commands available &nbsp;·&nbsp; ${size} per session</p>
        </div>

        <div class="start-buttons">
          <button class="btn-start btn-start-flashcard" id="crStart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
            Start Recall
          </button>
        </div>
      </div>
    `;

    panel().querySelectorAll('.topic-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.sec;
        state.section = raw === 'all' ? 'all' : parseInt(raw, 10);
        renderSetup();
      });
    });

    el('crStart').addEventListener('click', startSession);
  }

  // ── Session start ─────────────────────────────────────────
  function startSession () {
    const pool = buildPool();
    if (!pool.length) { alert('No commands in this section.'); return; }
    state.session    = shuffle(pool).slice(0, SESSION_SIZE);
    state.currentIdx = 0;
    state.correct    = 0;
    state.incorrect  = 0;
    state.skips      = 0;
    state.streak     = 0;
    state.maxStreak  = 0;
    renderQuestion();
  }

  // ── Question screen ───────────────────────────────────────
  function renderQuestion () {
    if (state.currentIdx >= state.session.length) { renderResults(); return; }

    const puzzle = state.session[state.currentIdx];
    const idx    = state.currentIdx;
    const total  = state.session.length;
    const pct    = Math.round((idx / total) * 100);
    state.answered  = false;
    let hintWords   = 0;

    panel().innerHTML = `
      <div class="cr-wrap">

        <div class="cr-topbar">
          <button class="session-back-btn" id="crBack">← Setup</button>
          <span class="cr-counter">${idx + 1} / ${total}</span>
          <span class="cr-streak-badge" id="crStreakBadge">${state.streak > 1 ? '🔥 ' + state.streak : ''}</span>
        </div>

        <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>

        <div class="cr-scenario-card">
          <span class="cr-scenario-label">Scenario</span>
          <p class="cr-scenario-text">${esc(puzzle.scenario)}</p>
        </div>

        <div class="cr-input-row">
          <span class="cr-prompt">${esc(promptFor(puzzle))}&nbsp;</span>
          <input id="crInput" class="cr-input" type="text"
            autocomplete="off" spellcheck="false"
            autocorrect="off" autocapitalize="none"
            placeholder="type command and press Enter…" />
        </div>

        <div class="cr-action-row">
          <button class="btn-skip" id="crSkip">Skip</button>
          <button class="cr-hint-btn" id="crHint">Show Hint</button>
        </div>

        <div class="cr-feedback" id="crFeedback" style="display:none"></div>

      </div>
    `;

    const input = el('crInput');
    input.focus();

    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (state.answered) { advance(); return; }
      const val = input.value.trim();
      if (!val) return;
      submit(puzzle, val);
    });

    el('crBack').addEventListener('click', renderSetup);

    el('crSkip').addEventListener('click', () => {
      if (state.answered) return;
      state.skips++;
      state.streak = 0;
      showFeedback(puzzle, null, 'skipped');
    });

    el('crHint').addEventListener('click', () => {
      if (state.answered) return;
      const words = puzzle.answer.split(' ');
      hintWords = Math.min(hintWords + 1, words.length);
      const revealed = words.slice(0, hintWords).join(' ');
      const btn = el('crHint');
      btn.textContent = hintWords < words.length
        ? revealed + ' …'
        : revealed;
      btn.classList.add('cr-hint-btn--revealed');
    });
  }

  function submit (puzzle, value) {
    const isCorrect = value.toLowerCase() === puzzle.answer.toLowerCase();
    if (isCorrect) {
      state.correct++;
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    } else {
      state.incorrect++;
      state.streak = 0;
    }
    showFeedback(puzzle, value, isCorrect ? 'correct' : 'incorrect');
  }

  function showFeedback (puzzle, typed, result) {
    state.answered = true;

    const input = el('crInput');
    if (input) input.disabled = true;

    const skipBtn = el('crSkip');
    const hintBtn = el('crHint');
    if (skipBtn) skipBtn.disabled = true;
    if (hintBtn) hintBtn.disabled = true;

    const badge = el('crStreakBadge');
    if (badge) badge.textContent = state.streak > 1 ? '🔥 ' + state.streak : '';

    const fb = el('crFeedback');
    fb.style.display = '';

    if (result === 'correct') {
      fb.className = 'cr-feedback cr-feedback--correct';
      fb.innerHTML = `
        <div class="cr-fb-left">
          <span class="cr-fb-icon">✓</span>
          <div>
            <div class="cr-fb-status">Correct!</div>
            <code class="cr-fb-cmd">${esc(puzzle.answer)}</code>
          </div>
        </div>
        <button class="btn-next" id="crNext">${state.currentIdx + 1 < state.session.length ? 'Next →' : 'Results →'}</button>
      `;
    } else if (result === 'incorrect') {
      fb.className = 'cr-feedback cr-feedback--incorrect';
      fb.innerHTML = `
        <div class="cr-fb-left">
          <span class="cr-fb-icon">✗</span>
          <div>
            <div class="cr-fb-status">Correct answer:</div>
            <code class="cr-fb-cmd">${esc(puzzle.answer)}</code>
          </div>
        </div>
        <button class="btn-next" id="crNext">${state.currentIdx + 1 < state.session.length ? 'Next →' : 'Results →'}</button>
      `;
    } else {
      fb.className = 'cr-feedback cr-feedback--skipped';
      fb.innerHTML = `
        <div class="cr-fb-left">
          <span class="cr-fb-icon">→</span>
          <div>
            <div class="cr-fb-status">Answer:</div>
            <code class="cr-fb-cmd">${esc(puzzle.answer)}</code>
          </div>
        </div>
        <button class="btn-next" id="crNext">${state.currentIdx + 1 < state.session.length ? 'Next →' : 'Results →'}</button>
      `;
    }

    el('crNext').addEventListener('click', advance);
  }

  function advance () {
    state.currentIdx++;
    renderQuestion();
  }

  // ── Results ───────────────────────────────────────────────
  function renderResults () {
    const total = state.session.length;
    const pct   = total > 0 ? Math.round((state.correct / total) * 100) : 0;
    const grade = pct >= 90 ? '🏆' : pct >= 70 ? '🎯' : pct >= 50 ? '📈' : '📚';

    panel().innerHTML = `
      <div class="tr-results">
        <div class="tr-results-header">
          <div class="tr-trophy">${grade}</div>
          <h2>${pct}% Accuracy</h2>
          <p style="color:var(--text-secondary);margin:0">${state.correct} of ${total} correct</p>
        </div>

        <div class="tr-result-grid">
          <div class="tr-result-stat">
            <span class="tr-result-value" style="color:#4ade80">${state.correct}</span>
            <span class="tr-result-label">Correct</span>
          </div>
          <div class="tr-result-stat">
            <span class="tr-result-value" style="color:#e05252">${state.incorrect}</span>
            <span class="tr-result-label">Incorrect</span>
          </div>
          <div class="tr-result-stat">
            <span class="tr-result-value" style="color:var(--text-muted)">${state.skips}</span>
            <span class="tr-result-label">Skipped</span>
          </div>
          <div class="tr-result-stat">
            <span class="tr-result-value">${state.maxStreak}</span>
            <span class="tr-result-label">Best Streak</span>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
          <button class="tr-btn-start" id="crAgain">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
            </svg>
            Play Again
          </button>
          <button class="btn-skip" id="crSetup" style="padding:12px 24px;">← Setup</button>
        </div>
      </div>
    `;

    el('crAgain').addEventListener('click', startSession);
    el('crSetup').addEventListener('click', renderSetup);
  }

  // ── Public API ────────────────────────────────────────────
  window.TypeRace = { init: renderSetup };

})();
