/* /tour: the guided walkthrough ("See Diligence Ready in 2 minutes").
   Modeled on the Arcade example Mike shared: a start screen with one button per part, a short intro
   for each part, then real app screenshots with one coral hotspot and one tip per step.
   Clicking the hotspot (or the arrow) moves on. Restart / back / forward at top left, a "Jump to…"
   menu at bottom left. Every part ends on Start free.

   To edit the tour, change CHAPTERS below. Hotspot boxes are percentages of the screenshot:
   [left, top, width, height]. Deep links work with a hash: /tour#cap-table, /tour#what-if,
   /tour#assistant, /tour#diligence.

   GA4 events (only sent if gtag is on the page): tour_start, tour_chapter_start,
   tour_chapter_complete, tour_complete, signup_click (with location "tour"). */
(function () {
  'use strict';

  var SIGNUP = 'https://app.diligenceready.com/signup?src=tour';

  var CHAPTERS = [
    {
      id: 'cap-table', name: 'Cap table', shot: 'shots/cap-table.png',
      intro: 'One live record of who owns what, tied to every signed document.',
      done: 'That’s the cap table.',
      steps: [
        { box: [1.7, 26.6, 96.9, 12.7], tip: 'Everything investors ask for first, on one screen: total raised, fully diluted shares and stakeholders.' },
        { box: [1.7, 42.5, 96.9, 46.7], tip: 'Every share class in one place, with what’s authorized and what’s been issued.' },
        { box: [89.3, 19.6, 9.3, 4.0], tip: 'Every change is saved as a version, so you can go back to any point in the company’s history.' },
        { box: [39.6, 12.8, 6.2, 3.6], tip: 'Want to see what a new round would do? That’s What If, the next part.' }
      ]
    },
    {
      id: 'what-if', name: 'Model a round', shot: 'shots/what-if.png',
      intro: 'See what a raise does to everyone’s ownership before you sign.',
      done: 'That’s modeling a round.',
      steps: [
        { box: [4.4, 42.2, 28.6, 8.2], tip: 'Type in a pre-money valuation and how much you’re raising.' },
        { box: [35.0, 30.0, 61.7, 21.3], tip: 'The post-money valuation and new price per share, worked out for you.' },
        { box: [35.0, 53.2, 61.7, 29.3], tip: 'See who owns what before and after the round, for every stakeholder.' },
        { box: [64.5, 23.2, 32.1, 4.2], tip: 'Save the scenario or print it as a PDF for the board. Nothing touches the real cap table until you decide.' }
      ]
    },
    {
      id: 'assistant', name: 'The assistant', shot: 'shots/real-ai.png',
      intro: 'Let it do the busywork. You approve every change.',
      done: 'That’s the assistant.',
      steps: [
        { box: [24.0, 58.7, 50.4, 27.3], tip: 'Ask about your cap table in plain words, or start from one of these.' },
        { box: [49.5, 58.7, 24.9, 8.0], tip: 'Ask it to add an investor or a SAFE. It reads the signed document and drafts the change for you.' },
        { box: [78.9, 20.8, 20.2, 24.3], tip: 'It works from this company’s real numbers, and every change it proposes waits for your approval.' }
      ]
    },
    {
      id: 'diligence', name: 'Diligence & data room', shot: 'shots/diligence-room.png',
      intro: 'Know what’s missing before anyone asks, then share the room.',
      done: 'That’s diligence and the data room.',
      steps: [
        { box: [4.4, 39.6, 91.1, 14.4], tip: 'Drop in your documents. Each one is reviewed and matched to the checklist.' },
        { box: [3.3, 57.7, 93.3, 10.4], tip: 'See what’s complete and what’s still missing, with a checklist for each stage from Seed to Series A.' },
        { box: [4.3, 78.5, 91.3, 10.5], tip: 'Every match comes with a note explaining why it was checked off.' },
        { box: [74.4, 18.3, 10.7, 4.0], tip: 'When someone asks, share a data room with just the files they need.' }
      ]
    }
  ];

  var root = document.getElementById('tour');
  if (!root) return;

  // ------------------------------------------------------------------ helpers
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} }
  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.33 8h9.34M8 3.33 12.67 8 8 12.67"/></svg>';
  var BACK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.67 8H3.33M8 12.67 3.33 8 8 3.33"/></svg>';
  var RESTART = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3h3"/></svg>';
  var MENU = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11"/></svg>';
  var FULL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>';

  var ICONS = {"cap-table": '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>', "what-if": '<path d="M2 17l6.5-6.5 5 5L22 7"/><path d="M16 7h6v6"/>', "assistant": '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/><path d="M20 3v4M22 5h-4"/>', "diligence": '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'};
  var RINGS = '<svg class="tr-rings" viewBox="0 0 300 200" fill="none" stroke="#fff" stroke-width="1.2" aria-hidden="true"><circle cx="290" cy="6" r="46"/><circle cx="290" cy="6" r="86"/><circle cx="290" cy="6" r="126"/><circle cx="290" cy="6" r="166"/></svg><i class="tr-speck" style="left:74%;top:16%"></i><i class="tr-speck tr-speck-sm" style="left:88%;top:44%"></i>';

  // preload screenshots
  CHAPTERS.forEach(function (c) { var i = new Image(); i.src = c.shot; });

  // ------------------------------------------------------------------ frame
  var stage = el('div', 'tr-stage');
  var screen = el('div', 'tr-screen');
  var shot = el('img', 'tr-shot'); shot.alt = ''; shot.setAttribute('draggable', 'false');
  var hot = el('button', 'tr-hot'); hot.type = 'button'; hot.setAttribute('aria-label', 'Next step');
  var tip = el('div', 'tr-tip'); tip.setAttribute('role', 'status'); tip.setAttribute('aria-live', 'polite');
  screen.appendChild(shot); screen.appendChild(hot);
  var panel = el('div', 'tr-panel');          // the navy start / intro / end screens
  stage.appendChild(screen); stage.appendChild(panel); stage.appendChild(tip);

  var controls = el('div', 'tr-controls');
  var bRestart = el('button', 'tr-ctl', RESTART); bRestart.type = 'button'; bRestart.setAttribute('aria-label', 'Start over');
  var bBack = el('button', 'tr-ctl', BACK); bBack.type = 'button'; bBack.setAttribute('aria-label', 'Back');
  var bFwd = el('button', 'tr-ctl', ARROW); bFwd.type = 'button'; bFwd.setAttribute('aria-label', 'Forward');
  controls.appendChild(bRestart); controls.appendChild(bBack); controls.appendChild(bFwd);
  var bFull = el('button', 'tr-ctl tr-full', FULL); bFull.type = 'button'; bFull.setAttribute('aria-label', 'Full screen');
  // Start free is always one click away, on every screen of the tour
  var cta = el('a', 'tr-cta', 'Start free ' + ARROW); cta.href = SIGNUP; cta.setAttribute('data-cta', 'start_free'); cta.setAttribute('data-loc', 'tour');
  var topRight = el('div', 'tr-topright'); topRight.appendChild(cta); topRight.appendChild(bFull);

  var menuWrap = el('div', 'tr-menu-wrap');
  var bMenu = el('button', 'tr-ctl tr-menu-btn', MENU); bMenu.type = 'button'; bMenu.setAttribute('aria-label', 'Jump to a part'); bMenu.setAttribute('aria-expanded', 'false');
  var menu = el('div', 'tr-menu'); menu.hidden = true;
  menu.appendChild(el('div', 'tr-menu-h', 'Jump to…'));
  var menuItems = [{ label: 'Start', go: { v: 'home' } }].concat(CHAPTERS.map(function (c, i) { return { label: c.name, go: { v: 'intro', c: i } }; }));
  menuItems.forEach(function (m) {
    var b = el('button', 'tr-menu-i', m.label); b.type = 'button';
    b.addEventListener('click', function () { closeMenu(); show(m.go); });
    menu.appendChild(b);
  });
  menuWrap.appendChild(menu); menuWrap.appendChild(bMenu);

  var progress = el('div', 'tr-progress'); var bar = el('span'); progress.appendChild(bar);

  root.appendChild(stage); root.appendChild(controls); root.appendChild(topRight); root.appendChild(menuWrap); root.appendChild(progress);

  // ------------------------------------------------------------------ state
  // views: home, intro (c), step (c, s), end (c), finish
  var state = { v: 'home' }, started = false, seen = {};
  var TOTAL = CHAPTERS.reduce(function (n, c) { return n + c.steps.length; }, 0);

  function order() {           // a flat list of every view, for back / forward
    var list = [{ v: 'home' }];
    CHAPTERS.forEach(function (c, i) {
      list.push({ v: 'intro', c: i });
      c.steps.forEach(function (_, s) { list.push({ v: 'step', c: i, s: s }); });
      list.push({ v: 'end', c: i });
    });
    list.push({ v: 'finish' });
    return list;
  }
  var ORDER = order();
  function idx(st) { for (var i = 0; i < ORDER.length; i++) { var o = ORDER[i]; if (o.v === st.v && o.c === st.c && o.s === st.s) return i; } return 0; }

  function chapterNav(i, small) {
    var c = CHAPTERS[i];
    return '<button type="button" class="tr-chip' + (small ? ' tr-chip-sm' : '') + (seen[c.id] ? ' is-seen' : '') + '" data-go-c="' + i + '"><span class="tr-chip-n">' + (i + 1) + '</span>' + c.name + (seen[c.id] ? '<span class="tr-chip-ck" aria-label="seen">✓</span>' : '') + '</button>';
  }

  function render() {
    var st = state;
    root.setAttribute('data-view', st.v);
    var i = idx(st);
    bBack.disabled = i === 0; bFwd.disabled = i === ORDER.length - 1;

    // progress: steps finished across the whole tour
    var doneSteps = 0;
    for (var k = 0; k < i; k++) if (ORDER[k].v === 'step') doneSteps++;
    if (st.v === 'step') doneSteps++;
    if (st.v === 'finish') doneSteps = TOTAL;
    bar.style.width = (doneSteps / TOTAL * 100) + '%';

    if (st.v === 'step') {
      var c = CHAPTERS[st.c], step = c.steps[st.s];
      panel.innerHTML = ''; panel.hidden = true;
      if (shot.getAttribute('src') !== c.shot) shot.src = c.shot;
      shot.alt = c.name + ' screen in Diligence Ready';
      var b = step.box;
      hot.style.left = b[0] + '%'; hot.style.top = b[1] + '%'; hot.style.width = b[2] + '%'; hot.style.height = b[3] + '%';
      hot.classList.remove('is-in'); void hot.offsetWidth; hot.classList.add('is-in');
      var last = st.s === c.steps.length - 1;
      tip.innerHTML = RINGS +
        '<div class="tr-tip-top"><span class="tr-tip-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[c.id] || '') + '</svg></span>' +
        '<span class="tr-tip-k">' + c.name + '<br>Step ' + (st.s + 1) + ' of ' + c.steps.length + '</span></div>' +
        '<p>' + step.tip + '</p>' +
        '<button type="button" class="tr-next">' + (last ? 'Finish this part' : 'Next') + ' ' + ARROW + '</button>';
      tip.querySelector('.tr-next').addEventListener('click', next);
      placeTip();
      return;
    }

    // navy panel views
    panel.hidden = false;
    var c2 = CHAPTERS[st.c] || CHAPTERS[0];
    if (shot.getAttribute('src') !== c2.shot) shot.src = c2.shot;
    hot.style.width = '0'; tip.innerHTML = '';
    var html = '';
    if (st.v === 'home') {
      html = '<div class="tr-copy"><span class="tr-k">4 parts · about 2 minutes</span><h2>Pick where to start.</h2>' +
        '<p>Click through real screens from the app, one step at a time. Or start at the top and go in order.</p>' +
        '<div class="tr-chips">' + CHAPTERS.map(function (_, j) { return chapterNav(j); }).join('') + '</div>' +
        '<div class="tr-row"><button type="button" class="tr-btn tr-btn-coral" data-go-c="0">Start the tour ' + ARROW + '</button>' +
        '<a class="tr-btn tr-btn-ghost" href="' + SIGNUP + '" data-cta="start_free" data-loc="tour">Skip to Start free</a></div></div>';
    } else if (st.v === 'intro') {
      html = '<div class="tr-copy"><span class="tr-k">Part ' + (st.c + 1) + ' of ' + CHAPTERS.length + '</span><h2>' + c2.name + '</h2>' +
        '<p>' + c2.intro + '</p>' +
        '<div class="tr-row"><button type="button" class="tr-btn tr-btn-coral" data-act="begin">Get started ' + ARROW + '</button>' +
        '<button type="button" class="tr-btn tr-btn-ghost" data-act="home">Back to start</button></div></div>';
    } else if (st.v === 'end') {
      var nxt = CHAPTERS[st.c + 1];
      html = '<div class="tr-copy"><span class="tr-k">Part ' + (st.c + 1) + ' done</span><h2>' + c2.done + '</h2>' +
        '<p>Bring your own in from a spreadsheet. Free forever for one company.</p>' +
        '<div class="tr-row"><a class="tr-btn tr-btn-coral" href="' + SIGNUP + '" data-cta="start_free" data-loc="tour">Start free ' + ARROW + '</a>' +
        (nxt ? '<button type="button" class="tr-btn tr-btn-ghost" data-go-c="' + (st.c + 1) + '">Next: ' + nxt.name + '</button>'
             : '<button type="button" class="tr-btn tr-btn-ghost" data-act="finish">Finish the tour</button>') + '</div></div>';
    } else if (st.v === 'finish') {
      html = '<div class="tr-copy"><span class="tr-k">That’s the tour</span><h2>You’ve seen all four parts.</h2>' +
        '<p>Start free with your own company. Bring your cap table in from a spreadsheet, or start blank. Free forever for one company.</p>' +
        '<div class="tr-row"><a class="tr-btn tr-btn-coral" href="' + SIGNUP + '" data-cta="start_free" data-loc="tour">Start free ' + ARROW + '</a>' +
        '<a class="tr-btn tr-btn-ghost" href="./#contact" data-cta="contact" data-loc="tour">Talk to us</a></div>' +
        '<button type="button" class="tr-link" data-act="home">' + RESTART + ' Watch it again</button></div>';
    }
    panel.innerHTML = html;
  }

  function placeTip() {
    if (window.matchMedia('(max-width: 760px)').matches) { tip.style.left = tip.style.top = ''; tip.removeAttribute('data-side'); return; }
    // work from the step's target box, not the outline's current size (it animates between steps)
    var W = screen.clientWidth, H = screen.clientHeight;
    var b = CHAPTERS[state.c].steps[state.s].box;
    var hx = b[0] / 100 * W, hy = b[1] / 100 * H, hw = b[2] / 100 * W, hh = b[3] / 100 * H;
    var tw = tip.offsetWidth, th = tip.offsetHeight, gap = 14;
    var x, y, side;
    if (hy + hh + gap + th <= H - 8) { y = hy + hh + gap; side = 'below'; }
    else if (hy - gap - th >= 8) { y = hy - gap - th; side = 'above'; }
    else { y = Math.max(8, Math.min(H - th - 8, hy + hh / 2 - th / 2)); side = 'inside'; }
    x = hx + Math.min(24, hw / 2 - 20);
    if (hw < tw) x = hx + hw / 2 - tw / 2;
    x = Math.max(12, Math.min(W - tw - 12, x));
    tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.setAttribute('data-side', side);
  }

  function show(st) {
    state = st;
    if (st.v !== 'home' && !started) { started = true; track('tour_start', {}); }
    if (st.v === 'intro') track('tour_chapter_start', { chapter: CHAPTERS[st.c].id });
    if (st.v === 'end') { seen[CHAPTERS[st.c].id] = true; track('tour_chapter_complete', { chapter: CHAPTERS[st.c].id }); }
    if (st.v === 'finish') track('tour_complete', {});
    var hash = (st.c != null && st.v !== 'finish') ? '#' + CHAPTERS[st.c].id : '';
    try { window.history.replaceState(null, '', location.pathname + location.search + hash); } catch (e) {}
    render();
  }
  function next() { var i = idx(state); if (i < ORDER.length - 1) show(ORDER[i + 1]); }
  function prev() { var i = idx(state); if (i > 0) show(ORDER[i - 1]); }

  // ------------------------------------------------------------------ events
  hot.addEventListener('click', next);
  bFwd.addEventListener('click', next);
  bBack.addEventListener('click', prev);
  bRestart.addEventListener('click', function () { show({ v: 'home' }); });
  panel.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go-c],[data-act]');
    if (!t) return;
    if (t.hasAttribute('data-go-c')) return show({ v: 'intro', c: +t.getAttribute('data-go-c') });
    var a = t.getAttribute('data-act');
    if (a === 'begin') show({ v: 'step', c: state.c, s: 0 });
    if (a === 'home') show({ v: 'home' });
    if (a === 'finish') show({ v: 'finish' });
  });
  function closeMenu() { menu.hidden = true; bMenu.setAttribute('aria-expanded', 'false'); }
  bMenu.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; bMenu.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.addEventListener('click', function (e) { if (!menuWrap.contains(e.target)) closeMenu(); });
  bFull.addEventListener('click', function () {
    var d = document;
    if (d.fullscreenElement) { d.exitFullscreen && d.exitFullscreen(); }
    else if (root.requestFullscreen) { root.requestFullscreen().catch(function () {}); }
  });
  if (!root.requestFullscreen) bFull.hidden = true;
  root.addEventListener('keydown', function (e) {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', function () { if (state.v === 'step') placeTip(); });
  document.addEventListener('fullscreenchange', function () { setTimeout(function () { if (state.v === 'step') placeTip(); }, 60); });
  shot.addEventListener('load', function () { if (state.v === 'step') placeTip(); });

  // ------------------------------------------------------------------ start (deep link with #chapter)
  var start = { v: 'home' };
  var h = (location.hash || '').replace('#', '');
  CHAPTERS.forEach(function (c, i) { if (c.id === h) start = { v: 'intro', c: i }; });
  state = start;
  if (start.v !== 'home') { started = true; track('tour_start', { from: 'link', chapter: h }); }
  render();
})();
