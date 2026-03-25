// ─────────────────────────────────────────────────────────────────────────────
//  Splash Screen — CSS particle animation (runs forever, never needs RAF)
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const splash = document.getElementById('splash');
  const msg    = document.getElementById('splashMsg');
  const container = document.getElementById('splashParticles');
  if (!splash || !msg || !container) return;

  // ── Spawn particles once — CSS animates them forever ─────────────────────────
  const NODE_LABELS = ['R1','R2','R3','SW1','SW2','FW','ISP','Core','WAN','Dist','Edge','LAN'];
  const NODE_COUNT  = 12;
  const DOT_COUNT   = 40;

  // Labeled network nodes
  for (let i = 0; i < NODE_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'sp-node';
    el.textContent = NODE_LABELS[i];
    el.style.left             = (5 + Math.random() * 90) + '%';
    el.style.top              = (5 + Math.random() * 90) + '%';
    el.style.animationDuration   = (18 + Math.random() * 22) + 's';
    el.style.animationDelay      = -(Math.random() * 20) + 's';
    el.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    el.style.setProperty('--dy', (Math.random() * 160 - 80) + 'px');
    if (i < 3) el.classList.add('sp-node--core');
    container.appendChild(el);
  }

  // Small glowing dots
  for (let i = 0; i < DOT_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'sp-dot';
    el.style.left             = (Math.random() * 100) + '%';
    el.style.top              = (Math.random() * 100) + '%';
    el.style.animationDuration   = (8 + Math.random() * 16) + 's';
    el.style.animationDelay      = -(Math.random() * 16) + 's';
    el.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
    el.style.setProperty('--dy', (Math.random() * 200 - 100) + 'px');
    // Some dots are green (packets), most are cyan (nodes)
    if (Math.random() < 0.25) el.classList.add('sp-dot--packet');
    container.appendChild(el);
  }

  // ── Dismiss — just fade the overlay, nothing to cancel ───────────────────────
  let dismissed = false;

  function dismiss () {
    if (dismissed) return;
    dismissed = true;
    document.removeEventListener('keydown', dismiss);
    splash.removeEventListener('click', dismiss);
    splash.classList.add('splash--out');
    setTimeout(() => {
      splash.style.display = 'none';
      if (window.PuzzleGame) window.PuzzleGame.init();
    }, 900);
  }

  // Wait 1800ms before enabling dismiss so accidental keypresses don't skip it
  setTimeout(() => {
    msg.classList.add('splash-msg--visible');
    document.addEventListener('keydown', dismiss);
    splash.addEventListener('click', dismiss);
  }, 1800);

})();
