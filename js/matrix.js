// ─────────────────────────────────────────────────────────────────────────────
//  Matrix Rain — Cisco IOS commands
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const WORDS = [
    'show', 'ip', 'route', 'ospf', 'eigrp', 'bgp', 'nat', 'vlan',
    'trunk', 'access', 'router', 'switch', 'ping', 'enable', 'config',
    'spanning', 'neighbor', 'dhcp', 'static', 'subnet', 'gateway',
    'channel', 'standby', 'crypto', 'rsa', 'permit', 'deny', 'debug',
    'shutdown', 'interface', 'running', 'startup', 'flash', 'tftp',
    'network', 'mask', 'acl', 'stp', 'lacp', 'hsrp', 'lldp', 'cdp',
    'dot1q', 'snmp', 'ntp', 'portfast', 'bpdu', 'trunk', 'eigrp',
    'no', 'copy', 'erase', 'reload', 'write', 'logging', 'service',
    'address', 'wildcard', 'metric', 'area', 'cost', 'hello', 'dead',
  ];

  const FONT_SIZE  = 13;
  const COL_WIDTH  = 72;
  const SPEED      = 3; // advance drops every N frames (higher = slower)

  let canvas, ctx, cols, drops, animFrame, panel, frameCount = 0;

  function init (targetPanel) {
    panel = targetPanel;

    // Remove any existing canvas
    const old = panel.querySelector('.matrix-canvas');
    if (old) old.remove();

    canvas = document.createElement('canvas');
    canvas.className = 'matrix-canvas';
    panel.insertBefore(canvas, panel.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    if (animFrame) cancelAnimationFrame(animFrame);
    draw();
  }

  function resize () {
    if (!canvas || !panel) return;
    canvas.width  = panel.offsetWidth;
    canvas.height = panel.offsetHeight;
    cols  = Math.max(1, Math.floor(canvas.width / COL_WIDTH));
    drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -40));
  }

  function draw () {
    frameCount++;

    // Fade previous frame every tick for smooth trail
    ctx.fillStyle = 'rgba(15, 17, 23, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Only advance drops every SPEED frames
    if (frameCount % SPEED !== 0) {
      animFrame = requestAnimationFrame(draw);
      return;
    }

    for (let i = 0; i < cols; i++) {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const x    = i * COL_WIDTH + 6;
      const y    = drops[i] * (FONT_SIZE + 8);

      // Bright head character
      ctx.font      = `bold ${FONT_SIZE}px 'Cascadia Code', 'Fira Code', monospace`;
      ctx.fillStyle = '#00ff88';
      ctx.fillText(word, x, y);

      // Dim trail one step above
      ctx.font      = `${FONT_SIZE}px 'Cascadia Code', 'Fira Code', monospace`;
      ctx.fillStyle = 'rgba(0, 200, 100, 0.35)';
      const prev = WORDS[Math.floor(Math.random() * WORDS.length)];
      ctx.fillText(prev, x, y - (FONT_SIZE + 8));

      drops[i]++;

      if (y > canvas.height && Math.random() > 0.97) {
        drops[i] = Math.floor(Math.random() * -30);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  function stop () {
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    window.removeEventListener('resize', resize);
  }

  window.MatrixRain = { init, stop };
})();
