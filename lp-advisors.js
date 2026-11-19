/* /for-advisors hero: an advisor preparing one client for diligence.
   Modeled on the app's Diligence screen. The card shows Acme Corp's checklist in four areas
   (Legal, Financial, Technical, Business). The cursor opens each area and attaches the missing
   documents; each one is matched and checked off, the counts and progress bar fill, and the card
   ends on "Ready for diligence". Then it quietly resets and plays again.
   The advisor prepares the company; nothing is "sent" here.
   Pauses when the card is off-screen or the tab is hidden. Reduced motion: shows the finished state. */
(function () {
  'use strict';
  var side = document.querySelector('.lp-side');
  var card = side && side.querySelector('.dp');
  if (!card) return;

  var TOTAL = 78;
  // edit the checklist here: two items already complete and two still open in each area
  var AREAS = [
    { name: 'Legal', of: 22, done: 20, icon: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
      complete: ['Certificate of Incorporation', 'Stockholder agreements'],
      open: [['Board minutes, past 24 months', 'Board minutes 2024-2026.pdf'], ['IP assignment agreements', 'IP assignments, signed.pdf']] },
    { name: 'Financial', of: 25, done: 23, icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17V11M12 17V7M16 17v-3"/>',
      complete: ['Cap table, fully diluted', 'Federal and state tax returns'],
      open: [['Q3 financial statements', 'Q3 2026 financials.pdf'], ['Budget vs. actuals, trailing 12 months', 'Budget vs actuals TTM.xlsx']] },
    { name: 'Technical', of: 15, done: 13, icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
      complete: ['System architecture diagrams', 'Tech stack documentation'],
      open: [['Security posture documentation', 'SOC 2 readiness summary.pdf'], ['Third-party software licenses', 'Software licenses.pdf']] },
    { name: 'Business', of: 16, done: 14, icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      complete: ['Business plan', 'Market analysis'],
      open: [['Top 10-20 customer contracts', 'Top customer contracts.zip'], ['Churn analysis, logo and revenue', 'Churn analysis 2026.xlsx']] }
  ];

  var areasEl = card.querySelector('.dp-areas');
  var listEl = card.querySelector('.dp-list');
  var badge = card.querySelector('.dp-badge');
  var doneEl = card.querySelector('.dp-done');
  var pctEl = card.querySelector('.dp-pct');
  var bar = card.querySelector('.dp-bar span');
  var FILE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5Z"/><path d="M9.5 1.5V5H13"/></svg>';
  var UP = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 10V2.5M5 5.5l3-3 3 3M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2"/></svg>';

  // area tiles
  var tiles = AREAS.map(function (a) {
    var t = document.createElement('div');
    t.className = 'dp-area'; t.setAttribute('role', 'listitem');
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + a.icon + '</svg>' +
      '<span class="dp-area-n">' + a.name + '</span><span class="dp-area-c"><b>' + a.done + '</b>/' + a.of + '</span>';
    areasEl.appendChild(t);
    return t;
  });

  var cursor = document.createElement('div');
  cursor.className = 'lp-cursor'; cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<img src="assets/home/hero/cursor.svg" alt="" width="67" height="75">';
  side.appendChild(cursor);

  var state = {};
  function resetState() {
    state.done = AREAS.reduce(function (n, a) { return n + a.done; }, 0);
    state.area = AREAS.map(function (a) { return a.done; });
  }
  function pill(cls, text) { return '<span class="dp-pill ' + cls + '">' + text + '</span>'; }
  function renderList(i, allDone) {
    var a = AREAS[i];
    var html = a.complete.map(function (n) {
      return '<div class="dp-row">' + pill('is-done', 'Complete') + '<span class="dp-nm">' + n + '</span></div>';
    }).join('');
    html += a.open.map(function (o, k) {
      if (allDone) return '<div class="dp-row is-matched">' + pill('is-done', 'Complete') + '<span class="dp-nm">' + o[0] + '</span><span class="dp-note">' + FILE + o[1] + ' · matched</span></div>';
      return '<div class="dp-row" data-k="' + k + '">' + pill('is-open', 'Pending') + '<span class="dp-nm">' + o[0] + '</span><span class="dp-attach">' + UP + 'Attach</span><span class="dp-note">' + FILE + o[1] + ' · matched</span></div>';
    }).join('');
    listEl.innerHTML = html;
  }
  function setArea(i) { tiles.forEach(function (t, j) { t.classList.toggle('is-active', j === i); }); }
  function updateCounts(i) {
    var left = TOTAL - state.done;
    doneEl.textContent = state.done;
    var pct = Math.round(state.done / TOTAL * 100);
    pctEl.textContent = pct + '%';
    bar.style.width = (state.done / TOTAL * 100) + '%';
    if (i != null) { var c = tiles[i].querySelector('b'); c.textContent = state.area[i]; pop(tiles[i]); if (state.area[i] === AREAS[i].of) tiles[i].classList.add('is-full'); }
    if (left) { badge.textContent = left + (left === 1 ? ' item open' : ' items open'); badge.className = 'status dp-badge st-review'; }
    else { badge.textContent = 'Ready for diligence ✓'; badge.className = 'status dp-badge st-ready'; card.classList.add('is-ready'); }
    pop(badge);
  }
  function pop(el) { el.classList.remove('pf-pop'); void el.offsetWidth; el.classList.add('pf-pop'); }

  function reset() {
    resetState();
    tiles.forEach(function (t, i) { t.classList.remove('is-full'); t.querySelector('b').textContent = AREAS[i].done; });
    card.classList.remove('is-ready');
    doneEl.textContent = state.done; pctEl.textContent = Math.round(state.done / TOTAL * 100) + '%';
    bar.style.width = (state.done / TOTAL * 100) + '%';
    badge.textContent = (TOTAL - state.done) + ' items open'; badge.className = 'status dp-badge st-review';
    setArea(0); renderList(0); listEl.classList.remove('is-swap');   // the list was faded out at the end of the last loop
    cursor.classList.remove('is-in', 'is-click'); offRight();
  }

  // reduced motion: just show the finished state
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resetState(); state.done = TOTAL; AREAS.forEach(function (a, i) { state.area[i] = a.of; tiles[i].classList.add('is-full'); tiles[i].querySelector('b').textContent = a.of; });
    setArea(0); renderList(0, true); updateCounts(null); return;
  }

  var timers = [], running = false, visible = true;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function point(el, fx, fy) {
    // the card can be scaled up with CSS zoom (home.css), so screen px are converted back to the card's own px
    var s = side.getBoundingClientRect(), r = el.getBoundingClientRect(), k = (s.width / side.offsetWidth) || 1;
    return [(r.left - s.left) / k + (fx == null ? r.width / k / 2 : fx), (r.top - s.top) / k + (fy == null ? r.height / k / 2 : fy)];
  }
  function moveTo(el, fx, fy) { var p = point(el, fx, fy); cursor.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function offRight() { cursor.style.transform = 'translate(' + (side.offsetWidth + 60) + 'px,' + (side.offsetHeight * 0.6) + 'px)'; }
  function click(t) { at(t, function () { cursor.classList.add('is-click'); }); at(t + 180, function () { cursor.classList.remove('is-click'); }); }

  function runArea(i, t) {
    if (i > 0) {
      at(t, function () { cursor.classList.add('is-in'); moveTo(tiles[i]); });
      click(t + 950);
      at(t + 1120, function () { setArea(i); listEl.classList.add('is-swap'); });
      at(t + 1300, function () { renderList(i); listEl.classList.remove('is-swap'); });
      t += 1700;
    }
    AREAS[i].open.forEach(function (o, k) {
      at(t, function () { cursor.classList.add('is-in'); var b = listEl.querySelector('[data-k="' + k + '"] .dp-attach'); if (b) moveTo(b); });
      click(t + 850);
      at(t + 1030, function () {
        var row = listEl.querySelector('[data-k="' + k + '"]'); if (!row) return;
        row.querySelector('.dp-pill').outerHTML = pill('is-busy', 'Matching');
      });
      at(t + 1750, function () {
        var row = listEl.querySelector('[data-k="' + k + '"]'); if (!row) return;
        row.querySelector('.dp-pill').outerHTML = pill('is-done', 'Complete');
        row.classList.add('is-matched'); pop(row.querySelector('.dp-pill'));
        state.done++; state.area[i]++; updateCounts(i);
      });
      t += 2250;
    });
    return t;
  }

  function play() {
    clear(); reset(); running = true;
    var t = 700;
    for (var i = 0; i < AREAS.length; i++) t = runArea(i, t);
    at(t, function () { cursor.classList.remove('is-in'); offRight(); });
    // hold on "Ready for diligence", then fade just the list and start over
    at(t + 3600, function () { listEl.classList.add('is-swap'); });
    at(t + 3900, function () { if (visible && !document.hidden) play(); else running = false; });
  }

  function wake() { if (visible && !document.hidden && !running) play(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (!visible) { clear(); running = false; reset(); } else wake(); }, { threshold: 0.3 }).observe(card);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clear(); running = false; reset(); } else wake(); });
  reset();
  wake();
})();
