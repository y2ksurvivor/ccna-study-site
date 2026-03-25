// ─────────────────────────────────────────────────────────────────────────────
//  Network Topology Background — reusable for any panel
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const NODE_COUNT      = 14;
  const CONNECT_RATIO   = 0.32;
  const PACKET_INTERVAL = 1200;
  const LABELS = ['R1','R2','R3','R4','SW1','SW2','SW3','FW','ISP','Core','Dist','Edge','WAN','LAN'];

  let canvas, ctx, nodes, packets, raf, panel, lastPacket = 0, frameTs = 0;

  function init (targetPanel) {
    panel = targetPanel;

    const old = panel.querySelector('.network-canvas');
    if (old) old.remove();

    canvas = document.createElement('canvas');
    canvas.className = 'network-canvas';
    panel.insertBefore(canvas, panel.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }

  function resize () {
    if (!canvas || !panel) return;
    canvas.width  = panel.offsetWidth;
    canvas.height = panel.offsetHeight;
    initNodes();
  }

  function initNodes () {
    const m = 60;
    nodes = LABELS.slice(0, NODE_COUNT).map((label, i) => ({
      x:     m + Math.random() * (canvas.width  - m * 2),
      y:     m + Math.random() * (canvas.height - m * 2),
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     i < 3 ? 12 : 7 + Math.random() * 4,
      pulse: Math.random() * Math.PI * 2,
      label,
      core:  i < 3,
    }));
    packets = [];
  }

  function getEdges () {
    const maxD = Math.min(canvas.width, canvas.height) * CONNECT_RATIO;
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < maxD)
          result.push({ a: i, b: j });
      }
    }
    return result;
  }

  function spawnPacket (edges) {
    if (!edges.length) return;
    const e = edges[Math.floor(Math.random() * edges.length)];
    const flip = Math.random() > 0.5;
    packets.push({ a: flip ? e.b : e.a, b: flip ? e.a : e.b, t: 0, speed: 0.003 + Math.random() * 0.003 });
  }

  function draw (ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ts - lastPacket > PACKET_INTERVAL) {
      const edges = getEdges();
      spawnPacket(edges);
      if (Math.random() > 0.5) spawnPacket(edges);
      lastPacket = ts;
    }

    const margin = 60;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
      if (n.x < margin || n.x > canvas.width  - margin) { n.vx *= -1; n.x = Math.max(margin, Math.min(canvas.width  - margin, n.x)); }
      if (n.y < margin || n.y > canvas.height - margin) { n.vy *= -1; n.y = Math.max(margin, Math.min(canvas.height - margin, n.y)); }
    }

    const edges = getEdges();

    // Edges
    for (const e of edges) {
      const a = nodes[e.a], b = nodes[e.b];
      ctx.strokeStyle = 'rgba(0,194,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // Packets
    packets = packets.filter(p => p.t < 1);
    for (const p of packets) {
      p.t += p.speed;
      const a = nodes[p.a], b = nodes[p.b];
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;

      const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(Math.max(0, p.t - 0.12), 'rgba(0,255,136,0)');
      g.addColorStop(p.t,                      'rgba(0,255,136,0.45)');
      g.addColorStop(Math.min(1, p.t + 0.12),  'rgba(0,255,136,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

      const grd = ctx.createRadialGradient(x, y, 0, x, y, 10);
      grd.addColorStop(0, 'rgba(0,255,136,0.5)');
      grd.addColorStop(1, 'rgba(0,255,136,0)');
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88'; ctx.fill();
    }

    // Nodes
    for (const n of nodes) {
      const r = n.r * (1 + 0.07 * Math.sin(n.pulse));

      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
      grd.addColorStop(0, `rgba(0,194,255,${n.core ? 0.22 : 0.12})`);
      grd.addColorStop(1, 'rgba(0,194,255,0)');
      ctx.beginPath(); ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#0f1117'; ctx.fill();
      ctx.strokeStyle = n.core ? '#00ff88' : '#00c2ff';
      ctx.lineWidth   = n.core ? 2 : 1.5;
      ctx.stroke();

      ctx.font         = `bold ${n.core ? 10 : 8}px 'Cascadia Code', monospace`;
      ctx.fillStyle    = n.core ? '#00ff88' : '#00c2ff';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y);
    }

    raf = requestAnimationFrame(draw);
  }

  function stop () {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    window.removeEventListener('resize', resize);
  }

  window.NetworkBg = { init, stop };
})();
