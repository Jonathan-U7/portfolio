/* ═══════════════════════════════════════════════════════════════
   AVATAR: THE LAST AIRBENDER — Portfolio main.js
   Page-switching navigation + elemental bending canvas system.
   Each nation's scene has a unique mouse-following bending effect.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Scene registry ─── */
  const SCENES = [
    { id: 's-intro',      element: 'none'  },
    { id: 's-nav',        element: 'none'  },
    { id: 's-about',      element: 'air'   },
    { id: 's-skills',     element: 'earth' },
    { id: 's-experience', element: 'fire'  },
    { id: 's-projects',   element: 'water' },
    { id: 's-contact',    element: 'all'   },
  ];

  let currentId       = 's-intro';
  let isTransitioning = false;
  let dots;
  const wipe = document.getElementById('pageWipe');


  /* ════════════════════════════════════════════════════════════
     BENDING CANVAS SYSTEM
     ════════════════════════════════════════════════════════════ */

  const MAX_PARTICLES = 180;
  let particles   = [];
  let mouse       = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let prevMouse   = { x: mouse.x, y: mouse.y };
  let bendingTime = 0;        // frame counter for aura animations
  let bendingCanvas, bendCtx;
  let rafId;

  /* ── Canvas setup ── */
  function initBendingCanvas() {
    bendingCanvas = document.createElement('canvas');
    bendingCanvas.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:500;';
    document.body.appendChild(bendingCanvas);
    bendCtx = bendingCanvas.getContext('2d');

    function resize() {
      bendingCanvas.width  = window.innerWidth;
      bendingCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    loop();
  }

  /* ── Main loop ── */
  function loop() {
    rafId = requestAnimationFrame(loop);
    bendCtx.clearRect(0, 0, bendingCanvas.width, bendingCanvas.height);

    const el = elementOf(currentId);
    if (el === 'none') return;

    bendingTime++;

    const speed = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);

    // Emit trail particles on mouse move
    if (speed > 1.5 && particles.length < MAX_PARTICLES) {
      emitParticles(el, speed);
    }

    // Always draw the persistent aura at cursor
    drawAura(el, bendCtx, mouse.x, mouse.y, bendingTime);

    // Update + draw trail particles
    particles = particles.filter(p => {
      p.update();
      if (p.life > 0) { p.draw(bendCtx); return true; }
      return false;
    });
  }

  /* ── Particle emission ── */
  function emitParticles(el, speed) {
    const count = el === 'all'
      ? Math.min(3, Math.floor(speed / 6))
      : Math.min(2, Math.floor(speed / 8));

    for (let i = 0; i < count; i++) {
      const element = el === 'all'
        ? ['air','earth','fire','water'][Math.floor(Math.random() * 4)]
        : el;
      particles.push(new Particle(mouse.x, mouse.y, element));
    }
  }

  /* ══════════════════════════════════════════════════════════
     PARTICLE CLASS
     ══════════════════════════════════════════════════════════ */
  class Particle {
    constructor(x, y, element) {
      this.x = x + (Math.random() - 0.5) * 12;
      this.y = y + (Math.random() - 0.5) * 12;
      this.element = element;
      this._init();
    }

    _init() {
      const r = Math.random;
      switch (this.element) {

        case 'air':
          this.radius   = 10 + r() * 22;
          this.angle    = r() * Math.PI * 2;
          this.arcLen   = Math.PI * (0.35 + r() * 0.55);
          this.rotSpeed = (0.06 + r() * 0.08) * (r() < 0.5 ? 1 : -1);
          this.expand   = 0.55 + r() * 0.4;
          this.vx       = (r() - 0.5) * 1.4;
          this.vy       = (r() - 0.5) * 1.4;
          this.life     = 45 + r() * 45;
          this.maxLife  = this.life;
          this.lw       = 1.2 + r() * 1.4;
          break;

        case 'earth': {
          this.w        = 12 + r() * 18;
          this.h        = 8  + r() * 12;
          this.rot      = r() * Math.PI * 2;
          this.rotSpeed = (r() - 0.5) * 0.05;
          this.skewX    = (r() - 0.5) * 0.55;  // irregular parallelogram shape
          this.vx       = (r() - 0.5) * 4.0;
          this.vy       = -(2.8 + r() * 4.0);
          this.gravity  = 0.22 + r() * 0.14;
          this.life     = 60 + r() * 55;
          this.maxLife  = this.life;
          // Stone-only palette: grays, slates, dark browns — no gold/green
          const pal     = ['#5a5248','#6e6358','#484038','#7a7068','#524844','#625a50'];
          this.color    = pal[Math.floor(r() * pal.length)];
          // Crack line endpoints (in local rect space)
          this.crackX1  = -this.w * 0.2 + (r() - 0.5) * this.w * 0.4;
          this.crackY1  = -this.h * 0.3;
          this.crackX2  =  this.w * 0.15 + (r() - 0.5) * this.w * 0.3;
          this.crackY2  =  this.h * 0.35;
          break;
        }

        case 'fire':
          this.radius   = 4 + r() * 9;
          this.vx       = (r() - 0.5) * 2.2;
          this.vy       = -(1.8 + r() * 3.5);
          this.sway     = (r() - 0.5) * 0.4;
          this.life     = 28 + r() * 32;
          this.maxLife  = this.life;
          this.hue      = 12 + r() * 38;   // 12–50: warm orange-red
          this.flicker  = r() * Math.PI * 2;
          break;

        case 'water':
          this.radius   = 3 + r() * 6;
          this.angle    = r() * Math.PI * 2;
          this.angSpeed = (0.05 + r() * 0.09) * (r() < 0.5 ? 1 : -1);
          this.orbit    = 8 + r() * 28;
          this.vx       = (r() - 0.5) * 1.8;
          this.vy       = (r() - 0.5) * 1.8;
          this.life     = 55 + r() * 55;
          this.maxLife  = this.life;
          break;
      }
    }

    update() {
      this.life--;
      switch (this.element) {
        case 'air':
          this.angle  += this.rotSpeed;
          this.radius += this.expand;
          this.x      += this.vx;
          this.y      += this.vy;
          this.vx     *= 0.97;
          this.vy     *= 0.97;
          break;
        case 'earth':
          this.vy  += this.gravity;
          this.x   += this.vx;
          this.y   += this.vy;
          this.rot += this.rotSpeed;
          this.vx  *= 0.98;
          break;
        case 'fire':
          this.x      += this.vx + Math.sin(this.flicker + this.life * 0.18) * this.sway;
          this.y      += this.vy;
          this.vy     -= 0.06;
          this.radius *= 0.964;
          this.vx     *= 0.96;
          break;
        case 'water':
          this.angle += this.angSpeed;
          this.x     += Math.cos(this.angle) * 1.1 + this.vx * 0.4;
          this.y     += Math.sin(this.angle) * 1.1 + this.vy * 0.4;
          this.vx    *= 0.94;
          this.vy    *= 0.94;
          break;
      }
    }

    draw(ctx) {
      const a = this.life / this.maxLife;   // 0→1 alpha envelope

      switch (this.element) {

        case 'air': {
          ctx.save();
          ctx.translate(this.x, this.y);
          // Outer arc
          ctx.beginPath();
          ctx.arc(0, 0, this.radius, this.angle, this.angle + this.arcLen);
          ctx.strokeStyle = `rgba(220,240,255,${a * 0.65})`;
          ctx.lineWidth   = this.lw;
          ctx.shadowBlur  = 10;
          ctx.shadowColor = `rgba(180,220,255,${a * 0.4})`;
          ctx.stroke();
          // Inner arc (counter-rotation feel)
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * 0.58,
            this.angle + Math.PI * 0.5, this.angle + this.arcLen + Math.PI * 0.5);
          ctx.strokeStyle = `rgba(200,230,255,${a * 0.35})`;
          ctx.lineWidth   = this.lw * 0.7;
          ctx.shadowBlur  = 0;
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'earth': {
          ctx.save();
          ctx.globalAlpha = a * 0.92;
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rot);
          // Skew for irregular, non-rectangular chunk shape
          ctx.transform(1, 0, this.skewX, 1, 0, 0);

          const hw = this.w / 2, hh = this.h / 2;

          // Base stone fill
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.rect(-hw, -hh, this.w, this.h);
          ctx.fill();

          // Top-face highlight (light catches the upper surface)
          const hiGrad = ctx.createLinearGradient(0, -hh, 0, 0);
          hiGrad.addColorStop(0, `rgba(255,255,255,0.18)`);
          hiGrad.addColorStop(1, `rgba(255,255,255,0)`);
          ctx.fillStyle = hiGrad;
          ctx.fill();

          // Bottom shadow (underside is darker)
          const shGrad = ctx.createLinearGradient(0, 0, 0, hh);
          shGrad.addColorStop(0, `rgba(0,0,0,0)`);
          shGrad.addColorStop(1, `rgba(0,0,0,0.40)`);
          ctx.fillStyle = shGrad;
          ctx.fill();

          // Thin dark edge stroke
          ctx.strokeStyle = `rgba(0,0,0,${a * 0.55})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();

          // Diagonal crack line
          ctx.beginPath();
          ctx.moveTo(this.crackX1, this.crackY1);
          ctx.lineTo(this.crackX2, this.crackY2);
          ctx.strokeStyle = `rgba(0,0,0,${a * 0.45})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
          // Bright highlight sliver beside the crack
          ctx.beginPath();
          ctx.moveTo(this.crackX1 + 0.8, this.crackY1);
          ctx.lineTo(this.crackX2 + 0.8, this.crackY2);
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.12})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();

          ctx.restore();
          break;
        }

        case 'fire': {
          ctx.save();
          const g = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2.2
          );
          g.addColorStop(0,   `hsla(${this.hue+44}, 100%, 96%, ${a})`);
          g.addColorStop(0.25,`hsla(${this.hue+22}, 100%, 72%, ${a * 0.9})`);
          g.addColorStop(0.6, `hsla(${this.hue},    100%, 52%, ${a * 0.65})`);
          g.addColorStop(1,   `hsla(${this.hue-8},  100%, 30%, 0)`);
          ctx.fillStyle  = g;
          ctx.shadowBlur = 12;
          ctx.shadowColor= `hsla(${this.hue+15}, 100%, 65%, ${a * 0.6})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'water': {
          ctx.save();
          const wg = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2.8
          );
          wg.addColorStop(0,   `rgba(200,235,255,${a * 0.95})`);
          wg.addColorStop(0.45,`rgba(74,158,202, ${a * 0.7})`);
          wg.addColorStop(1,   `rgba(13,42,74,   0)`);
          ctx.fillStyle  = wg;
          ctx.shadowBlur = 8;
          ctx.shadowColor= `rgba(74,158,202,${a * 0.45})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
  }


  /* ══════════════════════════════════════════════════════════
     PERSISTENT AURA — always drawn at cursor, every frame
     ══════════════════════════════════════════════════════════ */

  function drawAura(el, ctx, x, y, t) {
    switch (el) {
      case 'air':   drawAirAura(ctx, x, y, t);   break;
      case 'earth': drawEarthAura(ctx, x, y, t); break;
      case 'fire':  drawFireAura(ctx, x, y, t);  break;
      case 'water': drawWaterAura(ctx, x, y, t); break;
      case 'all':   drawAvatarAura(ctx, x, y, t); break;
    }
  }

  /* AIR — 3D vortex cone: ellipse rings at ascending heights, tapering to a tip */
  function drawAirAura(ctx, x, y, t) {
    ctx.save();
    ctx.shadowBlur  = 14;
    ctx.shadowColor = 'rgba(200,230,255,0.4)';

    // Four rings stacked at different heights, each as a perspective ellipse.
    // rx = ring radius (shrinks toward top), ry = rx * perspScale (flatter = higher tilt).
    // The combination of decreasing rx and increasing height creates the 3D cone illusion.
    const rings = [
      { h:   0, rx: 30, py: 0.36, speed:  0.018, arcLen: 0.72, lw: 1.8, a: 0.44 },
      { h: -16, rx: 21, py: 0.30, speed: -0.026, arcLen: 0.60, lw: 1.4, a: 0.52 },
      { h: -30, rx: 13, py: 0.24, speed:  0.034, arcLen: 0.52, lw: 1.1, a: 0.48 },
      { h: -42, rx:  6, py: 0.18, speed: -0.042, arcLen: 0.45, lw: 0.8, a: 0.38 },
    ];

    rings.forEach(({ h, rx, py, speed, arcLen, lw, a }, i) => {
      const ry    = rx * py;
      const cy    = y + h;
      const angle = t * speed + i * (Math.PI * 0.65);
      const arc   = Math.PI * arcLen;

      // Primary arc — near side (bottom of ellipse) is brighter
      ctx.beginPath();
      ctx.ellipse(x, cy, rx, ry, 0, angle, angle + arc);
      ctx.strokeStyle = `rgba(220,242,255,${a})`;
      ctx.lineWidth   = lw;
      ctx.stroke();

      // Ghost arc — 180° offset, dimmer (far side of cone)
      ctx.beginPath();
      ctx.ellipse(x, cy, rx * 0.62, ry * 0.62, 0,
        angle + Math.PI, angle + Math.PI + arc * 0.55);
      ctx.strokeStyle = `rgba(180,218,255,${a * 0.38})`;
      ctx.lineWidth   = lw * 0.55;
      ctx.stroke();
    });

    // Apex glow at cone tip
    const tipG = ctx.createRadialGradient(x, y - 46, 0, x, y - 44, 9);
    tipG.addColorStop(0, 'rgba(230,245,255,0.65)');
    tipG.addColorStop(1, 'rgba(180,220,255,0)');
    ctx.fillStyle  = tipG;
    ctx.shadowBlur = 14;
    ctx.shadowColor= 'rgba(200,230,255,0.55)';
    ctx.beginPath();
    ctx.arc(x, y - 44, 9, 0, Math.PI * 2);
    ctx.fill();

    // Ground ring — widest ring at base, barely visible
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 32, 11, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,235,255,0.12)';
    ctx.lineWidth   = 0.8;
    ctx.shadowBlur  = 0;
    ctx.stroke();

    ctx.restore();
  }

  /* EARTH — 3D perspective orbit: elliptical path, depth-sorted rocks, cast shadows */
  function drawEarthAura(ctx, x, y, t) {
    const rot     = t * 0.007;
    // Elliptical orbit: rx = width, ry = height (foreshortened ~38% for ~70° tilt)
    const orbitRx = 34;
    const orbitRy = 13;
    const rockPal = ['#5a5248','#6e6358','#484038','#7a7068'];
    const rockData = [
      { w: 11, h: 7,  skew:  0.26 },
      { w:  8, h: 10, skew: -0.19 },
      { w: 13, h:  6, skew:  0.31 },
      { w:  9, h:  9, skew: -0.23 },
    ];

    ctx.save();

    // Faint orbital track ellipse — subtle depth cue
    ctx.beginPath();
    ctx.ellipse(x, y, orbitRx, orbitRy, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(80,65,50,0.13)';
    ctx.lineWidth   = 0.7;
    ctx.stroke();

    // Ground dust haze centred on the near edge of the orbit
    const dustG = ctx.createRadialGradient(x, y + orbitRy, 0, x, y + orbitRy, 28);
    dustG.addColorStop(0,   'rgba(90,75,55,0.22)');
    dustG.addColorStop(0.55,'rgba(68,55,40,0.09)');
    dustG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = dustG;
    ctx.beginPath();
    ctx.ellipse(x, y + orbitRy, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Compute positions + depth for all rocks then sort back→front (painter's algo)
    const rocks = rockData.map((data, i) => {
      const angle = rot + i * (Math.PI / 2);
      const px    = x + Math.cos(angle) * orbitRx;
      const py    = y + Math.sin(angle) * orbitRy;
      // sin(angle): -1 = top of orbit (farthest), +1 = bottom (nearest viewer)
      const depth = (Math.sin(angle) + 1) / 2;        // 0=far, 1=near
      const scale = 0.72 + depth * 0.52;              // back rocks smaller
      const tilt  = rot * 1.5 + i * 0.85;
      return { ...data, px, py, depth, scale, tilt, i };
    });
    rocks.sort((a, b) => a.depth - b.depth);

    rocks.forEach(({ px, py, depth, scale, tilt, i, w, h, skew }) => {
      const sw = w * scale, sh = h * scale;
      const hw = sw / 2,   hh = sh / 2;

      // Elliptical cast shadow on the orbital plane
      ctx.save();
      ctx.globalAlpha = 0.12 + depth * 0.28;
      ctx.fillStyle   = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(px, py + hh + 1, hw * 0.85, (hh * 0.32) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rock body
      ctx.save();
      ctx.globalAlpha = 0.76 + depth * 0.18;
      ctx.shadowBlur  = 6 + depth * 8;
      ctx.shadowColor = 'rgba(40,30,20,0.5)';
      ctx.translate(px, py);
      ctx.rotate(tilt);
      ctx.transform(1, 0, skew, 1, 0, 0);

      ctx.fillStyle = rockPal[i];
      ctx.beginPath();
      ctx.rect(-hw, -hh, sw, sh);
      ctx.fill();

      // Top highlight (light from top-left)
      const hi = ctx.createLinearGradient(0, -hh, 0, 0);
      hi.addColorStop(0, 'rgba(255,255,255,0.20)');
      hi.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hi; ctx.fill();

      // Right-side shadow (light from top-left = right side darker)
      const ss = ctx.createLinearGradient(-hw, 0, hw, 0);
      ss.addColorStop(0.55, 'rgba(0,0,0,0)');
      ss.addColorStop(1,    'rgba(0,0,0,0.26)');
      ctx.fillStyle = ss; ctx.fill();

      // Bottom shadow
      const bs = ctx.createLinearGradient(0, 0, 0, hh);
      bs.addColorStop(0, 'rgba(0,0,0,0)');
      bs.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle = bs; ctx.fill();

      // Edge stroke
      ctx.strokeStyle = 'rgba(0,0,0,0.44)';
      ctx.lineWidth   = 0.7;
      ctx.stroke();

      // Diagonal crack
      ctx.beginPath();
      ctx.moveTo(-hw * 0.28, -hh * 0.55);
      ctx.lineTo( hw * 0.22,  hh * 0.52);
      ctx.strokeStyle = 'rgba(0,0,0,0.36)';
      ctx.lineWidth   = 0.65;
      ctx.stroke();
      // Bright sliver beside crack
      ctx.beginPath();
      ctx.moveTo(-hw * 0.28 + 0.9, -hh * 0.55);
      ctx.lineTo( hw * 0.22 + 0.9,  hh * 0.52);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth   = 0.45;
      ctx.stroke();

      ctx.restore();
    });

    ctx.restore();
  }

  /* FIRE — 3D flame with rotating corona ring + orbiting ember sparks */
  function drawFireAura(ctx, x, y, t) {
    const flicker  = Math.sin(t * 0.18) * 0.12 + 1;
    const flicker2 = Math.cos(t * 0.23 + 0.5) * 0.08 + 1;
    const h        = 38 * flicker;

    ctx.save();
    ctx.shadowBlur  = 22;
    ctx.shadowColor = 'rgba(255,140,20,0.65)';

    // === BASE GLOW — heat pool on the ground plane (perspective ellipse) ===
    const baseG = ctx.createRadialGradient(x, y + 6, 0, x, y + 6, 30);
    baseG.addColorStop(0,   'rgba(255,155,15,0.38)');
    baseG.addColorStop(0.5, 'rgba(200,55,0,0.18)');
    baseG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = baseG;
    ctx.beginPath();
    ctx.ellipse(x, y + 6, 30, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // === ROTATING FIRE CORONA — perspective ring tilted ~72° from horizontal ===
    // Drawn in two halves: near (bottom of ellipse, bright) and far (top, dim)
    // so it reads as a 3D ring encircling the flame base.
    const cRx   = 19 * flicker2;
    const cRy   = cRx * 0.26;
    const cSpin = t * 0.030;
    const cY    = y + 4;

    // Far half first (drawn beneath flame)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, cY, cRx, cRy, 0, cSpin + Math.PI, cSpin + Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,55,0,0.28)';
    ctx.lineWidth   = 1.4;
    ctx.shadowBlur  = 4;
    ctx.shadowColor = 'rgba(255,80,0,0.2)';
    ctx.stroke();
    ctx.restore();

    // === FLAME LAYERS — teardrop from outer red to inner white-hot ===
    const flames = [
      { ry: h * 1.05, rx: 13 * flicker2, col0:'rgba(140,10,0,0)',   col1:'rgba(200,30,0,0.22)',   col2:'rgba(180,40,0,0.46)',  col3:'rgba(80,5,0,0)'    },
      { ry: h * 0.88, rx: 9.5,           col0:'rgba(255,100,0,0)',   col1:'rgba(255,140,0,0.56)',  col2:'rgba(255,70,0,0.72)',  col3:'rgba(150,15,0,0)'  },
      { ry: h * 0.62, rx: 6.5,           col0:'rgba(255,220,50,0)',  col1:'rgba(255,240,80,0.72)', col2:'rgba(255,170,10,0.88)',col3:'rgba(210,55,0,0)'  },
      { ry: h * 0.38, rx: 4.2,           col0:'rgba(255,255,180,0)', col1:'rgba(255,255,220,0.88)',col2:'rgba(255,210,80,0.96)',col3:'rgba(255,130,0,0)' },
    ];
    flames.forEach(f => {
      const btm = y + 6;
      const top = y - h - (f.ry - h) * 0.6;
      const g   = ctx.createRadialGradient(x, btm, 0, x, btm, f.ry);
      g.addColorStop(0,   f.col0);
      g.addColorStop(0.3, f.col1);
      g.addColorStop(0.7, f.col2);
      g.addColorStop(1,   f.col3);
      ctx.fillStyle = g;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(x, btm - f.ry * 0.35, f.rx, f.ry * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - f.rx * 0.7, btm - f.ry * 0.5);
      ctx.quadraticCurveTo(x, top, x + f.rx * 0.7, btm - f.ry * 0.5);
      ctx.fill();
    });

    // Near corona half drawn on top of flame (bright front)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, cY, cRx, cRy, 0, cSpin, cSpin + Math.PI);
    ctx.strokeStyle = 'rgba(255,115,0,0.62)';
    ctx.lineWidth   = 2.8;
    ctx.shadowBlur  = 14;
    ctx.shadowColor = 'rgba(255,120,0,0.45)';
    ctx.stroke();
    ctx.restore();

    // === ORBITING EMBER SPARKS — 4 bright points at 2 height levels ===
    for (let s = 0; s < 4; s++) {
      const sA    = t * 0.048 + s * (Math.PI / 2);
      const sR    = 8 + Math.sin(t * 0.11 + s * 1.2) * 4;
      const sH    = (s % 2 === 0) ? -10 : -24;
      const sx    = x + Math.cos(sA) * sR;
      const sy    = y + sH + Math.sin(t * 0.09 + s) * 4;
      const sAlpha= (Math.sin(t * 0.08 + s * 2.1) + 1) / 2;

      ctx.save();
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 4.5);
      sg.addColorStop(0,   `rgba(255,255,180,${sAlpha * 0.88})`);
      sg.addColorStop(0.5, `rgba(255,140,0,${sAlpha * 0.55})`);
      sg.addColorStop(1,   'rgba(255,60,0,0)');
      ctx.fillStyle  = sg;
      ctx.shadowBlur = 7;
      ctx.shadowColor= `rgba(255,120,0,${sAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /* WATER — 3D sphere at cursor + perspective ripple platform + orbiting tendrils */
  function drawWaterAura(ctx, x, y, t) {
    ctx.save();

    // === PERSPECTIVE RIPPLE PLATFORM — 3 ellipses on an implied horizontal plane ===
    // ry = rx * 0.30 gives ~72° tilt, reads clearly as "rings on a flat surface"
    const groundY = y + 16;
    for (let i = 0; i < 3; i++) {
      const phase = ((t + i * 20) % 60) / 60;
      const rx  = 13 + phase * 54;
      const ry  = rx * 0.30;
      const a   = (1 - phase) * 0.54;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, groundY, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100,190,230,${a})`;
      ctx.lineWidth   = 1.9 - phase * 1.1;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = `rgba(74,158,202,${a * 0.5})`;
      ctx.stroke();
      ctx.restore();
    }

    // === 3D WATER ORB — sphere with specular highlight and deep-shadow edge ===
    const r = 11;
    // Off-centre focal point (top-left) simulates light source
    const sg = ctx.createRadialGradient(
      x - r * 0.36, y - r * 0.36, r * 0.06,
      x, y, r
    );
    sg.addColorStop(0,    'rgba(255,255,255,0.94)');  // specular hotspot
    sg.addColorStop(0.13, 'rgba(205,240,255,0.86)');  // bright water
    sg.addColorStop(0.48, 'rgba(74,158,202,0.88)');   // mid arctic blue
    sg.addColorStop(0.82, 'rgba(26,58,92,0.82)');     // shadow
    sg.addColorStop(1.0,  'rgba(10,24,44,0.74)');     // darkest edge
    ctx.fillStyle  = sg;
    ctx.shadowBlur = 16;
    ctx.shadowColor= 'rgba(74,158,202,0.58)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Small secondary specular catch-light
    ctx.beginPath();
    ctx.arc(x - r * 0.33, y - r * 0.33, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle  = 'rgba(255,255,255,0.52)';
    ctx.shadowBlur = 0;
    ctx.fill();

    // === ORBITING WATER TENDRILS — 2 arcs suggesting 3D water curl ===
    for (let k = 0; k < 2; k++) {
      const orbit = 19 + k * 9;
      const spin  = t * (0.022 + k * 0.009) * (k % 2 === 0 ? 1 : -1);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, orbit, spin, spin + Math.PI * 0.82);
      ctx.strokeStyle = `rgba(150,212,242,${0.52 - k * 0.10})`;
      ctx.lineWidth   = 1.6 - k * 0.3;
      ctx.shadowBlur  = 9;
      ctx.shadowColor = 'rgba(74,158,202,0.30)';
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /* AVATAR STATE — four 3D mini-elements orbiting an elliptical path */
  function drawAvatarAura(ctx, x, y, t) {
    const orbitRx = 40;
    const orbitRy = 16;   // perspective tilt on the orbit plane
    const spin    = t * 0.018;
    const elems   = ['air','earth','fire','water'];

    // Compute positions + depth, sort back→front
    const nodes = elems.map((el, i) => {
      const angle = spin + i * (Math.PI / 2);
      const ox    = x + Math.cos(angle) * orbitRx;
      const oy    = y + Math.sin(angle) * orbitRy;
      const depth = (Math.sin(angle) + 1) / 2;
      return { el, ox, oy, angle, depth };
    });
    nodes.sort((a, b) => a.depth - b.depth);

    // Faint orbital track
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, orbitRx, orbitRy, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 0.6;
    ctx.stroke();
    ctx.restore();

    nodes.forEach(({ el, ox, oy, angle, depth }) => {
      const scale = 0.72 + depth * 0.42;

      if (el === 'air') {
        // Mini vortex ring — two partial arcs on a small perspective ellipse
        ctx.save();
        const rx  = 10 * scale, ry = rx * 0.32;
        const arc = Math.PI * 0.78;
        const a0  = angle + t * 0.026;
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx, ry, 0, a0, a0 + arc);
        ctx.strokeStyle = `rgba(220,242,255,${0.55 * scale})`;
        ctx.lineWidth   = 1.4 * scale;
        ctx.shadowBlur  = 8; ctx.shadowColor = 'rgba(180,220,255,0.3)';
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx * 0.6, ry * 0.6, 0, a0 + Math.PI, a0 + Math.PI + arc * 0.55);
        ctx.strokeStyle = `rgba(180,218,255,${0.28 * scale})`;
        ctx.lineWidth   = 0.7 * scale;
        ctx.stroke();
        ctx.restore();

      } else if (el === 'earth') {
        // Mini stone chunk with top-highlight + side-shadow
        const w = 9 * scale, h = 6 * scale;
        ctx.save();
        ctx.globalAlpha = 0.80 + depth * 0.15;
        ctx.shadowBlur  = 5; ctx.shadowColor = 'rgba(30,20,10,0.5)';
        ctx.translate(ox, oy);
        ctx.rotate(spin * 2.8 + 0.4);
        ctx.transform(1, 0, 0.22, 1, 0, 0);
        ctx.fillStyle = '#5a5248';
        ctx.beginPath(); ctx.rect(-w/2, -h/2, w, h); ctx.fill();
        const mhi = ctx.createLinearGradient(0, -h/2, 0, 0);
        mhi.addColorStop(0, 'rgba(255,255,255,0.18)');
        mhi.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = mhi; ctx.fill();
        const mss = ctx.createLinearGradient(-w/2, 0, w/2, 0);
        mss.addColorStop(0.5, 'rgba(0,0,0,0)');
        mss.addColorStop(1,   'rgba(0,0,0,0.24)');
        ctx.fillStyle = mss; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 0.6; ctx.stroke();
        ctx.restore();

      } else if (el === 'fire') {
        // Mini 3D fire orb with specular + corona arc
        ctx.save();
        const r = 9 * scale;
        const fg = ctx.createRadialGradient(ox - r*0.3, oy - r*0.3, r*0.05, ox, oy, r);
        fg.addColorStop(0,    'rgba(255,255,180,0.92)');
        fg.addColorStop(0.22, 'rgba(255,200,60,0.80)');
        fg.addColorStop(0.55, 'rgba(255,80,0,0.62)');
        fg.addColorStop(1,    'rgba(120,15,0,0)');
        ctx.fillStyle  = fg;
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,100,0,0.5)';
        ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
        // Corona arc
        ctx.beginPath();
        ctx.ellipse(ox, oy + r * 0.25, r * 0.85, r * 0.22, 0,
          spin * 0.8, spin * 0.8 + Math.PI);
        ctx.strokeStyle = `rgba(255,110,0,${0.55 * scale})`;
        ctx.lineWidth   = 1.4 * scale;
        ctx.stroke();
        ctx.restore();

      } else if (el === 'water') {
        // Mini 3D water sphere with specular
        ctx.save();
        const r = 9 * scale;
        const wg = ctx.createRadialGradient(
          ox - r*0.32, oy - r*0.32, r*0.05, ox, oy, r);
        wg.addColorStop(0,    'rgba(255,255,255,0.88)');
        wg.addColorStop(0.15, 'rgba(200,238,255,0.80)');
        wg.addColorStop(0.50, 'rgba(74,158,202,0.75)');
        wg.addColorStop(1,    'rgba(13,42,74,0)');
        ctx.fillStyle  = wg;
        ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(74,158,202,0.4)';
        ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });

    // Center white glow
    ctx.save();
    const cg = ctx.createRadialGradient(x, y, 0, x, y, 18);
    cg.addColorStop(0, 'rgba(255,255,255,0.42)');
    cg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle  = cg;
    ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }


  /* ════════════════════════════════════════════════════════════
     PAGE NAVIGATION
     ════════════════════════════════════════════════════════════ */

  function elementOf(sceneId) {
    return SCENES.find(s => s.id === sceneId)?.element || 'none';
  }

  function activateScene(sceneEl) {
    if (!sceneEl.classList.contains('active')) {
      sceneEl.classList.add('active');
    }
  }

  function goTo(targetId, pushState = true) {
    if (targetId === currentId || isTransitioning) return;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    isTransitioning = true;

    // Clear bending particles on scene change
    particles = [];

    const el = elementOf(targetId);
    wipe.className = `el-${el === 'none' ? 'all' : el}`;

    requestAnimationFrame(() => wipe.classList.add('wipe-in'));

    setTimeout(() => {
      const prevEl = document.getElementById(currentId);
      if (prevEl) prevEl.classList.remove('visible');

      targetEl.classList.add('visible');
      activateScene(targetEl);
      currentId = targetId;
      updateDots(targetId);

      if (pushState) history.pushState({ scene: targetId }, '', '#' + targetId);

      wipe.classList.remove('wipe-in');
      wipe.classList.add('wipe-out');

      setTimeout(() => {
        wipe.classList.remove('wipe-out');
        isTransitioning = false;
      }, 400);
    }, 390);
  }

  function updateDots(activeId) {
    if (!dots) return;
    const idx = SCENES.findIndex(s => s.id === activeId);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  function interceptLinks() {
    document.addEventListener('click', e => {
      if (e.target.closest('#enterBtn')) {
        e.preventDefault();
        goTo('s-nav');
        return;
      }
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#s-')) return;
      e.preventDefault();
      goTo(href.slice(1));
    });
  }

  function buildNavDots() {
    const nav = document.createElement('nav');
    nav.className = 'nav-dots';
    nav.setAttribute('aria-label', 'Scene navigation');
    SCENES.forEach(scene => {
      const dot = document.createElement('button');
      dot.className = 'nav-dot';
      dot.setAttribute('aria-label', `Go to ${scene.id.replace('s-', '')}`);
      dot.dataset.target = scene.id;
      dot.addEventListener('click', () => goTo(scene.id));
      nav.appendChild(dot);
    });
    document.body.appendChild(nav);
    dots = nav.querySelectorAll('.nav-dot');
    return dots;
  }

  function initKeyNav() {
    document.addEventListener('keydown', e => {
      const idx = SCENES.findIndex(s => s.id === currentId);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const next = SCENES[idx + 1];
        if (next) goTo(next.id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = SCENES[idx - 1];
        if (prev) goTo(prev.id);
      }
    });
  }

  function initHistoryNav() {
    window.addEventListener('popstate', e => {
      const sceneId = e.state?.scene || 's-intro';
      if (sceneId === currentId) return;
      const prevEl   = document.getElementById(currentId);
      const targetEl = document.getElementById(sceneId);
      if (!targetEl) return;
      particles = [];
      if (prevEl) prevEl.classList.remove('visible');
      targetEl.classList.add('visible');
      activateScene(targetEl);
      currentId = sceneId;
      updateDots(sceneId);
    });
  }

  function initIntroPulse() {
    setTimeout(() => {
      const d = document.querySelector('.nav-dot');
      if (!d) return;
      d.classList.add('pulse');
      setTimeout(() => d.classList.remove('pulse'), 800);
    }, 3000);
  }


  /* ── Boot ── */
  function init() {
    buildNavDots();
    interceptLinks();
    initKeyNav();
    initHistoryNav();
    initBendingCanvas();

    const hashId  = location.hash.slice(1);
    const startId = SCENES.find(s => s.id === hashId)?.id || 's-intro';
    const startEl = document.getElementById(startId);

    if (startEl) {
      startEl.classList.add('visible');
      activateScene(startEl);
      currentId = startId;
      updateDots(startId);
      history.replaceState({ scene: startId }, '', '#' + startId);
    }

    if (startId === 's-intro') initIntroPulse();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
