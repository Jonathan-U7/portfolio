/* ═══════════════════════════════════════════════════════════════
   ATLA Portfolio — Easter Eggs
   Triggered by high mouse acceleration (fast mouse flicks).

   1. s-about  · Appa flyaway — fast flick near Appa launches him
                 off screen to the top-right; 2 s later he glides
                 back in from the top-left.

   2. s-skills · Wall imprint  — fast flick aimed at the Ba Sing
                 Se wall stamps a pixel-art boulder crater at the
                 impact point. Imprints persist until scene exit.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Velocity tracking ──────────────────────────────────────
     Rolling window of recent mouse positions; getSpeed() returns
     px/s over the last VEL_WINDOW_MS milliseconds.
  ────────────────────────────────────────────────────────────── */
  const VEL_WINDOW_MS = 80;
  const VEL_THRESHOLD = 680;   // px/s to qualify as "high acceleration"
  const samples = [];

  function trackMouse(x, y) {
    const t = performance.now();
    samples.push({ x, y, t });
    while (samples.length > 1 && t - samples[0].t > VEL_WINDOW_MS) samples.shift();
  }

  function getSpeed() {
    if (samples.length < 2) return 0;
    const a = samples[0], b = samples[samples.length - 1];
    const dt = (b.t - a.t) / 1000;
    return dt > 0 ? Math.hypot(b.x - a.x, b.y - a.y) / dt : 0;
  }

  /* ── Scene helper ───────────────────────────────────────── */
  function activeSceneId() {
    return document.querySelector('.scene.visible')?.id ?? null;
  }

  /* ════════════════════════════════════════════════════════
     1. APPA FLYAWAY  (s-about)
  ════════════════════════════════════════════════════════ */
  let appaFlying = false;

  function nearAppa(mx, my) {
    const wrap = document.querySelector('#s-about .appa-wrap');
    if (!wrap) return false;
    const r   = wrap.getBoundingClientRect();
    const pad = Math.max(r.width, r.height) * 0.75;
    return mx >= r.left - pad && mx <= r.right  + pad &&
           my >= r.top  - pad && my <= r.bottom + pad;
  }

  function triggerAppaFlyaway() {
    if (appaFlying) return;
    appaFlying = true;

    const wrap = document.querySelector('#s-about .appa-wrap');
    const svg  = wrap?.querySelector('svg');
    if (!wrap) { appaFlying = false; return; }

    /* Phase 1 — fly away toward top-right */
    wrap.classList.add('appa-flying');
    wrap.style.animation = 'appaFlyaway 0.85s steps(9) forwards';

    /* Phase 2 — 2 s after trigger, teleport off-screen-left & re-enter */
    setTimeout(() => {
      wrap.style.animation = 'none';
      wrap.style.opacity   = '0';
      wrap.style.transform = 'translate(-125vw, -90vh) rotate(18deg)';

      /* Give browser one paint to apply the off-screen-left position */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        wrap.style.opacity   = '';
        wrap.style.transform = '';
        /* animation-fill-mode: both ensures 0% keyframe fires immediately
           so the element starts at (-125vw, -90vh) with no flash */
        wrap.style.animation = 'appaReenter 1.0s steps(10) both';

        function onReenterEnd(e) {
          if (e.animationName !== 'appaReenter') return;
          wrap.removeEventListener('animationend', onReenterEnd);

          /* Settle: keep wrap visible with inline style so appaReveal
             does not re-run on subsequent CSS cascade evaluation */
          wrap.style.opacity   = '1';
          wrap.style.transform = 'translate(0,0)';
          wrap.style.animation = 'none';
          wrap.classList.remove('appa-flying');

          /* Restore the floating bob on the SVG itself */
          if (svg) svg.style.animation = 'appaFloat 4s steps(8) infinite';
          appaFlying = false;
        }

        wrap.addEventListener('animationend', onReenterEnd);
      }));
    }, 2000);
  }

  /* ════════════════════════════════════════════════════════
     2. WALL CRATERS  (s-skills)
  ════════════════════════════════════════════════════════ */
  const MAX_CRATERS    = 6;
  const STRIKE_COOLDOWN = 480;  // ms between craters
  const wallCraters    = [];
  let   lastStrike     = 0;

  function nearWall(mx, my) {
    const wall = document.querySelector('#s-skills .bss-wall-svg');
    if (!wall) return false;
    const r = wall.getBoundingClientRect();
    return mx >= r.left && mx <= r.right &&
           my >= r.top  && my <= r.bottom;
  }

  function addWallCrater(mx, my) {
    const wall = document.querySelector('#s-skills .bss-wall-svg');
    if (!wall) return;

    const r    = wall.getBoundingClientRect();
    /* Map screen → SVG viewBox (1400 × 460) */
    const svgX = Math.round(((mx - r.left) / r.width)  * 1400);
    const svgY = Math.round(((my - r.top)  / r.height) * 460);

    /* Only place craters on the wall body, not the sky above battlements */
    if (svgY < 100) return;

    /* Evict the oldest crater when at capacity */
    if (wallCraters.length >= MAX_CRATERS) {
      const old = wallCraters.shift();
      old.parentNode?.removeChild(old);
    }

    const ns  = 'http://www.w3.org/2000/svg';
    const sz  = 32 + Math.floor(Math.random() * 3) * 8;  /* 32 | 40 | 48 */
    const g   = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'wall-crater');

    /* Helper — round all attrs for crisp pixel art */
    function px(x, y, w, h, fill, op) {
      const el = document.createElementNS(ns, 'rect');
      el.setAttribute('x',       Math.round(x));
      el.setAttribute('y',       Math.round(y));
      el.setAttribute('width',   Math.max(2, Math.round(w)));
      el.setAttribute('height',  Math.max(2, Math.round(h)));
      el.setAttribute('fill',    fill);
      el.setAttribute('opacity', op);
      return el;
    }

    /* Outer dark halo */
    g.appendChild(px(svgX - sz * 0.65, svgY - sz * 0.5,  sz * 1.3,  sz * 1.0,  '#1a1208', '0.42'));
    /* Impact ring */
    g.appendChild(px(svgX - sz * 0.48, svgY - sz * 0.38, sz * 0.96, sz * 0.76, '#2e2112', '0.72'));
    /* Inner crater (darkest) */
    g.appendChild(px(svgX - sz * 0.22, svgY - sz * 0.17, sz * 0.44, sz * 0.34, '#0a0806', '0.92'));

    /* Cracks — thin rects in cardinal & oblique directions */
    g.appendChild(px(svgX - 2, svgY - sz * 0.82, 4, sz * 0.46, '#0e0a06', '0.76'));  /* up   */
    g.appendChild(px(svgX - 2, svgY + sz * 0.18,  4, sz * 0.52, '#0e0a06', '0.66'));  /* down */
    g.appendChild(px(svgX - sz * 0.88, svgY - 2,  sz * 0.50, 4, '#0e0a06', '0.70'));  /* left */
    g.appendChild(px(svgX + sz * 0.24,  svgY - 2,  sz * 0.62, 4, '#0e0a06', '0.70'));  /* right */

    /* Diagonal crack — upper-right (stair-stepped pixel blocks) */
    for (let i = 0; i < 4; i++) {
      g.appendChild(px(
        svgX + i * (sz * 0.09),
        svgY - sz * 0.16 - i * (sz * 0.10),
        sz * 0.08, sz * 0.08,
        '#0e0a06', '0.62'
      ));
    }
    /* Diagonal crack — upper-left */
    for (let i = 0; i < 3; i++) {
      g.appendChild(px(
        svgX - sz * 0.09 - i * (sz * 0.10),
        svgY - sz * 0.14 - i * (sz * 0.09),
        sz * 0.08, sz * 0.08,
        '#0e0a06', '0.56'
      ));
    }

    /* Scattered debris chunks */
    const debrisPal = ['#4a4030', '#5a5040', '#3a3020', '#6a6050', '#524430'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist  = sz * (0.58 + Math.random() * 0.55);
      const dx    = Math.round(Math.cos(angle) * dist);
      const dy    = Math.round(Math.sin(angle) * dist * 0.52); /* flattened for wall perspective */
      const dw    = 4 + Math.floor(Math.random() * 3) * 2;
      const dh    = 4 + Math.floor(Math.random() * 2) * 2;
      g.appendChild(px(
        svgX + dx - dw / 2, svgY + dy - dh / 2, dw, dh,
        debrisPal[i % debrisPal.length], '0.68'
      ));
    }

    wall.appendChild(g);
    wallCraters.push(g);
  }

  function clearWallCraters() {
    wallCraters.forEach(g => g.parentNode?.removeChild(g));
    wallCraters.length = 0;
  }

  /* ── Scene-exit cleanup ─────────────────────────────────
     Watch for .visible class changes to detect scene nav.
  ────────────────────────────────────────────────────────── */
  let lastVisibleId = null;
  new MutationObserver(() => {
    const id = activeSceneId();
    if (!id || id === lastVisibleId) return;
    if (lastVisibleId === 's-skills') clearWallCraters();
    lastVisibleId = id;
  }).observe(document.body, { subtree: true, attributeFilter: ['class'] });

  /* ── Main mousemove handler ─────────────────────────────── */
  document.addEventListener('mousemove', function (e) {
    trackMouse(e.clientX, e.clientY);
    const speed = getSpeed();
    if (speed < VEL_THRESHOLD) return;

    const sceneId = activeSceneId();

    if (sceneId === 's-about' && !appaFlying && nearAppa(e.clientX, e.clientY)) {
      triggerAppaFlyaway();
    }

    if (sceneId === 's-skills') {
      const now = performance.now();
      if (now - lastStrike > STRIKE_COOLDOWN && nearWall(e.clientX, e.clientY)) {
        lastStrike = now;
        addWallCrater(e.clientX, e.clientY);
      }
    }
  });

})();
