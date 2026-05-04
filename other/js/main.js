/* =========================================================
   JJK PORTFOLIO — main.js
   Cursed Energy Particles · Typed Text · Scroll Reveal
   Counter Animation · Custom Cursor · Navbar scroll
   ========================================================= */

'use strict';

/* ---- PAGE LOADER ---- */
(function createLoader() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-kanji">呪</div>
    <div class="loader-bar-wrap"><div class="loader-bar"></div></div>
  `;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }, 1200);
  });
})();

/* ---- CUSTOM CURSOR ---- */
(function initCursor() {
  const outer = document.getElementById('cursorOuter');
  const inner = document.getElementById('cursorInner');
  if (!outer || !inner) return;

  let mx = 0, my = 0, ox = 0, oy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    inner.style.left = mx + 'px';
    inner.style.top  = my + 'px';
  });

  function lerpCursor() {
    ox += (mx - ox) * 0.12;
    oy += (my - oy) * 0.12;
    outer.style.left = ox + 'px';
    outer.style.top  = oy + 'px';
    requestAnimationFrame(lerpCursor);
  }
  lerpCursor();

  document.addEventListener('mouseleave', () => {
    outer.style.opacity = '0';
    inner.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    outer.style.opacity = '1';
    inner.style.opacity = '1';
  });
})();

/* ---- CURSED ENERGY PARTICLE CANVAS ---- */
(function initParticles() {
  const canvas = document.getElementById('curseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = [
    'rgba(123, 47, 190,',
    'rgba(67, 97, 238,',
    'rgba(217, 70, 239,',
    'rgba(114, 137, 255,',
  ];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.r  = Math.random() * 2 + 0.4;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life  = 0;
      this.maxLife = Math.random() * 400 + 200;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      this.pulse += 0.02;
      const progress = this.life / this.maxLife;
      this.currentAlpha = this.alpha * Math.sin(progress * Math.PI) * (0.8 + 0.2 * Math.sin(this.pulse));
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.currentAlpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  // Energy streaks
  class Streak {
    constructor() { this.reset(); }

    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.len = Math.random() * 60 + 20;
      this.alpha = Math.random() * 0.06 + 0.01;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.3 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.life++;
      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      const fade = Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.len,
        this.y - Math.sin(this.angle) * this.len
      );
      ctx.strokeStyle = `${this.color}${(this.alpha * fade).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  const PARTICLE_COUNT = 120;
  const STREAK_COUNT   = 25;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  const streaks    = Array.from({ length: STREAK_COUNT   }, () => new Streak());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    streaks.forEach(s => { s.update(); s.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---- NAVBAR SCROLL EFFECT ---- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---- MOBILE NAV TOGGLE ---- */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---- TYPING ANIMATION ---- */
(function initTyper() {
  const el = document.getElementById('typedTitle');
  if (!el) return;

  const phrases = [
    'Full-Stack Developer',
    'Software Engineer',
    'CS Student',
    'Open Source Contributor',
    'Problem Solver',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(type, deleting ? 50 : 90);
  }
  setTimeout(type, 1800);
})();

/* ---- COUNTER ANIMATION ---- */
(function initCounters() {
  const els = document.querySelectorAll('.stat-num[data-count]');
  if (!els.length) return;

  const run = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        run(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => io.observe(el));
})();

/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.revealDelay || (i * 80);
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, parseInt(delay));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((el, i) => {
    el.dataset.revealDelay = i * 80;
    io.observe(el);
  });
})();

/* ---- ACTIVE NAV LINK HIGHLIGHTING ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          const active = a.getAttribute('href') === `#${id}`;
          a.style.color = active ? 'var(--text)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

/* ---- CONTACT FORM (frontend-only demo) ---- */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.querySelector('.btn-text').textContent;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Message Sent ✓';
    btn.style.background = 'linear-gradient(135deg, #1a7a4a, #1f6d8a)';

    // Reset after 3s
    setTimeout(() => {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = original;
      btn.style.background = '';
      form.reset();
    }, 3000);

    // TODO: Connect to EmailJS, Formspree, or your own backend
    // Example with EmailJS:
    // emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form)
    //   .then(() => { ... })
    //   .catch(err => console.error(err));
  });
})();

/* ---- FOOTER YEAR ---- */
(function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---- GLITCH HOVER EFFECT on hero name ---- */
(function initGlitch() {
  const heroName = document.getElementById('heroName');
  if (!heroName) return;

  let glitchInterval = null;

  heroName.addEventListener('mouseenter', () => {
    heroName.style.textShadow = '2px 0 var(--blue-lt), -2px 0 var(--magenta)';
    glitchInterval = setInterval(() => {
      const dx = (Math.random() - 0.5) * 6;
      heroName.style.transform = `skewX(${dx * 0.5}deg) translateX(${dx}px)`;
      setTimeout(() => { heroName.style.transform = ''; }, 50);
    }, 120);
  });

  heroName.addEventListener('mouseleave', () => {
    heroName.style.textShadow = '';
    heroName.style.transform  = '';
    clearInterval(glitchInterval);
  });
})();

/* ---- SKILL TAG PULSE on hover ---- */
(function initTagHover() {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.boxShadow = '0 0 10px rgba(123,47,190,0.4)';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.boxShadow = '';
    });
  });
})();

/* ---- SMOOTH ANCHOR SCROLL (backup for older browsers) ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =========================================================
   JJK × PERSONA 5 ANIMATION SYSTEM
   Panel intro · Section wipes · Impact reveals · Speed lines
   ========================================================= */

/* ---- INTRO PANEL SEQUENCE ---- */
(function initJJKIntro() {
  const intro = document.getElementById('jjkIntro');
  if (!intro) return;

  // Total intro animation takes ~1.55s (panels slam + exit + flash)
  // Hide and remove the overlay once done
  const TOTAL_MS = 1600;
  setTimeout(() => {
    intro.style.transition = 'opacity 0.2s';
    intro.style.opacity    = '0';
    setTimeout(() => intro.remove(), 250);
  }, TOTAL_MS);

  // Mark hero as wipe-done after intro so screen-label fades in
  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(() => hero.classList.add('wipe-done'), TOTAL_MS + 100);
  }
})();

/* ---- SPEED LINES ON HERO ---- */
(function initSpeedLines() {
  const canvas = document.getElementById('speedLinesCanvas');
  const hero   = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width * 0.75;
    const cy = canvas.height * 0.5;
    const lines = 60;
    for (let i = 0; i < lines; i++) {
      const angle  = (i / lines) * Math.PI * 2;
      const inner  = canvas.width * 0.05 + Math.random() * canvas.width * 0.05;
      const outer  = canvas.width * 0.55 + Math.random() * canvas.width * 0.2;
      const x1 = cx + Math.cos(angle) * inner;
      const y1 = cy + Math.sin(angle) * inner;
      const x2 = cx + Math.cos(angle) * outer;
      const y2 = cy + Math.sin(angle) * outer;
      const alpha = 0.06 + Math.random() * 0.08;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(123, 47, 190, ${alpha})`;
      ctx.lineWidth   = Math.random() * 1.5 + 0.3;
      ctx.stroke();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  // Reveal canvas on hero entry (after intro)
  setTimeout(() => {
    hero.classList.add('speed-active');
  }, 1700);
})();

/* ---- SECTION WIPE + BANG + IMPACT REVEAL ---- */
(function initSectionWipes() {
  const flash = document.getElementById('screenFlash');

  // Trigger wipe + bang + header impact per section
  function triggerSection(section) {
    if (section.dataset.wipeDone) return;
    section.dataset.wipeDone = 'true';

    const wipe   = section.querySelector('.section-wipe');
    const bang   = section.querySelector('.section-bang');
    const header = section.querySelector('.section-header');

    // 1. Screen flash
    if (flash) {
      flash.classList.remove('flash-active');
      void flash.offsetWidth;               // reflow to restart
      flash.classList.add('flash-active');
    }

    // 2. Panel wipe across section
    if (wipe) {
      wipe.classList.add('wipe-running');
      wipe.addEventListener('animationend', () => {
        wipe.style.display = 'none';
      }, { once: true });
    }

    // 3. Bang text slams in (~200ms after wipe starts)
    if (bang) {
      setTimeout(() => bang.classList.add('bang-live'), 200);
      // Fade out bang text after it's served its purpose
      setTimeout(() => {
        bang.style.transition = 'opacity 0.8s';
        bang.style.opacity = '0';
      }, 1200);
    }

    // 4. Section header impact
    if (header) {
      setTimeout(() => header.classList.add('impact-active'), 350);
    }

    // 5. Mark done so screen-label fades in
    setTimeout(() => section.classList.add('wipe-done'), 900);
  }

  // Observe each section
  const sections = document.querySelectorAll('.section[id]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerSection(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => io.observe(s));
})();

/* ---- ACTIVE NAV CURSOR (P5 menu ▶ indicator) ---- */
(function initP5NavCursor() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          const isActive = a.getAttribute('href') === `#${id}`;
          a.classList.toggle('active-section', isActive);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => io.observe(s));
})();

/* ---- HERO NAME IMPACT ON LOAD ---- */
(function initHeroImpact() {
  const name = document.getElementById('heroName');
  if (!name) return;

  // After intro panels clear, slam in the hero name
  setTimeout(() => {
    name.style.animation = 'none';      // override existing fadeUp
    void name.offsetWidth;
    name.style.opacity   = '0';
    name.style.animation = 'heroNameSlam 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards';
  }, 1500);

  // Inject the keyframes dynamically (only once)
  if (!document.getElementById('heroNameSlamKF')) {
    const style = document.createElement('style');
    style.id = 'heroNameSlamKF';
    style.textContent = `
      @keyframes heroNameSlam {
        0%   { opacity: 0; transform: scale(1.8) skewX(-6deg); filter: blur(8px); }
        60%  { transform: scale(0.97) skewX(0.5deg); filter: blur(0); }
        80%  { transform: scale(1.01) skewX(0deg); }
        100% { opacity: 1; transform: scale(1) skewX(0deg); filter: blur(0); }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ---- SKILL TAGS — P5 STAGGER ON REVEAL ---- */
(function initTagStagger() {
  const cards = document.querySelectorAll('.technique-card');
  cards.forEach(card => {
    const tags = card.querySelectorAll('.tag');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tags.forEach((tag, i) => {
            setTimeout(() => {
              tag.style.opacity   = '0';
              tag.style.transform = 'translateX(-10px)';
              tag.style.transition = 'none';
              void tag.offsetWidth;
              tag.style.transition = `opacity 0.3s ${i * 60}ms, transform 0.3s ${i * 60}ms`;
              tag.style.opacity   = '1';
              tag.style.transform = 'translateX(0)';
            }, i * 60);
          });
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(card);
  });
})();

