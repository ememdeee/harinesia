(function () {
  // Link & label tombol beli sudah ditulis build.js dari data/situs.json.
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // --- toast kecil ---
  var toast = document.querySelector('[data-toast]');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 3200);
  }

  // --- tombol beli yang link-nya belum ada: cuma munculin pesan ---
  each(document.querySelectorAll('[data-buy][data-pending]'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showToast((toast && toast.getAttribute('data-pesan')) || 'Link pembelian segera hadir.');
    });
  });

  // --- kartu tebak: bagian pertanyaannya disamain tingginya (kalau tampil sejajar),
  //     jadi kotaknya rata dan yang memanjang cuma kartu yang dibuka ---
  var quiz = document.querySelector('.quiz');
  if (quiz) {
    var questions = quiz.querySelectorAll('summary');
    var equalize = function () {
      each(questions, function (s) { s.style.minHeight = ''; });
      if (getComputedStyle(quiz).gridTemplateColumns.split(' ').length < 2) return;
      var tallest = 0;
      each(questions, function (s) { tallest = Math.max(tallest, s.offsetHeight); });
      each(questions, function (s) { s.style.minHeight = tallest + 'px'; });
    };
    var resizeTimer;
    equalize();
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(equalize, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalize);
  }

  // --- FAQ & kartu tebak: buka/tutup dengan tinggi yang memanjang/menyusut halus ---
  // Kalau diklik lagi di tengah animasi, dia langsung balik arah dari posisi sekarang.
  if (!reduceMotion && Element.prototype.animate) {
    each(document.querySelectorAll('.faq details, .quiz details'), function (d) {
      var summary = d.querySelector('summary');
      var body = summary && summary.nextElementSibling;
      if (!body) return;
      var anim = null;

      var toggle = function (open) {
        var from = null;
        if (anim) {
          var now = getComputedStyle(body);
          from = { height: now.height, paddingTop: now.paddingTop, paddingBottom: now.paddingBottom, opacity: now.opacity };
          anim.cancel();
        }
        if (open) { d.classList.remove('is-closing'); d.open = true; } else { d.classList.add('is-closing'); }
        var cs = getComputedStyle(body);
        var full = { height: body.offsetHeight + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 };
        var zero = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
        body.style.overflow = 'hidden';
        anim = body.animate([from || (open ? zero : full), open ? full : zero], {
          duration: open ? 340 : 260,
          easing: open ? 'cubic-bezier(0.2, 0.8, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.7, 1)',
        });
        anim.onfinish = function () {
          anim = null;
          body.style.overflow = '';
          if (!open) { d.open = false; d.classList.remove('is-closing'); }
        };
      };

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        toggle(!d.open || d.classList.contains('is-closing'));
      });
    });
  }

  // --- animasi di bagian yang lagi di luar layar dihentikan (hemat CPU & baterai HP) ---
  if (hasIO) {
    var animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('anim-off', !e.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    each(document.querySelectorAll('[data-anim]'), function (el) { animObserver.observe(el); });
  }

  // --- bar beli di HP: muncul setelah lewat tombol hero, ngumpet di area harga/penutup ---
  var bar = document.querySelector('[data-buybar]');
  var heroCta = document.querySelector('[data-hero-cta]');
  if (bar && heroCta && hasIO) {
    var pastHero = false;
    var zonesInView = 0;
    var updateBar = function () { bar.classList.toggle('is-on', pastHero && zonesInView === 0); };

    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; });
      updateBar();
    }).observe(heroCta);

    var zoneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var was = e.target.hasAttribute('data-in-view');
        if (e.isIntersecting && !was) { e.target.setAttribute('data-in-view', ''); zonesInView++; }
        if (!e.isIntersecting && was) { e.target.removeAttribute('data-in-view'); zonesInView--; }
      });
      updateBar();
    }, { rootMargin: '-80px 0px 0px 0px' }); // bagian yang ketutup header sticky nggak dihitung kelihatan
    each(document.querySelectorAll('[data-hide-buybar]'), function (z) { zoneObserver.observe(z); });
  }

  // ================= video di hero =================
  // Klip pendek yang gantian diputar: di HP (Panduan) dan di dua kartu samping maskot (Home).
  // Klipnya baru diunduh setelah halaman selesai dimuat dan bagiannya kelihatan, dan cuma
  // diputar sendiri kalau pengunjung nggak minta "kurangi gerakan" / hemat data. Selain itu
  // tetap bisa diputar dengan diketuk.
  var autoplay = !reduceMotion && !(navigator.connection && navigator.connection.saveData);
  var pageLoaded = document.readyState === 'complete';
  var onLoaded = [];
  window.addEventListener('load', function () { pageLoaded = true; onLoaded.forEach(function (fn) { fn(); }); });
  var afterLoad = function (fn) { if (pageLoaded) fn(); else onLoaded.push(fn); };
  var restart = function (el, cls) { // animasi CSS-nya diulang dari awal
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };
  var loadVideo = function (v) {
    if (v.getAttribute('src')) return;
    v.poster = v.getAttribute('data-poster');
    v.preload = 'auto';
    v.src = v.getAttribute('data-src');
  };

  each(document.querySelectorAll('[data-feed]'), function (deck) {
    var slides = deck.querySelectorAll('video.klip');
    var art = deck.closest('.hero-art');
    var bubble = art.querySelector('[data-feed-bubble]');
    var segs = deck.querySelectorAll('.feed-bar i'); // bar progres per topik (HP di Panduan)
    var btn = deck.querySelector('.feed-next');
    var cur = 0, visible = false, wanted = autoplay, raf = null;

    var tickBar = function () {
      raf = null;
      var v = slides[cur];
      if (segs[cur] && v.duration) segs[cur].style.setProperty('--p', (v.currentTime / v.duration).toFixed(3));
      if (!v.paused) raf = requestAnimationFrame(tickBar);
    };
    var play = function () {
      var v = slides[cur];
      loadVideo(v);
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { deck.classList.remove('is-playing'); });
    };
    var go = function (i) {
      var prev = slides[cur];
      cur = (i + slides.length) % slides.length;
      var v = slides[cur];
      each(segs, function (s, k) { s.classList.toggle('is-done', k < cur); s.style.removeProperty('--p'); });
      loadVideo(v);
      prev.classList.remove('is-on');
      prev.classList.add('is-prev');
      v.classList.add('is-on');
      setTimeout(function () { prev.classList.remove('is-prev'); prev.pause(); }, 520);
      // maskot bereaksi: gelembungnya ganti kata, kepalanya geleng sekali
      bubble.textContent = v.getAttribute('data-gelembung');
      restart(bubble, 'is-pop');
      if (!reduceMotion) restart(art, 'is-aha');
      try { v.currentTime = 0; } catch (e) { /* belum dimuat */ }
      if (wanted && visible) play();
    };

    each(slides, function (v, i) {
      v.addEventListener('playing', function () {
        if (i !== cur) return;
        deck.classList.add('is-playing');
        if (raf === null) raf = requestAnimationFrame(tickBar);
        loadVideo(slides[(i + 1) % slides.length]); // topik berikutnya disiapin
      });
      v.addEventListener('pause', function () { if (i === cur) deck.classList.remove('is-playing'); });
      v.addEventListener('ended', function () { if (i === cur) go(cur + 1); });
    });

    if (btn) btn.addEventListener('click', function () {
      if (!wanted || slides[cur].paused) { wanted = true; play(); } else go(cur + 1);
    });
    // klip berhenti kalau discroll lewat, jalan lagi pas kelihatan
    var onScreen = function (on) {
      visible = on;
      if (!on) { if (!slides[cur].paused) slides[cur].pause(); return; }
      afterLoad(function () { if (wanted && visible) play(); });
    };
    if (hasIO) new IntersectionObserver(function (e) { onScreen(e[0].isIntersecting); }, { rootMargin: '80px 0px' }).observe(deck);
    else onScreen(true);
  });

  if (reduceMotion || !hasIO) return;

  // ================= animasi =================

  // --- muncul saat discroll: elemen yang masuk layar barengan dikasih jeda berurutan ---
  var revealSelector = [
    '.section-head', '.quiz > .q', '.reel > li', '.video-grid > li', '.reel-more',
    '.beats-player', '.beats > li', '.cards > .card', '.modules > li', '.draft-note',
    '.fit > .fit-col', '.about', '.mascot-peek', '.price-card', '.faq > details',
    '.closing .mascot', '.closing h2', '.closing .lead', '.closing .cta-row', '.closing .price-line',
    '.promo', '.ask > *'
  ].join(',');

  var revealObserver = new IntersectionObserver(function (entries) {
    var shown = entries.filter(function (e) { return e.isIntersecting; });
    shown.sort(function (a, b) {
      return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left);
    });
    var show = function (el, i) {
      el.style.setProperty('--d', (Math.min(i, 5) * 0.09) + 's');
      el.classList.add('is-in');
      revealObserver.unobserve(el);
    };
    shown.forEach(function (e, i) {
      // kartu di deretan geser muncul barengan, termasuk yang masih di luar layar ke samping
      if (e.target.parentNode.classList.contains('reel')) {
        each(e.target.parentNode.children, function (li, j) { if (!li.classList.contains('is-in')) show(li, j); });
        return;
      }
      show(e.target, i);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  // baca posisi semua elemen dulu, baru ubah kelasnya, biar browser cuma ngitung layout sekali
  // (yang sudah kelihatan pas halaman dibuka dibiarin, biar nggak kedip)
  var viewportH = window.innerHeight;
  var belowFold = Array.prototype.filter.call(document.querySelectorAll(revealSelector), function (el) {
    return el.getBoundingClientRect().top >= viewportH;
  });
  belowFold.forEach(function (el) {
    el.classList.add('reveal');
    el.addEventListener('transitionend', function done(e) {
      if (e.target !== el || e.propertyName !== 'transform') return;
      el.classList.remove('reveal');
      el.style.removeProperty('--d');
      el.removeEventListener('transitionend', done);
    });
    revealObserver.observe(el);
  });

  // --- angka naik dari 0 ---
  function countUp(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var decimals = (raw.split('.')[1] || '').length;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / 1200, 1);
      var v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(decimals).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countUp(e.target);
      countObserver.unobserve(e.target);
    });
  }, { threshold: 1 });
  each(document.querySelectorAll('[data-count]'), function (el) { countObserver.observe(el); });

  // --- deretan video: sekali "ngintip" ke samping biar kelihatan bisa digeser ---
  var reel = document.querySelector('.reel');
  if (reel) {
    var reelObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      reelObserver.disconnect();
      if (reel.scrollWidth - reel.clientWidth < 20 || reel.scrollLeft > 0) return;
      setTimeout(function () {
        reel.scrollTo({ left: 64, behavior: 'smooth' });
        setTimeout(function () { if (reel.scrollLeft <= 64) reel.scrollTo({ left: 0, behavior: 'smooth' }); }, 700);
      }, 600);
    }, { threshold: 0.6 });
    reelObserver.observe(reel);
  }

  // --- resep 60 detik: playhead jalan, bagian yang aktif ikut nyala ---
  var player = document.querySelector('[data-beats]');
  if (player) {
    var segs = player.querySelectorAll('[data-from]');
    var beatCards = document.querySelectorAll('.beats > li');
    var head = player.querySelector('.playhead');
    var clock = player.querySelector('[data-beats-clock]');
    var LOOP_MS = 15000; // 60 detik video diputar dalam 15 detik
    var TOTAL = +segs[segs.length - 1].getAttribute('data-to');
    var raf = null, t0 = null, active = -1, lastSec = -1, geo = null;

    // posisi tiap segmen diukur sekali (dan ulang kalau layar berubah ukuran), bukan tiap frame
    var measure = function () {
      geo = Array.prototype.map.call(segs, function (s) {
        return { from: +s.getAttribute('data-from'), to: +s.getAttribute('data-to'), x: s.offsetLeft, w: s.offsetWidth };
      });
    };
    window.addEventListener('resize', function () { geo = null; });

    var frame = function (ts) {
      if (t0 === null) t0 = ts;
      if (geo === null) measure();
      var t = ((ts - t0) % LOOP_MS) / LOOP_MS * TOTAL;
      for (var i = 0; i < geo.length; i++) {
        var g = geo[i];
        if (t < g.to || i === geo.length - 1) {
          var x = g.x + Math.min((t - g.from) / (g.to - g.from), 1) * g.w;
          head.style.transform = 'translateX(' + x + 'px)';
          if (i !== active) {
            if (active > -1) { segs[active].classList.remove('is-active'); beatCards[active] && beatCards[active].classList.remove('is-active'); }
            segs[i].classList.add('is-active');
            if (beatCards[i]) beatCards[i].classList.add('is-active');
            active = i;
          }
          break;
        }
      }
      var sec = Math.floor(t);
      if (sec !== lastSec) { clock.textContent = '0:' + (sec < 10 ? '0' : '') + sec; lastSec = sec; }
      raf = requestAnimationFrame(frame);
    };

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        player.classList.add('beats-on');
        if (raf === null) raf = requestAnimationFrame(frame);
      } else if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null; t0 = null;
      }
    }).observe(player);
  }
})();
