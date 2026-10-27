// Bikin index.html, panduan/index.html, dan 404.html dari data/*.json.
//   node build.js           build sekali
//   node build.js --watch   build ulang otomatis tiap file di data/ atau src/ disimpan
// Nggak butuh npm install; cukup Node.js 18 ke atas.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const HALAMAN = [
  { nama: 'beranda', data: 'beranda.json', keluar: 'index.html', base: '', beranda: './', jalur: '' },
  { nama: 'panduan', data: 'panduan.json', keluar: 'panduan/index.html', base: '../', beranda: '../', jalur: 'panduan/' },
  { nama: 'privasi', template: 'legal', data: 'privasi.json', keluar: 'privasi/index.html', base: '../', beranda: '../', jalur: 'privasi/' },
  { nama: 'syarat', template: 'legal', data: 'syarat.json', keluar: 'syarat/index.html', base: '../', beranda: '../', jalur: 'syarat/' },
  { nama: '404', data: null, keluar: '404.html', base: '/', beranda: '/', jalur: '404.html' },
];

function bacaJson(file) {
  const teks = fs.readFileSync(path.join(ROOT, 'data', file), 'utf8').replace(/^﻿/, '');
  try {
    return JSON.parse(teks);
  } catch (e) {
    const pos = /position (\d+)/.exec(e.message);
    const baris = pos ? ` (sekitar baris ${teks.slice(0, +pos[1]).split('\n').length})` : '';
    throw new Error(`data/${file} bukan JSON yang valid${baris}.\n  ${e.message}\n  Biasanya karena koma kurang/kelebihan atau tanda kutip belum ditutup.`);
  }
}

function build() {
  // template dimuat ulang tiap build, biar mode --watch ikut kalau src/ diedit
  for (const k of Object.keys(require.cache)) if (k.startsWith(SRC)) delete require.cache[k];
  const { peringatan } = require('./src/teks');
  peringatan.length = 0;

  const situs = bacaJson('situs.json');
  const produk = bacaJson('produk.json');
  const laporan = [];
  for (const h of HALAMAN) {
    const ctx = {
      situs, produk, statistik: situs.statistik,
      data: h.data ? bacaJson(h.data) : null,
      base: h.base, beranda: h.beranda, jalur: h.jalur, halaman: h.nama,
    };
    const out = require(`./src/halaman/${h.template || h.nama}`)(ctx);
    const file = path.join(ROOT, h.keluar);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, out);
    const ph = (out.match(/class="ph"/g) || []).length;
    laporan.push(`  ${h.keluar.padEnd(20)} ${(Buffer.byteLength(out) / 1024).toFixed(1).padStart(5)} KB${ph ? `   ${ph} placeholder belum diisi` : ''}`);
  }

  const jam = new Date().toLocaleTimeString('id-ID');
  console.log(`✓ Build selesai (${jam})\n${laporan.join('\n')}`);
  const unik = [...new Set(peringatan)];
  if (unik.length) console.log(`! Perlu dicek:\n${unik.map((p) => `  - ${p}`).join('\n')}`);
  if (String(situs.linkBeli || '#').trim() === '#') console.log(`  (linkBeli masih "#": tombol tampil "${situs.labelBeliBelumAda}", kalau diklik cuma muncul pesan)`);
}

const pantau = process.argv.includes('--watch');
try {
  build();
} catch (e) {
  console.error(`✗ ${e.message}`);
  if (!pantau) process.exit(1);
}

if (pantau) {
  let jeda;
  const ulang = () => {
    clearTimeout(jeda);
    jeda = setTimeout(() => {
      try { build(); } catch (e) { console.error(`✗ ${e.message}`); }
    }, 150);
  };
  for (const dir of ['data', 'src']) fs.watch(path.join(ROOT, dir), { recursive: true }, ulang);
  console.log('Memantau data/ dan src/ ... simpan file buat build ulang (Ctrl+C buat berhenti)');
}
