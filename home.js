/* Homepage (Oct 2026 rebuild): hero audience toggle, product animation, conversion tracking.
   Loaded by index.html only. The A/B version is assigned by the inline script in <head>. */
(function () {
  'use strict';

  // "Why we built this": hero button, lightbox and floating chip. The one switch for all three.
  // Off for now (Oct 2026): waiting on a new video. Set to true to bring all three back.
  var SHOW_FOUNDER_VIDEO = false;

  var HV = window.DR_HERO_VERSION || 'a';
  var reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hero = document.getElementById('hero');
  var aud = 'founders';
  var heroVisible = true;
  var resumers = [];

  var watchers = [];
  function canRun() { return heroVisible && !document.hidden; }
  function onResume(fn) { resumers.push(fn); }
  function onMotionChange(fn) { watchers.push(fn); }       // called on every visibility change, running or not
  function resumeAll() {
    watchers.forEach(function (fn) { fn(); });
    if (canRun()) resumers.forEach(function (fn) { fn(); });
  }

  // ---------------------------------------------------------------- GA4 events
  // Every event carries the A/B version and the audience the visitor last saw in the hero.
  function track(name, params) {
    if (typeof gtag !== 'function') return;
    var p = { hero_version: HV, audience: aud, transport_type: 'beacon' };
    for (var k in params) p[k] = params[k];
    gtag('event', name, p);
  }

  function ctaLocation(el) {
    if (el.dataset.loc) return el.dataset.loc;
    var holder = el.closest('[data-loc]');
    if (holder) return holder.dataset.loc;
    var sec = el.closest('section');
    return (sec && sec.id) || 'other';
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;
    var isStartFree = el.matches('[data-cta="start_free"]') ||
      (el.tagName === 'A' && /app\.diligenceready\.com\/signup/.test(el.href) && /start free/i.test(el.textContent));
    if (isStartFree) track('start_free_click', { location: ctaLocation(el), link_url: el.href });
    if (el.matches('[data-cta="contact"]')) track('contact_click', { location: ctaLocation(el) });
    var card = el.closest('[data-role-card]');
    if (card) track('role_card_click', { card: card.dataset.roleCard, link_url: el.href || '' });
  });

  // ---------------------------------------------------------------- logo hover (nav + footer)
  // The shared logo is one masked image + one text run. Here (homepage only) we add nine real squares so
  // the hover animation in home.css can move them individually; the wordmark stays still.
  document.querySelectorAll('#nav .brand, footer .brand').forEach(function (brand) {
    if (!brand.hasAttribute('aria-label')) brand.setAttribute('aria-label', 'Diligence Ready');
    var mark = brand.querySelector('.mono-circle');
    if (mark) {
      var grid = document.createElement('span');
      grid.className = 'hm-logo-grid';
      grid.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 9; i++) {
        var cell = document.createElement('i');
        cell.style.setProperty('--d', ((i % 3) + Math.floor(i / 3)) * 55 + 'ms');   // diagonal ripple
        if (i === 8) cell.className = 'is-coral';
        grid.appendChild(cell);
      }
      mark.appendChild(grid);
    }
    brand.classList.add('hm-logo');
  });

  // ---------------------------------------------------------------- background "universe"
  // Soft dot patches (the advisor card's grid), occasional faint ring groups (2-3 concentric rings), blurred
  // coral/blue blobs and specks behind the cream part of the page, in Figma's styling. One continuous layer from the curtain edge to the end of <main>, so
  // nothing is cut at section boundaries. Everything sits in the side margins (ring centres are off the
  // page edge, only arcs show), each group has its own strength, and the layout is new on every load.
  (function buildUniverse() {
    var layer = document.getElementById('hmUniverse');
    var main = document.querySelector('main');
    var first = document.querySelector('[data-uni-first]') || document.getElementById('who');
    if (!layer || !main || !first) return;
    var R = Math.random;
    var rr = function (a, b) { return a + R() * (b - a); };
    var pick = function (a) { return a[Math.floor(R() * a.length)]; };
    var RING_OP = [0.126, 0.1008, 0.0882], BLOB = ['#D44A3B', '#5A78C8'];

    // the layer starts where the cream curtain starts
    // ...and stops where the navy final CTA band starts
    var last = document.getElementById('demo');
    var place = function () {
      layer.style.top = first.offsetTop + 'px';
      layer.style.bottom = last ? (main.offsetHeight - last.offsetTop) + 'px' : '0';
    };
    place();
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(main);

    var W = layer.offsetWidth || window.innerWidth;
    var H = Math.max(800, (last ? last.offsetTop : main.offsetHeight) - first.offsetTop);
    var scale = Math.min(1, Math.max(0.55, W / 1440));       // smaller shapes on narrow screens
    var xPct = function (px) { return (px / W) * 100; };
    var yPct = function (px) { return (px / H) * 100; };
    // how far a shape may reach in from the page edge, so it stays in the margin, not behind the content
    var reach = Math.max(40, (W - Math.min(W - 64, 1200)) / 2 + 30);
    var shapes = [];
    function shape(cls, x, y, size, css) {
      var el = document.createElement('i');
      el.className = cls;
      el.style.cssText = 'left:calc(' + x.toFixed(2) + '% - ' + (size / 2).toFixed(1) + 'px);top:calc(' + y.toFixed(3) + '% - ' +
        (size / 2).toFixed(1) + 'px);width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;--d:-' + rr(0, 24).toFixed(1) + 's;' + css;
      layer.appendChild(el);
      shapes.push(el);
    }
    // a centre x (in %) for something of radius r on one side, so that at most `reach` px of it comes onto the page
    var edgeCentre = function (left, r) {
      var c = rr(-r * 0.75, reach - r);
      return left ? xPct(c) : 100 - xPct(c);
    };

    var bands = Math.max(1, Math.round(H / 760)), side = R() < 0.5;
    for (var b = 0; b < bands; b++) {
      var bandY = function () { return ((b + rr(0.08, 0.92)) / bands) * 100; };
      side = R() < 0.75 ? !side : side;                        // mostly alternate sides down the page
      var strength = rr(0.4, 1);                               // some groups are much fainter than others

      var cy = bandY(), outer;
      if (R() < 0.33) {
        // ring group (about a third of bands): 2-3 concentric rings centred off the page edge, so only
        // arcs show in the margin. The rings sit in one wrapper that drifts as a unit, so they stay concentric.
        outer = rr(150, 330) * scale;
        var count = pick([2, 2, 3]);
        shape('hm-uni-grp', edgeCentre(side, outer), cy, 0,
          '--dx:' + (pick([-1, 1]) * rr(8, 16)).toFixed(0) + 'px;--dy:' + rr(8, 14).toFixed(0) + 'px;--s:1.03;--t:' + rr(26, 38).toFixed(0) + 's');
        var grp = shapes[shapes.length - 1];
        for (var k = 0; k < count; k++) {
          var ring = document.createElement('b'), d = 2 * outer * [1, 0.62, 0.36][k];
          ring.style.cssText = 'left:' + (-d / 2).toFixed(1) + 'px;top:' + (-d / 2).toFixed(1) + 'px;width:' + d.toFixed(1) + 'px;height:' + d.toFixed(1) +
            'px;opacity:' + (RING_OP[k] * strength).toFixed(4);
          grp.appendChild(ring);
          // orbiting specks: 0-2 per ring, sitting on the ring and circling the group's centre slowly
          var orbit = document.createElement('b');
          orbit.className = 'hm-uni-orbit';
          orbit.style.animationDuration = rr(70, 150).toFixed(0) + 's';
          orbit.style.animationDirection = R() < 0.5 ? 'normal' : 'reverse';
          orbit.style.animationDelay = '-' + rr(0, 150).toFixed(0) + 's';
          var n = Math.round(rr(0, 2.4));
          for (var o = 0; o < n; o++) {
            var a = rr(0, Math.PI * 2), sp = document.createElement('b');
            sp.className = 'hm-uni-speck';
            sp.style.cssText = 'left:' + (Math.cos(a) * d / 2 - 1.5).toFixed(1) + 'px;top:' + (Math.sin(a) * d / 2 - 1.5).toFixed(1) + 'px;opacity:' + (0.243 * rr(0.45, 1)).toFixed(4);
            orbit.appendChild(sp);
          }
          if (n) grp.appendChild(orbit);
        }
      } else {
        // dot patch (the rest): the advisor card's 3px-on-20px dot grid in faint navy, faded out at its edges
        // by a radial mask so it never ends in a line. Mostly in the margin, it can reach a little further in.
        var cols = Math.round(rr(7, 15)), rows = Math.round(rr(5, 12)), pw = cols * 20, ph = rows * 20;
        outer = ph / 2;
        var inset = rr(-pw * 0.35, Math.max(20, reach + 90 - pw));       // patch's near edge, measured from the page edge
        var px = side ? inset + pw / 2 : W - inset - pw / 2;
        var el = document.createElement('i');
        el.className = 'hm-uni-dots';
        el.style.cssText = 'left:calc(' + xPct(px).toFixed(2) + '% - ' + (pw / 2) + 'px);top:calc(' + cy.toFixed(3) + '% - ' + (ph / 2) + 'px);width:' + pw + 'px;height:' + ph +
          'px;opacity:' + (0.16 * strength).toFixed(4) + ';--d:-' + rr(0, 24).toFixed(1) + 's;--dx:' + (pick([-1, 1]) * rr(6, 12)).toFixed(0) + 'px;--dy:' + rr(6, 12).toFixed(0) + 'px;--s:1;--t:' + rr(28, 40).toFixed(0) + 's';
        layer.appendChild(el);
        shapes.push(el);
      }

      // blurred blob, also at an edge (soft enough to sit a little further in)
      var blobLeft = R() < 0.6 ? !side : side, br = rr(150, 260) * scale;
      shape('hm-uni-blob', blobLeft ? xPct(rr(-br * 0.6, reach * 0.6)) : 100 - xPct(rr(-br * 0.6, reach * 0.6)), bandY(), 2 * br,
        'background:' + pick(BLOB) + ';opacity:' + (0.099 * rr(0.5, 1)).toFixed(4) + ';filter:blur(45px);--dx:' + (pick([-1, 1]) * rr(20, 30)).toFixed(0) + 'px;--dy:' + rr(16, 24).toFixed(0) + 'px;--s:1.1;--t:' + rr(28, 38).toFixed(0) + 's');

    }

    // each shape drifts only while it's on (or near) the screen
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var el = e.target.tagName === 'B' ? e.target.parentNode : e.target;
          el.classList.toggle('is-idle', !e.isIntersecting);
        });
      }, { rootMargin: '300px 0px' });
      shapes.forEach(function (el) {
        el.classList.add('is-idle');
        // a ring group's anchor is a zero-size point off the page edge, so watch its outer ring instead
        io.observe(el.classList.contains('hm-uni-grp') ? el.firstElementChild : el);
      });
    }
  })();

  var contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', function () { track('contact_form_submit', { form: 'contact' }); });

  if (!hero) return;

  // pause hero motion while it is off-screen or the tab is hidden
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      hero.classList.toggle('is-paused', !heroVisible);
      resumeAll();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', resumeAll);

  // The hero dot grid, and the final CTA band's, eases a few pixels toward the cursor (mouse/trackpad only,
  // not with reduced motion). It uses the `translate` property so it stacks on the slow drift animation,
  // which owns `transform`. `area` takes the pointer events; `target` gets the --hm-cx/--hm-cy offsets.
  var followCursor = function (area, target) {
    if (!area || !target || reduceMotion || !window.matchMedia || !matchMedia('(pointer: fine)').matches) return;
    var FOLLOW = 12, EASE = 0.06;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    var step = function () {
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      target.style.setProperty('--hm-cx', cx.toFixed(2) + 'px');   // hero: combined with the scroll parallax in home.css
      target.style.setProperty('--hm-cy', cy.toFixed(2) + 'px');
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(step) : 0;
    };
    var aim = function (x, y) { tx = x; ty = y; if (!raf) raf = requestAnimationFrame(step); };
    area.addEventListener('pointermove', function (e) {
      var r = area.getBoundingClientRect();
      aim(((e.clientX - r.left) / r.width - 0.5) * 2 * FOLLOW, ((e.clientY - r.top) / r.height - 0.5) * 2 * FOLLOW);
    });
    area.addEventListener('pointerleave', function () { aim(0, 0); });
  };
  var dots = hero.querySelector('.hm-dots');
  followCursor(hero, dots);
  var band = document.getElementById('demo');
  followCursor(band, band);   // its dots are #demo::before, which reads the vars from #demo

  // Curtain parallax: as the cream page slides up over the hero, the hero's content lags behind (35% of the
  // scroll) and fades, and the dot grid lags further (50%), so the edge reads as one sheet passing over
  // another. Tablet/desktop only and off with reduced motion; only transform/opacity, once per frame.
  var heroGrid = hero.querySelector('.hm-hero-grid');
  var curtainMq = window.matchMedia ? matchMedia('(min-width: 768px)') : { matches: true };
  if (heroGrid && !reduceMotion) {
    var curtainRaf = 0;
    var curtain = function () {
      curtainRaf = 0;
      var h = hero.offsetHeight;
      var y = curtainMq.matches ? Math.min(Math.max(window.scrollY, 0), h) : 0;
      var p = y / h;
      heroGrid.style.transform = y ? 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0)' : '';
      heroGrid.style.opacity = y ? (1 - p * 0.75).toFixed(3) : '';
      if (dots) dots.style.setProperty('--hm-py', (y * 0.5).toFixed(1) + 'px');
    };
    var queue = function () { if (!curtainRaf) curtainRaf = requestAnimationFrame(curtain); };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    if (curtainMq.addEventListener) curtainMq.addEventListener('change', queue);
    queue();
  }

  // ---------------------------------------------------------------- audience toggle + rotating copy
  // Every 11s the hero switches audience: the outgoing copy eases up and out (0.4s), the incoming headline
  // and lead rise in with a soft overshoot (0.55s, slightly staggered; see home.css). A pill click switches
  // at once and stops the rotation for this page view. The timer pauses while the hero is off-screen or
  // the tab is hidden, and keeps its remaining time.
  var ROTATE_MS = 11000;
  var audBtns = hero.querySelectorAll('.hm-aud-btn');
  var rotItems = {};
  hero.querySelectorAll('.hm-rot-item').forEach(function (el) { rotItems[el.dataset.aud] = el; });
  var whyBtn = hero.querySelector('[data-video-open="founder"]');
  var rotTimer = null, swapTimer = null, autoOn = false, rotLeft = 0, rotStarted = 0;

  function showItem(el, on) {
    el.setAttribute('aria-hidden', String(!on));
    el.inert = !on;
  }

  function setAudience(next) {
    if (next === aud || !rotItems[next]) return;
    var out = rotItems[aud], inn = rotItems[next];
    clearTimeout(swapTimer);
    Object.keys(rotItems).forEach(function (k) { rotItems[k].classList.remove('is-out', 'is-in', 'is-pending'); });
    aud = next;
    hero.dataset.aud = next;
    audBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.aud === next)); });
    out.classList.add('is-out');
    showItem(out, false);
    inn.classList.add('is-pending');
    showItem(inn, true);
    // the incoming copy starts rising once the outgoing copy has mostly cleared
    swapTimer = setTimeout(function () {
      out.classList.remove('is-out');
      inn.classList.remove('is-pending');
      inn.classList.add('is-in');
    }, reduceMotion ? 150 : 300);
  }

  function runRotate() {
    clearTimeout(rotTimer);
    rotTimer = null;
    if (!autoOn || !canRun()) return;
    rotStarted = Date.now();
    rotTimer = setTimeout(function () {
      rotTimer = null;
      setAudience(aud === 'founders' ? 'advisors' : 'founders');
      rotLeft = ROTATE_MS;
      runRotate();
    }, rotLeft);
  }
  function pauseRotate() {
    if (!rotTimer) return;
    clearTimeout(rotTimer);
    rotTimer = null;
    rotLeft = Math.max(0, rotLeft - (Date.now() - rotStarted));
  }
  onMotionChange(function () { if (canRun()) { if (!rotTimer) runRotate(); } else pauseRotate(); });

  function setAuto(on) {
    autoOn = on;
    clearTimeout(rotTimer);
    rotTimer = null;
    if (on) { rotLeft = ROTATE_MS; runRotate(); }
  }

  audBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      setAuto(false);
      if (b.dataset.aud === aud) return;
      setAudience(b.dataset.aud);
      track('audience_toggle', { method: 'click' });
    });
  });

  if (!reduceMotion) setAuto(true);              // reduced motion: no auto-rotation, clicks crossfade
  if (whyBtn) whyBtn.hidden = !SHOW_FOUNDER_VIDEO;
  var standIn = hero.querySelector('[data-video-stand-in]');   // "Contact us" holds the spot while the video is off
  if (standIn) standIn.hidden = SHOW_FOUNDER_VIDEO;

  // ---------------------------------------------------------------- "Why we built this" video
  if (SHOW_FOUNDER_VIDEO) setupVideo();

  function setupVideo() {
    var box = document.getElementById('hmVideoBox');
    var chip = document.getElementById('hmChip');
    if (!box || !chip) return;
    var lbVideo = box.querySelector('video');
    var chipVideo = chip.querySelector('video');
    var soundBtn = chip.querySelector('.hm-chip-sound');
    var DISMISS_KEY = 'dr_chip_dismissed';
    var wideEnough = window.matchMedia ? matchMedia('(min-width: 640px)') : { matches: true };
    var opener = null, openSource = '', playedThisOpen = false, chipWanted = false;

    // posters and <source>s are attached on first use only, so nothing downloads with the page
    function poster(v) { if (!v.poster && v.dataset.poster) v.poster = v.dataset.poster; }
    function load(v) {
      poster(v);
      if (v.dataset.loaded) return;
      var base = v.dataset.videoSrc;
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (s) {
        var el = document.createElement('source');
        el.src = base + '.' + s[0];
        el.type = s[1];
        v.appendChild(el);
      });
      v.dataset.loaded = '1';
      v.load();
    }

    // ---- lightbox
    function focusables() {
      return Array.prototype.filter.call(box.querySelectorAll('button, video[controls]'), function (el) { return !el.disabled && el.offsetParent !== null; });
    }
    function openBox(source, from) {
      opener = from || document.activeElement;
      openSource = source;
      playedThisOpen = false;
      setChipVisible(false);                          // hidden while the lightbox is open
      load(lbVideo);
      box.hidden = false;
      document.documentElement.classList.add('hm-lb-lock');
      void box.offsetWidth;
      box.classList.add('is-open');
      lbVideo.currentTime = 0;
      lbVideo.muted = false;
      var p = lbVideo.play();
      if (p && p.catch) p.catch(function () {});       // controls are there if the browser blocks autoplay
      box.querySelector('.hm-lb-close').focus();
      track('video_open', { source: source });
    }
    function closeBox() {
      if (box.hidden) return;
      lbVideo.pause();
      box.classList.remove('is-open');
      document.documentElement.classList.remove('hm-lb-lock');
      var fromChip = opener && opener.closest && opener.closest('.hm-chip');
      if (opener && opener.focus && !fromChip) opener.focus();
      setTimeout(function () {
        box.hidden = true;
        updateChip();
        // the chip comes back after the lightbox closes, so return focus to it then (if it's showing)
        if (fromChip && !chip.hidden) opener.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 250);
    }
    lbVideo.addEventListener('playing', function () {
      if (playedThisOpen) return;
      playedThisOpen = true;
      track('video_play', { source: openSource });
    });
    box.addEventListener('click', function (e) { if (e.target.closest('[data-lb-close]')) closeBox(); });
    // capture phase on document: the video's native controls swallow keys before they reach the dialog
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeBox(); return; }
      if (e.key !== 'Tab') return;
      // keep focus inside the dialog
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }, true);
    if (whyBtn) whyBtn.addEventListener('click', function () { openBox('hero_button', whyBtn); });

    // ---- floating chip: slides up once the hero is mostly out of view (about one screen down)
    function dismissed() { try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { return false; } }
    // chipWanted = the visitor has scrolled far enough (set by the observer); this only shows or hides it
    function setChipVisible(on) {
      if (on) {
        if (chip.classList.contains('is-up')) return;
        chip.hidden = false;
        poster(chipVideo);
        void chip.offsetWidth;
        chip.classList.add('is-up');
        if (!reduceMotion) {                            // reduced motion: poster only, no autoplay
          load(chipVideo);
          var p = chipVideo.play();
          if (p && p.catch) p.catch(function () {});
        }
      } else {
        chip.classList.remove('is-up');
        if (!chipVideo.paused) chipVideo.pause();
        setTimeout(function () { if (!chip.classList.contains('is-up')) chip.hidden = true; }, reduceMotion ? 0 : 400);
      }
    }
    function updateChip() {
      setChipVisible(chipWanted && wideEnough.matches && !dismissed() && box.hidden);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var r = entries[0].intersectionRatio;
        if (r < 0.2 && window.scrollY > window.innerHeight * 0.9) chipWanted = true;
        else if (r > 0.5) chipWanted = false;
        updateChip();
      }, { threshold: [0, 0.2, 0.5, 1] }).observe(hero);
    }
    if (wideEnough.addEventListener) wideEnough.addEventListener('change', updateChip);

    chip.querySelector('.hm-chip-open').addEventListener('click', function () { openBox('chip', chip.querySelector('.hm-chip-open')); });
    soundBtn.addEventListener('click', function () {
      load(chipVideo);
      chipVideo.muted = !chipVideo.muted;
      var on = !chipVideo.muted;
      if (on && chipVideo.paused) chipVideo.play().catch(function () {});
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.querySelector('span').textContent = on ? 'Sound on' : 'Unmute';
      if (on) track('video_unmute', { source: 'chip' });
    });
    chip.querySelector('.hm-chip-close').addEventListener('click', function () {
      try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
      chipVideo.muted = true;
      setChipVisible(false);
      track('chip_dismiss', {});
    });
  }

  // ---------------------------------------------------------------- hero product animation
  var mock = hero.querySelector('.hm-mock');
  var stage = hero.querySelector('.hm-stage');
  var pop = hero.querySelector('.hm-pop');
  var cam = hero.querySelector('.hm-cam');
  var cursor = hero.querySelector('.hm-cursor');
  if (!mock || !cam) return;

  // Figma hero mock geometry (stage units): window position/size, screen scale at full view, cursor tip
  var WX = 78.58, WY = 58.94, WW = 654.84, WH = 392.9, BASE = WW / 1200, TIPX = 24.215, TIPY = 21.315;

  function fit() { stage.style.setProperty('--k', mock.clientWidth / WW); }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(mock);
  else window.addEventListener('resize', fit);

  var screens = {}, dropdowns = {}, typeEl = null, steps = [], idx = 0, stepTimer = null, typeTimer = null, waiting = false;

  // zoom 1 shows the whole screen from the top; otherwise centre the focus, clamped so nothing outside the screen shows
  function camFor(st) {
    var s = BASE * (st.zoom || 1);
    if ((st.zoom || 1) === 1 || !st.focus) return { s: s, x: 0, y: 0 };
    return {
      s: s,
      x: Math.min(0, Math.max(WW - 1200 * s, WW / 2 - st.focus[0] * s)),
      y: Math.min(0, Math.max(WH - 760 * s, WH / 2 - st.focus[1] * s))
    };
  }

  function apply(st, dur, ease) {
    var c = camFor(st);
    var tr = dur ? 'transform ' + dur + 's ' + ease : 'none';
    cam.style.transition = tr + ', opacity .35s ease';
    cam.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px) scale(' + c.s + ')';
    cursor.style.transition = tr;
    cursor.style.transform = 'translate(' + (WX + c.x + st.cursor[0] * c.s - TIPX) + 'px,' + (WY + c.y + st.cursor[1] * c.s - TIPY) + 'px)';
    Object.keys(screens).forEach(function (k) { screens[k].classList.toggle('on', k === st.screen); });
    Object.keys(dropdowns).forEach(function (k) {
      if (k !== st.dropdown) {
        dropdowns[k].classList.remove('on');
        dropdowns[k].querySelectorAll('.dd-i.on').forEach(function (i) { i.classList.remove('on'); });
      }
    });
    pop.style.transition = dur ? 'transform ' + dur + 's ' + ease + ', opacity ' + dur + 's ' + ease : 'none';
    pop.style.transform = st.exit ? 'scale(.55)' : 'scale(1)';
    pop.style.opacity = st.exit ? '0' : '1';
  }

  function arrive(st) {
    var dd = st.dropdown && dropdowns[st.dropdown];
    if (dd) {
      dd.classList.add('on');
      dd.querySelectorAll('.dd-i').forEach(function (i) { i.classList.toggle('on', i.dataset.item === st.hover); });
    }
    if (st.click) {
      cursor.classList.add('is-press');
      setTimeout(function () { cursor.classList.remove('is-press'); }, 160);
    }
  }

  function typeRoomName(ms) {
    clearInterval(typeTimer);
    var full = typeEl.dataset.type, n = 0;
    typeEl.textContent = '';
    typeTimer = setInterval(function () {
      typeEl.textContent = full.slice(0, ++n);
      if (n >= full.length) clearInterval(typeTimer);
    }, ms / full.length);
  }

  function enter(i, dur, ease) {
    var st = steps[i];
    idx = i;
    apply(st, dur, ease);
    if (st.type && typeEl) typeRoomName((dur + st.dwell) * 900);
    stepTimer = setTimeout(function () {
      arrive(st);
      stepTimer = setTimeout(advance, st.dwell * 1000);
    }, dur * 1000);
  }

  // jump back to the first frame with no motion (the window is hidden at this point)
  function reset() {
    clearInterval(typeTimer);
    if (typeEl) typeEl.textContent = '';
    cam.classList.add('no-fade');
    var first = Object.assign({}, steps[0], { exit: true });
    apply(first, 0);
    void cam.offsetWidth;
    cam.classList.remove('no-fade');
  }

  function advance() {
    if (!canRun()) { waiting = true; return; }
    var leaving = steps[idx];
    var nextIdx = (idx + 1) % steps.length;
    if (nextIdx === 0) reset();
    enter(nextIdx, leaving.next[0], leaving.next[1]);
  }
  onResume(function () { if (waiting) { waiting = false; advance(); } });

  function start() {
    cam.innerHTML = window.DR_HERO_SCREENS;
    cam.querySelectorAll('.scr').forEach(function (el) { screens[el.dataset.s] = el; });
    cam.querySelectorAll('.dd').forEach(function (el) { dropdowns[el.dataset.dd] = el; });
    typeEl = cam.querySelector('[data-type]');

    apply(steps[0], 0);
    if (typeEl) typeEl.textContent = '';
    cam.classList.add('is-ready');
    cursor.classList.add('is-ready');
    if (reduceMotion) return;              // static first frame
    stepTimer = setTimeout(advance, steps[0].dwell * 1000);
  }

  // Steps live in a JSON block in index.html; the screens are a separate script so they load after the page
  // and also work when the file is opened from disk (fetch is blocked on file://). Path is relative on purpose.
  try { steps = JSON.parse(document.getElementById('hm-steps').textContent).steps; } catch (e) { return; }
  var tag = document.createElement('script');
  tag.src = 'assets/home/screens.js';
  tag.onload = function () { if (window.DR_HERO_SCREENS) start(); };
  document.body.appendChild(tag);
})();

/* No widows: glue the last two words of every text block together so a line
   never ends with one word on its own. Runs once on load; CSS text-wrap:pretty
   does the same job in browsers that support it. */
(function () {
  'use strict';
  var SEL = 'h1,h2,h3,h4,p,li,dd,dt,summary,blockquote,figcaption,.st,.how-note,.hm-lead,.hm-card-link,.lp-tier-n';
  function glue(el) {
    var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = tw.nextNode())) nodes.push(n);
    var words = 0;
    nodes.forEach(function (t) { words += (t.data.match(/\S+/g) || []).length; });
    if (words < 4) return;
    for (var i = nodes.length - 1; i >= 0; i--) {
      var d = nodes[i].data, trimmed = d.replace(/\s+$/, '');
      if (!trimmed) continue;
      var sp = trimmed.search(/[ \t\n]+\S+$/);
      if (sp > 0) { nodes[i].data = trimmed.slice(0, sp) + ' ' + trimmed.slice(sp).replace(/^\s+/, '') + d.slice(trimmed.length); return; }
      // the last word starts this node (e.g. inside <em>): glue the space before it
      for (var j = i - 1; j >= 0; j--) {
        if (/\s$/.test(nodes[j].data)) { nodes[j].data = nodes[j].data.replace(/\s+$/, ' '); return; }
        if (/\S/.test(nodes[j].data)) return;
      }
      return;
    }
  }
  function run() { document.querySelectorAll(SEL).forEach(glue); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

/* Section eyebrows: draw the highlighter stroke on as each one scrolls into view. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var marks = document.querySelectorAll('.home-page .eyebrow, .home-page .hm-eyebrow');
  if (!marks.length) return;
  document.body.classList.add('ink-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 1 });
  marks.forEach(function (m) { io.observe(m); });
})();

/* "Who it's for" cards: the whole card opens its link, not just the text link at the bottom.
   (A CSS stretched link won't work here because the card body moves on hover.) */
(function () {
  'use strict';
  document.querySelectorAll('.hm-card').forEach(function (card) {
    var link = card.querySelector('.hm-card-link');
    if (!link) return;
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;                       // the link handles itself
      if (window.getSelection && String(window.getSelection())) return;  // let people select text
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) { window.open(link.href, '_blank'); return; }
      link.click();
    });
  });
})();
