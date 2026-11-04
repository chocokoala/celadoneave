// Celadon Eave — page behaviour

// Compact sticky header after the first bit of scroll
(function () {
  var ticking = false;
  function update() {
    document.body.classList.toggle('is-scrolled', window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// Lotus medallion turns with the scroll (eased so it glides rather than snaps)
(function () {
  var el = document.querySelector('.medallion');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var DEG_PER_PX = 0.25;      // 1440px of scroll = one full turn
  var current = 0, target = 0, running = false;
  function frame() {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.05) { current = target; running = false; }
    el.style.setProperty('--spin', current.toFixed(2) + 'deg');
    if (running) requestAnimationFrame(frame);
  }
  function onScroll() {
    target = window.scrollY * DEG_PER_PX;
    if (!running) { running = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  current = target = window.scrollY * DEG_PER_PX;
  el.style.setProperty('--spin', current.toFixed(2) + 'deg');
})();

// Reveal on scroll
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Every "Pre-Order" / "Subscribe" link scrolls to the hero signup and focuses the email field
document.querySelectorAll('.js-focus-signup').forEach(function (link) {
  link.addEventListener('click', function (ev) {
    ev.preventDefault();
    var form = document.getElementById('signup');
    var input = document.getElementById('signup-email');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { input.focus({ preventScroll: true }); }, 500);
  });
});

// Forms: sent to a Google Apps Script web app that appends rows to a Google Sheet
// (tab "Signups" for the hero form, tab "Contact" for the contact form).
// Paste the web app URL below after deploying the script. While it is empty, forms just show the thank-you message.
var FORM_ENDPOINT = '';

document.querySelectorAll('form').forEach(function (form) {
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    function show(text) {
      if (msg) { msg.textContent = text; msg.classList.add('show'); }
    }
    var okText = form.dataset.success || "Thank you. We'll be in touch.";
    var errText = "Something went wrong. Please try again in a moment.";
    var data = new FormData(form);
    if (data.get('website')) { show(okText); form.reset(); return; }   // spam trap
    if (!FORM_ENDPOINT) { show(okText); form.reset(); return; }
    var body = new URLSearchParams();
    data.forEach(function (v, k) { if (k !== 'website') body.append(k, v); });
    body.append('form', form.dataset.form || 'signups');
    body.append('page', location.href);
    if (btn) btn.disabled = true;
    // no-cors: the response can't be read, but a resolved fetch means the request was delivered
    fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () { show(okText); form.reset(); })
      .catch(function () { show(errText); })
      .then(function () { if (btn) btn.disabled = false; });
  });
});
