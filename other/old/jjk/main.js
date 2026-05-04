/* ══════════════════════════════════════════════════
   JJK PORTFOLIO — main.js
   Page-switching navigation (no scroll).
   Each scene is its own "page"; links swap which
   scene is visible with a purple diagonal wipe.
══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Scene registry ─── */
  const SCENES = [
    { id: 's-intro',    label: '00' },
    { id: 's-about',    label: '01' },
    { id: 's-menu',     label: '02' },
    { id: 's-info',     label: '03' },
    { id: 's-exp-cmd',  label: '04' },
    { id: 's-work',     label: '05' },
    { id: 's-proj-cmd', label: '06' },
    { id: 's-items',    label: '07' },
    { id: 's-contact',  label: '08' },
  ];

  let currentId = 's-intro';
  let isTransitioning = false;
  let dots;
  const wipe = document.getElementById('pageWipe');

  /* ─── Activate scene animations ─── */
  function activateScene(sceneEl) {
    // Only animate once per scene (CSS animations replay if class is re-added,
    // so we leave .active on after first visit).
    if (!sceneEl.classList.contains('active')) {
      sceneEl.classList.add('active');
    }
  }

  /* ─── Show a scene (with diagonal wipe transition) ─── */
  function goTo(targetId, pushState = true) {
    if (targetId === currentId || isTransitioning) return;

    // External links (no leading #s-) are handled by the browser normally
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    isTransitioning = true;

    // 1. Wipe IN (purple panel sweeps left→right, covers the screen)
    wipe.classList.remove('wipe-out');
    wipe.classList.add('wipe-in');

    setTimeout(() => {
      // 2. Swap scene visibility while panel is covering the screen
      const prevEl = document.getElementById(currentId);
      if (prevEl) prevEl.classList.remove('visible');

      targetEl.classList.add('visible');
      activateScene(targetEl);

      currentId = targetId;

      // Update nav dots
      updateDots(targetId);

      // Update URL hash (without triggering hashchange loop)
      if (pushState) {
        history.pushState({ scene: targetId }, '', '#' + targetId);
      }

      // 3. Wipe OUT (panel continues off-screen to the right)
      wipe.classList.remove('wipe-in');
      wipe.classList.add('wipe-out');

      setTimeout(() => {
        wipe.classList.remove('wipe-out');
        isTransitioning = false;
      }, 380);
    }, 370); // matches wipe-in transition duration
  }

  /* ─── Update nav dot states ─── */
  function updateDots(activeId) {
    if (!dots) return;
    const idx = SCENES.findIndex((s) => s.id === activeId);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  /* ─── Intercept all internal scene links ─── */
  function interceptLinks() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      // Only intercept #s-* hash links (scene links), not external URLs
      if (!href || !href.startsWith('#s-')) return;

      e.preventDefault();
      goTo(href.slice(1)); // strip leading #
    });
  }

  /* ─── Nav dots ─── */
  function buildNavDots() {
    const nav = document.createElement('nav');
    nav.className = 'nav-dots';
    nav.setAttribute('aria-label', 'Scene navigation');

    SCENES.forEach((scene) => {
      const dot = document.createElement('button');
      dot.className = 'nav-dot';
      dot.setAttribute('aria-label', `Go to scene ${scene.label}`);
      dot.dataset.target = scene.id;
      dot.addEventListener('click', () => goTo(scene.id));
      nav.appendChild(dot);
    });

    document.body.appendChild(nav);
    dots = nav.querySelectorAll('.nav-dot');
    return dots;
  }

  /* ─── Keyboard navigation ─── */
  function initKeyNav() {
    document.addEventListener('keydown', (e) => {
      const currentIdx = SCENES.findIndex((s) => s.id === currentId);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const next = SCENES[currentIdx + 1];
        if (next) goTo(next.id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = SCENES[currentIdx - 1];
        if (prev) goTo(prev.id);
      }
    });
  }

  /* ─── Browser back/forward support ─── */
  function initHistoryNav() {
    window.addEventListener('popstate', (e) => {
      const sceneId = e.state?.scene || 's-intro';
      const targetEl = document.getElementById(sceneId);
      if (!targetEl || sceneId === currentId) return;

      // Swap without pushing a new history entry
      const prevEl = document.getElementById(currentId);
      if (prevEl) prevEl.classList.remove('visible');
      targetEl.classList.add('visible');
      activateScene(targetEl);
      currentId = sceneId;
      updateDots(sceneId);
    });
  }

  /* ─── Cursor glow ─── */
  function initCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let raf;
    document.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
      });
    });
  }

  /* ─── Boot ─── */
  function init() {
    buildNavDots();
    interceptLinks();
    initKeyNav();
    initHistoryNav();
    initCursorGlow();

    // Determine starting scene from URL hash (supports bookmarking)
    const hashId = location.hash.slice(1);
    const startId = SCENES.find((s) => s.id === hashId)?.id || 's-intro';

    const startEl = document.getElementById(startId);
    if (startEl) {
      startEl.classList.add('visible');
      activateScene(startEl);
      currentId = startId;
      updateDots(startId);
      history.replaceState({ scene: startId }, '', '#' + startId);
    }

    // Intro nudge: after animations settle, pulse nav dot as scroll hint
    if (startId === 's-intro') {
      setTimeout(() => {
        const firstDot = document.querySelector('.nav-dot');
        if (firstDot) {
          firstDot.classList.add('pulse');
          setTimeout(() => firstDot.classList.remove('pulse'), 800);
        }
      }, 2800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
