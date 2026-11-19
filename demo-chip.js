/* Demo video pop-up for the pricing and learn pages (the homepage has its own in home.js).
   A small muted preview of the product demo slides up in the bottom right once the visitor scrolls
   past the first screen; clicking it opens the full demo with sound. Closing it keeps it closed for
   the rest of the visit (shared with the homepage). Nothing downloads until it appears. */
(function () {
  'use strict';
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.replace(/demo-chip\.js.*$/, '') : '/';
  var SRC = base + 'media/diligence-ready-demo.mp4', POSTER = base + 'media/diligence-ready-demo-poster.jpg';
  var KEY = 'dr_chip_dismissed';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia ? matchMedia('(min-width: 640px)') : { matches: true };
  function dismissed() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function track(n, p) { try { if (window.gtag) window.gtag('event', n, p || {}); } catch (e) {} }
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var SPK = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>';

  var chip = document.createElement('div');
  chip.className = 'hm-chip hm-chip-wide'; chip.hidden = true;
  chip.innerHTML = '<button type="button" class="hm-chip-open" aria-label="Play the 14 minute Diligence Ready demo with Alan Rihm">' +
    '<video muted loop playsinline preload="none" aria-hidden="true"></video><span class="hm-chip-scrim" aria-hidden="true"></span>' +
    '<span class="hm-chip-cap" aria-hidden="true"><span class="k">PRODUCT DEMO · 14:20</span><span class="t">See it all, from cap tables to data rooms</span></span></button>' +
    '<button type="button" class="hm-chip-sound" aria-pressed="false"><svg class="i-muted" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SPK + '<path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>' +
    '<svg class="i-sound" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SPK + '<path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg><span>Unmute</span></button>' +
    '<button type="button" class="hm-chip-close" aria-label="Dismiss video">' + X + '</button>';
  document.body.appendChild(chip);
  var cv = chip.querySelector('video'), sound = chip.querySelector('.hm-chip-sound');

  var box = document.createElement('div');
  box.className = 'hm-lb hm-lb-wide'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'drDemoTitle');
  box.innerHTML = '<div class="hm-lb-backdrop" data-x></div><div class="hm-lb-card"><div class="hm-lb-media"><video controls playsinline preload="none"></video>' +
    '<button type="button" class="hm-lb-close" data-x aria-label="Close video">' + X.replace('#fff', '#0B162D') + '</button></div>' +
    '<div class="hm-lb-caption"><h2 id="drDemoTitle">Diligence Ready, from cap tables to data rooms</h2><p><strong>Alan Rihm</strong> · CEO &amp; Co-founder, Diligence Ready · <span class="hm-lb-dur">14:20</span></p></div></div>';
  document.body.appendChild(box);
  var bv = box.querySelector('video');

  var wanted = false, opener = null;
  function prep(v) { if (!v.getAttribute('src')) { v.poster = POSTER; v.src = SRC; } }
  function show(on) {
    if (on) {
      if (chip.classList.contains('is-up')) return;
      chip.hidden = false; cv.poster = POSTER; void chip.offsetWidth; chip.classList.add('is-up');
      if (!reduce) { prep(cv); var p = cv.play(); if (p && p.catch) p.catch(function () {}); }
    } else {
      chip.classList.remove('is-up'); if (!cv.paused) cv.pause();
      setTimeout(function () { if (!chip.classList.contains('is-up')) chip.hidden = true; }, reduce ? 0 : 400);
    }
  }
  function update() { show(wanted && wide.matches && !dismissed() && box.hidden); }
  function onScroll() { wanted = window.scrollY > window.innerHeight * 0.9; update(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (wide.addEventListener) wide.addEventListener('change', update);

  function open() {
    opener = chip.querySelector('.hm-chip-open');
    show(false); prep(bv);
    box.hidden = false; document.documentElement.classList.add('hm-lb-lock');
    void box.offsetWidth; box.classList.add('is-open');
    bv.currentTime = cv.currentTime || 0; bv.muted = false;
    var p = bv.play(); if (p && p.catch) p.catch(function () {});
    box.querySelector('.hm-lb-close').focus();
    track('video_open', { source: 'chip', page: location.pathname });
  }
  function close() {
    if (box.hidden) return;
    bv.pause(); box.classList.remove('is-open'); document.documentElement.classList.remove('hm-lb-lock');
    setTimeout(function () { box.hidden = true; update(); if (opener && !chip.hidden) opener.focus({ preventScroll: true }); }, 250);
  }
  chip.querySelector('.hm-chip-open').addEventListener('click', open);
  box.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  sound.addEventListener('click', function () {
    prep(cv); cv.muted = !cv.muted; var on = !cv.muted;
    if (on && cv.paused) cv.play().catch(function () {});
    sound.setAttribute('aria-pressed', String(on)); sound.querySelector('span').textContent = on ? 'Sound on' : 'Unmute';
    if (on) track('video_unmute', { source: 'chip' });
  });
  chip.querySelector('.hm-chip-close').addEventListener('click', function () {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    cv.muted = true; show(false); track('chip_dismiss', {});
  });
})();
