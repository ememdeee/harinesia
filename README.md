# Situs Harinesia

Website statik untuk Harinesia. Konten ada di file JSON, lalu `build.js` mengubahnya jadi HTML biasa. Tanpa backend, tanpa CMS, dan tanpa `npm install`.

| Halaman | Dibuat dari | URL |
|---|---|---|
| Panduan (halaman jualan, prioritas) | `data/panduan.json` | `/panduan/` |
| Home | `data/beranda.json` | `/` |
| Kebijakan Privasi | `data/privasi.json` | `/privasi/` |
| Syarat & Ketentuan | `data/syarat.json` | `/syarat/` |
| 404 | `data/situs.json` → `halaman404` | otomatis di Netlify, Cloudflare Pages, dan Vercel |

## Edit konten

1. Edit file di folder `data/`:
   - `situs.json`: **link beli**, akun sosial, email kontak, angka statistik, dan pengaturan (sorotan placeholder, index Google, domain).
   - `produk.json`: nama produk, harga, isi paket, bonus, dan pembayaran. Dipakai di dua halaman sekaligus.
   - `panduan.json` dan `beranda.json`: semua teks per halaman, daftar video, modul, FAQ, dll.
2. Jalankan build:

   ```bash
   node build.js           # sekali
   node build.js --watch   # build ulang otomatis tiap file disimpan (enak dipakai bareng Live Server)
   ```

**Kalau perubahan JSON nggak muncul di halaman, berarti build-nya belum jalan.** Paling praktis, buka terminal VS Code (Ctrl+`) lalu biarkan `node build.js --watch` menyala selama kamu mengedit. Setiap JSON disimpan, HTML dibuat ulang dan Live Server ikut refresh.

`index.html`, `panduan/index.html`, dan `404.html` adalah **hasil build**. Jangan edit langsung, karena bakal tertimpa build berikutnya.

### Format teks di JSON

| Tulis | Hasil |
|---|---|
| `**tebal**` | **tebal** |
| `==kata==` | caption merah bergaris ala video Harinesia |
| `[teks](https://...)`, `[teks](../syarat/)`, `[teks](mailto:...)` | link (link keluar otomatis dibuka di tab baru) |
| `[TEKS APA PUN]` | placeholder yang disorot kuning sampai diganti |
| `\n` | pindah baris |
| `{produk.nama}`, `{produk.harga}`, `{statistik.likesTikTok}` | diisi otomatis dari `produk.json` / `situs.json` |

Kosongkan sebuah isian (`""`) kalau barisnya nggak dipakai, misalnya `hargaNormal` kalau nggak ada harga coret. Baris itu otomatis hilang dari halaman.

### Link pembelian (Link ID)

Di `data/situs.json`:

```json
"linkBeli": "https://link-pembelian-yang-asli",
```

Lalu `node build.js`. Semua tombol beli (header, hero, kartu harga, penutup, bar bawah di HP) langsung pakai link itu dengan label `labelBeli`. Selama masih `"#"`, tombol tetap tampil "Beli sekarang" (`labelBeliBelumAda`), tapi kalau diklik cuma muncul pesan `pesanBeliBelumAda`.

### Tambah atau ganti video

Di `panduan.json` (bagian `contoh.video`) atau `beranda.json` (bagian `video.video`):

```json
{ "youtube": "ID_SHORTS", "gambar": "nama-gambar", "views": "12 rb", "judul": "..." }
```

Thumbnail diambil dari `assets/img/v-nama-gambar-360.webp` (dan `-540.webp` untuk layar tajam), ukuran 9:16. Kalau filenya belum ada, build tetap jalan pakai thumbnail YouTube dan memberi peringatan.

### Setelah semua placeholder diisi

Output `node build.js` menampilkan jumlah placeholder yang tersisa per halaman. Setelah nol, set `"sorotPlaceholder": false` di `situs.json`.

## Lihat di komputer sendiri

```bash
node build.js --watch
python -m http.server 8765      # atau Live Server di VS Code
# buka http://localhost:8765/panduan/
```

## Warna, animasi, dan performa

- Warna ada di `assets/css/style.css` bagian `:root`:
  - `--accent: #cf3c4b` untuk tombol dan label, selalu dengan teks putih (kontras 4,8:1, lolos standar WCAG AA).
  - `--accent-soft: #e75562` adalah merah topeng logo versi lembut, untuk caption, hiasan, dan teks merah di latar gelap.
  - Kuning cuma dipakai untuk sorotan placeholder.
- Animasi: elemen muncul saat discroll, caption dicap, maskot berkedip, cuplikan di layar HP, playhead "Resep 60 detik", angka statistik naik, dan FAQ & kartu tebak yang buka/tutup dengan tinggi memanjang/menyusut halus. Animasi di bagian yang sedang di luar layar otomatis dijeda.
- Hover sengaja sedikit dan cuma di elemen yang bisa diklik (tombol, menu, kartu tebak, kartu video, FAQ). Isi kartu nggak pernah digeser. Hover cuma aktif di perangkat yang punya kursor.
- Semua gerak mati kalau pengunjung mengaktifkan "kurangi gerakan" di perangkatnya.
- Supaya ringan di Android, header nggak pakai efek blur dan nggak ada animasi dekoratif yang jalan terus.

## Angka yang perlu dicek berkala

Angka akun di `data/situs.json` → `statistik` (likes & jumlah video TikTok, views Short terbanyak), plus `views` di tiap video. Semua per **27 Oktober 2026**. Ubah juga `statistik.tanggal` saat memperbarui.

## Sebelum pindah ke domain final

- [ ] Di `situs.json`: isi `"domain": "https://domain-asli.com"` (untuk og:image & canonical) dan set `"bolehDiindexGoogle": true`. Sekarang skor SEO Lighthouse 63 hanya karena halaman sengaja di-noindex.
- [ ] Isi `linkBeli` dan semua placeholder.
- [ ] Minta klien membaca `/privasi/` dan `/syarat/`, terutama bagian **Pengembalian dana** (sekarang: pembelian final, kendala teknis dibantu). Ini draf yang ditulis dari cara situs bekerja, bukan nasihat hukum.

## Deploy

Build command: `node build.js`. Output/publish directory: root folder (`.` atau `/`).

- **Netlify:** lewat Git, `netlify.toml` sudah mengatur build. Lewat app.netlify.com/drop, jalankan `node build.js` dulu lalu seret folder ini.
- **Cloudflare Pages:** isi build command `node build.js` dan output directory `/`. Bisa juga "Upload assets" setelah build lokal.
- **Vercel:** `vercel.json` sudah berisi `buildCommand`. Pilih framework "Other".

Folder `data/`, `src/`, `build.js`, `brief-harinesia.md`, dan `README.md` ikut terunggah. Isinya nggak rahasia, tapi pindahkan brief kalau nggak mau bisa diakses publik.

## Struktur

```
data/          konten (JSON), yang diedit sehari-hari
src/           template HTML (teks.js, bagian.js, halaman/*.js)
build.js       pembuat HTML
assets/        css, js, font Poppins, gambar WebP
index.html, panduan/index.html, 404.html   hasil build
```

## Aset

- Thumbnail video dari YouTube Shorts @harinesia_id, dikonversi ke WebP.
- Logo topeng, favicon, dan maskot (termasuk di bagian "Kenalan dulu") berupa SVG yang digambar ulang dari avatar Harinesia, jadi tetap tajam di ukuran berapa pun.
- Font Poppins (SIL Open Font License), di-host sendiri, subset latin. Ikon sosial dari Simple Icons (CC0).

## Hasil cek (27 Okt 2026)

Lighthouse 12 mobile, server lokal:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/panduan/` | 99 | 100 | 100 | 63 (karena noindex) |
| `/` | 100 | 100 | 100 | 63 (karena noindex) |

Simulasi Android (CPU 4× lebih lambat, layar 360 px, scroll satu halaman Panduan): frame p95 8,5 ms, 0,3% frame tersendat.
