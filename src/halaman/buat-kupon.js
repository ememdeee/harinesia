// Template /buat-kupon/: alat internal buat bikin kode kupon acak & ganti kode yang aktif di popup.
// Teksnya di data/buat-kupon.json. Kode acaknya dibikin main.js di browser (crypto.getRandomValues);
// kode aktif disimpan di Google Sheet (tab Kupon) lewat Apps Script, dicek/diganti pakai PIN.
const fs = require("fs");
const path = require("path");
const { esc, html, polos } = require("../teks");
const B = require("../bagian");

module.exports = function buatKupon(ctx) {
  const d = ctx.data;
  const h = (s) => html(s, ctx);
  const ke = ctx.beranda;
  // kode cadangan popup di /panduan/, dipakai kalau Sheet belum punya kode aktif
  const panduan = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "data", "panduan.json"), "utf8"));
  const kodeCadangan = panduan.kupon && panduan.kupon.kode;
  const atr = {
    endpoint: ctx.situs.endpointNewsletter,
    tersalin: d.tersalin,
    "label-salin": d.tombolSalin,
    "label-aktifkan": d.tombolAktifkan,
    "label-aktif": d.labelAktif,
    "label-sejak": d.labelSejak,
    konfirmasi: d.konfirmasi,
    sukses: d.sukses,
    "belum-ada": d.belumAda,
    loading: d.loading,
    "error-pin-kosong": d.errorPinKosong,
    "error-pin": d.errorPin,
    "error-sibuk": d.errorSibuk,
    "error-belum-setel": d.errorBelumSetel,
    "error-kode": d.errorKode,
    "error-kirim": d.errorKirim,
  };

  return `${B.head(ctx, d.meta)}

${B.header(
  ctx,
  [
    { label: "Beranda", href: ke },
    { label: "Panduan", href: `${ke}panduan/` },
  ],
  "",
  "Menu utama",
)}

<main id="isi-halaman" class="legal-page">
  <div class="wrap">
    <div class="legal alat-kupon" data-pembuat-kupon ${Object.entries(atr).map(([n, v]) => `data-${n}="${polos(v, ctx)}"`).join(" ")}>
      <p class="tag tag--ink">${h(d.tag)}</p>
      <h1>${h(d.judul)}</h1>
      <p class="legal-intro">${h(d.lead)}</p>

      <section class="alat-panel" aria-labelledby="judul-aktif">
        <h2 id="judul-aktif">${h(d.judulAktif)}</h2>
        <p>${h(d.leadAktif)}</p>
        <form class="alat-pin" data-aktif-form>
          <label class="kupon-field">
            <span>${h(d.labelPin)}</span>
            <input name="pin" type="password" autocomplete="current-password" required>
          </label>
          <button class="btn btn--lg" type="submit">${h(d.tombolCek)}</button>
        </form>
        <p class="alat-status" role="status" data-aktif-status></p>
        <div class="kupon-tiket alat-aktif" data-aktif-tiket hidden>
          <code></code>
          <small></small>
        </div>
        <p class="alat-sekarang">${h(d.labelCadangan)} <code>${esc(kodeCadangan || "-")}</code></p>
      </section>

      <section class="legal-section" aria-labelledby="judul-bikin">
        <h2 id="judul-bikin">${h(d.judulBikin)}</h2>
        <form class="alat-form" data-pembuat-form>
          <label class="kupon-field">
            <span>${h(d.labelAwalan)}</span>
            <input name="awalan" type="text" value="HARI15" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="bantu-awalan">
            <small id="bantu-awalan">${h(d.bantuAwalan)}</small>
          </label>
          <label class="kupon-field">
            <span>${h(d.labelPanjang)}</span>
            <input name="panjang" type="number" value="6" min="4" max="12" inputmode="numeric">
          </label>
          <label class="kupon-field">
            <span>${h(d.labelJumlah)}</span>
            <input name="jumlah" type="number" value="1" min="1" max="20" inputmode="numeric">
          </label>
          <label class="alat-cek"><input name="pemisah" type="checkbox" checked> ${h(d.labelPemisah)}</label>
          <label class="alat-cek"><input name="mirip" type="checkbox" checked> ${h(d.labelMirip)}</label>
          <button class="btn btn--buy btn--lg" type="submit">${h(d.tombol)}</button>
        </form>

        <ul class="alat-hasil" data-pembuat-hasil aria-live="polite"></ul>
        <p class="alat-status" role="status" data-hasil-status></p>
        <button class="btn btn--sm alat-salin-semua" type="button" data-pembuat-salin-semua hidden>${h(d.tombolSalinSemua)}</button>
      </section>

      <section class="legal-section" aria-labelledby="judul-langkah">
        <h2 id="judul-langkah">${h(d.judulLangkah)}</h2>
        <ol class="alat-langkah">
${d.langkah.map((l) => `          <li>${h(l)}</li>`).join("\n")}
        </ol>
      </section>
    </div>
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
