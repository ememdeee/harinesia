// Template halaman /panduan/. Isi teksnya ada di data/panduan.json.
const { esc, html, polos, kosong, peringatan } = require("../teks");
const B = require("../bagian");

module.exports = function panduan(ctx) {
  const d = ctx.data;
  const p = ctx.produk;
  const h = (s) => html(s, ctx);
  const ada = (s) => !kosong(s, ctx);
  const kepala = (
    sec,
    id,
    opsi = {},
  ) => `<div class="section-head${opsi.tengah ? " section-head--center" : ""}">
        <p class="tag${opsi.tag ? ` ${opsi.tag}` : ""}">${h(sec.tag)}</p>
        <h2 id="${id}">${h(sec.judul)}</h2>${sec.lead ? `\n        <p class="lead">${h(sec.lead)}</p>` : ""}
      </div>`;

  // ---------- hero ----------
  // Video di HP diputar sendiri dan ganti-ganti topik; ketuk HP buat ke topik berikutnya.
  const hero = d.hero;
  const hargaBaris = [
    `<span class="price">${h(p.harga)}</span>`,
    ada(p.hargaNormal) ? `<s class="price-old">${h(p.hargaNormal)}</s>` : "",
    ada(p.catatanPromo)
      ? `<span class="price-note">${h(p.catatanPromo)}</span>`
      : "",
  ]
    .filter(Boolean)
    .join("\n          ");

  const secHero = `<section class="hero hero--panduan" data-anim>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="tag">${h(hero.tag)}</p>
        <h1>${h(hero.judul)}</h1>
        <p class="lead">${h(hero.lead)}</p>
        <div class="price-row">
          ${hargaBaris}
        </div>
        <div class="cta-row" data-hero-cta>
          ${B.tombolBeli(ctx, "btn btn--buy btn--lg")}
          <a class="btn btn--ghost btn--lg" href="${esc(hero.tombolKedua.href)}">${h(hero.tombolKedua.label)}</a>
        </div>
        ${B.daftarAngka(ctx, hero.statistik, "hero-stats", "Akun Harinesia")}
      </div>

      <div class="hero-art art-topik">
        <div class="phone" data-feed>
          ${B.deretKlip(ctx, hero.topik, { sizes: "(min-width: 960px) 300px, 260px", alt: polos(hero.altTopik, ctx), prioritas: true, indent: "          " })}
          <span class="feed-bar" aria-hidden="true">${hero.topik.map(() => "<i></i>").join("")}</span>
          <span class="phone-play" aria-hidden="true">${B.ikon("play")}</span>
          <button class="feed-next" type="button" aria-label="Putar video, ketuk lagi buat topik berikutnya"></button>
        </div>
        <div class="hero-mascot" aria-hidden="true">
          <span class="bubble" data-feed-bubble>${esc(B.teksPolos(hero.topik[0].gelembung, ctx))}</span>
          ${B.maskot("mascot")}
        </div>
        <span class="sticker sticker--time" aria-hidden="true">${h(hero.stiker)}</span>
        ${B.konfeti()}
      </div>
    </div>
  </section>`;

  // ---------- tebak dulu ----------
  const t = d.tebak;
  const secTebak = `<section class="section section--paper" id="tebak" aria-labelledby="tebak-judul">
    <div class="wrap">
      ${kepala(t, "tebak-judul", { tag: "tag--ink" })}
      <div class="quiz">
${t.daftar
  .map(
    (q) => `        <details class="q">
          <summary>
            <span class="q-emoji" aria-hidden="true">${esc(q.emoji)}</span>
            <span class="q-text">${h(q.tanya)}</span>
            <span class="q-cta"><span class="q-cta-label">${h(t.labelTombol)}</span><span class="q-cta-tutup">${h(t.labelTombolTutup || "Tutup")}</span></span>
          </summary>
          <div class="q-answer">
            <p class="tag tag--paper">${h(t.labelJawaban)}</p>
            <p>${h(q.jawab)}</p>
          </div>
        </details>`,
  )
  .join("\n")}
      </div>
    </div>
  </section>`;

  // ---------- contoh video ----------
  const c = d.contoh;
  const secContoh = `<section class="section section--night" id="contoh" aria-labelledby="contoh-judul">
    <div class="wrap">
      ${kepala(c, "contoh-judul")}
      <ul class="reel">
        ${c.video.map((v) => B.kartuVideo(ctx, v, "(min-width: 1024px) 250px, 240px")).join("\n        ")}
      </ul>
      <p class="note">${h(c.catatan)}</p>
    </div>
  </section>`;

  // ---------- resep 60 detik ----------
  const r = d.resep;
  const total = r.bagian[r.bagian.length - 1].sampai;
  const labelBar =
    `Pembagian ${total} detik: ` +
    r.bagian
      .map(
        (b) =>
          `${polos(b.judul, ctx).toLowerCase().replace(/…$/, "")} ${b.sampai - b.dari} detik`,
      )
      .join(", ");
  const jam = (dtk) =>
    `${Math.floor(dtk / 60)}:${String(dtk % 60).padStart(2, "0")}`;
  const warna = (i) => `b${(i % 5) + 1}`;
  const secResep = `<section class="section" id="resep" aria-labelledby="resep-judul">
    <div class="wrap">
      ${kepala(r, "resep-judul")}

      <div class="beats-player" data-beats>
        <p class="beats-now" aria-hidden="true"><span class="rec"></span><span data-beats-clock>0:00</span><span>/ ${jam(total)}</span></p>
        <div class="beats-bar" role="img" aria-label="${labelBar}">
${r.bagian.map((b, i) => `          <span class="${warna(i)}" data-from="${b.dari}" data-to="${b.sampai}" style="flex: ${b.sampai - b.dari} 0 30px">${i + 1}</span>`).join("\n")}
          <i class="playhead" aria-hidden="true"></i>
        </div>
        <div class="beats-scale" aria-hidden="true"><span>0:00</span><span>${jam(total / 2)}</span><span>${jam(total)}</span></div>
      </div>

      <ol class="beats">
${r.bagian
  .map(
    (b, i) => `        <li class="beat ${warna(i)}">
          <p class="beat-time">${i + 1} · ${b.dari}–${b.sampai} detik</p>
          <h3>${h(b.judul)}</h3>
          <p>${h(b.teks)}</p>${b.contoh ? `\n          <q>${h(b.contoh)}</q>` : ""}
        </li>`,
  )
  .join("\n")}
      </ol>
      <p class="note">${h(r.catatan)}</p>
    </div>
  </section>`;

  // ---------- isi paket ----------
  const ip = d.isiPaket;
  const secIsi = `<section class="section section--paper" id="isi" aria-labelledby="isi-judul">
    <div class="wrap">
      ${kepala(ip, "isi-judul")}
      <div class="cards">
${ip.kartu
  .map(
    (k) => `        <article class="card">
          <div class="card-art bg-${esc(k.warna)}" aria-hidden="true">
            ${B.IKON_KARTU[k.ikon] || B.IKON_KARTU.bonus}
          </div>
          <div class="card-body">
            <p class="tag tag--paper">${h(k.label)}</p>
            <h3>${h(k.judul)}</h3>
            <p>${h(k.teks)}</p>${ada(k.keterangan) ? `\n            <p class="card-meta">${h(k.keterangan)}</p>` : ""}
          </div>
        </article>`,
  )
  .join("\n")}
      </div>
    </div>
  </section>`;

  // ---------- kurikulum ----------
  const k = d.kurikulum;
  const secKurikulum = `<section class="section" id="kurikulum" aria-labelledby="kurikulum-judul">
    <div class="wrap">
      ${kepala(k, "kurikulum-judul")}${ada(k.catatan) ? `\n      <p class="draft-note">${h(k.catatan)}</p>` : ""}
      <ol class="modules">
${k.modul
  .map(
    (m, i) => `        <li class="module">
          <span class="module-num" aria-hidden="true">${i + 1}</span>
          <h3>${h(m.judul)}</h3>
          <p>${h(m.teks)}</p>${ada(m.durasi) ? `\n          <p class="module-meta">${h(m.durasi)}</p>` : ""}
        </li>`,
  )
  .join("\n")}
      </ol>
    </div>
  </section>`;

  // ---------- buat siapa ----------
  const bs = d.buatSiapa;
  const kolom = (col, kelas) => `        <div class="fit-col">
          <h3>${h(col.judul)}</h3>
          <ul class="ticks${kelas}">
${col.daftar.map((x) => `            <li>${h(x)}</li>`).join("\n")}
          </ul>
        </div>`;
  const secSiapa = `<section class="section section--paper" id="buat-siapa" aria-labelledby="siapa-judul">
    <div class="wrap">
      ${kepala(bs, "siapa-judul")}
      <div class="fit">
${kolom(bs.cocok, "")}
${kolom(bs.belumCocok, " ticks--no")}
${kolom(bs.perluDisiapin, " ticks--need")}
      </div>
    </div>
  </section>`;

  // ---------- tentang ----------
  const tg = d.tentang;
  const secTentang = `<section class="section" id="tentang" aria-labelledby="tentang-judul">
    <div class="wrap">
      <div class="about">
        <div class="about-avatar" role="img" aria-label="${polos(tg.altAvatar, ctx)}">${B.maskot("mascot")}</div>
        <div>
          <h2 id="tentang-judul">${h(tg.judul)}</h2>
${tg.paragraf
  .filter(ada)
  .map((x) => `          <p>${h(x)}</p>`)
  .join("\n")}
          ${B.daftarAngka(ctx, tg.statistik, "chips")}
          <p class="note">${h(tg.catatan)}</p>
          <div class="social-btns">
${ctx.situs.sosial.map((s) => `            <a class="btn btn--sm" href="${esc(s.url)}" target="_blank" rel="noopener">${B.ikon(s.id)}${esc(s.handle)}</a>`).join("\n")}
          </div>
        </div>
      </div>
    </div>
  </section>`;

  // ---------- harga ----------
  const hg = d.harga;
  const secHarga = `<section class="section section--accent" id="harga" aria-labelledby="harga-judul" data-hide-buybar data-anim>
    <div class="wrap">
      ${kepala(hg, "harga-judul", { tengah: true, tag: "tag--paper" })}
      <div class="pricing">
        ${B.maskot("mascot-peek")}
        <div class="price-card">${ada(p.catatanPromo) ? `\n          <p class="tag tag--ink">${h(p.catatanPromo)}</p>` : ""}
          <h3 class="price-card-name">${h(p.nama)}</h3>
          <span class="price">${h(p.harga)}</span>${ada(p.hargaNormal) ? `\n          <s class="price-old">${h(p.hargaNormal)}</s>` : ""}
          <span class="price-note">${h(hg.catatanHarga)}</span>
          <ul class="ticks">
${hg.termasuk
  .filter(ada)
  .map((x) => `            <li>${h(x)}</li>`)
  .join("\n")}
          </ul>
          ${B.tombolBeli(ctx, "btn btn--buy btn--lg btn--block")}
          <p class="fine">${h(hg.catatanBawah)}</p>
        </div>
      </div>
    </div>
  </section>`;

  // ---------- faq ----------
  const f = d.faq;
  const secFaq = `<section class="section" id="faq" aria-labelledby="faq-judul">
    <div class="wrap">
      ${kepala(f, "faq-judul", { tengah: true })}
      <div class="faq">
${f.daftar
  .map(
    (x) => `        <details>
          <summary>${h(x.tanya)}</summary>
          <div class="faq-a"><p>${h(x.jawab)}</p></div>
        </details>`,
  )
  .join("\n")}
      </div>
    </div>
  </section>`;

  // ---------- penutup ----------
  const pt = d.penutup;
  const secPenutup = `<section class="section section--night closing" aria-labelledby="penutup-judul" data-hide-buybar data-anim>
    <div class="wrap">
      ${B.maskot("mascot")}
      <h2 id="penutup-judul">${h(pt.judul)}</h2>
      <p class="lead">${h(pt.teks)}</p>
      <div class="cta-row">
        ${B.tombolBeli(ctx, "btn btn--buy btn--lg")}
      </div>
      <p class="price-line">${h(pt.bawahTombol)}</p>
    </div>
  </section>`;

  // ---------- popup kupon (muncul setelah pengunjung scroll & baca sebentar) ----------
  const kp = d.kupon;
  if (/^\[.*\]$/.test(String(kp.kode).trim())) {
    peringatan.push("kode kupon popup masih placeholder (data/panduan.json -> kupon.kode)");
  }
  const atrKupon = {
    endpoint: ctx.situs.endpointNewsletter,
    bagian: kp.munculDiBagian,
    detik: kp.munculSetelahDetik,
    "jeda-hari": kp.jedaHari,
    sumber: kp.sumber,
    "error-nama": polos(kp.errorNama, ctx),
    "error-email": polos(kp.errorEmail, ctx),
    "error-sementara": polos(kp.errorSementara, ctx),
    "error-domain": polos(kp.errorDomain, ctx),
    "daftar-sementara": `${ctx.base}assets/data/email-sementara.txt`,
    "error-sibuk": polos(kp.errorSibuk, ctx),
    "error-kirim": polos(kp.errorKirim, ctx),
    loading: polos(kp.tombolLoading, ctx),
    tersalin: polos(kp.tersalin, ctx),
  };
  const popupKupon = `<dialog class="kupon" aria-labelledby="kupon-judul" data-kupon ${Object.entries(atrKupon).map(([n, v]) => `data-${n}="${esc(v)}"`).join(" ")}>
  ${B.maskot("mascot")}
  <div class="kupon-langkah" data-kupon-isi tabindex="-1" autofocus>
    <p class="tag">${h(kp.tag)}</p>
    <h2 id="kupon-judul">${h(kp.judul)}</h2>
    <p class="kupon-lead">${h(kp.lead)}</p>
    <form class="kupon-form" data-kupon-form novalidate>
      <label class="kupon-field">
        <span>${h(kp.labelNama)}</span>
        <input name="name" type="text" autocomplete="name" maxlength="100" placeholder="${polos(kp.contohNama, ctx)}" required aria-describedby="kupon-error">
      </label>
      <label class="kupon-field">
        <span>${h(kp.labelEmail)}</span>
        <input name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="254" placeholder="${polos(kp.contohEmail, ctx)}" required aria-describedby="kupon-error">
      </label>
      <p class="kupon-saran" data-kupon-saran hidden>${h(kp.saranEmail)} <button type="button" data-kupon-saran-pakai></button>? <button type="button" class="kupon-saran-tolak" data-kupon-saran-tolak>${h(kp.saranTolak)}</button></p>
      <p class="kupon-error" id="kupon-error" role="alert" data-kupon-error></p>
      <input class="kupon-jebakan" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn--buy btn--lg btn--block" type="submit" data-kupon-kirim>${h(kp.tombol)}</button>
      <p class="kupon-catatan">${h(kp.catatan)}</p>
    </form>
  </div>
  <div class="kupon-langkah" data-kupon-hasil tabindex="-1" hidden>
    <p class="tag tag--ink">${h(kp.tag)}</p>
    <h2>${h(kp.judulSukses)}</h2>
    <p class="kupon-lead">${h(kp.teksSukses)}</p>
    <div class="kupon-tiket">
      <code data-kupon-kode>${h(kp.kode)}</code>
      <button class="btn btn--sm" type="button" data-kupon-salin>${h(kp.tombolSalin)}</button>
    </div>
    ${B.tombolBeli(ctx, "btn btn--buy btn--lg btn--block", polos(kp.tombolPakai, ctx))}
  </div>
  <button class="kupon-tutup" type="button" data-kupon-tutup aria-label="${polos(kp.labelTutup, ctx)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg></button>
</dialog>`;

  // ---------- survei "kenapa belum beli" (kartu kecil di pojok, nggak nutup halaman) ----------
  const sv = d.survei;
  const surveiBelumBeli = `<aside class="survei" aria-labelledby="survei-judul" data-survei data-detik="${sv.munculSetelahDetik}" data-jeda-hari="${sv.jedaHari}" data-endpoint="${esc(ctx.situs.endpointNewsletter)}" hidden>
  <div data-survei-tanya>
    <p class="survei-label">${h(sv.label)}</p>
    <p class="survei-judul" id="survei-judul">${h(sv.tanya)}</p>
    <div class="survei-pilihan">
${sv.pilihan.map((x) => `      <button type="button" data-alasan="${polos(x, ctx)}">${h(x)}</button>`).join("\n")}
      <button type="button" data-survei-lainnya aria-expanded="false">${h(sv.labelLainnya)}</button>
    </div>
    <form class="survei-lain" data-survei-form hidden>
      <input name="teks" type="text" maxlength="300" placeholder="${polos(sv.contohLainnya, ctx)}" aria-label="${polos(sv.contohLainnya, ctx)}">
      <button class="btn btn--buy btn--sm" type="submit">${h(sv.tombolKirim)}</button>
    </form>
    <p class="survei-catatan">${h(sv.catatan)}</p>
  </div>
  <p class="survei-makasih" role="status" data-survei-makasih hidden>${h(sv.makasih)}</p>
  <button class="survei-tutup" type="button" data-survei-tutup aria-label="${polos(sv.labelTutup, ctx)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg></button>
</aside>`;

  return `${B.head(ctx, d.meta)}

${B.header(ctx, d.menu, B.tombolBeli(ctx, "btn btn--buy btn--sm header-buy"), "Bagian halaman")}

<main id="isi-halaman">

  ${[secHero, secTebak, secContoh, secResep, secIsi, secKurikulum, secSiapa, secTentang, secHarga, secFaq, secPenutup].join("\n\n  ")}

</main>

${B.footer(
  ctx,
  [
    { label: "Beranda", href: "../" },
    { label: "Panduan", href: "../panduan/", kini: true },
    { label: "FAQ", href: "#faq" },
  ],
  " data-hide-buybar",
)}

<div class="buybar" data-buybar>
  <div class="buybar-info">
    <span class="buybar-name">${h(p.nama)}</span>
    <span class="buybar-price">${h(p.harga)}</span>
  </div>
  ${B.tombolBeli(ctx, "btn btn--buy")}
</div>
<div class="toast" role="status" aria-live="polite" data-toast data-pesan="${polos(ctx.situs.pesanBeliBelumAda, ctx)}"></div>

${popupKupon}

${surveiBelumBeli}

</body>
</html>
`;
};
