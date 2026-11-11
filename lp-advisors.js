/* /for-advisors hero: a short looping demo on the "all clients" card.
   1. Harbor Logistics: open it, tick off its three open items, send the data room.
   2. The list scrolls down to Northwind Labs and does the same with its one open item.
   3. The list scrolls back up and the loop starts over.
   The card keeps one height; opening a company pushes the ones below it down inside the card.
   Pauses when the card is off-screen or the tab is hidden. Reduced motion: no animation. */
(function () {
  'use strict';
  var side = document.querySelector('.lp-side');
  var card = side && side.querySelector('.portfolio');
  if (!card) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var top = card.querySelector('.pf-top');
  var rows = Array.prototype.slice.call(card.querySelectorAll('.pf-row'));
  if (rows.length < 6) return;

  // rows move inside a window so the list can scroll
  var view = document.createElement('div'); view.className = 'pf-view';
  var list = document.createElement('div'); list.className = 'pf-list';
  view.appendChild(list); card.appendChild(view);
  rows.forEach(function (r) { list.appendChild(r); });

  var TICK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  function addDrawer(row, names) {
    var d = document.createElement('div');
    d.className = 'pf-drawer';
    d.innerHTML = '<div class="pf-drawer-in">' + names.map(function (t) {
      return '<div class="pf-item"><span class="pf-tick">' + TICK + '</span><span>' + t + '</span><span class="pf-item-st">Missing</span></div>';
    }).join('') + '</div>';
    row.insertAdjacentElement('afterend', d);
    return d;
  }
  // the companies the demo works through (edit the item names here)
  var CO = [
    { row: rows[1], names: ['Board minutes, last 24 months', 'Signed SAFE: Catalyst Ventures', 'Q3 financial statements'] },   // Harbor Logistics
    { row: rows.filter(function (r) { return /Northwind/.test(r.textContent); })[0], names: ['Updated cap table export'] }                                                                         // Northwind Labs
  ];
  CO.forEach(function (c) {
    c.drawer = addDrawer(c.row, c.names);
    c.items = c.drawer.querySelectorAll('.pf-item');
    c.pill = c.row.querySelector('.status');
    c.start = { text: c.pill.textContent, cls: c.pill.className };
  });

  var cursor = document.createElement('div');
  cursor.className = 'lp-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<img src="assets/home/hero/cursor.svg" alt="" width="67" height="75">';
  side.appendChild(cursor);

  // one fixed height: the header plus all six companies with nothing open
  function sizeCard() {
    var h = top.offsetHeight;
    rows.slice(0, 6).forEach(function (r) { h += r.offsetHeight; });   // six companies show at a time
    view.style.height = (h - top.offsetHeight) + 'px';
  }
  card.classList.add('is-fixed');
  sizeCard();
  window.addEventListener('resize', sizeCard);

  var timers = [], running = false, visible = true;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function point(el, fx, fy) {
    var s = side.getBoundingClientRect(), r = el.getBoundingClientRect();
    return [r.left - s.left + (fx == null ? r.width / 2 : fx), r.top - s.top + (fy == null ? r.height / 2 : fy)];
  }
  function moveTo(el, fx, fy) { var p = point(el, fx, fy); cursor.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function offRight(y) { var s = side.getBoundingClientRect(); cursor.style.transform = 'translate(' + (s.width + 60) + 'px,' + (y == null ? s.height * 0.6 : y) + 'px)'; }
  function pop(el) { el.classList.remove('pf-pop'); void el.offsetWidth; el.classList.add('pf-pop'); }
  function setPill(c, text, cls) { c.pill.innerHTML = text; c.pill.className = 'status ' + cls; pop(c.pill); }
  function click(t) { at(t, function () { cursor.classList.add('is-click'); }); at(t + 180, function () { cursor.classList.remove('is-click'); }); }
  function scrollTo(y) { list.style.transform = y ? 'translateY(' + (-y) + 'px)' : ''; }

  function resetCompany(c) {
    c.row.classList.remove('is-hover', 'is-open');
    c.drawer.classList.remove('is-open');
    c.items.forEach(function (i) { i.classList.remove('is-done'); i.querySelector('.pf-item-st').textContent = 'Missing'; });
    c.pill.textContent = c.start.text; c.pill.className = c.start.cls;
  }
  function reset() {
    CO.forEach(resetCompany);
    scrollTo(0);
    cursor.classList.remove('is-in', 'is-click');
    offRight();
  }

  // open a company, tick its items, send the room. Returns when it's done (ms).
  function runCompany(c, t) {
    at(t, function () { cursor.classList.add('is-in'); moveTo(c.row, c.row.offsetWidth * 0.6); });
    at(t + 1000, function () { c.row.classList.add('is-hover'); });
    click(t + 1300);
    at(t + 1480, function () { c.row.classList.add('is-open'); c.drawer.classList.add('is-open'); });
    t += 2200;
    c.items.forEach(function (item, i) {
      at(t, function () { moveTo(item.querySelector('.pf-tick'), 9, 9); });
      click(t + 650);
      at(t + 830, function () {
        item.classList.add('is-done');
        item.querySelector('.pf-item-st').textContent = 'Added';
        var left = c.items.length - i - 1;
        if (left) setPill(c, left + (left === 1 ? ' item open' : ' items open'), 'st-review');
        else setPill(c, 'Send data room →', 'st-send');
      });
      t += 1400;
    });
    at(t, function () { moveTo(c.pill); });
    click(t + 800);
    at(t + 980, function () { setPill(c, 'Sent ✓', 'st-sent'); });
    at(t + 1900, function () { c.drawer.classList.remove('is-open'); c.row.classList.remove('is-open', 'is-hover'); });
    return t + 2500;
  }

  function play() { clear(); reset(); loop(); }
  function loop() {
    running = true;
    var t = runCompany(CO[0], 500);
    // scroll down and centre Northwind Labs (with its list open) in the card
    at(t, function () {
      var block = CO[1].row.offsetHeight + CO[1].drawer.querySelector('.pf-drawer-in').scrollHeight + 10;
      var target = (CO[1].row.offsetTop - list.offsetTop) - (view.clientHeight - block) / 2;
      scrollTo(Math.max(0, target));
      offRight(view.offsetTop + view.clientHeight * 0.5);
    });
    at(t + 1300, function () { resetCompany(CO[0]); });   // Harbor is out of view now, so its reset isn't seen
    t = runCompany(CO[1], t + 1400);
    // back to the top; Northwind resets once it's out of view, then the loop carries straight on
    at(t, function () { cursor.classList.remove('is-in'); scrollTo(0); });
    at(t + 1200, function () { resetCompany(CO[1]); });
    at(t + 1300, function () { if (visible && !document.hidden) loop(); else running = false; });
  }


  function wake() { if (visible && !document.hidden && !running) play(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (!visible) { clear(); running = false; reset(); } else wake(); }, { threshold: 0.3 }).observe(card);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clear(); running = false; reset(); } else wake(); });
  reset();
  wake();
})();
