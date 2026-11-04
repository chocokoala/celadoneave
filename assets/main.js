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

// City autocomplete for the contact form: type a city, pick "City, Country".
// Uses assets/cities.js (cities of 15k+ people, "Name|CC" per line, biggest first). Anything typed is still accepted.
(function () {
  var input = document.getElementById('cf-place');
  var list = document.getElementById('cf-place-list');
  if (!input || !list) return;
  var cities = null, loading = false, active = -1, shown = [];
  var names = window.Intl && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
  var OVERRIDE = { US: 'USA', GB: 'UK' };
  function country(cc) {
    if (OVERRIDE[cc]) return OVERRIDE[cc];
    try { return names ? names.of(cc) : cc; } catch (e) { return cc; }
  }
  function fold(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function load() {
    if (cities || loading) return;
    loading = true;
    // A <script> tag (not fetch) so it also works when the page is opened straight from disk
    var s = document.createElement('script');
    s.src = 'assets/cities.js';
    s.onload = function () {
      cities = window.CE_CITIES.split('\n').map(function (l) {
        var p = l.split('|');
        return { n: p[0], c: p[1], f: fold(p[0]) };
      });
      if (document.activeElement === input) render();
    };
    s.onerror = function () { loading = false; };
    document.head.appendChild(s);
  }
  function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; }
  function pick(i) {
    var m = shown[i]; if (!m) return;
    input.value = m.n + ', ' + country(m.c);
    close();
  }
  function highlight() {
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.setAttribute('aria-selected', i === active ? 'true' : 'false');
    });
  }
  function render() {
    var q = fold(input.value.trim());
    if (!cities || q.length < 2) { close(); return; }
    var starts = [], words = [];
    for (var i = 0; i < cities.length && starts.length < 6; i++) {
      var f = cities[i].f;
      if (f.indexOf(q) === 0) starts.push(cities[i]);
      else if (words.length < 6 && f.indexOf(' ' + q) > -1) words.push(cities[i]);
    }
    shown = starts.concat(words).slice(0, 6);
    if (!shown.length) { close(); return; }
    list.innerHTML = '';
    shown.forEach(function (m, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.appendChild(document.createTextNode(m.n + ', '));
      var span = document.createElement('span');
      span.className = 'place-country';
      span.textContent = country(m.c);
      li.appendChild(span);
      li.addEventListener('mousedown', function (ev) { ev.preventDefault(); pick(i); });
      list.appendChild(li);
    });
    active = -1;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  input.addEventListener('focus', load);
  input.addEventListener('input', function () { load(); render(); });
  input.addEventListener('blur', close);
  input.addEventListener('keydown', function (ev) {
    if (list.hidden) return;
    if (ev.key === 'ArrowDown') { ev.preventDefault(); active = (active + 1) % shown.length; highlight(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); active = (active - 1 + shown.length) % shown.length; highlight(); }
    else if (ev.key === 'Enter' && active > -1) { ev.preventDefault(); pick(active); }
    else if (ev.key === 'Escape') { close(); }
  });
})();

// Forms: sent to a Google Apps Script web app that appends rows to a Google Sheet
// (tab "Signups" for the hero form, tab "Contact" for the contact form).
// Paste the web app URL below after deploying the script. While it is empty, forms just show the thank-you message.
var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwL_kISG5FESvRcBxNYDGKaeHt_rK_EPEWLvpGiBGIwMrmUpDxuAbCBvZM3FGRiht7SuQ/exec';

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
    // Show the thank-you straight away; the data goes to the Sheet in the background.
    if (btn) btn.disabled = true;
    show(okText);
    form.reset();
    // no-cors: the response can't be read, but a resolved fetch means the request was delivered
    fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body, keepalive: true })
      .catch(function () { show(errText); })
      .then(function () { if (btn) btn.disabled = false; });
  });
});
