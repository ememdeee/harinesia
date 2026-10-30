(function () {
  // Link & label tombol beli sudah ditulis build.js dari data/situs.json.
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // ================= statistik (Umami + Google Tag Manager/GA4) =================
  // Asal pengunjung dicatat sekali pas pertama masuk, lalu dibawa ke halaman berikutnya (selama
  // tab-nya kebuka), jadi yang masuk lewat Home terus klik Beli di Panduan tetap kecatat asalnya.
  // Urutan: ?utm_source=... di link bio > browser bawaan TikTok/IG/FB > situs asal > "langsung".
  var sumber = (function () {
    var KUNCI = 'harinesia-sumber';
    try { var lama = sessionStorage.getItem(KUNCI); if (lama) return lama; } catch (e) { /* mode privat */ }
    var utm = /[?&]utm_source=([^&#]*)/.exec(location.search);
    var s = utm ? decodeURIComponent(utm[1]).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) : '';
    var ua = navigator.userAgent;
    if (!s) {
      if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) s = 'tiktok';
      else if (/Instagram/.test(ua)) s = 'instagram';
      else if (/FBAN|FBAV|FB_IAB/.test(ua)) s = 'facebook';
    }
    if (!s && document.referrer) {
      var asal = '';
      try { asal = new URL(document.referrer).hostname.replace(/^(www|m|l|lm)\./, ''); } catch (e) { /* referrer aneh */ }
      var KENAL = [[/tiktok\.com$/, 'tiktok'], [/instagram\.com$/, 'instagram'], [/youtube\.com$|youtu\.be$/, 'youtube'],
        [/facebook\.com$|fb\.me$/, 'facebook'], [/^t\.co$|twitter\.com$|^x\.com$/, 'x'], [/whatsapp|wa\.me$/, 'whatsapp'],
        [/threads\.net$/, 'threads'], [/google\./, 'google'], [/bing\.com$/, 'bing']];
      if (asal && asal !== location.hostname.replace(/^www\./, '')) {
        s = asal;
        for (var i = 0; i < KENAL.length; i++) if (KENAL[i][0].test(asal)) { s = KENAL[i][1]; break; }
      }
    }
    s = s || 'langsung';
    try { sessionStorage.setItem(KUNCI, s); } catch (e) { /* mode privat */ }
    return s;
  })();
  // catat('klik-beli', { tombol: 'hero' }) -> event di Umami, selalu ditempeli asal pengunjung.
  // Script Umami dimuat async, jadi event yang muncul sebelum script-nya siap diantre dulu.
  var antreStatistik = [];
  var catat = function (nama, data) {
    data = data || {};
    data.sumber = sumber;
    // di komputer sendiri (Live Server dll.) Umami nggak ngitung, jadi event-nya ditampilin di Console (F12) buat dicek
    if (/^(localhost|127\.|192\.168\.)/.test(location.hostname) && window.console) console.info('[statistik]', nama, JSON.stringify(data));
    // ke GTM juga (buat GA4); nama event GA4 nggak boleh pakai tanda hubung, jadi klik-beli -> klik_beli
    if (window.dataLayer) {
      var pesan = { event: nama.replace(/-/g, '_') };
      for (var k in data) if (data.hasOwnProperty(k)) pesan[k] = data[k];
      dataLayer.push(pesan);
    }
    if (window.umami && umami.track) return umami.track(nama, data);
    antreStatistik.push([nama, data]);
  };
  var tagUmami = document.getElementById('umami-script');
  if (tagUmami) tagUmami.addEventListener('load', function () {
    if (!window.umami || !umami.track) return;
    antreStatistik.forEach(function (e) { umami.track(e[0], e[1]); });
    antreStatistik = [];
  });

  // klik "Beli sekarang", plus dari tombol yang mana
  var sudahKlikBeli = false;
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-buy]');
    if (!t) return;
    sudahKlikBeli = true;
    try { sessionStorage.setItem('harinesia-klik-beli', '1'); } catch (err) { /* mode privat */ } // buat survei kalau balik lagi
    var tombol = t.closest('.site-header') ? 'header' : t.closest('.buybar') ? 'bar-bawah' : t.closest('[data-kupon]') ? 'popup-kupon'
      : t.closest('.hero') ? 'hero' : t.closest('#harga') ? 'harga' : t.closest('.closing') ? 'penutup' : 'lainnya';
    var terkirim = catat('klik-beli', { tombol: tombol });
    // link ke checkout di tab yang sama: tunggu event-nya kekirim dulu (maks. 0,4 detik), baru pindah halaman
    if (!terkirim || t.hasAttribute('data-pending') || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || t.target === '_blank') return;
    e.preventDefault();
    var sudahPergi = false;
    var pergi = function () { if (!sudahPergi) { sudahPergi = true; location.href = t.href; } };
    Promise.resolve(terkirim).then(pergi, pergi);
    setTimeout(pergi, 400);
  });

  // sampai di bagian mana (sekali per bagian): bagian dianggap dibaca kalau sudah naik ke setengah atas layar
  if (hasIO) {
    var bagianDibaca = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        bagianDibaca.unobserve(e.target);
        catat('sampai-bagian', { bagian: e.target.id });
      });
    }, { rootMargin: '0px 0px -50% 0px' });
    each(document.querySelectorAll('main section[id]'), function (s) { bagianDibaca.observe(s); });
  }

  // pertanyaan FAQ yang dibuka (sekali per pertanyaan): biasanya itu keraguan pengunjung
  each(document.querySelectorAll('.faq details'), function (d) {
    var sudah = false;
    d.addEventListener('toggle', function () {
      if (!d.open || sudah) return;
      sudah = true;
      catat('buka-faq', { tanya: d.querySelector('summary').textContent.trim().slice(0, 80) });
    });
  });

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

  // --- salin teks ke clipboard; tombolnya nunjukin labelSelesai ("Tersalin!") sebentar ---
  var salinTeks = function (teks, tombol, labelSelesai) {
    if (!tombol.hasAttribute('data-label')) tombol.setAttribute('data-label', tombol.textContent);
    var selesai = function () {
      tombol.textContent = labelSelesai;
      setTimeout(function () { tombol.textContent = tombol.getAttribute('data-label'); }, 2000);
    };
    var cadangan = function () { // browser lama: lewat textarea sementara (ditaruh di sebelah tombol biar tetap jalan di dalam popup)
      var t = document.createElement('textarea');
      t.value = teks;
      t.setAttribute('readonly', '');
      t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      tombol.parentNode.appendChild(t);
      t.select();
      try { if (document.execCommand('copy')) selesai(); } catch (e) { /* biarin, disalin manual */ }
      t.parentNode.removeChild(t);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(teks).then(selesai, cadangan);
    else cadangan();
  };

  // --- alat internal /buat-kupon/: bikin kode kupon acak & ganti kode yang aktif di popup ---
  // Kode acaknya dibikin di browser. Kode aktif disimpan di Google Sheet (tab Kupon) lewat Apps
  // Script, dan cuma bisa dicek/diganti pakai PIN yang disetel di Apps Script (bukan di website).
  var pembuat = document.querySelector('[data-pembuat-kupon]');
  if (pembuat && window.crypto && crypto.getRandomValues) {
    var pd = pembuat.dataset;
    var pf = pembuat.querySelector('[data-pembuat-form]');
    var daftarKode = pembuat.querySelector('[data-pembuat-hasil]');
    var salinSemua = pembuat.querySelector('[data-pembuat-salin-semua]');
    var statusHasil = pembuat.querySelector('[data-hasil-status]');
    var pinForm = pembuat.querySelector('[data-aktif-form]');
    var pin = pinForm.elements.pin, tombolCek = pinForm.querySelector('button');
    var statusAktif = pembuat.querySelector('[data-aktif-status]');
    var tiketAktif = pembuat.querySelector('[data-aktif-tiket]');
    var KUNCI_PIN = 'harinesia-pin'; // diingat selama tab ini terbuka aja
    var semuaKode = [], kodeAktif = '';
    try { pin.value = sessionStorage.getItem(KUNCI_PIN) || ''; } catch (e) { /* mode privat */ }

    // tombol "Jadikan kode aktif" di kode yang sedang aktif berubah jadi "Aktif"
    var tandaiAktif = function () {
      each(daftarKode.querySelectorAll('[data-aktifkan]'), function (b) {
        var aktif = b.getAttribute('data-aktifkan') === kodeAktif;
        b.textContent = aktif ? pd.labelAktif : pd.labelAktifkan;
        b.disabled = aktif;
      });
    };
    var tampilAktif = function (r) {
      kodeAktif = r.kode || '';
      statusAktif.textContent = '';
      tiketAktif.hidden = !kodeAktif;
      tiketAktif.querySelector('code').textContent = kodeAktif;
      tiketAktif.querySelector('small').textContent = r.sejak ? pd.labelSejak + ' ' + r.sejak : '';
      tandaiAktif();
    };
    var PESAN = { wrong_pin: pd.errorPin, busy: pd.errorSibuk, no_pin: pd.errorBelumSetel, invalid_code: pd.errorKode };
    // kirim ke Apps Script; isi = {} buat ngecek, {kode} buat ganti. Hasilnya true kalau berhasil.
    var kirimAdmin = function (isi, tombol, status) {
      if (!pin.value) {
        status.textContent = pd.errorPinKosong;
        pin.focus();
        return Promise.resolve(false);
      }
      isi.pin = pin.value;
      var label = tombol.textContent;
      tombol.textContent = pd.loading;
      tombol.disabled = true;
      status.textContent = '';
      return fetch(pd.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // jangan application/json: ditolak Apps Script
        body: JSON.stringify({ kuponAdmin: isi }),
      })
        .then(function (res) { return res.json(); })
        .catch(function () { return { ok: false }; })
        .then(function (r) {
          tombol.textContent = label;
          tombol.disabled = false;
          if (r && r.ok) {
            try { sessionStorage.setItem(KUNCI_PIN, pin.value); } catch (e) { /* mode privat */ }
            tampilAktif(r);
            return true;
          }
          status.textContent = PESAN[r && r.error] || pd.errorKirim;
          if (r && r.error === 'wrong_pin') pin.focus();
          return false;
        });
    };
    var cekAktif = function () {
      kirimAdmin({}, tombolCek, statusAktif).then(function (ok) {
        if (ok && !kodeAktif) statusAktif.textContent = pd.belumAda;
      });
    };
    pinForm.addEventListener('submit', function (e) { e.preventDefault(); cekAktif(); });
    if (pin.value) cekAktif();

    var HURUF_SEMUA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var HURUF_AMAN = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // tanpa 0, O, 1, I, L
    // tiap huruf dipilih acak & adil: angka acak yang bikin pilihan berat sebelah dibuang
    var hurufAcak = function (huruf, n) {
      var hasil = '', batas = 256 - (256 % huruf.length), satu = new Uint8Array(1);
      while (hasil.length < n) {
        crypto.getRandomValues(satu);
        if (satu[0] < batas) hasil += huruf[satu[0] % huruf.length];
      }
      return hasil;
    };
    var bikinKode = function () {
      var f = pf.elements;
      var awalan = f.awalan.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
      var panjang = Math.min(12, Math.max(4, parseInt(f.panjang.value, 10) || 6));
      var jumlah = Math.min(20, Math.max(1, parseInt(f.jumlah.value, 10) || 1));
      f.awalan.value = awalan; f.panjang.value = panjang; f.jumlah.value = jumlah;
      var huruf = f.mirip.checked ? HURUF_AMAN : HURUF_SEMUA;
      var sambung = awalan && f.pemisah.checked ? '-' : '';
      semuaKode = [];
      while (semuaKode.length < jumlah) {
        var kode = awalan + sambung + hurufAcak(huruf, panjang);
        if (semuaKode.indexOf(kode) < 0) semuaKode.push(kode);
      }
      daftarKode.textContent = '';
      semuaKode.forEach(function (kode) {
        var li = document.createElement('li');
        li.className = 'kupon-tiket';
        var teks = document.createElement('code');
        teks.textContent = kode;
        var tombol = document.createElement('button');
        tombol.type = 'button';
        tombol.className = 'btn btn--sm';
        tombol.textContent = pembuat.dataset.labelSalin;
        tombol.addEventListener('click', function () { salinTeks(kode, tombol, pd.tersalin); });
        var aktifkan = document.createElement('button');
        aktifkan.type = 'button';
        aktifkan.className = 'btn btn--buy btn--sm';
        aktifkan.setAttribute('data-aktifkan', kode);
        aktifkan.addEventListener('click', function () {
          if (!window.confirm(pd.konfirmasi.replace('%KODE%', kode))) return;
          kirimAdmin({ kode: kode }, aktifkan, statusHasil).then(function (ok) {
            if (ok) statusHasil.textContent = pd.sukses.replace('%KODE%', kodeAktif);
          });
        });
        var tombolTombol = document.createElement('span');
        tombolTombol.className = 'alat-tombol';
        tombolTombol.appendChild(tombol);
        tombolTombol.appendChild(aktifkan);
        li.appendChild(teks);
        li.appendChild(tombolTombol);
        daftarKode.appendChild(li);
      });
      salinSemua.hidden = semuaKode.length < 2;
      statusHasil.textContent = '';
      tandaiAktif();
    };
    salinSemua.addEventListener('click', function () { salinTeks(semuaKode.join('\n'), salinSemua, pd.tersalin); });
    pf.addEventListener('submit', function (e) { e.preventDefault(); bikinKode(); });
    bikinKode();
  }

  // --- popup kupon (Panduan) ---
  // Muncul sekali, setelah pengunjung scroll sampai bagian data-bagian DAN sudah data-detik detik
  // di halaman. Ditutup = nggak muncul lagi selama data-jeda-hari hari; sudah daftar = nggak muncul
  // lagi. Nama & email dikirim ke Google Sheet, dan kuponnya baru tampil kalau datanya tersimpan.
  // Buat ngecek tampilannya: buka /panduan/?kupon (langsung muncul, abaikan ingatan browser).
  var kupon = document.querySelector('[data-kupon]');
  if (kupon && typeof kupon.showModal === 'function') {
    var kc = kupon.dataset;
    var KUNCI = 'harinesia-kupon';
    var ingat = function (nilai) { // mode cek (?kupon) nggak dicatat, biar popup aslinya tetap muncul
      if (paksa) return;
      try { localStorage.setItem(KUNCI, JSON.stringify(nilai)); } catch (e) { /* mode privat */ }
    };
    var catatan = null;
    try { catatan = JSON.parse(localStorage.getItem(KUNCI)); } catch (e) { /* mode privat */ }
    var paksa = /[?&]kupon\b/.test(location.search);
    var catatKupon = function (nama, data) { if (!paksa) catat(nama, data); }; // mode cek nggak ikut statistik
    var lewati = !paksa && catatan && (catatan.s === 'daftar' || (catatan.s === 'tutup' && Date.now() - catatan.t < (+kc.jedaHari || 7) * 864e5));
    var selesai = false, sudahMuncul = false, cukupLama = paksa, sudahSampai = paksa;

    var munculkan = function () {
      if (lewati || sudahMuncul || !cukupLama || !sudahSampai || document.querySelector('dialog[open]')) return;
      sudahMuncul = true;
      kupon.showModal();
      catatKupon('kupon-muncul');
      muatDaftarSementara(); // disiapin selagi pengunjung ngisi form
    };
    setTimeout(function () { cukupLama = true; munculkan(); }, paksa ? 600 : (+kc.detik || 25) * 1000);
    var bagian = document.getElementById(kc.bagian);
    if (!paksa && bagian && hasIO) {
      // dianggap "sampai" kalau bagian itu sudah naik ke 60% atas layar, atau sudah kelewat
      // (mis. browser balikin posisi scroll ke bawah pas halaman di-refresh)
      var pemicu = new IntersectionObserver(function (entries) {
        var e = entries[0];
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        pemicu.disconnect();
        sudahSampai = true;
        munculkan();
      }, { rootMargin: '0px 0px -40% 0px' });
      pemicu.observe(bagian);
    } else {
      sudahSampai = true;
    }

    // tutup: tombol ×, klik di luar kartu, atau Esc
    kupon.querySelector('[data-kupon-tutup]').addEventListener('click', function () { kupon.close(); });
    kupon.addEventListener('click', function (e) { if (e.target === kupon) kupon.close(); });
    kupon.addEventListener('close', function () {
      if (selesai) return;
      ingat({ s: 'tutup', t: Date.now() });
      catatKupon('kupon-tutup');
    });

    var form = kupon.querySelector('[data-kupon-form]');
    var nama = form.elements.name, email = form.elements.email, jebakan = form.elements.website;
    var kirim = kupon.querySelector('[data-kupon-kirim]'), labelKirim = kirim.innerHTML;
    var pesan = kupon.querySelector('[data-kupon-error]');
    var kodeEl = kupon.querySelector('[data-kupon-kode]');
    var saran = kupon.querySelector('[data-kupon-saran]');
    var saranPakai = kupon.querySelector('[data-kupon-saran-pakai]');
    var emailDibiarkan = ''; // email yang tetap dipakai walau dikira salah ketik

    var tandai = function (input, salah) { input.setAttribute('aria-invalid', salah ? 'true' : 'false'); };
    var tampilPesan = function (teks, input) {
      pesan.textContent = teks || '';
      if (input) { tandai(input, true); input.focus(); }
    };
    each([nama, email], function (input) {
      input.addEventListener('input', function () { tandai(input, false); pesan.textContent = ''; saran.hidden = true; });
    });

    // format email: bagian-sebelum-@ yang wajar, domain dengan titik, dan akhiran minimal 2 huruf
    var POLA = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
    var formatBenar = function (m) { return m.length <= 254 && m.split('@')[0].length <= 64 && POLA.test(m); };
    // salah ketik domain populer (gmail.con, gmial.com, yaho.com, …) ditanyain dulu
    var DOMAIN = ['gmail.com', 'yahoo.com', 'yahoo.co.id', 'hotmail.com', 'outlook.com', 'icloud.com', 'ymail.com', 'live.com', 'mail.com'];
    // jumlah huruf yang beda (tambah/hapus/ganti, dan dua huruf ketuker dihitung satu)
    var jarak = function (a, b) {
      var d = [];
      for (var i = 0; i <= a.length; i++) { d[i] = [i]; }
      for (var j = 1; j <= b.length; j++) d[0][j] = j;
      for (i = 1; i <= a.length; i++) {
        for (j = 1; j <= b.length; j++) {
          var beda = a[i - 1] === b[j - 1] ? 0 : 1;
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + beda);
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
      return d[a.length][b.length];
    };
    var tebakTypo = function (m) {
      var at = m.lastIndexOf('@'), domain = m.slice(at + 1), terbaik = '', terdekat = 3;
      if (DOMAIN.indexOf(domain) > -1) return '';
      DOMAIN.forEach(function (d) { var j = jarak(domain, d); if (j < terdekat) { terdekat = j; terbaik = d; } });
      return terbaik ? m.slice(0, at + 1) + terbaik : '';
    };
    var kirimUlang = function () { saran.hidden = true; if (form.requestSubmit) form.requestSubmit(); else kirim.click(); };
    saranPakai.addEventListener('click', function () { email.value = saranPakai.textContent; kirimUlang(); });
    kupon.querySelector('[data-kupon-saran-tolak]').addEventListener('click', function () { emailDibiarkan = email.value; kirimUlang(); });

    // email sementara (temp mail) ditolak. Daftar ±10 rb domainnya (assets/data/email-sementara.txt)
    // baru diunduh pas popup kebuka; kalau gagal diunduh, tetap ada pengecekan kata kunci di bawah.
    var KATA_SEMENTARA = /temp-?mail|tmp-?mail|10-?minute|minute-?mail|throw-?away|trash-?mail|disposable|guerrilla|mailinator|yopmail|fake-?mail|burner|sharklasers|maildrop|getnada|dropmail|mohmal|emailondeck|mailnesia|spamgourmet/;
    var daftarSementara = null;
    var muatDaftarSementara = function () {
      if (!daftarSementara) {
        daftarSementara = fetch(kc.daftarSementara)
          .then(function (res) { if (!res.ok) throw res.status; return res.text(); })
          .then(function (teks) {
            var isi = {};
            teks.split('\n').forEach(function (d) { if (d) isi[d.trim()] = 1; });
            return isi;
          })
          .catch(function () { daftarSementara = null; return {}; }); // dicoba lagi pas submit berikutnya
      }
      return daftarSementara;
    };
    var emailSementara = function (m) {
      var domain = m.slice(m.lastIndexOf('@') + 1);
      if (DOMAIN.indexOf(domain) > -1) return Promise.resolve(false);
      if (KATA_SEMENTARA.test(domain)) return Promise.resolve(true);
      return muatDaftarSementara().then(function (isi) {
        // cek domainnya dan induknya juga: x.mailinator.com -> mailinator.com
        for (var d = domain; d.indexOf('.') > -1; d = d.slice(d.indexOf('.') + 1)) if (isi[d]) return true;
        return false;
      });
    };

    // domain email harus beneran bisa nerima email (punya server email / MX), dicek lewat DNS publik
    // Google. Yang dikirim cuma domainnya (bagian setelah @). Kalau DNS-nya lagi gangguan, nggak nolak.
    var DNS = 'https://dns.google/resolve?name=';
    var cekDns = function (domain, jenis) {
      var henti = window.AbortController ? new AbortController() : null;
      var batas = setTimeout(function () { if (henti) henti.abort(); }, 5000);
      return fetch(DNS + encodeURIComponent(domain) + '&type=' + jenis, { signal: henti ? henti.signal : undefined })
        .then(function (res) { return res.json(); })
        .then(function (r) { clearTimeout(batas); return r; }, function () { clearTimeout(batas); return null; });
    };
    var hasilDomain = {};
    var domainHidup = function (m) {
      var domain = m.slice(m.lastIndexOf('@') + 1);
      if (DOMAIN.indexOf(domain) > -1) return Promise.resolve(true);
      if (!hasilDomain[domain]) {
        hasilDomain[domain] = cekDns(domain, 'MX').then(function (r) {
          if (!r || (r.Status !== 0 && r.Status !== 3)) { delete hasilDomain[domain]; return true; } // DNS gangguan
          if (r.Status === 3) return false; // domainnya nggak ada (mis. salah ketik / ngarang)
          var mx = (r.Answer || []).filter(function (a) { return a.type === 15; }).map(function (a) { return String(a.data).trim(); });
          // "0 ." = domain yang sengaja nggak nerima email (mis. example.com)
          if (mx.length) return mx.some(function (d) { return !/^\d+\s+\.?$/.test(d); });
          // tanpa MX, email dikirim ke alamat utama domainnya, jadi minimal harus punya alamat (A)
          return cekDns(domain, 'A').then(function (a) {
            return !a || a.Status !== 0 || (a.Answer || []).some(function (x) { return x.type === 1; });
          });
        });
      }
      return hasilDomain[domain];
    };
    // dicek duluan pas kolom email ditinggal, biar pas klik tombolnya udah siap
    email.addEventListener('blur', function () {
      var m = email.value.trim().toLowerCase();
      if (formatBenar(m)) domainHidup(m);
    });

    // kodenya dari Google Sheet (kode aktif, diatur dari /buat-kupon/); kode di halaman cuma cadangan
    var berhasil = function (kodeAktif) {
      if (/^[A-Z0-9][A-Z0-9-]{0,39}$/.test(kodeAktif || '')) kodeEl.textContent = kodeAktif;
      selesai = true;
      ingat({ s: 'daftar', t: Date.now() });
      catatKupon('kupon-daftar');
      kupon.querySelector('[data-kupon-isi]').hidden = true;
      var hasil = kupon.querySelector('[data-kupon-hasil]');
      hasil.hidden = false;
      hasil.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (kirim.getAttribute('aria-busy') === 'true') return;
      var n = nama.value.trim().replace(/\s+/g, ' ');
      var m = email.value.trim().toLowerCase();
      email.value = m;
      saran.hidden = true;
      var ditolak = function (alasan) { catatKupon('kupon-ditolak', { alasan: alasan }); };
      if (!n) return ditolak('nama-kosong'), tampilPesan(kc.errorNama, nama);
      if (!formatBenar(m)) return ditolak('format-email'), tampilPesan(kc.errorEmail, email);
      var typo = m !== emailDibiarkan && tebakTypo(m);
      if (typo) {
        tampilPesan('');
        saranPakai.textContent = typo;
        saran.hidden = false;
        saranPakai.focus();
        return;
      }
      tampilPesan('');
      kirim.setAttribute('aria-busy', 'true');
      kirim.textContent = kc.loading;
      var henti = window.AbortController ? new AbortController() : null;
      var batas = setTimeout(function () { if (henti) henti.abort(); }, 20000);
      Promise.all([emailSementara(m), domainHidup(m)])
        .then(function (cek) {
          // pesan umum jadi cadangan kalau teks khususnya belum ada (mis. HTML lama yang masih di-cache)
          if (cek[0]) return ditolak('temp-mail'), tampilPesan(kc.errorSementara || kc.errorEmail, email);
          if (!cek[1]) return ditolak('domain-mati'), tampilPesan(kc.errorDomain || kc.errorEmail, email);
          return fetch(kc.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // jangan application/json: ditolak Apps Script
            // kupon = kode yang dikasih ke pendaftar ini, buat kolom "Kode Kupon" di Sheet
            body: JSON.stringify({ newsletter: { name: n, email: m, source: (location.pathname + ' · ' + kc.sumber).slice(0, 100), kupon: kodeEl.textContent.trim(), website: jebakan.value } }),
            signal: henti ? henti.signal : undefined,
          })
            .then(function (res) { return res.json(); })
            .then(function (r) {
              if (r && r.ok) return berhasil(r.kupon); // termasuk email yang sudah pernah daftar
              if (r && r.error === 'invalid_email') return ditolak('format-email'), tampilPesan(kc.errorEmail, email);
              ditolak('gagal-kirim');
              tampilPesan(r && r.error === 'busy' ? kc.errorSibuk : kc.errorKirim);
            });
        })
        .catch(function () { ditolak('gagal-kirim'); tampilPesan(kc.errorKirim); })
        .then(function () {
          clearTimeout(batas);
          kirim.removeAttribute('aria-busy');
          kirim.innerHTML = labelKirim;
        });
    });

    // salin kode kupon
    var salin = kupon.querySelector('[data-kupon-salin]');
    salin.addEventListener('click', function () { salinTeks(kodeEl.textContent.trim(), salin, kc.tersalin); });
  }

  // --- survei "kenapa belum beli" (Panduan) ---
  // Kartu kecil di pojok, nggak nutup halaman. Muncul sekali, di salah satu momen ini:
  //  - setelah-harga: bagian Harga sudah kelihatan data-detik detik tapi belum klik Beli
  //  - penutup: sampai bagian penutup tanpa klik Beli
  //  - balik-dari-checkout: sudah klik Beli, terus balik lagi ke halaman ini (nggak jadi bayar)
  // Dijawab = nggak muncul lagi; ditutup = baru muncul lagi setelah data-jeda-hari hari.
  // Buat ngecek tampilannya: /panduan/?survei (langsung muncul, nggak dicatat & nggak masuk statistik).
  var survei = document.querySelector('[data-survei]');
  if (survei) {
    var sv = survei.dataset;
    var KUNCI_SV = 'harinesia-survei';
    var paksaSv = /[?&]survei\b/.test(location.search);
    var catatanSv = null;
    try { catatanSv = JSON.parse(localStorage.getItem(KUNCI_SV)); } catch (e) { /* mode privat */ }
    var lewatiSv = !paksaSv && catatanSv && (catatanSv.s === 'jawab' || (catatanSv.s === 'tutup' && Date.now() - catatanSv.t < (+sv.jedaHari || 7) * 864e5));
    var ingatSv = function (s) {
      if (paksaSv) return;
      try { localStorage.setItem(KUNCI_SV, JSON.stringify({ s: s, t: Date.now() })); } catch (e) { /* mode privat */ }
    };
    var momenSv = '', timerSv = null;

    var munculSv = function (momen) {
      if (lewatiSv || momenSv) return;
      if (momen !== 'balik-dari-checkout' && sudahKlikBeli && !paksaSv) return; // lagi proses beli, jangan diganggu
      var dialogBuka = document.querySelector('dialog[open]'); // jangan numpuk sama popup kupon
      if (dialogBuka) {
        dialogBuka.addEventListener('close', function () { setTimeout(function () { munculSv(momen); }, 1500); }, { once: true });
        return;
      }
      momenSv = momen;
      survei.hidden = false;
      if (!paksaSv) catat('survei-muncul', { momen: momen });
    };
    var tutupSv = function () { survei.hidden = true; };

    if (paksaSv) setTimeout(function () { munculSv('cek'); }, 600);
    else {
      // balik lagi setelah klik Beli: dari klik tombol back (halaman dipulihkan) atau buka ulang di tab yang sama
      var balikDariCheckout = function () {
        var pernah = null;
        try { pernah = sessionStorage.getItem('harinesia-klik-beli'); sessionStorage.removeItem('harinesia-klik-beli'); } catch (e) { /* mode privat */ }
        if (pernah) setTimeout(function () { munculSv('balik-dari-checkout'); }, 2000);
      };
      balikDariCheckout();
      window.addEventListener('pageshow', function (e) { if (e.persisted) balikDariCheckout(); });

      var harga = document.getElementById('harga'), penutup = document.querySelector('.closing');
      if (hasIO) {
        // "kelihatan" = sudah naik ke 60% atas layar, atau sudah kelewat
        var pemicuSv = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
            pemicuSv.unobserve(e.target);
            if (e.target === penutup) setTimeout(function () { munculSv('penutup'); }, 8000); // kasih waktu buat klik Beli dulu
            else if (!timerSv) timerSv = setTimeout(function () { munculSv('setelah-harga'); }, (+sv.detik || 30) * 1000);
          });
        }, { rootMargin: '0px 0px -40% 0px' });
        if (harga) pemicuSv.observe(harga);
        if (penutup) pemicuSv.observe(penutup);
      }
    }

    // jawaban: ke Google Sheet (tab Survei) + statistik Umami. Gagal kirim nggak apa-apa, pengunjung tetap dibilang makasih.
    var jawabSv = function (alasan, teks) {
      ingatSv('jawab');
      if (!paksaSv) catat('survei-jawab', { alasan: alasan, momen: momenSv });
      if (sv.endpoint) {
        fetch(sv.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // jangan application/json: ditolak Apps Script
          body: JSON.stringify({ survei: { alasan: alasan, teks: teks || '', sumber: sumber, momen: momenSv, halaman: location.pathname } }),
        }).catch(function () { /* nggak usah ganggu pengunjung */ });
      }
      survei.querySelector('[data-survei-tanya]').hidden = true;
      survei.querySelector('[data-survei-makasih]').hidden = false;
      setTimeout(tutupSv, 4000);
    };
    each(survei.querySelectorAll('[data-alasan]'), function (b) {
      b.addEventListener('click', function () { jawabSv(b.getAttribute('data-alasan')); });
    });
    var formSv = survei.querySelector('[data-survei-form]');
    var lainnya = survei.querySelector('[data-survei-lainnya]');
    lainnya.addEventListener('click', function () {
      formSv.hidden = false;
      lainnya.setAttribute('aria-expanded', 'true');
      formSv.elements.teks.focus();
    });
    formSv.addEventListener('submit', function (e) {
      e.preventDefault();
      var teks = formSv.elements.teks.value.trim();
      if (teks) jawabSv('Lainnya', teks);
      else formSv.elements.teks.focus();
    });
    var tutupManual = function () {
      if (!survei.querySelector('[data-survei-makasih]').hidden) return tutupSv();
      ingatSv('tutup');
      if (!paksaSv) catat('survei-tutup', { momen: momenSv });
      tutupSv();
    };
    survei.querySelector('[data-survei-tutup]').addEventListener('click', tutupManual);
    survei.addEventListener('keydown', function (e) { if (e.key === 'Escape') tutupManual(); });
  }

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
