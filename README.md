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

### Video di hero

Hero memutar klip pendek dari video Harinesia, gantian ganti topik kayak geser video di TikTok. Klip berikutnya naik dari bawah, dan maskot bereaksi tiap ganti topik (gelembungnya ganti kata, kepalanya geleng).

- **Panduan**: klipnya diputar di layar HP, dengan bar progres per topik di bawahnya. Ketuk HP buat lompat ke topik berikutnya.
- **Home**: dua kartu di kiri-kanan maskot memutar klip sendiri-sendiri. Kartu kiri dapat topik ke-1, 3, 5; kartu kanan ke-2, 4, 6.

Daftar klipnya ada di bagian `hero` → `topik` pada `panduan.json` / `beranda.json`:

```json
"topik": [
  { "klip": "klip-pelangi", "gelembung": "kok bisa?" },
  { "klip": "klip-jendela", "gelembung": "lho, bolong?" }
]
```

- `klip` = file `assets/video/<klip>.mp4`, plus posternya `<klip>-360.webp` dan `<klip>-540.webp`. Klip pertama juga jadi gambar yang tampil sebelum videonya jalan.
- `gelembung` = kata maskot pas topik itu muncul.

Klip tanpa suara, 100–180 KB per buah, baru diunduh setelah halaman selesai dimuat dan bagiannya kelihatan, dan berhenti kalau discroll lewat. Pengunjung yang memilih "kurangi gerakan" atau mode hemat data cuma lihat poster + tombol play (ketuk buat muter).

**Bikin atau ganti klip.** Pakai `alat/klip-video.py` (Python 3). Sekali saja, pasang paketnya:

```bash
python -m venv .venv-alat
.venv-alat/Scripts/python -m pip install yt-dlp imageio-ffmpeg pillow   # Mac/Linux: .venv-alat/bin/python
```

Lalu potong dari ID Shorts (atau file `.mp4` dari tim video, hasilnya lebih bersih), mis. mulai detik ke-0,5 sepanjang 4,6 detik:

```bash
.venv-alat/Scripts/python alat/klip-video.py 7-3_2FWEih0 klip-pelangi --mulai 0.5 --durasi 4.6
```

Hasilnya langsung masuk `assets/video/`. Tambahkan namanya di `topik`, lalu `node build.js`.

### Popup kupon 15% (Panduan)

Popup muncul **sekali**, setelah pengunjung scroll sampai bagian "Resep 60 detik" **dan** sudah minimal 25 detik di halaman. Pengunjung isi nama & email, datanya masuk ke Google Sheet (tab **Newsletter**), lalu kode kuponnya tampil dengan tombol "Salin" dan "Pakai sekarang" (ke link beli).

- **Kode kupon**: diambil langsung dari Google Sheet (tab **Kupon**, baris paling bawah) tiap ada yang daftar, dan diganti dari halaman `/buat-kupon/` (lihat di bawah), tanpa build atau push. `data/panduan.json` → `kupon.kode` cuma **kode cadangan**, dipakai kalau tab Kupon masih kosong atau Sheet lagi nggak bisa dihubungi. Dua-duanya harus sudah dibuat di checkout Lynk.id.
- **Kapan muncul**: `kupon.munculDiBagian` (id bagian), `kupon.munculSetelahDetik`, dan `kupon.jedaHari` (kalau ditutup, baru muncul lagi setelah sekian hari). Yang sudah daftar nggak dikasih popup lagi di browser yang sama.
- **Teks popup**: semua ada di `kupon` (judul, label, pesan error, dll.).
- **Alamat Google Sheet**: `data/situs.json` → `endpointNewsletter`. Format request-nya di `newsletter-endpoint.md`. Tiap pendaftar masuk sebagai satu baris di tab **Newsletter**: Tanggal, Full Name, Email, Sumber (`/panduan/ · popup kupon 15%`), dan Kode Kupon yang dia dapat. Apps Script-nya (Extensions → Apps Script di Sheet itu) yang nentuin kodenya: jawabannya `{"ok": true, "kupon": "KODE"}`.
- **Cek email**: formatnya dicek dulu di browser; salah ketik domain populer (`gmial.con`, `yaho.com`, …) ditanyain "Maksudnya …@gmail.com?"; lalu dicek lagi oleh Google Sheet. Kuponnya baru muncul kalau datanya benar-benar tersimpan. Formulir juga punya jebakan bot (kolom `website` yang tersembunyi).
- **Domain email harus bisa nerima email**: sebelum dikirim, domainnya (bagian setelah @) dicek ke DNS publik Google (`dns.google`). Domain yang nggak ada (`budi@eekjf.com`) atau sengaja nggak nerima email (`@example.com`) ditolak. Kalau DNS-nya lagi gangguan, emailnya tetap diterima biar pengunjung asli nggak kejebak.
- **Email sementara (temp mail) ditolak**: dicek ke daftar ±10 rb domain di `assets/data/email-sementara.txt` (sumber: [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains), CC0) plus kata kunci seperti `tempmail`, `10minute`, `yopmail`. Daftarnya baru diunduh browser pas popup kebuka. Layanan temp mail sering bikin domain baru, jadi perbarui daftarnya sesekali: `node alat/update-email-sementara.js`, lalu build & push.
- **Buat ngecek tampilannya**: buka `/panduan/?kupon`. Popup langsung muncul walau browser sudah pernah nutup/daftar, dan nutup/daftar di mode ini nggak dicatat browser. Kalau popup aslinya nggak muncul lagi di browser kamu (karena pernah ditutup/daftar), hapus ingatannya lewat Console (F12): `localStorage.removeItem('harinesia-kupon')`. Kalau beneran dikirim, datanya ikut masuk ke Sheet, jadi hapus barisnya setelah tes.

### Bikin & ganti kode kupon (`/buat-kupon/`)

Halaman internal buat ganti kode kupon tanpa build atau push:

1. **Bikin kode baru**: atur awalan (mis. `HARI15`), panjang bagian acak, jumlah kode, tanda hubung, dan hindari huruf yang gampang ketuker (0/O, 1/I/L). Kodenya dibikin di browser (`crypto.getRandomValues`).
2. **Daftarkan kodenya di Lynk.id** sebagai kupon diskon 15%.
3. Isi **PIN**, klik **Jadikan kode aktif** di kode itu. Kodenya ditambah sebagai baris baru di tab **Kupon** di Google Sheet, dan pendaftar berikutnya langsung dapat kode itu. Tombol **Cek kode aktif** nunjukin kode yang lagi dipakai.

- **PIN** disetel di Apps Script (`KUPON_PIN`, minimal 8 karakter) dan nggak pernah ada di kode website. Setelah 10 kali salah PIN, halaman ini dikunci 10 menit. PIN diingat browser selama tab-nya masih terbuka.
- Kode aktif juga bisa diganti langsung di Sheet: tambah baris di paling bawah tab **Kupon**. Riwayat kode yang pernah aktif tetap kelihatan di sana.
- Halaman ini nggak ditautkan dari mana pun dan nggak diindex Google, tapi alamatnya tetap bisa dibuka siapa saja; yang ngelindungin cuma PIN-nya.

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
- Animasi: elemen muncul saat discroll, caption dicap, maskot berkedip, video di hero (lihat "Video di hero"), playhead "Resep 60 detik", angka statistik naik, dan FAQ & kartu tebak yang buka/tutup dengan tinggi memanjang/menyusut halus. Animasi di bagian yang sedang di luar layar otomatis dijeda.
- Hover sengaja sedikit dan cuma di elemen yang bisa diklik (tombol, menu, kartu tebak, kartu video, FAQ). Isi kartu nggak pernah digeser. Hover cuma aktif di perangkat yang punya kursor.
- Semua gerak mati kalau pengunjung mengaktifkan "kurangi gerakan" di perangkatnya. Klip di hero juga nggak diputar sendiri (cukup ketuk buat muter).
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

Folder `data/`, `src/`, `alat/`, `build.js`, `brief-harinesia.md`, dan `README.md` ikut terunggah. Isinya nggak rahasia, tapi pindahkan brief kalau nggak mau bisa diakses publik.

## Struktur

```
data/          konten (JSON), yang diedit sehari-hari
src/           template HTML (teks.js, bagian.js, halaman/*.js)
build.js       pembuat HTML
alat/          skrip pembantu: potong klip video hero (Python) & perbarui daftar temp mail (Node)
assets/        css, js, font Poppins, gambar WebP, klip video (assets/video/)
index.html, panduan/index.html, 404.html   hasil build
```

## Aset

- Thumbnail video dari YouTube Shorts @harinesia_id, dikonversi ke WebP. Klip di hero (`assets/video/`) dipotong dari Shorts yang sama pakai `alat/klip-video.py`.
- Logo topeng, favicon, dan maskot (termasuk di bagian "Kenalan dulu") berupa SVG yang digambar ulang dari avatar Harinesia, jadi tetap tajam di ukuran berapa pun.
- Font Poppins (SIL Open Font License), di-host sendiri, subset latin. Ikon sosial dari Simple Icons (CC0).

## Hasil cek (28 Okt 2026)

Lighthouse 12 mobile, server lokal:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/panduan/` | 99 | 100 | 100 | 100 |
| `/` | 99 | 100 | 100 | 100 |

Simulasi Android (CPU 4× lebih lambat, layar 360 px, scroll satu halaman Panduan sambil klip di hero jalan): frame p95 8,4 ms, 0% frame tersendat.
