// Ubah teks dari JSON jadi HTML yang aman.
//   **tebal**          -> <b>
//   ==caption==        -> caption merah bergaris (class "cap")
//   [teks](https://..) -> link
//   [TEKS LAIN]        -> placeholder yang disorot kuning
//   {produk.nama}      -> diisi dari data (situs/produk/statistik)

const peringatan = [];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ambil(obj, jalur) {
  return jalur.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function isi(str, ctx) {
  return String(str == null ? "" : str).replace(
    /\{([a-zA-Z0-9_.]+)\}/g,
    (asli, kunci) => {
      const v = ambil(ctx, kunci);
      if (v === undefined || typeof v === "object") {
        peringatan.push(`{${kunci}} nggak ketemu di data (${ctx.halaman})`);
        return asli;
      }
      return String(v);
    },
  );
}

// [teks](alamat): alamat boleh https://..., mailto:..., /..., ../..., atau #...
const LINK = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|\.{0,2}\/|#)[^)\s]*)\)/g;

function html(str, ctx) {
  let s = esc(isi(str, ctx));
  s = s.replace(LINK, (_, t, u) =>
    /^https?:/.test(u)
      ? `<a href="${u}" target="_blank" rel="noopener">${t}</a>`
      : `<a href="${u}">${t}</a>`,
  );
  s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  s = s.replace(/==(.+?)==/g, '<span class="cap">$1</span>');
  s = s.replace(/\[([^\]\n]+)\](?!\()/g, '<span class="ph">[$1]</span>');
  s = s.replace(/\n/g, "<br>"); // \n di JSON = pindah baris
  return s;
}

// buat atribut (alt, aria-label, meta): tanpa markup
function polos(str, ctx) {
  return esc(
    isi(str, ctx)
      .replace(/\*\*|==/g, "")
      .replace(LINK, "$1"),
  );
}

const kosong = (str, ctx) => isi(str, ctx).trim() === "";

// "117,4" -> "117.4" buat animasi angka naik; selain angka murni dikembalikan null
function angka(str, ctx) {
  const v = isi(str, ctx).trim();
  return /^\d+([.,]\d+)?$/.test(v) ? v.replace(",", ".") : null;
}

module.exports = { esc, isi, html, polos, kosong, angka, peringatan };
