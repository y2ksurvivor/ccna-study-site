// ─────────────────────────────────────────────────────────────────────────────
//  CCNA Study Site — Fill in the Blank
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const MAX_ATTEMPTS = 5;
  const PANEL = document.getElementById('tool-puzzle');

  // selectedSection: 'all' or a section number (integer)
  let selectedSection = 'all';

  let state = {
    puzzle:   null,
    blank:    null,   // { idx, word }
    attempts: [],     // [{ guess, correct }]
    gameOver: false,
    won:      false,
  };

  window.PuzzleGame = { init };

  // ── Init — shows category picker ─────────────────────────────────────────────
  function init () {
    // Set up a persistent content wrapper so NetworkBg canvas is never clobbered
    if (!PANEL.querySelector('.pz-content')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'pz-content';
      PANEL.appendChild(wrapper);
    }
    if (window.NetworkBg) window.NetworkBg.init(PANEL);
    renderCategoryPicker();
  }

  // ── Start a game with chosen section ─────────────────────────────────────────
  function getPool (sec) {
    return sec === 'all' ? PUZZLES : PUZZLES.filter(p => p.section === sec);
  }

  function startGame (section) {
    selectedSection = section;
    const pool   = getPool(section);
    const puzzle = pool[Math.floor(Math.random() * pool.length)];
    state = {
      puzzle,
      blank:    getBlank(puzzle.answer),
      attempts: [],
      gameOver: false,
      won:      false,
    };
    render();
  }

  // ── Blank Word Selection ──────────────────────────────────────────────────────
  // Picks the most exam-critical word to blank out from the command
  function getBlank (answer) {
    const tokens = answer.split(' ');

    const priority = [
      'ospf', 'eigrp', 'bgp', 'nat', 'cdp', 'lldp',
      'running-config', 'startup-config', 'version', 'route', 'routing',
      'neighbors', 'neighbor', 'translations', 'statistics', 'binding', 'lease',
      'trunk', 'nonegotiate', 'portfast', 'bpduguard', 'snooping',
      'preempt', 'priority', 'primary', 'active', 'desirable',
      'synchronous', 'secret', 'master', 'generate', 'unicast-routing',
      'auto-summary', 'inspection', 'encryption', 'extended', 'permit',
      'tftp', 'allowed', 'trust', 'helper-address',
      'domain-lookup', 'domain-name', 'name-server', 'dns', 'switchport',
      'full', 'port-security', 'fastethernet', 'rsa', 'password-encryption',
      'address', 'pool', 'access', 'dhcp', 'standby',
    ];

    for (const kw of priority) {
      const idx = tokens.indexOf(kw);
      if (idx !== -1) return { idx, word: kw };
    }

    // Fall back: last token that isn't an IP address or number
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (!/^\d/.test(tokens[i]) && tokens[i] !== '*') {
        return { idx: i, word: tokens[i] };
      }
    }

    return { idx: 0, word: tokens[0] };
  }

  // ── Build command display with blank ─────────────────────────────────────────
  function buildCommandDisplay (answer, blankIdx, revealWord) {
    const tokens = answer.split(' ');
    return tokens.map((token, i) => {
      if (i !== blankIdx) return `<span class="pz-cmd-word">${esc(token)}</span>`;
      if (revealWord) return `<span class="pz-cmd-word pz-cmd-word--reveal">${esc(token)}</span>`;
      return `<span class="pz-cmd-blank">_______</span>`;
    }).join(' ');
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  function submitGuess (raw) {
    const guess = raw.trim().toLowerCase();
    if (!guess || state.gameOver) return;

    const correct = guess === state.blank.word;
    state.attempts.push({ guess, correct });

    if (correct) {
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

  function getContent () {
    return PANEL.querySelector('.pz-content') || PANEL;
  }

  // ── Section Picker ────────────────────────────────────────────────────────────
  function renderCategoryPicker () {
    // Build section counts (preserve order by section number)
    const secMap = new Map();
    for (const p of PUZZLES) {
      if (!secMap.has(p.section)) secMap.set(p.section, { unit: p.unit, count: 0 });
      secMap.get(p.section).count++;
    }
    // Sort by section number
    const sections = [...secMap.entries()].sort((a, b) => a[0] - b[0]);

    const sectionsHtml = sections.map(([sec, { unit, count }]) => `
      <button class="pz-cat-btn" data-sec="${sec}">
        <span class="pz-cat-name">${esc(unit)}</span>
        <span class="pz-cat-count">${count} question${count !== 1 ? 's' : ''}</span>
      </button>
    `).join('');

    getContent().innerHTML = `
      <div class="pz-container">
        <div class="pz-header">
          <h2 class="pz-title">Command Puzzle</h2>
          <span class="stat-chip">${PUZZLES.length} questions</span>
        </div>
        <div class="pz-picker-intro">
          <div class="pz-scenario-label">Choose a Section</div>
          <p class="pz-scenario-text">Pick a topic to drill, or practice across all sections.</p>
        </div>
        <button class="pz-cat-btn pz-cat-btn--all" data-sec="all">
          <span class="pz-cat-name">All Sections</span>
          <span class="pz-cat-count">${PUZZLES.length} questions</span>
        </button>
        <div class="pz-cat-grid">${sectionsHtml}</div>
      </div>
    `;

    getContent().querySelectorAll('.pz-cat-btn').forEach(btn => {
      const raw = btn.dataset.sec;
      const sec = raw === 'all' ? 'all' : parseInt(raw, 10);
      btn.addEventListener('click', () => startGame(sec));
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function render () {
    const { puzzle, blank, attempts, gameOver, won } = state;
    const remaining = MAX_ATTEMPTS - attempts.length;
    const prompt    = puzzle.mode === 'config' ? 'Router(config)#' : 'Router#';
    const showHint  = !gameOver && attempts.length >= 2;
    const modeDesc  = puzzle.mode === 'config'
      ? 'Global Configuration Mode'
      : 'Privileged EXEC Mode';
    const sectionLabel = puzzle.unit || '';

    // Attempt history
    const attemptsHtml = attempts.map(({ guess, correct }) => `
      <div class="pz-attempt ${correct ? 'pz-attempt--correct' : 'pz-attempt--wrong'}">
        <span class="pz-attempt-icon">${correct ? '✅' : '❌'}</span>
        <span class="pz-attempt-guess">${esc(guess)}</span>
      </div>
    `).join('');

    // Command display
    const cmdDisplay = buildCommandDisplay(puzzle.answer, blank.idx, gameOver);

    // Bottom: input or result
    let bottomHtml = '';
    if (!gameOver) {
      bottomHtml = `
        <div class="pz-input-area">
          <label class="pz-input-label">Fill in the blank:</label>
          <div class="pz-input-row">
            <input
              type="text"
              id="puzzleInput"
              class="pz-input"
              placeholder="type the missing word…"
              autocomplete="off"
              spellcheck="false"
              autocapitalize="none"
            />
            <button class="pz-submit" id="puzzleSubmit">Submit</button>
          </div>
        </div>
        <div class="pz-hint${showHint ? ' pz-hint--visible' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Hint: ${esc(puzzle.hint)}</span>
        </div>
      `;
    } else {
      const cls = won ? 'pz-result--win' : 'pz-result--lose';
      const msg = won
        ? `<strong>Correct!</strong> The full command is:`
        : `<strong>Not quite.</strong> The answer was:`;
      bottomHtml = `
        <div class="pz-result ${cls}">
          <div class="pz-result-msg">${msg}</div>
          <div class="pz-result-cmd">${esc(puzzle.answer)}</div>
          <div class="pz-result-actions">
            <button class="pz-new-btn" id="puzzleNew">Next Puzzle →</button>
            <button class="pz-change-cat-btn" id="puzzleChangeCat">Change Category</button>
          </div>
        </div>
      `;
    }

    getContent().innerHTML = `
      <div class="pz-container">

        <div class="pz-header">
          <h2 class="pz-title">Command Puzzle</h2>
          <div class="pz-header-meta">
            <span class="pz-section-chip">${esc(sectionLabel)}</span>
            <span class="stat-chip">${remaining} attempt${remaining !== 1 ? 's' : ''} left</span>
          </div>
        </div>

        <div class="pz-scenario">
          <div class="pz-scenario-label">Scenario</div>
          <p class="pz-scenario-text">${esc(puzzle.scenario)}</p>
        </div>

        <div class="pz-command-card">
          <div class="pz-command-mode">${esc(prompt)} <span class="pz-mode-desc">(${esc(modeDesc)})</span></div>
          <div class="pz-command-display">${cmdDisplay}</div>
          <div class="pz-command-instruction">Type the word that replaces <span class="pz-blank-indicator">_______</span></div>
        </div>

        <div class="pz-attempts">${attemptsHtml}</div>

        ${bottomHtml}

      </div>
    `;

    // Events
    const content  = getContent();
    const inputEl  = content.querySelector('#puzzleInput');
    const submitEl = content.querySelector('#puzzleSubmit');
    const newEl    = content.querySelector('#puzzleNew');

    if (inputEl) {
      inputEl.focus();
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); submitGuess(inputEl.value); }
      });
    }
    if (submitEl) submitEl.addEventListener('click', () => {
      const el = content.querySelector('#puzzleInput');
      if (el) submitGuess(el.value);
    });
    if (newEl) newEl.addEventListener('click', () => startGame(selectedSection));
    const changeCatEl = content.querySelector('#puzzleChangeCat');
    if (changeCatEl) changeCatEl.addEventListener('click', renderCategoryPicker);
  }

  function esc (str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
