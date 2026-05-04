/* ══════════════════════════════════════════════════════════════
   benders-anim.js — Timed bending cycle for pixel-art characters
   Fires every 5 seconds from when the user arrives on a scene.
   Benders only: Aang, Gyatso (air) · Toph (earth) · Zuko, Azula (fire) · Katara (water)
   Non-benders (EK Guard, Sokka) are excluded intentionally.
══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Which benders live in which scene ── */
  const BENDER_SCENES = {
    's-about':      ['.bender-aang', '.bender-gyatso'],
    's-skills':     ['.bender-toph'],
    's-experience': ['.bender-zuko', '.bender-azula'],
    's-projects':   ['.bender-katara'],
  };

  /* Full animation duration (windup delay + projectile flight + buffer) */
  const BEND_ANIM_MS  = 2400;
  /* Interval between bending events */
  const BEND_INTERVAL = 5000;

  let activeScene  = null;
  let bendInterval = null;

  /* ── Add .is-bending to all benders in a scene, remove after animation ── */
  function triggerBend(sceneId) {
    const sels = BENDER_SCENES[sceneId];
    if (!sels) return;

    sels.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      /* Force CSS animation restart via reflow */
      el.classList.remove('is-bending');
      void el.offsetWidth;
      el.classList.add('is-bending');
    });

    /* Strip class after animation completes so idle/pulse resumes cleanly */
    setTimeout(() => {
      if (activeScene !== sceneId) return; /* scene changed mid-flight — skip */
      sels.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.remove('is-bending');
      });
    }, BEND_ANIM_MS);
  }

  /* ── Start the 5-second bending cycle for a scene ── */
  function startCycle(sceneId) {
    stopCycle();
    if (!BENDER_SCENES[sceneId]) return;
    activeScene  = sceneId;
    /* First fire at t+5s, then every 5s thereafter */
    bendInterval = setInterval(() => triggerBend(sceneId), BEND_INTERVAL);
  }

  /* ── Tear down cycle and clean up any lingering .is-bending class ── */
  function stopCycle() {
    clearInterval(bendInterval);
    bendInterval = null;
    if (activeScene) {
      const sels = BENDER_SCENES[activeScene] || [];
      sels.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.remove('is-bending');
      });
      activeScene = null;
    }
  }

  /* ── Watch .visible class on bender scenes via MutationObserver ── */
  function observeScenes() {
    const sceneIds = Object.keys(BENDER_SCENES);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(({ target, oldValue }) => {
        const id = target.id;
        if (!sceneIds.includes(id)) return;

        const prev = (oldValue || '').split(/\s+/);
        const hadVisible = prev.includes('visible');
        const hasVisible = target.classList.contains('visible');

        if (!hadVisible && hasVisible) {
          /* User arrived at this scene — start bending clock */
          startCycle(id);
        } else if (hadVisible && !hasVisible) {
          /* User left this scene — stop clock */
          if (activeScene === id) stopCycle();
        }
      });
    });

    sceneIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      observer.observe(el, {
        attributes:        true,
        attributeFilter:   ['class'],
        attributeOldValue: true,
      });
      /* Handle direct URL-hash landing (scene already visible on load) */
      if (el.classList.contains('visible')) startCycle(id);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeScenes);
  } else {
    observeScenes();
  }

})();
