/* ═══════════════════════════════════════════════════════════════
   ATLA Portfolio — Easter Eggs
   All three are triggered by mouse gestures on their respective scenes.

   1. s-about     · Appa flyaway   — fast flick near Appa
   2. s-skills    · Wall craters   — fast flick into the Ba Sing Se wall
   3. s-experience· Fire charring  — circular mouse motion over the temple
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     SHARED HELPERS
  ══════════════════════════════════════════════════════════ */

  function activeSceneId() {
    return document.querySelector('.scene.visible')?.id ?? null;
  }

  const NS = 'http://www.w3.org/2000/svg';

  /* Inject a crisp SVG rect (all attrs rounded for pixel art) */
  function svgRect(x, y, w, h, fill, op) {
    const el = document.createElementNS(NS, 'rect');
    el.setAttribute('x',       Math.round(x));
    el.setAttribute('y',       Math.round(y));
    el.setAttribute('width',   Math.max(2, Math.round(w)));
    el.setAttribute('height',  Math.max(2, Math.round(h)));
    el.setAttribute('fill',    fill);
    el.setAttribute('opacity', op);
    return el;
  }

  /* ══════════════════════════════════════════════════════════
     VELOCITY TRACKING  (Appa + wall triggers)
  ══════════════════════════════════════════════════════════ */
  const VEL_WINDOW_MS = 80;
  const VEL_THRESHOLD = 680;
  const velSamples = [];

  function trackVelocity(x, y) {
    const t = performance.now();
    velSamples.push({ x, y, t });
    while (velSamples.length > 1 && t - velSamples[0].t > VEL_WINDOW_MS) velSamples.shift();
  }

  function getSpeed() {
    if (velSamples.length < 2) return 0;
    const a = velSamples[0], b = velSamples[velSamples.length - 1];
    const dt = (b.t - a.t) / 1000;
    return dt > 0 ? Math.hypot(b.x - a.x, b.y - a.y) / dt : 0;
  }

  /* ══════════════════════════════════════════════════════════
     SWIRL DETECTION  (fire charring trigger)
     Computes how much the recent mouse path forms a circle.
     swirlScore 0→1: 1 means strong sustained circular motion.
  ══════════════════════════════════════════════════════════ */
  const SWIRL_WINDOW_MS = 700;
  const swirlBuf = [];
  let swirlScore  = 0;
  let swirlCenter = null;

  function updateSwirl(mx, my) {
    const now = performance.now();
    swirlBuf.push({ x: mx, y: my, t: now });
    while (swirlBuf.length > 0 && now - swirlBuf[0].t > SWIRL_WINDOW_MS) swirlBuf.shift();

    if (swirlBuf.length < 8) { swirlScore *= 0.92; return; }

    /* Centroid of buffered positions */
    const cx = swirlBuf.reduce((s, p) => s + p.x, 0) / swirlBuf.length;
    const cy = swirlBuf.reduce((s, p) => s + p.y, 0) / swirlBuf.length;

    /* Total signed angular rotation of the point cloud around the centroid */
    const angles = swirlBuf.map(p => Math.atan2(p.y - cy, p.x - cx));
    let rot = 0;
    for (let i = 1; i < angles.length; i++) {
      let da = angles[i] - angles[i - 1];
      while (da >  Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      rot += da;
    }

    /* Average radius — must look like a real circle, not tiny jitter */
    const avgR = swirlBuf.reduce((s, p) =>
      s + Math.hypot(p.x - cx, p.y - cy), 0) / swirlBuf.length;
    const radiusOk = avgR > 18 && avgR < 360;

    /* 0.55+ rotations in the window → strong swirl score */
    const rotations = Math.abs(rot) / (2 * Math.PI);
    const raw = radiusOk ? Math.min(1.0, rotations * 1.8) : 0;

    swirlScore = swirlScore * 0.62 + raw * 0.38;
    if (swirlScore > 0.18) swirlCenter = { x: cx, y: cy };
  }

  /* ══════════════════════════════════════════════════════════
     1. APPA FLYAWAY  (s-about)
        Fast flick near Appa → flies off top-right, glides back
        from top-left after 2 s.  Legs flap, fur waves mid-flight.
  ══════════════════════════════════════════════════════════ */
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

    /* Phase 1 — slow exit to top-right (1.3 s, 11 discrete steps) */
    wrap.classList.add('appa-flying');
    wrap.style.animation = 'appaFlyaway 1.3s steps(11) forwards';

    /* Phase 2 — after 1.8 s reposition off-screen-left, then re-enter */
    setTimeout(() => {
      wrap.style.animation = 'none';
      wrap.style.opacity   = '0';
      wrap.style.transform = 'translate(-125vw, -90vh) rotate(18deg)';

      /* One extra rAF so the browser paints the off-screen position
         before we hand control to the re-enter animation */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        wrap.style.opacity   = '';
        wrap.style.transform = '';
        /* fill-mode: both → 0% keyframe applies immediately (no flash) */
        wrap.style.animation = 'appaReenter 1.8s steps(14) both';

        function onDone(e) {
          if (e.animationName !== 'appaReenter') return;
          wrap.removeEventListener('animationend', onDone);
          /* Lock wrap visible; prevents appaReveal re-running via CSS */
          wrap.style.opacity   = '1';
          wrap.style.transform = 'translate(0,0)';
          wrap.style.animation = 'none';
          wrap.classList.remove('appa-flying');
          /* Restore the gentle float on the SVG sprite */
          if (svg) svg.style.animation = 'appaFloat 4s steps(8) infinite';
          appaFlying = false;
        }
        wrap.addEventListener('animationend', onDone);
      }));
    }, 1800);
  }

  /* ══════════════════════════════════════════════════════════
     2. WALL CRATERS  (s-skills)
        Fast flick at the Ba Sing Se wall → pixel-art boulder
        impact crater at the hit point.  Clears on scene exit.
  ══════════════════════════════════════════════════════════ */
  const MAX_CRATERS    = 6;
  const STRIKE_COOLDOWN = 480;
  const wallCraters    = [];
  let   lastStrike     = 0;

  function nearWall(mx, my) {
    const wall = document.querySelector('#s-skills .bss-wall-svg');
    if (!wall) return false;
    const r = wall.getBoundingClientRect();
    return mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
  }

  function addWallCrater(mx, my) {
    const wall = document.querySelector('#s-skills .bss-wall-svg');
    if (!wall) return;

    const r    = wall.getBoundingClientRect();
    const svgX = Math.round(((mx - r.left) / r.width)  * 1400);
    const svgY = Math.round(((my - r.top)  / r.height) * 460);
    if (svgY < 100) return;

    if (wallCraters.length >= MAX_CRATERS) {
      const old = wallCraters.shift();
      old.parentNode?.removeChild(old);
    }

    const sz = 32 + Math.floor(Math.random() * 3) * 8;
    const g  = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'wall-crater');

    g.appendChild(svgRect(svgX - sz * 0.65, svgY - sz * 0.50, sz * 1.30, sz * 1.00, '#1a1208', '0.42'));
    g.appendChild(svgRect(svgX - sz * 0.48, svgY - sz * 0.38, sz * 0.96, sz * 0.76, '#2e2112', '0.72'));
    g.appendChild(svgRect(svgX - sz * 0.22, svgY - sz * 0.17, sz * 0.44, sz * 0.34, '#0a0806', '0.92'));

    g.appendChild(svgRect(svgX - 2, svgY - sz * 0.82, 4, sz * 0.46, '#0e0a06', '0.76'));
    g.appendChild(svgRect(svgX - 2, svgY + sz * 0.18, 4, sz * 0.52, '#0e0a06', '0.66'));
    g.appendChild(svgRect(svgX - sz * 0.88, svgY - 2, sz * 0.50, 4, '#0e0a06', '0.70'));
    g.appendChild(svgRect(svgX + sz * 0.24, svgY - 2, sz * 0.62, 4, '#0e0a06', '0.70'));

    for (let i = 0; i < 4; i++) {
      g.appendChild(svgRect(svgX + i * sz * 0.09, svgY - sz * 0.16 - i * sz * 0.10,
        sz * 0.08, sz * 0.08, '#0e0a06', '0.62'));
    }
    for (let i = 0; i < 3; i++) {
      g.appendChild(svgRect(svgX - sz * 0.09 - i * sz * 0.10, svgY - sz * 0.14 - i * sz * 0.09,
        sz * 0.08, sz * 0.08, '#0e0a06', '0.56'));
    }

    const debrisPal = ['#4a4030', '#5a5040', '#3a3020', '#6a6050', '#524430'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist  = sz * (0.58 + Math.random() * 0.55);
      const dx = Math.round(Math.cos(angle) * dist);
      const dy = Math.round(Math.sin(angle) * dist * 0.52);
      const dw = 4 + Math.floor(Math.random() * 3) * 2;
      const dh = 4 + Math.floor(Math.random() * 2) * 2;
      g.appendChild(svgRect(svgX + dx - dw / 2, svgY + dy - dh / 2,
        dw, dh, debrisPal[i % debrisPal.length], '0.68'));
    }

    wall.appendChild(g);
    wallCraters.push(g);
  }

  function clearWallCraters() {
    wallCraters.forEach(g => g.parentNode?.removeChild(g));
    wallCraters.length = 0;
  }

  /* ══════════════════════════════════════════════════════════
     3. FIRE CHARRING  (s-experience)
        Circular mouse motion slowly chars the temple surface.
        Heat builds from warming → charred → igniting → burning.
        When a spot has burned long enough it spreads outward and
        the original spot slowly cools back to normal.
  ══════════════════════════════════════════════════════════ */

  const TICK_MS        = 300;   /* tick interval — all change is slow         */
  const SPREAD_TICKS   = 50;    /* burn ticks before spreading (~15 s)        */
  const COOL_RATE      = 0.42;  /* heat lost per tick while cooling (~57 ticks to zero) */
  const SELF_HEAT_RATE = 0.18;  /* spontaneous heat gain once heat > 40       */
  const MAX_FIRE_SPOTS = 7;

  let fireSpots    = [];
  let fireTimer    = null;

  /* Accurate screen → SVG mapping that respects preserveAspectRatio */
  function screenToFireSvg(mx, my) {
    const svgEl = document.querySelector('#s-experience .fire-temple-svg');
    if (!svgEl) return null;
    if (svgEl.createSVGPoint && svgEl.getScreenCTM) {
      const pt = svgEl.createSVGPoint();
      pt.x = mx; pt.y = my;
      try {
        const p = pt.matrixTransform(svgEl.getScreenCTM().inverse());
        return { x: Math.round(p.x), y: Math.round(p.y) };
      } catch (_) { /* fall through */ }
    }
    /* Fallback for browsers without SVG DOM matrix support */
    const r = svgEl.getBoundingClientRect();
    return {
      x: Math.round((mx - r.left) / r.width  * 960),
      y: Math.round((my - r.top)  / r.height * 640),
    };
  }

  function isValidFirePos(x, y) {
    /* Restrict to the temple body — avoid sky and outer edges */
    return x > 155 && x < 795 && y > 125 && y < 595;
  }

  /* ── FireSpot ─────────────────────────────────────────── */
  class FireSpot {
    constructor(svgX, svgY, svgEl, startHeat = 0) {
      this.x         = svgX;
      this.y         = svgY;
      this.heat      = startHeat;
      this.phase     = 'warming'; /* warming | burning | cooling | dead */
      this.burnTick  = 0;
      this.hasSpread = false;
      this._el       = svgEl;
      this._group    = null;
      this._lastBkt  = -1;        /* last heat "bucket" — avoids redundant redraws */
      this._initGroup();
    }

    _initGroup() {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'fire-char-spot');
      this._el.appendChild(g);
      this._group = g;
    }

    /* Deterministic pseudo-random from position seed */
    _rng(i) {
      let h = (this.x * 31 + this.y * 17 + i * 97) | 0;
      h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
      h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
      return ((h ^ (h >>> 16)) & 0xFFFF) / 0xFFFF;
    }

    /* Rebuild the SVG group to match the current heat level.
       Only runs when the heat "bucket" changes to keep it cheap. */
    _draw() {
      const bucket = Math.floor(this.heat / 3);
      if (bucket === this._lastBkt) return;
      this._lastBkt = bucket;

      const g = this._group;
      while (g.firstChild) g.removeChild(g.firstChild);

      const h = this.heat;
      if (h < 10) return;

      const { x, y } = this;
      /* Size grows from 18 to 66 px as heat climbs */
      const sz   = Math.round(18 + h * 0.48);
      const half = sz >> 1;

      /* ── Warming (10-35): faint black overlay ── */
      if (h < 35) {
        const op = ((h - 10) / 25 * 0.38).toFixed(2);
        g.appendChild(svgRect(x - half, y - half * 0.55, sz, sz * 0.70, '#000000', op));
      }

      /* ── Charred (35-60): heavy black base + scattered scorch pixels ── */
      else if (h < 60) {
        const baseOp = (0.35 + (h - 35) / 25 * 0.38).toFixed(2);
        g.appendChild(svgRect(x - half, y - half * 0.60, sz, sz * 0.75, '#050200', baseOp));

        const count = Math.min(9, Math.floor((h - 35) / 2.8));
        for (let i = 0; i < count; i++) {
          const ox = (this._rng(i)     - 0.5) * sz * 0.92;
          const oy = (this._rng(i + 30) - 0.5) * sz * 0.58;
          const sw = 4 + ((i * 7) % 5) * 2;
          const sh = 4 + ((i * 3) % 3) * 2;
          g.appendChild(svgRect(x + ox - sw / 2, y + oy - sh / 2, sw, sh, '#060200', '0.80'));
        }
      }

      /* ── Igniting (60-80): dark base + pulsing orange ember glow ── */
      else if (h < 80) {
        g.appendChild(svgRect(x - half, y - half * 0.65, sz, sz * 0.80, '#060200', '0.82'));
        const glowOp = ((h - 60) / 20 * 0.42).toFixed(2);
        const gw = sz * 0.62, gh = sz * 0.42;
        const glowEl = svgRect(x - gw / 2, y - gh * 0.85, gw, gh, '#ff3800', glowOp);
        glowEl.classList.add('char-glow');
        g.appendChild(glowEl);
        /* Ember sparks */
        const ec = Math.floor((h - 60) / 4);
        for (let i = 0; i < ec; i++) {
          const ex = x + (this._rng(i + 10) - 0.5) * sz * 0.72;
          const ey = y - this._rng(i + 20) * sz * 0.55;
          g.appendChild(svgRect(ex - 2, ey - 2, 4, 4, '#ff6600', '0.72'));
        }
      }

      /* ── Burning (80-100): scorch base + animated pixel flame stack ── */
      else {
        /* Scorch base */
        g.appendChild(svgRect(x - half - 4, y - half * 0.55, sz + 8, sz * 0.75, '#040100', '0.92'));
        /* Outer ember glow */
        const outerGlow = svgRect(x - half * 0.70, y - sz * 0.52, sz * 0.90, sz * 0.58, '#cc2800', '0.26');
        outerGlow.classList.add('char-glow');
        g.appendChild(outerGlow);

        /* Flame height grows with heat beyond 80 */
        const fh = Math.round(14 + (h - 80) * 0.90);
        const fw = Math.max(8, Math.round(sz * 0.44));
        /* Tiny static horizontal offset per spot for organic feel */
        const fx = x + Math.round((this._rng(5) - 0.5) * 6);
        const fy = y;

        /* Base flame (orange-red) */
        const fl1 = svgRect(fx - fw / 2, fy - fh, fw, fh, '#cc3500', '0.94');
        fl1.classList.add('char-flame', 'cf-base');
        g.appendChild(fl1);

        /* Mid flame (bright orange) */
        const fl2 = svgRect(fx - fw * 0.32, fy - fh * 0.78, fw * 0.64, fh * 0.62, '#ff6600', '0.88');
        fl2.classList.add('char-flame', 'cf-mid');
        g.appendChild(fl2);

        /* Tip (yellow) */
        const fl3 = svgRect(fx - fw * 0.17, fy - fh * 1.06, fw * 0.34, fh * 0.30, '#ffbe00', '0.76');
        fl3.classList.add('char-flame', 'cf-tip');
        g.appendChild(fl3);

        /* Floating ember specks */
        for (let i = 0; i < 4; i++) {
          const ex = fx + (this._rng(i + 40) - 0.5) * fw * 1.9;
          const ey = fy - fh * (0.4 + this._rng(i + 50) * 1.1);
          const em = svgRect(ex - 1, ey - 1, 2, 2, '#ffcc00', '0.82');
          em.classList.add('char-flame', i % 2 ? 'cf-mid' : 'cf-tip');
          g.appendChild(em);
        }
      }
    }

    /* Called every tick.  externalHeat = heat added by current swirl. */
    tick(externalHeat) {
      if (this.phase === 'warming') {
        let gain = externalHeat;
        /* Spontaneous slow self-heating once charred (heat > 40) */
        if (this.heat > 40) gain += SELF_HEAT_RATE;
        this.heat = Math.min(100, this.heat + gain);
        if (this.heat >= 80) this.phase = 'burning';

      } else if (this.phase === 'burning') {
        this.burnTick++;

      } else if (this.phase === 'cooling') {
        this.heat = Math.max(0, this.heat - COOL_RATE);
        if (this.heat <= 0) {
          this.phase = 'dead';
          this._group?.parentNode?.removeChild(this._group);
          return;
        }
      }

      this._draw();
    }

    startCooling() { this.phase = 'cooling'; }

    get isBurning()    { return this.phase === 'burning' && this.heat >= 80; }
    get shouldSpread() { return this.isBurning && !this.hasSpread && this.burnTick >= SPREAD_TICKS; }
    get isDead()       { return this.phase === 'dead'; }
    destroy()          { this._group?.parentNode?.removeChild(this._group); }
  }

  /* ── Fire tick ────────────────────────────────────────── */
  function fireTick() {
    if (activeSceneId() !== 's-experience') return;

    const svgEl = document.querySelector('#s-experience .fire-temple-svg');
    if (!svgEl) return;

    /* Decay swirl score each tick so it fades without mouse movement */
    swirlScore *= 0.88;

    /* ── Add heat to the spot near the current swirl centre ── */
    if (swirlScore > 0.20 && swirlCenter) {
      const pos = screenToFireSvg(swirlCenter.x, swirlCenter.y);
      if (pos && isValidFirePos(pos.x, pos.y)) {
        /* Find nearest warming spot or create one */
        let target = fireSpots.find(s =>
          s.phase === 'warming' && Math.hypot(s.x - pos.x, s.y - pos.y) < 55
        );
        if (!target && fireSpots.filter(s => !s.isDead).length < MAX_FIRE_SPOTS) {
          target = new FireSpot(pos.x, pos.y, svgEl);
          fireSpots.push(target);
        }
        if (target && target.phase === 'warming') {
          target.heat = Math.min(100, target.heat + swirlScore * 0.78);
          if (target.heat >= 80) target.phase = 'burning';
          target._draw();
        }
      }
    }

    /* ── Tick every spot; collect any that should spread ── */
    const toSpread = [];
    for (const spot of fireSpots) {
      spot.tick(0);   /* external heat handled above */
      if (spot.shouldSpread) {
        spot.hasSpread = true;
        spot.startCooling();
        toSpread.push(spot);
      }
    }

    /* ── Spawn spread spots (staggered by 3-5 s each) ── */
    for (const origin of toSpread) {
      const count = 2 + Math.floor(Math.random() * 2); /* 2 or 3 neighbours */
      for (let i = 0; i < count; i++) {
        const delay = i * 3800 + Math.random() * 2200;
        setTimeout(() => {
          if (activeSceneId() !== 's-experience') return;
          const svgEl2 = document.querySelector('#s-experience .fire-temple-svg');
          if (!svgEl2 || fireSpots.filter(s => !s.isDead).length >= MAX_FIRE_SPOTS) return;

          const angle = (i / count) * Math.PI * 2 + Math.random() * 1.1;
          const dist  = 60 + Math.random() * 75;
          const nx = origin.x + Math.round(Math.cos(angle) * dist);
          const ny = origin.y + Math.round(Math.sin(angle) * dist * 0.52);
          if (!isValidFirePos(nx, ny)) return;

          /* Start spread spot already charred so it self-ignites slowly */
          const s = new FireSpot(nx, ny, svgEl2, 45);
          fireSpots.push(s);
        }, delay);
      }
    }

    /* ── Prune dead spots ── */
    fireSpots = fireSpots.filter(s => !s.isDead);
  }

  function startFire() {
    if (!fireTimer) fireTimer = setInterval(fireTick, TICK_MS);
  }

  function stopFire() {
    clearInterval(fireTimer);
    fireTimer = null;
    fireSpots.forEach(s => s.destroy());
    fireSpots = [];
    swirlScore = 0;
  }

  /* ══════════════════════════════════════════════════════════
     SCENE-CHANGE OBSERVER
     Starts/stops systems and clears persistent state.
  ══════════════════════════════════════════════════════════ */
  let lastScene = null;
  new MutationObserver(() => {
    const id = activeSceneId();
    if (!id || id === lastScene) return;

    if (lastScene === 's-skills')     clearWallCraters();
    if (lastScene === 's-experience') stopFire();
    if (id === 's-experience')        startFire();

    lastScene = id;
  }).observe(document.body, { subtree: true, attributeFilter: ['class'] });

  /* ══════════════════════════════════════════════════════════
     MAIN MOUSEMOVE HANDLER
  ══════════════════════════════════════════════════════════ */
  document.addEventListener('mousemove', function (e) {
    trackVelocity(e.clientX, e.clientY);
    updateSwirl(e.clientX, e.clientY);

    const sceneId = activeSceneId();
    const speed   = getSpeed();

    /* Appa flyaway */
    if (sceneId === 's-about' && speed > VEL_THRESHOLD && !appaFlying &&
        nearAppa(e.clientX, e.clientY)) {
      triggerAppaFlyaway();
    }

    /* Wall craters */
    if (sceneId === 's-skills' && speed > VEL_THRESHOLD) {
      const now = performance.now();
      if (now - lastStrike > STRIKE_COOLDOWN && nearWall(e.clientX, e.clientY)) {
        lastStrike = now;
        addWallCrater(e.clientX, e.clientY);
      }
    }

    /* Fire charring: driven by fireTick() which reads swirlScore / swirlCenter */
  });

})();
