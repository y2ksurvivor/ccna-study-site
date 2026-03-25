// ─────────────────────────────────────────────────────────────────────────────
//  Layer8 — Type Race v2
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const PANEL_ID  = 'tool-typerace';
  const RACE_SIZE = 8;

  const OPP_DEFS = [
    { name: 'NoviceNet', wpm: 22, fill: '#e05252' },
    { name: 'OSPF_Pro',  wpm: 44, fill: '#f5a623' },
    { name: 'RouteKing', wpm: 63, fill: '#6bcb77' },
  ];

  // ── State ─────────────────────────────────────────────────
  const state = {
    puzzles:    [],
    commands:   [],
    currentIdx: 0,
    currentPos: 0,
    hasError:   false,
    startTime:  null,
    paused:     false,
    done:       false,
    totalErrors:         0,
    totalCharsCompleted: 0,
    statsTimer: null,
    oppTimer:   null,
    opponents:  [],
    playerFinishTime: null,
  };

  function resetOpponents () {
    state.opponents = OPP_DEFS.map(o => ({
      name:       o.name,
      wpm:        o.wpm,
      fill:       o.fill,
      charsTyped: 0,
      finished:   false,
      finishTime: null,
    }));
  }

  // ── Helpers ───────────────────────────────────────────────
  function el (id)  { return document.getElementById(id); }
  function panel () { return el(PANEL_ID); }

  function esc (str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function shuffle (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildPool () {
    return PUZZLES.filter(p => {
      const a = p.answer.trim();
      return a.length >= 8 && a.length <= 52 &&
             !a.includes('\n') && !a.includes('<') && !a.includes('[');
    });
  }

  // ── Math ──────────────────────────────────────────────────
  function totalRaceChars () {
    return state.commands.reduce((s, c) => s + c.length, 0);
  }

  function playerProgress () {
    const t = totalRaceChars();
    return t ? ((state.totalCharsCompleted + state.currentPos) / t) * 100 : 0;
  }

  function oppProgress (opp) {
    const t = totalRaceChars();
    return t ? Math.min(100, (opp.charsTyped / t) * 100) : 0;
  }

  function calcWPM () {
    if (!state.startTime) return 0;
    const mins = (Date.now() - state.startTime) / 60000;
    if (mins < 0.001) return 0;
    return Math.round(((state.totalCharsCompleted + state.currentPos) / 5) / mins);
  }

  function calcAccuracy () {
    const total = state.totalCharsCompleted + state.currentPos + state.totalErrors;
    return total ? Math.max(0, Math.round(((total - state.totalErrors) / total) * 100)) : 100;
  }

  function wpmGrade (wpm) {
    if (wpm >= 80) return 'Network Engineer speed 🚀';
    if (wpm >= 60) return 'Solid — above average';
    if (wpm >= 40) return 'Getting there — keep it up';
    return 'Practice makes perfect';
  }

  // ── SVGs ──────────────────────────────────────────────────
  function playerCarSVG () {
    return `<svg width="48" height="22" viewBox="0 0 48 22">
      <rect x="4" y="8" width="38" height="9" rx="2.5" fill="var(--accent)"/>
      <path d="M11 8 L14 3 H32 L37 8 Z" fill="var(--accent)"/>
      <rect x="15" y="3.5" width="7" height="4" rx="1" fill="rgba(6,8,16,0.55)"/>
      <rect x="24" y="3.5" width="6" height="4" rx="1" fill="rgba(6,8,16,0.55)"/>
      <circle cx="13" cy="18" r="3.5" fill="#0d1017" stroke="var(--accent)" stroke-width="1.5"/>
      <circle cx="13" cy="18" r="1.2" fill="var(--accent)" opacity="0.5"/>
      <circle cx="35" cy="18" r="3.5" fill="#0d1017" stroke="var(--accent)" stroke-width="1.5"/>
      <circle cx="35" cy="18" r="1.2" fill="var(--accent)" opacity="0.5"/>
      <rect x="41" y="10" width="5" height="3" rx="1" fill="#fff" opacity="0.85"/>
      <rect x="2"  y="10" width="4" height="3" rx="1" fill="#ff4444" opacity="0.9"/>
    </svg>`;
  }

  function oppCarSVG (fill) {
    return `<svg width="40" height="18" viewBox="0 0 40 18">
      <rect x="3" y="7" width="32" height="7" rx="2" fill="${fill}" opacity="0.85"/>
      <path d="M9 7 L12 2 H27 L31 7 Z" fill="${fill}" opacity="0.85"/>
      <circle cx="11" cy="15" r="3" fill="#0d1017" stroke="${fill}" stroke-width="1.2"/>
      <circle cx="29" cy="15" r="3" fill="#0d1017" stroke="${fill}" stroke-width="1.2"/>
      <rect x="34" y="8"  width="4" height="2.5" rx="0.5" fill="#fff" opacity="0.5"/>
      <rect x="2"  y="8" width="3" height="2.5" rx="0.5" fill="#f00" opacity="0.5"/>
    </svg>`;
  }

  // ── Setup ─────────────────────────────────────────────────
  function renderSetup () {
    panel().innerHTML = `
      <div class="tr-setup">
        <div class="tr-setup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/>
            <circle cx="18" cy="17" r="3"/><circle cx="7" cy="17" r="3"/>
          </svg>
        </div>
        <h2>Command Race</h2>
        <p>Race ${OPP_DEFS.length} opponents through ${RACE_SIZE} IOS commands.<br>Each command pauses for a quick explanation.</p>
        <div class="tr-opp-preview">
          ${OPP_DEFS.map(o => `
            <div class="tr-opp-chip">
              <span class="tr-opp-dot" style="background:${o.fill}"></span>
              <span>${esc(o.name)}</span>
              <span class="tr-opp-wpm">~${o.wpm} WPM</span>
            </div>
          `).join('')}
        </div>
        <button class="tr-btn-start" id="trStartBtn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          Start Race
        </button>
      </div>
    `;
    el('trStartBtn').addEventListener('click', startRace);
  }

  // ── Race ──────────────────────────────────────────────────
  function startRace () {
    clearInterval(state.statsTimer);
    clearInterval(state.oppTimer);
    resetOpponents();
    const pool = shuffle(buildPool()).slice(0, RACE_SIZE);
    Object.assign(state, {
      puzzles:   pool,
      commands:  pool.map(p => p.answer.trim()),
      currentIdx: 0,
      currentPos: 0,
      hasError:   false,
      startTime:  null,
      paused:     false,
      done:       false,
      totalErrors:         0,
      totalCharsCompleted: 0,
      playerFinishTime:    null,
    });
    renderRace();
  }

  function buildLanesHTML () {
    const pPct = playerProgress();
    let html = `
      <div class="tr-lane">
        <span class="tr-lane-label tr-lane-label--player">You</span>
        <div class="tr-lane-road" id="trPlayerRoad">
          <div class="tr-road-anim" id="trRoadAnim"></div>
          <div class="tr-lane-car" id="trCarPlayer" style="left:${Math.max(3,Math.min(87,pPct))}%">${playerCarSVG()}</div>
          <div class="tr-lane-flag">🏁</div>
        </div>
      </div>
    `;
    state.opponents.forEach((opp, i) => {
      const oPct = oppProgress(opp);
      html += `
        <div class="tr-lane">
          <span class="tr-lane-label" style="color:${opp.fill}">${esc(opp.name)}</span>
          <div class="tr-lane-road">
            <div class="tr-lane-car" id="trCarOpp${i}" style="left:${Math.max(3,Math.min(87,oPct))}%">${oppCarSVG(opp.fill)}</div>
            <div class="tr-lane-flag">🏁</div>
          </div>
        </div>
      `;
    });
    return html;
  }

  function renderRace () {
    panel().innerHTML = `
      <div class="tr-race">

        <div class="tr-stats-bar">
          <div class="tr-stat"><span class="tr-stat-value" id="trWpm">0</span><span class="tr-stat-label">WPM</span></div>
          <div class="tr-stat"><span class="tr-stat-value" id="trAcc">100%</span><span class="tr-stat-label">Accuracy</span></div>
          <div class="tr-stat"><span class="tr-stat-value" id="trTime">0:00</span><span class="tr-stat-label">Time</span></div>
          <div class="tr-stat"><span class="tr-stat-value" id="trErrors">0</span><span class="tr-stat-label">Errors</span></div>
        </div>

        <div class="tr-track-wrap">
          <div class="tr-track" id="trTrack">${buildLanesHTML()}</div>
          <div class="tr-track-meta">
            <span id="trCmdLabel">Command 1 of ${state.commands.length}</span>
            <span id="trPctLabel">0% complete</span>
          </div>
        </div>

        <div class="tr-command-wrap">
          <div class="tr-command-label" id="trCmdHeading">Type this command</div>
          <div class="tr-command-display" id="trCmdDisplay">${buildCmdHTML()}</div>
          <div class="tr-explain" id="trExplain" style="display:none"></div>
        </div>

        <div class="tr-input-wrap" id="trInputWrap">
          <input id="trInput" class="tr-input" type="text"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            placeholder="Start typing…"/>
          <div class="tr-input-hint">Backspace to correct errors</div>
        </div>

      </div>
    `;

    el('trInput').focus();
    el('trInput').addEventListener('keydown', onKeydown);

    state.statsTimer = setInterval(tickStats, 150);
    state.oppTimer   = setInterval(tickOpponents, 100);
  }

  // ── Command display ───────────────────────────────────────
  function promptFor (puzzle) {
    if (!puzzle) return 'Router#';
    return puzzle.mode === 'config' ? 'Router(config)#' : 'Router#';
  }

  function buildCmdHTML () {
    const cmd    = state.commands[state.currentIdx] || '';
    const prompt = promptFor(state.puzzles[state.currentIdx]);
    const promptSpan = `<span class="tr-ch-prompt">${esc(prompt)}\u00a0</span>`;
    const chars = cmd.split('').map((ch, i) => {
      const d = ch === ' ' ? '\u00a0' : esc(ch);
      if (i < state.currentPos)     return `<span class="tr-ch tr-ch-correct">${d}</span>`;
      if (i === state.currentPos)   return `<span class="tr-ch ${state.hasError ? 'tr-ch-error' : 'tr-ch-cursor'}">${d}</span>`;
      return `<span class="tr-ch tr-ch-pending">${d}</span>`;
    }).join('');
    return promptSpan + chars;
  }

  function buildCompletedCmdHTML (puzzle) {
    const prompt = promptFor(puzzle);
    const promptSpan = `<span class="tr-ch-prompt">${esc(prompt)}\u00a0</span>`;
    const chars = puzzle.answer.trim().split('').map(ch => {
      const d = ch === ' ' ? '\u00a0' : esc(ch);
      return `<span class="tr-ch tr-ch-correct">${d}</span>`;
    }).join('');
    return promptSpan + chars;
  }

  // ── Keydown ───────────────────────────────────────────────
  function onKeydown (e) {
    if (state.paused || state.done) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }

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

    if (!state.startTime) state.startTime = Date.now();

    if (e.key === cmd[state.currentPos] && !state.hasError) {
      state.currentPos++;

      if (state.currentPos >= cmd.length) {
        // Command complete
        state.totalCharsCompleted += cmd.length;
        const justFinishedIdx = state.currentIdx;
        state.currentIdx++;
        state.currentPos = 0;
        state.hasError   = false;

        refreshDisplay();

        if (state.currentIdx >= state.commands.length) {
          // Race done
          state.playerFinishTime = Date.now() - state.startTime;
          clearInterval(state.statsTimer);
          clearInterval(state.oppTimer);
          setTimeout(finishRace, 300);
        } else {
          // Show explanation then continue
          showExplanation(justFinishedIdx);
        }
        return;
      }
    } else {
      if (!state.hasError) {
        state.totalErrors++;
        state.hasError = true;
      }
    }

    refreshDisplay();
  }

  // ── Explanation pause ─────────────────────────────────────
  function showExplanation (puzzleIdx) {
    state.paused = true;
    clearInterval(state.oppTimer); // freeze opponents during explanation

    const puzzle   = state.puzzles[puzzleIdx];
    const heading  = el('trCmdHeading');
    const display  = el('trCmdDisplay');
    const explain  = el('trExplain');
    const inputWrap = el('trInputWrap');

    if (heading) heading.textContent = 'Command complete ✓';

    // Show the completed command all-green with prompt
    if (display) display.innerHTML = buildCompletedCmdHTML(puzzle);

    if (inputWrap) inputWrap.style.display = 'none';

    if (explain) {
      explain.style.display = 'block';
      explain.innerHTML = `
        <div class="tr-explain-inner">
          <div class="tr-explain-context">${esc(puzzle.scenario)}</div>
          <div class="tr-explain-meta">
            <span class="tr-explain-unit">${esc(puzzle.unit)}</span>
            <span class="tr-explain-mode">${puzzle.mode === 'config' ? 'config mode' : 'exec mode'}</span>
          </div>
          <button class="tr-btn-continue" id="trContinueBtn">
            Next Command →
          </button>
        </div>
      `;
      const continueBtn = el('trContinueBtn');
      continueBtn.addEventListener('click', resumeRace);
      continueBtn.focus(); // Enter key will activate it
    }
  }

  function resumeRace () {
    state.paused = false;

    const heading   = el('trCmdHeading');
    const display   = el('trCmdDisplay');
    const explain   = el('trExplain');
    const inputWrap = el('trInputWrap');

    if (heading)   heading.textContent = 'Type this command';
    if (explain)   explain.style.display = 'none';
    if (inputWrap) inputWrap.style.display = '';
    if (display)   display.innerHTML = buildCmdHTML();

    // Update command label
    const cmdLabel = el('trCmdLabel');
    if (cmdLabel) cmdLabel.textContent = `Command ${state.currentIdx + 1} of ${state.commands.length}`;

    // Resume opponent timer
    state.oppTimer = setInterval(tickOpponents, 100);

    // Re-focus input
    const input = el('trInput');
    if (input) { input.value = ''; input.focus(); }
  }

  // ── Refresh display ───────────────────────────────────────
  function refreshDisplay () {
    const display = el('trCmdDisplay');
    if (display && !state.paused) display.innerHTML = buildCmdHTML();

    const pPct = playerProgress();
    const car  = el('trCarPlayer');
    if (car) car.style.left = Math.max(3, Math.min(87, pPct)) + '%';

    const pctLbl = el('trPctLabel');
    if (pctLbl) pctLbl.textContent = Math.round(pPct) + '% complete';

    // Road scroll speed proportional to WPM
    const road = el('trRoadAnim');
    if (road) {
      const wpm   = calcWPM();
      const speed = Math.max(0.1, 0.75 - wpm * 0.005);
      road.style.animationDuration = speed + 's';
    }

    const input = el('trInput');
    if (input) input.classList.toggle('tr-input--error', state.hasError);

    tickStats();
  }

  // ── Tickers ───────────────────────────────────────────────
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

  function tickOpponents () {
    if (state.paused || state.done) return;
    const total = totalRaceChars();
    if (!total || !state.startTime) return;

    const dt = 0.1; // seconds per tick

    state.opponents.forEach((opp, i) => {
      if (opp.finished) return;
      const charsPerSec = (opp.wpm * 5) / 60;
      opp.charsTyped = Math.min(total, opp.charsTyped + charsPerSec * dt);
      if (opp.charsTyped >= total) {
        opp.charsTyped  = total;
        opp.finished    = true;
        opp.finishTime  = Date.now() - state.startTime;
      }
      const oPct = oppProgress(opp);
      const carEl = el('trCarOpp' + i);
      if (carEl) carEl.style.left = Math.max(3, Math.min(87, oPct)) + '%';
    });
  }

  // ── Results ───────────────────────────────────────────────
  function finishRace () {
    state.done = true;
    clearInterval(state.statsTimer);
    clearInterval(state.oppTimer);

    const wpm = calcWPM();
    const acc = calcAccuracy();
    const playerMs = state.playerFinishTime || 0;
    const playerSec = playerMs / 1000;

    // Rank all finishers
    const entries = [
      { name: 'You', ms: playerMs, wpm, isPlayer: true },
      ...state.opponents.map(o => ({
        name: o.name,
        ms:   o.finishTime || (totalRaceChars() / ((o.wpm * 5) / 60) * 1000),
        wpm:  o.wpm,
        fill: o.fill,
        isPlayer: false,
      })),
    ].sort((a, b) => a.ms - b.ms);

    const playerPlace = entries.findIndex(e => e.isPlayer) + 1;
    const placeLabel  = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th'][playerPlace - 1] || `${playerPlace}th`;
    const mins = Math.floor(playerSec / 60);
    const secs = Math.floor(playerSec % 60);

    panel().innerHTML = `
      <div class="tr-results">
        <div class="tr-results-header">
          <div class="tr-trophy">${playerPlace === 1 ? '🏆' : playerPlace === 2 ? '🥈' : playerPlace === 3 ? '🥉' : '🏁'}</div>
          <h2>Race Complete — ${placeLabel}!</h2>
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

        <div class="tr-standings">
          <div class="tr-standings-title">Final Standings</div>
          ${entries.map((e, i) => {
            const t = Math.floor(e.ms / 1000);
            const tm = Math.floor(t / 60) + ':' + String(t % 60).padStart(2,'0');
            const medal = ['🥇','🥈','🥉',''][i] || '';
            return `
              <div class="tr-standing-row ${e.isPlayer ? 'tr-standing-row--player' : ''}">
                <span class="tr-standing-place">${medal} ${i + 1}</span>
                <span class="tr-standing-name" ${e.fill ? `style="color:${e.fill}"` : ''}>${esc(e.name)}</span>
                <span class="tr-standing-time">${tm}</span>
                <span class="tr-standing-wpm">${e.wpm} WPM</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="tr-wpm-grade">${wpmGrade(wpm)}</div>

        <button class="tr-btn-start" id="trNewRace">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          Race Again
        </button>
      </div>
    `;

    el('trNewRace').addEventListener('click', startRace);
  }

  // ── Public API ────────────────────────────────────────────
  window.TypeRace = { init: renderSetup };

})();
