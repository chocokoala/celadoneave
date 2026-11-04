/* Celadon Eave — product page */
(function () {
  // Accordions
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Photos fade in once they are on screen and decoded.
  // Hero and gallery photos wait for each other so they appear together.
  function ready(img) {
    return new Promise(function (res) {
      if (!img || (img.complete && img.naturalWidth)) return res();
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
    });
  }
  function reveal(target) {
    var crops = target.classList.contains('crop') ? [target] : Array.prototype.slice.call(target.querySelectorAll('.crop'));
    crops.forEach(function (c) { var i = c.querySelector('img'); if (i) i.loading = 'eager'; });
    Promise.all(crops.map(function (c) { return ready(c.querySelector('img')); })).then(function () {
      requestAnimationFrame(function () { crops.forEach(function (c) { c.classList.add('is-in'); }); });
    });
  }
  var groups = Array.prototype.slice.call(document.querySelectorAll('.pdp-hero, .g-stage'));
  var singles = Array.prototype.filter.call(document.querySelectorAll('.crop'), function (c) {
    return !groups.some(function (g) { return g.contains(c); });
  });
  var targets = groups.concat(singles);
  if (!('IntersectionObserver' in window)) { targets.forEach(reveal); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); reveal(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  targets.forEach(function (t) { io.observe(t); });
})();
