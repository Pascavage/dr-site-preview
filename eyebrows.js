/* Section eyebrows: draw the highlighter (or the coral underline on navy) as each one scrolls into view.
   The homepage and landing pages do this in home.js; every other page loads this file. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var marks = document.querySelectorAll('.eyebrow');
  if (!marks.length) return;
  document.body.classList.add('ink-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 1 });
  marks.forEach(function (m) { io.observe(m); });
})();
