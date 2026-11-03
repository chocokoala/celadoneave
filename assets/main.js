// Celadon Eave — page behaviour

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

// Forms: no backend connected yet. Swap this for Klaviyo / Mailchimp / Formspree when ready.
document.querySelectorAll('form').forEach(function (form) {
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var msg = form.querySelector('.form-msg');
    if (msg) {
      msg.textContent = form.dataset.success || "Thank you. We'll be in touch.";
      msg.classList.add('show');
    }
    form.reset();
  });
});
