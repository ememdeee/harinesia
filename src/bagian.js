// Potongan HTML yang dipakai bareng di semua halaman.
const fs = require("fs");
const path = require("path");
const { esc, isi, html, polos, kosong, angka, peringatan } = require("./teks");

const ROOT = path.join(__dirname, "..");

const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="i-tiktok" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></symbol>
  <symbol id="i-youtube" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></symbol>
  <symbol id="i-mask" viewBox="0 0 64 32">
    <path d="M12 13C7 10 4 11 1.5 8M12 19c-5 1-7 4-10.5 4" fill="none" stroke="#e75562" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="10" y="4.5" width="52" height="23" rx="11.5" fill="#e75562" stroke="#0f1a30" stroke-width="3"/>
    <circle cx="26" cy="16" r="7.5" fill="#fff" stroke="#0f1a30" stroke-width="2.5"/>
    <circle cx="46" cy="16" r="7.5" fill="#fff" stroke="#0f1a30" stroke-width="2.5"/>
    <path d="M22.3 17.6q3.7-4.4 7.4 0M42.3 17.6q3.7-4.4 7.4 0" fill="none" stroke="#0f1a30" stroke-width="2.4" stroke-linecap="round"/>
  </symbol>
</svg>`;

// maskot inline (bukan <use>) supaya matanya bisa kedip lewat CSS
const maskot = (
  cls,
) => `<svg class="${cls} is-live" viewBox="0 0 140 130" aria-hidden="true" focusable="false">
  <path d="M30 50C20 42 12 44 4 38M30 62c-10 2-16 9-25 9" fill="none" stroke="#e75562" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="76" cy="68" rx="58" ry="56" fill="#fff" stroke="#0f1a30" stroke-width="5"/>
  <path d="M42 108c16 10 52 11 68 0" fill="none" stroke="#dde6f1" stroke-width="6" stroke-linecap="round"/>
  <rect x="26" y="38" width="100" height="36" rx="18" fill="#e75562" stroke="#0f1a30" stroke-width="5"/>
  <g class="m-eyes">
    <circle cx="55" cy="56" r="13" fill="#fff" stroke="#0f1a30" stroke-width="4"/>
    <circle cx="97" cy="56" r="13" fill="#fff" stroke="#0f1a30" stroke-width="4"/>
    <circle cx="57" cy="57" r="5.5" fill="#0f1a30"/><circle cx="99" cy="57" r="5.5" fill="#0f1a30"/><circle cx="59" cy="54.5" r="1.8" fill="#fff"/><circle cx="101" cy="54.5" r="1.8" fill="#fff"/>
  </g>
  <ellipse cx="42" cy="92" rx="10" ry="6" fill="#ffc2cd"/>
  <ellipse cx="110" cy="92" rx="10" ry="6" fill="#ffc2cd"/>
  <ellipse cx="76" cy="97" rx="12" ry="10" fill="#0f1a30"/><ellipse cx="76" cy="102" rx="6" ry="3.5" fill="#ff7a90"/>
</svg>`;

const IKON_KARTU = {
  ebook:
    '<svg viewBox="0 0 88 88"><path d="M14 20c10-4 20-4 30 2v48c-10-6-20-6-30-2z" fill="#fff" stroke="#0f1a30" stroke-width="3.5" stroke-linejoin="round"/><path d="M74 20c-10-4-20-4-30 2v48c10-6 20-6 30-2z" fill="#fff" stroke="#0f1a30" stroke-width="3.5" stroke-linejoin="round"/><path d="M21 33c6-2 11-1 16 1M21 43c6-2 11-1 16 1M21 53c6-2 11-1 16 1M51 34c5-2 10-3 16-1M51 44c5-2 10-3 16-1" fill="none" stroke="#0f1a30" stroke-width="3" stroke-linecap="round"/></svg>',
  video:
    '<svg viewBox="0 0 88 88"><rect x="12" y="18" width="64" height="46" rx="10" fill="#fff" stroke="#0f1a30" stroke-width="3.5"/><path d="M38 31v20l17-10z" fill="#e75562" stroke="#0f1a30" stroke-width="3" stroke-linejoin="round"/><path d="M30 74h28" stroke="#0f1a30" stroke-width="3.5" stroke-linecap="round"/></svg>',
  bonus:
    '<svg viewBox="0 0 88 88"><rect x="16" y="38" width="56" height="36" rx="6" fill="#fff" stroke="#0f1a30" stroke-width="3.5"/><rect x="12" y="26" width="64" height="14" rx="5" fill="#ffc83d" stroke="#0f1a30" stroke-width="3.5"/><path d="M44 28v44" stroke="#e75562" stroke-width="7"/><path d="M44 26c-6-12-20-12-18-2 2 6 18 2 18 2zm0 0c6-12 20-12 18-2-2 6-18 2-18 2z" fill="#e75562" stroke="#0f1a30" stroke-width="3" stroke-linejoin="round"/></svg>',
};

const ikon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

function sosial(ctx, id) {
  const s = ctx.situs.sosial.find((x) => x.id === id);
  if (!s) throw new Error(`Akun sosial "${id}" nggak ada di data/situs.json`);
  return s;
}

// ---------- gambar thumbnail ----------
// assets/img/v-<nama>-360.webp (+ -540 / -180). Kalau file belum ada, pakai thumbnail YouTube biar halaman nggak bolong.
function adaGambar(nama, w) {
  return fs.existsSync(path.join(ROOT, "assets", "img", `v-${nama}-${w}.webp`));
}
function thumb(ctx, nama, opsi) {
  const {
    lebar = [360, 540],
    sizes,
    kelas = "",
    alt = "",
    lazy = true,
    prioritas = false,
    youtube,
  } = opsi;
  const base = ctx.base;
  const ada = lebar.filter((w) => adaGambar(nama, w));
  const atr = `${kelas ? ` class="${kelas}"` : ""}`;
  const muat = `${prioritas ? ' fetchpriority="high"' : ""}${lazy ? ' loading="lazy"' : ""}${prioritas ? "" : ' decoding="async"'}`;
  if (!ada.length) {
    peringatan.push(
      `gambar assets/img/v-${nama}-${lebar[0]}.webp belum ada (${ctx.halaman})${youtube ? ", sementara pakai thumbnail YouTube" : ""}`,
    );
    const src = youtube
      ? `https://i.ytimg.com/vi/${youtube}/oardefault.jpg`
      : "";
    return `<img${atr} src="${src}" width="360" height="640" alt="${alt}"${muat}>`;
  }
  const w0 = ada[0];
  const h0 = Math.round((w0 * 16) / 9);
  const srcset =
    ada.length > 1
      ? ` srcset="${ada.map((w) => `${base}assets/img/v-${nama}-${w}.webp ${w}w`).join(", ")}" sizes="${sizes}"`
      : "";
  return `<img${atr} src="${base}assets/img/v-${nama}-${w0}.webp"${srcset} width="${w0}" height="${h0}" alt="${alt}"${muat}>`;
}

function kartuVideo(ctx, v, sizes) {
  const url = v.url || `https://www.youtube.com/shorts/${v.youtube}`;
  const views = v.views
    ? `<span class="vid-views">${html(v.views, ctx)} views</span>`
    : "";
  return `<li><a class="vid" href="${esc(url)}" target="_blank" rel="noopener">
          <span class="vid-thumb">${thumb(ctx, v.gambar, { sizes, youtube: v.youtube })}${views}<span class="vid-play" aria-hidden="true">${ikon("play").replace(' aria-hidden="true"', "")}</span></span>
          <span class="vid-title">${html(v.judul, ctx)}</span>
        </a></li>`;
}

// ---------- tombol beli ----------
function tombolBeli(ctx, kelas, labelPendek) {
  const s = ctx.situs;
  const link = String(s.linkBeli || "#").trim();
  if (link === "" || link === "#") {
    return `<a class="${kelas}" href="#" data-buy data-pending>${esc(s.labelBeliBelumAda)}</a>`;
  }
  return `<a class="${kelas}" href="${esc(link)}" rel="noopener" data-buy>${esc(labelPendek || s.labelBeli)}</a>`;
}

// ---------- daftar angka (hero, tentang) ----------
function daftarAngka(ctx, items, kelas, label) {
  const li = items.map((it) => {
    const n = angka(it.angka || "", ctx);
    const teks = html(it.teks, ctx);
    if (kosong(it.angka || "", ctx)) return `<li>${teks}</li>`;
    const b = n
      ? `<b data-count="${n}">${html(it.angka, ctx)}</b>`
      : `<b>${html(it.angka, ctx)}</b>`;
    return `<li>${b} ${teks}</li>`;
  });
  return `<ul class="${kelas}"${label ? ` aria-label="${label}"` : ""}>
${li.map((x) => `          ${x}`).join("\n")}
        </ul>`;
}

// ---------- head ----------
function head(ctx, meta) {
  const s = ctx.situs;
  const b = ctx.base;
  const domain = String(s.domain || "").replace(/\/+$/, "");
  const og = domain ? `${domain}/assets/img/og.jpg` : `${b}assets/img/og.jpg`;
  const canonical = domain
    ? `\n<link rel="canonical" href="${domain}/${ctx.jalur}">`
    : "";
  const robots = ctx.noindex
    ? '\n<meta name="robots" content="noindex, nofollow">'
    : s.bolehDiindexGoogle
      ? ""
      : '\n<!-- Masih domain dummy: set "bolehDiindexGoogle": true di data/situs.json saat pindah ke domain final. -->\n<meta name="robots" content="noindex, nofollow">';
  return `<!doctype html>
<!-- File ini dibuat otomatis oleh build.js dari data/*.json. Edit JSON-nya, jangan file ini. -->
<html lang="id"${s.sorotPlaceholder ? ' class="show-ph"' : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${polos(meta.judul, ctx)}</title>
<meta name="description" content="${polos(meta.deskripsi, ctx)}">${robots}
<meta name="theme-color" content="#e75562">
<meta property="og:type" content="website">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="Harinesia">
<meta property="og:title" content="${polos(meta.judulShare || meta.judul, ctx)}">
<meta property="og:description" content="${polos(meta.deskripsiShare || meta.deskripsi, ctx)}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">${canonical}
<link rel="icon" href="${b}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${b}apple-touch-icon.png">
<link rel="preload" href="${b}assets/fonts/poppins-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${b}assets/fonts/poppins-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${b}assets/css/style.css">
<script src="${b}assets/js/main.js" defer></script>
</head>
<body>

${SPRITE}

<a class="skip" href="#isi-halaman">Langsung ke isi</a>`;
}

// ---------- header & footer ----------
function daftarSosial(ctx) {
  return `<ul class="socials" aria-label="Harinesia di media sosial">
${ctx.situs.sosial.map((s) => `      <li><a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.nama)} ${esc(s.handle)}">${ikon(s.id)}</a></li>`).join("\n")}
    </ul>`;
}

function merek(ctx, kini) {
  return `<a class="brand" href="${ctx.beranda}" aria-label="Harinesia, ke beranda"${kini ? ' aria-current="page"' : ""}>
      <svg class="brand-mark" aria-hidden="true"><use href="#i-mask"/></svg>
      <span class="brand-name">harinesia</span>
    </a>`;
}

function header(ctx, menu, tombolKanan, labelMenu) {
  return `<header class="site-header">
  <div class="wrap header-inner">
    ${merek(ctx, ctx.halaman === "beranda")}
    <nav class="nav" aria-label="${labelMenu}">
${menu.map((m) => `      <a href="${esc(m.href)}">${html(m.label, ctx)}</a>`).join("\n")}
    </nav>
    ${daftarSosial(ctx)}
    ${tombolKanan}
  </div>
</header>`;
}

// email asli jadi link mailto; kalau kontakEmail kosong, arahkan ke DM Instagram
function kontak(ctx) {
  const email = String(ctx.situs.kontakEmail || "").trim();
  if (!email) {
    const ig = sosial(ctx, "instagram");
    return `<a href="${esc(ig.url)}" target="_blank" rel="noopener">DM ${esc(ig.handle)} di Instagram</a>`;
  }
  return /^[^\s@[\]]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? `<a href="mailto:${esc(email)}">${esc(email)}</a>`
    : html(email, ctx);
}

function footer(ctx, tautan, ekstra) {
  return `<footer class="site-footer"${ekstra || ""}>
  <div class="wrap">
    <div class="footer-grid">
      <div>
        ${merek(ctx, false).replace(/\n    /g, "\n        ")}
        <p class="footer-tagline">${html(ctx.situs.tagline, ctx)}</p>
      </div>
      <nav class="footer-links" aria-label="Halaman">
${tautan.map((t) => `        <a href="${esc(t.href)}"${t.kini ? ' aria-current="page"' : ""}>${html(t.label, ctx)}</a>`).join("\n")}
      </nav>
      ${daftarSosial(ctx).replace(/\n/g, "\n  ")}
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Harinesia · <a href="${ctx.beranda}privasi/"${ctx.halaman === "privasi" ? ' aria-current="page"' : ""}>Privasi</a> · <a href="${ctx.beranda}syarat/"${ctx.halaman === "syarat" ? ' aria-current="page"' : ""}>Syarat &amp; Ketentuan</a></span>
      <span>Kontak: ${kontak(ctx)}</span>
    </div>
  </div>
</footer>`;
}

const konfeti = () =>
  [1, 2, 3, 4, 5, 6]
    .map((i) => `<span class="confetti c${i}" aria-hidden="true"></span>`)
    .join("");

// ---------- video di hero ----------
// Klip MP4 kecil ada di assets/video/ (dibuat alat/klip-video.py). Markupnya selalu punya
// poster gambar, jadi tetap rapi tanpa JS atau kalau pengunjung memilih "kurangi gerakan";
// main.js yang memutar.
const teksPolos = (s, ctx) => isi(s, ctx).replace(/\*\*|==/g, "");

// deretan klip yang gantian diputar; yang pertama juga jadi poster gambar
function deretKlip(ctx, topik, o) {
  const b = ctx.base;
  const [t0] = topik;
  const muat = o.prioritas ? ' fetchpriority="high"' : "";
  const poster = `<img class="klip-poster" src="${b}assets/video/${t0.klip}-360.webp" srcset="${b}assets/video/${t0.klip}-360.webp 360w, ${b}assets/video/${t0.klip}-540.webp 540w" sizes="${o.sizes}" width="360" height="640" alt="${o.alt || ""}"${muat}>`;
  const video = topik.map((t, i) => {
    if (!fs.existsSync(path.join(ROOT, "assets", "video", `${t.klip}.mp4`))) {
      throw new Error(`assets/video/${t.klip}.mp4 belum ada. Bikin dulu pakai alat/klip-video.py (lihat README).`);
    }
    return `<video class="klip${i === 0 ? " is-on" : ""}" muted playsinline preload="none" data-src="${b}assets/video/${t.klip}.mp4" data-poster="${b}assets/video/${t.klip}-540.webp" data-gelembung="${esc(teksPolos(t.gelembung || "", ctx))}" aria-hidden="true"></video>`;
  });
  return [poster, ...video].join(`\n${o.indent}`);
}

module.exports = {
  maskot,
  IKON_KARTU,
  ikon,
  sosial,
  thumb,
  kartuVideo,
  tombolBeli,
  daftarAngka,
  head,
  header,
  footer,
  konfeti,
  teksPolos,
  deretKlip,
};
