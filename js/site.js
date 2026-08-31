/* ============================================================
   EENOVATIVE — shared site behaviour
   nav / mobile menu / scroll reveals / counters /
   ambient particle canvas (inner pages) / contact form
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Active nav link ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here) a.classList.add('active');
  });

  /* ---------- Scroll reveals ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1400, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.firstChild.nodeValue = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
          else el.firstChild.nodeValue = target;
        }
        el.innerHTML = '0<b>' + suffix + '</b>';
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Ambient particle drift (inner pages) ---------- */
  var amb = document.getElementById('ambient');
  if (amb && !reduced) {
    var ctx = amb.getContext('2d');
    var W, H, pts = [];
    function sizeAmb() {
      W = amb.width = window.innerWidth;
      H = amb.height = window.innerHeight;
    }
    sizeAmb();
    window.addEventListener('resize', sizeAmb);
    var N = window.innerWidth < 720 ? 34 : 70;
    for (var i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * 2000, y: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.4,
        ember: Math.random() < 0.12
      });
    }
    var running = true;
    document.addEventListener('visibilitychange', function () { running = !document.hidden; });
    (function drift() {
      requestAnimationFrame(drift);
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x % (W + 20), p.y % (H + 20), p.r, 0, 6.283);
        ctx.fillStyle = p.ember ? 'rgba(255,138,61,0.5)' : 'rgba(109,163,255,0.38)';
        ctx.fill();
      }
      // faint links
      ctx.strokeStyle = 'rgba(77,141,255,0.07)';
      for (var a = 0; a < N; a++) {
        for (var b = a + 1; b < N; b++) {
          var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
          if (dx * dx + dy * dy < 16000) {
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
            ctx.stroke();
          }
        }
      }
    })();
  }

  /* ---------- Contact form -> Google Sheets via Apps Script ---------- */
  // After deploying apps-script/Code.gs as a Web App ("Anyone" access),
  // paste the /exec URL below.
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRwFo9DQ4p18win90S-oGDar4D23hIX1JFnCL-Z21Ero5Vamymk7a50umrXa1MnEZB/exec';

  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var statusEl = document.getElementById('statusText');
      var btn = document.getElementById('submitBtn');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.source = 'eenovative-website';

      if (SCRIPT_URL.indexOf('PASTE_') === 0) {
        statusEl.textContent = 'Form endpoint not configured yet — please email hello@eenovative-technologies.ai';
        statusEl.className = 'status err';
        return;
      }

      statusEl.textContent = 'Sending…';
      statusEl.className = 'status';
      btn.disabled = true;

      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json(); })
        .then(function (res) {
          if (res && res.success) {
            statusEl.textContent = res.message || 'Message sent. Your enquiry has been saved — we will be in touch soon.';
            statusEl.className = 'status ok';
            form.reset();
          } else {
            throw new Error((res && res.message) || 'Unexpected response');
          }
        })
        .catch(function () {
          statusEl.textContent = 'Could not send right now. Please email hello@eenovative-technologies.ai directly.';
          statusEl.className = 'status err';
        })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
