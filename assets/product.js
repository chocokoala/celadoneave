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

  // Photos fade in once they are on screen and decoded
  var crops = document.querySelectorAll('.crop');
  function show(el) {
    var img = el.querySelector('img');
    var go = function () { requestAnimationFrame(function () { el.classList.add('is-in'); }); };
    if (!img || (img.complete && img.naturalWidth)) return go();
    img.addEventListener('load', go, { once: true });
    img.addEventListener('error', go, { once: true });
  }
  if (!('IntersectionObserver' in window)) { crops.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); show(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
  crops.forEach(function (c) { io.observe(c); });
})();
