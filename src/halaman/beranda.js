// Template Home (/). Isi teksnya ada di data/beranda.json.
const { esc, html } = require('../teks');
const B = require('../bagian');

module.exports = function beranda(ctx) {
  const d = ctx.data;
  const h = (s) => html(s, ctx);
  const tombolSosial = (t, kelas) => {
    const s = B.sosial(ctx, t.sosial);
    return `<a class="${kelas}" href="${esc(s.url)}" target="_blank" rel="noopener">${B.ikon(s.id)}${h(t.label)}</a>`;
  };

  // ---------- hero ----------
  // Dua kartu di kiri-kanan maskot memutar klip sendiri dan gantian ganti topik.
  const hero = d.hero;
  const kartu = [0, 1].map((k) => hero.topik.filter((_, i) => i % 2 === k));
  const secHero = `<section class="hero hero--home" data-anim>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="tag">${h(hero.tag)}</p>
        <h1>${h(hero.judul)}</h1>
        <p class="lead">${h(hero.lead)}</p>
        <div class="cta-row">
          ${tombolSosial(hero.tombolUtama, 'btn btn--buy btn--lg')}
          <a class="btn btn--ghost btn--lg" href="${esc(hero.tombolKedua.href)}">${h(hero.tombolKedua.label)}</a>
        </div>
        ${B.daftarAngka(ctx, hero.statistik, 'hero-stats', 'Akun Harinesia')}
      </div>

      <div class="hero-art home-art" aria-hidden="true">
${kartu.map((t, k) => `        <span class="vid-thumb ht-${k + 1}" data-feed>
          ${B.deretKlip(ctx, t, { sizes: '(min-width: 960px) 210px, 160px', indent: '          ' })}
        </span>`).join('\n')}
        <span class="bubble" data-feed-bubble>${esc(B.teksPolos(hero.topik[0].gelembung, ctx))}</span>
        ${B.maskot('mascot')}
        ${B.konfeti()}
      </div>
    </div>
  </section>`;

  const v = d.video;
  const secVideo = `<section class="section section--night" id="video" aria-labelledby="video-judul">
    <div class="wrap">
      <div class="section-head">
        <p class="tag">${h(v.tag)}</p>
        <h2 id="video-judul">${h(v.judul)}</h2>
        <p class="lead">${h(v.lead)}</p>
      </div>
      <ul class="video-grid">
        ${v.video.map((x) => B.kartuVideo(ctx, x, '(min-width: 1024px) 340px, (min-width: 720px) 30vw, 46vw')).join('\n        ')}
      </ul>
      <div class="reel-more">
${v.tombol.map((t) => `        ${tombolSosial(t, t.utama ? 'btn btn--buy' : 'btn')}`).join('\n')}
      </div>
    </div>
  </section>`;

  const pr = d.promo;
  const secPromo = `<section class="section section--accent" aria-labelledby="promo-judul">
    <div class="wrap">
      <div class="promo">
        <div>
          <p class="tag tag--ink">${h(pr.tag)}</p>
          <h2 id="promo-judul">${h(pr.judul)}</h2>
          <p class="lead">${h(pr.lead)}</p>
          <ul class="ticks">
${pr.daftar.map((x) => `            <li>${h(x)}</li>`).join('\n')}
          </ul>
          <div class="cta-row">
            <a class="btn btn--buy btn--lg" href="${esc(pr.tombol.href)}">${h(pr.tombol.label)}</a>
          </div>
        </div>
        <div class="promo-art" aria-hidden="true">
${pr.gambar.map((g) => `          <span class="vid-thumb">${B.thumb(ctx, g, { lebar: [180, 360], sizes: '(min-width: 900px) 190px, 40vw' })}</span>`).join('\n')}
        </div>
      </div>
    </div>
  </section>`;

  const rq = d.request;
  const secRequest = `<section class="section section--tight" id="request" aria-labelledby="request-judul">
    <div class="wrap ask">
      <div>
        <h2 id="request-judul">${h(rq.judul)}</h2>
        <p class="lead">${h(rq.lead)}</p>
      </div>
      <div class="social-btns">
${rq.tombol.map((t) => `        ${tombolSosial(t, 'btn')}`).join('\n')}
      </div>
    </div>
  </section>`;

  const tombolHeader = `<a class="btn btn--buy btn--sm header-buy" href="${esc(d.tombolHeader.href)}">${h(d.tombolHeader.label)}</a>`;

  return `${B.head(ctx, d.meta)}

${B.header(ctx, d.menu, tombolHeader, 'Menu utama')}

<main id="isi-halaman">

  ${[secHero, secVideo, secPromo, secRequest].join('\n\n  ')}

</main>

${B.footer(ctx, [
    { label: 'Beranda', href: './', kini: true },
    { label: 'Panduan', href: 'panduan/' },
    { label: 'Request topik', href: '#request' },
  ])}

</body>
</html>
`;
};
