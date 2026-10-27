// Template halaman legal (/privasi/, /syarat/). Isinya di data/privasi.json & data/syarat.json.
const { esc, html } = require("../teks");
const B = require("../bagian");

module.exports = function legal(ctx) {
  const d = ctx.data;
  const h = (s) => html(s, ctx);
  const ke = ctx.beranda; // "../"

  const bagian = d.bagian
    .map(
      (b) => `<section class="legal-section">
        <h2>${h(b.judul)}</h2>
${(b.isi || []).map((p) => `        <p>${h(p)}</p>`).join("\n")}${
        b.daftar && b.daftar.length
          ? `\n        <ul>\n${b.daftar.map((x) => `          <li>${h(x)}</li>`).join("\n")}\n        </ul>`
          : ""
      }
      </section>`,
    )
    .join("\n      ");

  const tombolHeader = `<a class="btn btn--buy btn--sm header-buy" href="${ke}panduan/">Lihat panduan</a>`;

  return `${B.head(ctx, d.meta)}

${B.header(
  ctx,
  [
    { label: "Beranda", href: ke },
    { label: "Panduan", href: `${ke}panduan/` },
  ],
  tombolHeader,
  "Menu utama",
)}

<main id="isi-halaman" class="legal-page">
  <div class="wrap">
    <article class="legal">
      <p class="tag tag--ink">${h(d.tag)}</p>
      <h1>${h(d.judul)}</h1>
      <p class="legal-date">Berlaku sejak ${esc(d.berlaku)}</p>
      <p class="legal-intro">${h(d.pengantar)}</p>
      ${bagian}
    </article>
  </div>
</main>

${B.footer(ctx, [
  { label: "Beranda", href: ke },
  { label: "Panduan", href: `${ke}panduan/` },
])}

</body>
</html>
`;
};
