// Halaman 404. Teksnya di data/situs.json bagian "halaman404".
// Path aset pakai "/" karena halaman ini bisa muncul di URL mana aja.
const { html, polos } = require("../teks");
const B = require("../bagian");

module.exports = function halaman404(ctx) {
  const t = ctx.situs.halaman404;
  return `<!doctype html>
<!-- File ini dibuat otomatis oleh build.js dari data/*.json. Edit JSON-nya, jangan file ini. -->
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${polos(t.judul, ctx)} · Harinesia</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>

<main class="wrap lost">
  <div>
    ${B.maskot("mascot")}
    <h1>${html(t.judul, ctx)}</h1>
    <p>${html(t.teks, ctx)}</p>
    <div class="cta-row" style="justify-content:center">
      <a class="btn btn--buy btn--lg" href="/">Ke beranda</a>
      <a class="btn btn--lg" href="/panduan/">Lihat panduan</a>
    </div>
  </div>
</main>

</body>
</html>
`;
};
