// ─────────────────────────────────────────────────────────────────────────────
//  CCNA Command Puzzle — Game Logic
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const MAX_ATTEMPTS = 5;
  const PANEL = document.getElementById('tool-puzzle');

  let state = {
    puzzle:   null,
    attempts: [],   // [{ guess, feedback: [{ token, status }] }]
    gameOver: false,
    won:      false,
  };

  // ── Public API ───────────────────────────────────────────────────────────────
  window.PuzzleGame = { init };

  function init () {
    state = {
      puzzle:   pickRandom(),
      attempts: [],
      gameOver: false,
      won:      false,
    };
    render();
  }

  // ── Core Logic ───────────────────────────────────────────────────────────────
  function pickRandom () {
    return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
  }

  function submitGuess (raw) {
    const guess = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!guess || state.gameOver) return;

    const answer  = state.puzzle.answer.toLowerCase();
    const feedback = getTokenFeedback(guess, answer);
    const won      = guess === answer;

    state.attempts.push({ guess, feedback });

    if (won) {
      state.gameOver = true;
      state.won      = true;
    } else if (state.attempts.length >= MAX_ATTEMPTS) {
      state.gameOver = true;
    }

    render();

    if (!state.gameOver) {
      const input = PANEL.querySelector('#puzzleInput');
      if (input) { input.value = ''; input.focus(); }
    }
  }

  // Token-level Wordle-style feedback
  function getTokenFeedback (guessStr, answerStr) {
    const gTokens = guessStr.split(' ');
    const aTokens = answerStr.split(' ');
    const result  = new Array(gTokens.length).fill('gray');
    const aUsed   = new Array(aTokens.length).fill(false);
    const gUsed   = new Array(gTokens.length).fill(false);

    // Pass 1: exact position (green)
    for (let i = 0; i < gTokens.length; i++) {
      if (i < aTokens.length && gTokens[i] === aTokens[i]) {
        result[i] = 'green';
        aUsed[i]  = true;
        gUsed[i]  = true;
      }
    }

    // Pass 2: wrong position (yellow)
    for (let i = 0; i < gTokens.length; i++) {
      if (gUsed[i]) continue;
      for (let j = 0; j < aTokens.length; j++) {
        if (!aUsed[j] && gTokens[i] === aTokens[j]) {
          result[i] = 'yellow';
          aUsed[j]  = true;
          break;
        }
      }
    }

    return gTokens.map((token, i) => ({ token, status: result[i] }));
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function render () {
    const { puzzle, attempts, gameOver, won } = state;
    const remaining = MAX_ATTEMPTS - attempts.length;
    const prompt    = puzzle.mode === 'config' ? 'Router(config)#' : 'Router#';
    const showHint  = !gameOver && attempts.length >= 3;

    // Build attempt history rows
    let boardHtml = '';
    attempts.forEach(({ guess, feedback }) => {
      const chips = feedback
        .map(({ token, status }) =>
          `<span class="pz-token pz-token--${status}">${esc(token)}</span>`)
        .join('');
      boardHtml += `<div class="pz-row">${chips}</div>`;
    });

    // Empty placeholder rows for remaining attempts
    for (let i = attempts.length; i < MAX_ATTEMPTS; i++) {
      boardHtml += `<div class="pz-row pz-row--empty">
        <span class="pz-token pz-token--empty">&nbsp;</span>
      </div>`;
    }

    // Bottom section: input or result
    let bottomHtml = '';
    if (!gameOver) {
      bottomHtml = `
        <div class="pz-terminal">
          <div class="pz-prompt-wrap">
            <span class="pz-prompt">${esc(prompt)}</span>
            <input
              type="text"
              id="puzzleInput"
              class="pz-input"
              placeholder="type your command and press Enter…"
              autocomplete="off"
              spellcheck="false"
              autocapitalize="none"
            />
          </div>
          <button class="pz-submit" id="puzzleSubmit">Submit</button>
        </div>
        <div class="pz-hint${showHint ? ' pz-hint--visible' : ''}" id="puzzleHint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>${esc(puzzle.hint)}</span>
        </div>
      `;
    } else {
      const cls = won ? 'pz-result--win' : 'pz-result--lose';
      const msg = won
        ? `Correct! The command is <span class="pz-answer">${esc(puzzle.answer)}</span>`
        : `The answer was <span class="pz-answer">${esc(puzzle.answer)}</span>`;
      bottomHtml = `
        <div class="pz-result ${cls}">
          <div class="pz-result-msg">${msg}</div>
          <button class="pz-new-btn" id="puzzleNew">New Puzzle</button>
        </div>
      `;
    }

    PANEL.innerHTML = `
      <div class="pz-container">

        <div class="pz-header">
          <h2 class="pz-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
              <circle cx="7" cy="10" r="1" fill="currentColor"/>
              <circle cx="12" cy="10" r="1" fill="currentColor"/>
              <circle cx="17" cy="10" r="1" fill="currentColor"/>
            </svg>
            Command Puzzle
          </h2>
          <div class="pz-header-meta">
            <span class="stat-chip">${remaining} attempt${remaining !== 1 ? 's' : ''} left</span>
            <span class="pz-cat-badge cat-${esc(puzzle.category)}">${esc(puzzle.category)}</span>
          </div>
        </div>

        <div class="pz-scenario">
          <div class="pz-scenario-label">Exam Scenario</div>
          <p class="pz-scenario-text">${esc(puzzle.scenario)}</p>
          <div class="pz-mode-badge">
            CLI Mode: <code>${esc(prompt)}</code>
            <span class="pz-mode-desc">${puzzle.mode === 'config' ? '— Global Configuration Mode (entered via <code>configure terminal</code>)' : '— Privileged EXEC Mode (entered via <code>enable</code>)'}</span>
          </div>
        </div>

        <div class="pz-board">
          ${boardHtml}
        </div>

        <div class="pz-legend">
          <span class="pz-legend-item">
            <span class="pz-token pz-token--green pz-token--sm">word</span> correct position
          </span>
          <span class="pz-legend-item">
            <span class="pz-token pz-token--yellow pz-token--sm">word</span> wrong position
          </span>
          <span class="pz-legend-item">
            <span class="pz-token pz-token--gray pz-token--sm">word</span> not in command
          </span>
        </div>

        ${bottomHtml}

      </div>
    `;

    // Bind events after render
    const inputEl  = PANEL.querySelector('#puzzleInput');
    const submitEl = PANEL.querySelector('#puzzleSubmit');
    const newEl    = PANEL.querySelector('#puzzleNew');

    if (inputEl) {
      inputEl.focus();
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); submitGuess(inputEl.value); }
      });
    }
    if (submitEl) {
      submitEl.addEventListener('click', () => {
        const el = PANEL.querySelector('#puzzleInput');
        if (el) submitGuess(el.value);
      });
    }
    if (newEl) {
      newEl.addEventListener('click', init);
    }
  }

  function esc (str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
