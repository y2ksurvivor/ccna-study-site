// ─────────────────────────────────────────────────────────────────────────────
//  CCNA Study Site — Subnet Methods Drill
//  Mode 1: Block Size  |  Mode 2: Powers of 2
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const PANEL = document.getElementById('tool-subnet-methods');

  window.SubnetMethods = { init };

  // ── Utilities ────────────────────────────────────────────────────────────────
  function getContent () { return PANEL.querySelector('.sm-content') || PANEL; }

  function esc (str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function randInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init () {
    if (!PANEL.querySelector('.sm-content')) {
      const w = document.createElement('div');
      w.className = 'sm-content';
      PANEL.appendChild(w);
    }
    renderMenu();
  }

  // ── Menu ─────────────────────────────────────────────────────────────────────
  function renderMenu () {
    getContent().innerHTML = `
      <div class="sm-container">
        <div class="sm-header">
          <h2 class="sm-title">Subnet Methods</h2>
        </div>
        <p class="sm-intro">Two essential skills for subnetting on the exam. Pick one to drill.</p>
        <div class="sm-mode-grid">
          <button class="sm-mode-btn" id="smModeBlock">
            <div class="sm-mode-label">Method 1</div>
            <div class="sm-mode-name">Block Size</div>
            <div class="sm-mode-desc">Given an IP + prefix, work through block size → network → hosts → broadcast → next network.</div>
          </button>
          <button class="sm-mode-btn" id="smModePow2">
            <div class="sm-mode-label">Method 2</div>
            <div class="sm-mode-name">Powers of 2</div>
            <div class="sm-mode-desc">Fill in the full 2ˢ and 2ʰ − 2 table from memory. Race the clock.</div>
          </button>
        </div>
      </div>
    `;
    getContent().querySelector('#smModeBlock').addEventListener('click', startBS);
    getContent().querySelector('#smModePow2').addEventListener('click', startP2);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  BLOCK SIZE METHOD
  // ═══════════════════════════════════════════════════════════════════════════

  const CIDR_MASK = { 25: 128, 26: 192, 27: 224, 28: 240, 29: 248, 30: 252 };

  const BS_STEPS = [
    { key: 'blockSize',      label: 'Block size',        hint: '256 − mask octet',    ph: 'e.g. 64'   },
    { key: 'networkAddress', label: 'Network address',   hint: 'First in the subnet', ph: '0.0.0.0'   },
    { key: 'firstHost',      label: 'First usable host', hint: 'Network + 1',         ph: '0.0.0.0'   },
    { key: 'lastHost',       label: 'Last usable host',  hint: 'Broadcast − 1',       ph: '0.0.0.0'   },
    { key: 'broadcast',      label: 'Broadcast address', hint: 'Last in the subnet',  ph: '0.0.0.0'   },
    { key: 'nextNetwork',    label: 'Next network',      hint: 'Network + block size',ph: '0.0.0.0'   },
  ];

  let bsState = {};

  function genQuestion () {
    const prefixes   = [25, 26, 27, 28, 29, 30];
    const prefix     = prefixes[randInt(0, prefixes.length - 1)];
    const maskOctet  = CIDR_MASK[prefix];
    const blockSize  = 256 - maskOctet;

    const a = 192, b = 168, c = randInt(1, 254);

    // ensure next network stays ≤ 255
    const maxNetIdx = Math.floor(256 / blockSize) - 2;
    const netBase   = randInt(0, maxNetIdx) * blockSize;
    const d         = netBase + randInt(1, blockSize - 2);  // host inside subnet

    return {
      ip:             `${a}.${b}.${c}.${d}`,
      prefix,
      mask:           `255.255.255.${maskOctet}`,
      blockSize:      String(blockSize),
      networkAddress: `${a}.${b}.${c}.${netBase}`,
      firstHost:      `${a}.${b}.${c}.${netBase + 1}`,
      lastHost:       `${a}.${b}.${c}.${netBase + blockSize - 2}`,
      broadcast:      `${a}.${b}.${c}.${netBase + blockSize - 1}`,
      nextNetwork:    `${a}.${b}.${c}.${netBase + blockSize}`,
    };
  }

  function startBS () {
    bsState = { q: genQuestion(), stepIdx: 0, answers: [], startTime: Date.now() };
    renderBS();
  }

  function renderBS () {
    const { q, stepIdx, answers } = bsState;
    const step = BS_STEPS[stepIdx];

    const progressHtml = BS_STEPS.map((s, i) => {
      if (i < stepIdx) return `
        <div class="sm-prog-row sm-prog-row--done">
          <span class="sm-prog-label">${esc(s.label)}</span>
          <span class="sm-prog-val">${esc(answers[i])}</span>
        </div>`;
      if (i === stepIdx) return `
        <div class="sm-prog-row sm-prog-row--active">
          <span class="sm-prog-label">${esc(s.label)}</span>
          <span class="sm-prog-val sm-prog-val--blank">?</span>
        </div>`;
      return `
        <div class="sm-prog-row sm-prog-row--pending">
          <span class="sm-prog-label">${esc(s.label)}</span>
          <span class="sm-prog-val sm-prog-val--dot">·</span>
        </div>`;
    }).join('');

    getContent().innerHTML = `
      <div class="sm-container">

        <div class="sm-header">
          <h2 class="sm-title">Block Size Method</h2>
          <button class="sm-back-btn" id="smBack">← Menu</button>
        </div>

        <div class="sm-q-card">
          <div class="sm-q-label">Given</div>
          <div class="sm-q-ip">${esc(q.ip)}<span class="sm-q-prefix">/${q.prefix}</span></div>
          <div class="sm-q-mask">${esc(q.mask)}</div>
        </div>

        <div class="sm-progress">${progressHtml}</div>

        <div class="sm-input-area">
          <label class="sm-input-label">
            ${esc(step.label)}
            <span class="sm-input-hint">${esc(step.hint)}</span>
          </label>
          <div class="sm-input-row">
            <input id="smBsInput" class="sm-input" type="text" inputmode="decimal"
              placeholder="${esc(step.ph)}" autocomplete="off" spellcheck="false" autocapitalize="none" />
            <button class="sm-submit-btn" id="smBsSubmit">Check</button>
          </div>
          <div class="sm-feedback" id="smBsFeedback"></div>
        </div>

      </div>
    `;

    const input = getContent().querySelector('#smBsInput');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkBS(); } });
    getContent().querySelector('#smBsSubmit').addEventListener('click', checkBS);
    getContent().querySelector('#smBack').addEventListener('click', renderMenu);
  }

  function checkBS () {
    const { q, stepIdx } = bsState;
    const step     = BS_STEPS[stepIdx];
    const input    = getContent().querySelector('#smBsInput');
    const feedback = getContent().querySelector('#smBsFeedback');
    const raw      = input.value.trim();
    if (!raw) return;

    if (raw === q[step.key]) {
      bsState.answers.push(raw);
      bsState.stepIdx++;
      bsState.stepIdx >= BS_STEPS.length ? renderBSResult() : renderBS();
    } else {
      feedback.className   = 'sm-feedback sm-feedback--wrong';
      feedback.textContent = 'Not quite — try again.';
      input.value = '';
      input.classList.add('sm-shake');
      setTimeout(() => input.classList.remove('sm-shake'), 400);
      input.focus();
    }
  }

  function renderBSResult () {
    const { q, answers, startTime } = bsState;
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    const summaryHtml = BS_STEPS.map((s, i) => `
      <div class="sm-sum-row">
        <span class="sm-sum-label">${esc(s.label)}</span>
        <span class="sm-sum-val">${esc(answers[i])}</span>
      </div>`).join('');

    getContent().innerHTML = `
      <div class="sm-container">
        <div class="sm-header">
          <h2 class="sm-title">Block Size Method</h2>
          <button class="sm-back-btn" id="smBack">← Menu</button>
        </div>
        <div class="sm-result-card sm-result-card--win">
          <div class="sm-result-msg">✓ Complete in ${elapsed}s</div>
          <div class="sm-q-card">
            <div class="sm-q-label">Given</div>
            <div class="sm-q-ip">${esc(q.ip)}<span class="sm-q-prefix">/${q.prefix}</span></div>
            <div class="sm-q-mask">${esc(q.mask)}</div>
          </div>
          <div class="sm-summary">${summaryHtml}</div>
          <div class="sm-result-actions">
            <button class="sm-new-btn" id="smBsNew">New Question</button>
            <button class="sm-sec-btn" id="smBsMenu">← Menu</button>
          </div>
        </div>
      </div>
    `;

    getContent().querySelector('#smBsNew').addEventListener('click', startBS);
    getContent().querySelector('#smBack').addEventListener('click', renderMenu);
    getContent().querySelector('#smBsMenu').addEventListener('click', renderMenu);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  POWERS OF 2
  // ═══════════════════════════════════════════════════════════════════════════

  const POW2_ROWS = Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    return { bits: n, subnets: Math.pow(2, n), hosts: Math.pow(2, n) - 2 };
  });

  let p2State = {};

  function getBest ()     { return localStorage.getItem('layer8_pow2_best'); }
  function saveBest (t)   {
    const b = getBest();
    if (!b || t < parseInt(b, 10)) { localStorage.setItem('layer8_pow2_best', t); return true; }
    return false;
  }

  function startP2 () {
    clearInterval((p2State || {}).interval);
    p2State = { started: false, startTime: null, interval: null, correct: new Set() };
    renderP2();
  }

  function renderP2 () {
    const best = getBest();

    const rowsHtml = POW2_ROWS.map(({ bits, subnets, hosts }) => `
      <tr>
        <td class="sm-p2-bits">${bits}</td>
        <td>
          <input class="sm-p2-input" data-answer="${subnets}"
            inputmode="numeric" placeholder="?" autocomplete="off" spellcheck="false" />
        </td>
        <td>
          <input class="sm-p2-input" data-answer="${hosts}"
            inputmode="numeric" placeholder="?" autocomplete="off" spellcheck="false" />
        </td>
      </tr>`).join('');

    getContent().innerHTML = `
      <div class="sm-container">
        <div class="sm-header">
          <h2 class="sm-title">Powers of 2</h2>
          <button class="sm-back-btn" id="smBack">← Menu</button>
        </div>

        <div class="sm-p2-intro">
          Fill the table from memory. Timer starts on first keystroke.
          ${best ? `<span class="sm-p2-best">Best: ${best}s</span>` : ''}
        </div>

        <div class="sm-p2-stats">
          <span class="sm-p2-timer" id="smP2Timer">0.0s</span>
          <span class="sm-p2-prog"  id="smP2Prog">0 / 16</span>
        </div>

        <table class="sm-p2-table">
          <thead>
            <tr>
              <th>Bits</th>
              <th>2<sup>s</sup><small>Subnets</small></th>
              <th>2<sup>h</sup> − 2<small>Hosts</small></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <div id="smP2Result"></div>
      </div>
    `;

    const inputs = [...getContent().querySelectorAll('.sm-p2-input')];

    inputs.forEach((inp, idx) => {
      inp.addEventListener('input', () => {
        if (!p2State.started) {
          p2State.started   = true;
          p2State.startTime = Date.now();
          p2State.interval  = setInterval(tickP2, 100);
        }
        checkP2Cell(inp);
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (idx < inputs.length - 1) inputs[idx + 1].focus();
        }
      });
    });

    getContent().querySelector('#smBack').addEventListener('click', () => {
      clearInterval(p2State.interval);
      renderMenu();
    });
  }

  function tickP2 () {
    const el = getContent().querySelector('#smP2Timer');
    if (el) el.textContent = ((Date.now() - p2State.startTime) / 1000).toFixed(1) + 's';
  }

  function checkP2Cell (inp) {
    const answer = parseInt(inp.dataset.answer, 10);
    const val    = parseInt(inp.value.trim(), 10);

    if (isNaN(val)) {
      inp.classList.remove('sm-p2-correct', 'sm-p2-wrong');
      p2State.correct.delete(inp);
    } else if (val === answer) {
      inp.classList.add('sm-p2-correct');
      inp.classList.remove('sm-p2-wrong');
      inp.readOnly = true;
      p2State.correct.add(inp);
    } else {
      inp.classList.add('sm-p2-wrong');
      inp.classList.remove('sm-p2-correct');
      p2State.correct.delete(inp);
    }

    const n = p2State.correct.size;
    const progEl = getContent().querySelector('#smP2Prog');
    if (progEl) progEl.textContent = `${n} / 16`;

    if (n === 16) finishP2();
  }

  function finishP2 () {
    clearInterval(p2State.interval);
    const elapsed = Math.round((Date.now() - p2State.startTime) / 1000);
    const newBest = saveBest(elapsed);
    const best    = getBest();

    const el = getContent().querySelector('#smP2Result');
    el.innerHTML = `
      <div class="sm-p2-complete">
        <span>✓ ${elapsed}s${newBest ? ' — New best!' : ` (best: ${best}s)`}</span>
        <button class="sm-new-btn" id="smP2Again">Try Again</button>
        <button class="sm-sec-btn" id="smP2Menu">← Menu</button>
      </div>
    `;
    getContent().querySelector('#smP2Again').addEventListener('click', startP2);
    getContent().querySelector('#smP2Menu').addEventListener('click', () => {
      clearInterval(p2State.interval);
      renderMenu();
    });
  }

})();
