/* Shared background for the inner pages, so they match the homepage and landing pages:
   1) the navy hero gets the homepage's drifting dot grid and soft coral glows;
   2) the cream part of the page gets the same "universe" (dot patches, faint rings, blurred blobs)
      as the homepage, generated fresh on each load (same code as home.js). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.replace(/site-bg\.js.*$/, '') : '/';

  // ---- 1. navy hero
  var heroEl = document.querySelector('main .feat-hero, main .page-hero, main .legal-hero, main .hero-v3');
  if (heroEl && !heroEl.querySelector('.hm-dots')) {
    heroEl.classList.add('sub-hero-bg');
    var d = document.createElement('div');
    d.className = 'hm-dots hm-drift';
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = '--dx:8px;--dy:8px;--s:1;--t:22s';
    var g = document.createElement('div');
    g.className = 'sub-glows';
    g.setAttribute('aria-hidden', 'true');
    var H = base + 'assets/home/hero/';
    [['shot-glow', 'left:-34px;top:-119px;width:880px;height:689px;--dx:22px;--dy:14px;--s:1.1;--t:18s'],
     ['glow', 'left:-46px;top:-47px;width:904px;height:655px;--dx:22px;--dy:16px;--s:1.12;--t:16s;--d:-4s'],
     ['deco1', 'left:-7px;top:156px;width:142px;height:142px;--dx:-18px;--dy:14px;--s:1.1;--t:15s;--d:-6s'],
     ['deco9', 'left:818px;top:122px;width:106px;height:106px;--dx:-18px;--dy:16px;--s:1.12;--t:16s;--d:-8s'],
     ['deco7', 'left:781px;top:371px;width:166px;height:166px;--dx:-30px;--dy:22px;--s:1.12;--t:21s;--d:-2s'],
     ['deco3', 'left:34px;top:25px;width:96px;height:96px;--dx:24px;--dy:18px;--s:1.12;--t:17s;--d:-3s'],
     ['deco5', 'left:739px;top:70px;width:4px;height:4px;--dx:-8px;--dy:6px;--t:11s;--d:-3s'],
     ['deco4', 'left:727px;top:10px;width:6px;height:6px;--dx:8px;--dy:8px;--t:9s']
    ].forEach(function (x) {
      var i = document.createElement('img');
      i.src = H + x[0] + '.svg'; i.alt = ''; i.className = 'hm-deco hm-drift'; i.style.cssText = x[1];
      g.appendChild(i);
    });
    heroEl.insertBefore(g, heroEl.firstChild);
    heroEl.insertBefore(d, heroEl.firstChild);
    // pause the drift while the hero is off-screen
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
      heroEl.classList.toggle('is-paused', !e[0].isIntersecting);
    }).observe(heroEl);
  }

  // ---- 2. cream "universe"
  (function buildUniverse() {
    var layer = document.getElementById('hmUniverse');
    var main = document.querySelector('main');
    var hero = main && main.querySelector('.feat-hero, .page-hero, .legal-hero, .hero-v3');
    var first = document.querySelector('[data-uni-first]') || (hero ? hero.nextElementSibling : main && main.firstElementChild);
    if (!layer || !main || !first) return;
    var R = Math.random;
    var rr = function (a, b) { return a + R() * (b - a); };
    var pick = function (a) { return a[Math.floor(R() * a.length)]; };
    var RING_OP = [0.126, 0.1008, 0.0882], BLOB = ['#D44A3B', '#5A78C8'];

    // the layer starts where the cream curtain starts
    // ...and stops where the navy final CTA band starts
    var last = document.querySelector('main > [data-screen-label="Final CTA"]');
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
})();
