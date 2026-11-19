/* Preview copy only: the demo video is stored in three parts (the upload used for this preview
   caps file size), and they are joined in the browser the first time the video plays. */
(function () {
  'use strict';
  var NAME = 'diligence-ready-demo.mp4', PARTS = 3, cache = null;
  function blobUrl(abs) {
    if (!cache) {
      var reqs = [];
      for (var i = 0; i < PARTS; i++) reqs.push(fetch(abs + '.part' + i).then(function (r) { return r.arrayBuffer(); }));
      cache = Promise.all(reqs).then(function (bufs) { return URL.createObjectURL(new Blob(bufs, { type: 'video/mp4' })); });
    }
    return cache;
  }
  function hook(proto) {
    var d = Object.getOwnPropertyDescriptor(proto, 'src');
    if (!d) return;
    Object.defineProperty(proto, 'src', {
      configurable: true, enumerable: d.enumerable,
      get: function () { return d.get.call(this); },
      set: function (v) {
        var el = this;
        if (typeof v === 'string' && v.indexOf(NAME) > -1 && v.indexOf('blob:') !== 0) {
          var abs = new URL(v, location.href).href.replace(/[?#].*$/, '');
          blobUrl(abs).then(function (u) {
            d.set.call(el, u);
            var media = el.tagName === 'SOURCE' ? el.parentNode : el;
            if (!media) return;
            if (el.tagName === 'SOURCE') media.load();
            var p = media.play && media.play(); if (p && p.catch) p.catch(function () {});
          });
          return;
        }
        d.set.call(el, v);
      }
    });
  }
  hook(HTMLMediaElement.prototype);
  hook(HTMLSourceElement.prototype);
})();
