/* One nav on every page:
   1) the logo (nav + footer) gets nine real squares so the hover ripple works everywhere;
   2) the section you're in gets the coral bar (Product for every product/feature page). */
(function () {
  'use strict';
  document.querySelectorAll('#nav .brand, footer .brand').forEach(function (brand) {
    if (brand.classList.contains('hm-logo')) return;
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

  var path = location.pathname.replace(/^\/dr-site-preview/, '').replace(/\.html$/, '').replace(/\/index$/, '/');
  var norm = function (h) { return (h || '').replace(/^(\.\.?\/)+/, '/'); };
  var PRODUCT = ['/cap-table', '/scenario-modeling', '/diligence-room', '/ai-assistant', '/features', '/cap-table-version-history',
    '/safe-cap-table-modeling', '/google-drive-onedrive-data-room', '/fundraising-readiness', '/startup-due-diligence'];
  var section = null;
  if (/^\/learn(\/|$)/.test(path)) section = '/learn/';
  else if (path === '/for-advisors' || path === '/tour' || path === '/pricing') section = path;
  else if (PRODUCT.indexOf(path) > -1) section = 'product';

  var links = document.querySelectorAll('#nav .nav-links > a, #mobileMenu > a');
  links.forEach(function (a) {
    a.removeAttribute('aria-current');
    if (section && norm(a.getAttribute('href')) === section) a.setAttribute('aria-current', 'page');
  });
  if (section === 'product') {
    var btn = document.querySelector('#nav .nav-dd-btn');
    if (btn) btn.classList.add('is-current');
    document.querySelectorAll('#nav .nav-dd-menu a, #mobileMenu a.sub').forEach(function (a) {
      if (norm(a.getAttribute('href')) === path) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
    });
  }
})();

/* No widows: glue the last two words of every text block together so a line
   never ends with one word on its own. Runs once on load; CSS text-wrap:pretty
   does the same job in browsers that support it. */
(function () {
  'use strict';
  var SEL = 'h1,h2,h3,h4,p,li,dd,dt,summary,blockquote,figcaption,.st,.how-note,.hm-lead,.hm-card-link,.lp-tier-n,.lead,.section-title,.display,.final-card .lead';
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


