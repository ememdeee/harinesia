# Bikin 2 halaman statik (Panduan + Home) untuk Harinesia

## Konteks
Klien baru: Harinesia, akun konten edukasi di TikTok, Instagram, dan YouTube Shorts. Mereka mau website untuk menjual produk digital berupa panduan dan kelas online (e-course). Jenis produknya sama seperti di kitabedah.id. Kitabedah.id dipakai sebagai acuan umum untuk alur dan level kualitas: hasil akhir minimal sebaik itu, idealnya lebih baik. Ini bukan untuk disalin.

## Scope
1. **Halaman Panduan (`/panduan`), PRIORITAS UTAMA.** Halaman jualan dan tempat mayoritas pengunjung mendarat. Kerjakan duluan. Ikuti kurang lebih alur halaman panduan di kitabedah.id sebagai acuan, tapi susunan, bagian, dan penyajiannya bebas disesuaikan dengan produk dan brand Harinesia.
2. **Home (`/`)**, prioritas rendah. Kerjakan setelah Panduan selesai.

## Aturan konten
- Semua teks ditulis ulang dari nol dengan suara Harinesia, bukan parafrase kalimat kitabedah.
- Tidak boleh memakai gambar, angka, testimoni, atau klaim kitabedah.
- Detail produk dan harga belum final, jadi pakai placeholder yang jelas (misal `[HARGA]`, `[NAMA PRODUK]`) dan tandai supaya mudah diganti.

## Desain
- Belum ada logo, warna, atau font. Ambil dari akun sosial Harinesia (referensi utama TikTok, lalu Instagram dan YouTube) dan buat tampilannya konsisten dengan itu.
- Tidak harus identik dengan sosmed. Kalau ada pilihan yang lebih bagus untuk web, boleh, asal tetap on brand.
- Harus jelas berbeda dari tampilan kitabedah.id.

## Link sosial (taruh di header dan footer)
- TikTok: https://www.tiktok.com/@harinesia
- Instagram: https://www.instagram.com/harinesia.id/
- YouTube: https://www.youtube.com/@harinesia_id

## Tombol beli
Mengarah ke link eksternal (Link ID) yang akan dikirim menyusul. Sementara pakai placeholder `#` dengan label "Link pembelian segera hadir", dan buat supaya URL-nya mudah diganti di satu tempat.

## Teknis
- Website statik (HTML/CSS/JS), tanpa backend dan tanpa CMS.
- Mobile-first dan responsif, karena mayoritas pengunjung datang dari sosmed di HP.
- Cepat: gambar WebP dan lazy-load, tanpa library berat, target Lighthouse mobile 90+.
- Disarankan dibangun dengan Claude Opus 5.5.
- Domain dan hosting belum ada. Untuk sekarang pakai domain dummy dan host di mana saja (Vercel, Netlify, Cloudflare Pages, dll.). Domain asli menyusul.

## Definition of done
- Halaman Panduan live di URL dummy dan sudah dicek di HP dan desktop.
- Semua link sosial berfungsi, dan tombol beli sudah punya placeholder yang mudah diganti.
- Klien sudah review dan setuju dengan teks dan desainnya.
- Home dikerjakan setelah itu.

## Menunggu dari klien/PM
- Link pembelian (Link ID)
- Harga dan detail isi produk
- Domain dan hosting final
