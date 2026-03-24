// ─────────────────────────────────────────────────────────────────────────────
//  Splash Screen
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const splash  = document.getElementById('splash');
  const canvas  = document.getElementById('splashCanvas');
  const msg     = document.getElementById('splashMsg');
  if (!splash || !canvas || !msg) return;

  // ── Matrix Rain ─────────────────────────────────────────────────────────────
  const WORDS = [
    'show','ip','route','ospf','eigrp','bgp','nat','vlan','trunk','access',
    'router','switch','ping','enable','config','spanning','neighbor','dhcp',
    'static','subnet','gateway','channel','standby','crypto','rsa','permit',
    'deny','debug','shutdown','interface','running','startup','flash','tftp',
    'network','mask','acl','stp','lacp','hsrp','lldp','cdp','dot1q','snmp',
    'ntp','portfast','bpdu','wildcard','metric','area','cost','hello','dead',
    'no','copy','erase','reload','logging','service','address','protocol',
  ];

  const ctx      = canvas.getContext('2d');
  const FONT     = 13;
  const COL_W    = 68;
  let cols, drops, raf;

  function resize () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.max(1, Math.floor(canvas.width / COL_W));
    drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -60));
  }

  function drawRain () {
    ctx.fillStyle = 'rgba(15, 17, 23, 0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const x    = i * COL_W + 6;
      const y    = drops[i] * (FONT + 8);

      ctx.font      = `bold ${FONT}px 'Cascadia Code','Fira Code',monospace`;
      ctx.fillStyle = '#00ff88';
      ctx.fillText(word, x, y);

      ctx.font      = `${FONT}px 'Cascadia Code','Fira Code',monospace`;
      ctx.fillStyle = 'rgba(0,200,100,0.3)';
      ctx.fillText(WORDS[Math.floor(Math.random() * WORDS.length)], x, y - (FONT + 8));

      drops[i]++;
      if (y > canvas.height && Math.random() > 0.97) {
        drops[i] = Math.floor(Math.random() * -40);
      }
    }
    raf = requestAnimationFrame(drawRain);
  }

  resize();
  window.addEventListener('resize', resize);
  drawRain();

  // ── Show "press any key" after pause ────────────────────────────────────────
  setTimeout(() => msg.classList.add('splash-msg--visible'), 1800);

  // ── Dismiss ─────────────────────────────────────────────────────────────────
  let dismissed = false;

  function dismiss () {
    if (dismissed) return;
    dismissed = true;

    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    document.removeEventListener('keydown', dismiss);
    splash.removeEventListener('click', dismiss);

    splash.classList.add('splash--out');

    setTimeout(() => {
      splash.style.display = 'none';
      if (window.PuzzleGame) window.PuzzleGame.init();
    }, 900);
  }

  document.addEventListener('keydown', dismiss);
  splash.addEventListener('click', dismiss);

})();
