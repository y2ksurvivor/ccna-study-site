// ─────────────────────────────────────────────────────────────────────────────
//  Layer8 — Type Race
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const PANEL_ID  = 'tool-typerace';
  const RACE_SIZE = 8;

  // ── State ─────────────────────────────────────────────────
  const state = {
    commands:    [],
    currentIdx:  0,
    currentPos:  0,   // correct chars typed in current command
    hasError:    false,
    startTime:   null,
    totalErrors: 0,
    totalCharsCompleted: 0,
    statsTimer:  null,
    done:        false,
  };

  // ── Helpers ───────────────────────────────────────────────
  function el (id)  { return document.getElementById(id); }
  function panel () { return el(PANEL_ID); }

  function esc (str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function shuffle (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Command pool ──────────────────────────────────────────
  // Use puzzle answers — concrete, typeable IOS commands
  function buildPool () {
    return PUZZLES
      .map(p => p.answer.trim())
      .filter(a =>
        a.length >= 8 &&
        a.length <= 52 &&
        !a.includes('\n') &&
        !a.includes('<') &&
        !a.includes('[')
      );
  }

  // ── Stats ─────────────────────────────────────────────────
  function calcWPM () {
    if (!state.startTime) return 0;
    const mins = (Date.now() - state.startTime) / 60000;
    if (mins < 0.001) return 0;
    const chars = state.totalCharsCompleted + state.currentPos;
    return Math.round((chars / 5) / mins);
  }

  function calcAccuracy () {
    const total = state.totalCharsCompleted + state.currentPos + state.totalErrors;
    if (total === 0) return 100;
    return Math.max(0, Math.round(((total - state.totalErrors) / total) * 100));
  }

  function calcProgress () {
    const totalChars = state.commands.reduce((s, c) => s + c.length, 0);
    if (!totalChars) return 0;
    return ((state.totalCharsCompleted + state.currentPos) / totalChars) * 100;
  }

  function wpmGrade (wpm) {
    if (wpm >= 80) return 'Network Engineer speed';
    if (wpm >= 60) return 'Solid — above average';
    if (wpm >= 40) return 'Keep practicing';
    return 'You\'ll get faster';
  }

  // ─────────────────────────────────────────────────────────
  //  SETUP
  // ─────────────────────────────────────────────────────────
  function renderSetup () {
    panel().innerHTML = `
      <div class="tr-setup">
        <div class="tr-setup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/>
            <circle cx="18" cy="17" r="3"/><circle cx="7" cy="17" r="3"/>
            <path d="M7 17V5M17 17v-2"/>
          </svg>
        </div>
        <h2>Type Race</h2>
        <p>Race through ${RACE_SIZE} IOS commands. Type faster, drive faster.</p>
        <button class="tr-btn-start" id="trStartBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Start Race
        </button>
      </div>
    `;
    el('trStartBtn').addEventListener('click', startRace);
  }

  // ─────────────────────────────────────────────────────────
  //  RACE
  // ─────────────────────────────────────────────────────────
  function startRace () {
    clearInterval(state.statsTimer);
    const pool = buildPool();
    Object.assign(state, {
      commands:            shuffle(pool).slice(0, RACE_SIZE),
      currentIdx:          0,
      currentPos:          0,
      hasError:            false,
      startTime:           null,
      totalErrors:         0,
      totalCharsCompleted: 0,
      done:                false,
    });
    renderRace();
  }

  function renderRace () {
    const cmd  = state.commands[state.currentIdx] || '';
    const pct  = calcProgress();
    const carX = Math.max(3, Math.min(87, pct));

    panel().innerHTML = `
      <div class="tr-race">

        <!-- Stats -->
        <div class="tr-stats-bar">
          <div class="tr-stat">
            <span class="tr-stat-value" id="trWpm">0</span>
            <span class="tr-stat-label">WPM</span>
          </div>
          <div class="tr-stat">
            <span class="tr-stat-value" id="trAcc">100%</span>
            <span class="tr-stat-label">Accuracy</span>
          </div>
          <div class="tr-stat">
            <span class="tr-stat-value" id="trTime">0:00</span>
            <span class="tr-stat-label">Time</span>
          </div>
          <div class="tr-stat">
            <span class="tr-stat-value" id="trErrors">0</span>
            <span class="tr-stat-label">Errors</span>
          </div>
        </div>

        <!-- Track -->
        <div class="tr-track-wrap">
          <div class="tr-track">
            <div class="tr-road-lines" id="trRoadLines"></div>
            <div class="tr-road-center" id="trRoadCenter"></div>
            <div class="tr-car" id="trCar" style="left:${carX}%">
              ${carSVG()}
            </div>
            <div class="tr-flag">🏁</div>
          </div>
          <div class="tr-track-meta">
            <span>Command ${state.currentIdx + 1} of ${state.commands.length}</span>
            <span id="trPctLabel">${Math.round(pct)}% complete</span>
          </div>
        </div>

        <!-- Command display -->
        <div class="tr-command-wrap">
          <div class="tr-command-label">Type this command</div>
          <div class="tr-command-display" id="trCmdDisplay">${buildCmdHTML(cmd)}</div>
        </div>

        <!-- Input -->
        <div class="tr-input-wrap">
          <input
            id="trInput"
            class="tr-input"
            type="text"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="Start typing…"
          />
          <div class="tr-input-hint">Backspace to correct errors</div>
        </div>

      </div>
    `;

    // Focus and bind
    const input = el('trInput');
    input.focus();
    input.addEventListener('keydown', onKeydown);

    // Live stats ticker
    state.statsTimer = setInterval(tickStats, 150);
  }

  function carSVG () {
    return `
      <svg width="54" height="26" viewBox="0 0 54 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- body -->
        <rect x="4"  y="10" width="44" height="11" rx="3" fill="var(--accent)"/>
        <!-- cab -->
        <path d="M12 10 L16 3 H36 L42 10 Z" fill="var(--accent)"/>
        <!-- windows -->
        <rect x="17" y="4"  width="8"  height="5" rx="1" fill="rgba(6,8,16,0.6)"/>
        <rect x="27" y="4"  width="8"  height="5" rx="1" fill="rgba(6,8,16,0.6)"/>
        <!-- wheels -->
        <circle cx="14" cy="22" r="4" fill="#0d1017" stroke="var(--accent)" stroke-width="1.5"/>
        <circle cx="14" cy="22" r="1.5" fill="var(--accent)" opacity="0.6"/>
        <circle cx="40" cy="22" r="4" fill="#0d1017" stroke="var(--accent)" stroke-width="1.5"/>
        <circle cx="40" cy="22" r="1.5" fill="var(--accent)" opacity="0.6"/>
        <!-- headlight -->
        <rect x="47" y="12" width="5" height="4" rx="1" fill="#fff" opacity="0.9"/>
        <!-- taillight -->
        <rect x="2"  y="12" width="4" height="4" rx="1" fill="#ff4444" opacity="0.9"/>
      </svg>
    `;
  }

  function buildCmdHTML (cmd) {
    if (!cmd) return '';
    return cmd.split('').map((ch, i) => {
      const display = ch === ' ' ? '\u00a0' : esc(ch);
      if (i < state.currentPos) {
        return `<span class="tr-ch tr-ch-correct">${display}</span>`;
      }
      if (i === state.currentPos) {
        const cls = state.hasError ? 'tr-ch tr-ch-error' : 'tr-ch tr-ch-cursor';
        return `<span class="${cls}">${display}</span>`;
      }
      return `<span class="tr-ch tr-ch-pending">${display}</span>`;
    }).join('');
  }

  // ── Keydown handler ───────────────────────────────────────
  function onKeydown (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (state.done) return;

    const cmd = state.commands[state.currentIdx];
    if (!cmd) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (state.hasError) {
        state.hasError = false;
      } else if (state.currentPos > 0) {
        state.currentPos--;
      }
      refreshDisplay();
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    // Start timer on first real keypress
    if (!state.startTime) state.startTime = Date.now();

    const expected = cmd[state.currentPos];
    if (e.key === expected && !state.hasError) {
      state.currentPos++;
      state.hasError = false;

      if (state.currentPos >= cmd.length) {
        // Command complete — advance
        state.totalCharsCompleted += cmd.length;
        state.currentIdx++;
        state.currentPos = 0;
        state.hasError   = false;

        if (state.currentIdx >= state.commands.length) {
          clearInterval(state.statsTimer);
          refreshDisplay();
          setTimeout(finishRace, 300);
          return;
        }
      }
    } else {
      if (!state.hasError) {
        state.totalErrors++;
        state.hasError = true;
      }
    }

    refreshDisplay();
  }

  function refreshDisplay () {
    const cmd     = state.commands[state.currentIdx];
    const display = el('trCmdDisplay');
    const car     = el('trCar');
    const input   = el('trInput');
    const pctLbl  = el('trPctLabel');
    const roads   = [el('trRoadLines'), el('trRoadCenter')];

    if (display && cmd !== undefined) {
      display.innerHTML = buildCmdHTML(cmd || '');
    }

    const pct  = calcProgress();
    const carX = Math.max(3, Math.min(87, pct));
    if (car)    car.style.left = carX + '%';
    if (pctLbl) pctLbl.textContent = Math.round(pct) + '% complete';

    // Road scroll speed scales with WPM (higher WPM → faster road)
    const wpm   = calcWPM();
    const speed = Math.max(0.15, 0.8 - wpm * 0.005);
    roads.forEach(r => { if (r) r.style.animationDuration = speed + 's'; });

    if (input) input.classList.toggle('tr-input--error', state.hasError);

    tickStats();
  }

  function tickStats () {
    const wpmEl  = el('trWpm');
    const accEl  = el('trAcc');
    const timeEl = el('trTime');
    const errEl  = el('trErrors');

    if (wpmEl)  wpmEl.textContent  = calcWPM();
    if (accEl)  accEl.textContent  = calcAccuracy() + '%';
    if (errEl)  errEl.textContent  = state.totalErrors;
    if (timeEl && state.startTime) {
      const sec = Math.floor((Date.now() - state.startTime) / 1000);
      timeEl.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
    }
  }

  // ─────────────────────────────────────────────────────────
  //  RESULTS
  // ─────────────────────────────────────────────────────────
  function finishRace () {
    clearInterval(state.statsTimer);
    state.done = true;

    const wpm = calcWPM();
    const acc = calcAccuracy();
    const elapsed = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    panel().innerHTML = `
      <div class="tr-results">
        <div class="tr-results-header">
          <div class="tr-trophy">🏆</div>
          <h2>Race Complete!</h2>
        </div>

        <div class="tr-result-grid">
          <div class="tr-result-stat">
            <span class="tr-result-value">${wpm}</span>
            <span class="tr-result-label">WPM</span>
          </div>
          <div class="tr-result-stat">
            <span class="tr-result-value">${acc}%</span>
            <span class="tr-result-label">Accuracy</span>
          </div>
          <div class="tr-result-stat">
            <span class="tr-result-value">${mins}:${String(secs).padStart(2,'0')}</span>
            <span class="tr-result-label">Time</span>
          </div>
          <div class="tr-result-stat">
            <span class="tr-result-value">${state.totalErrors}</span>
            <span class="tr-result-label">Errors</span>
          </div>
        </div>

        <div class="tr-wpm-grade">${wpmGrade(wpm)}</div>

        <button class="tr-btn-start" id="trNewRace">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          New Race
        </button>
      </div>
    `;

    el('trNewRace').addEventListener('click', startRace);
  }

  // ── Public API ────────────────────────────────────────────
  window.TypeRace = { init: renderSetup };

})();
