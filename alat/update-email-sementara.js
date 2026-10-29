// Perbarui daftar domain email sementara (temp mail) yang ditolak popup kupon.
//   node alat/update-email-sementara.js
// Sumber: github.com/disposable-email-domains/disposable-email-domains (CC0, domain publik).
// Hasilnya assets/data/email-sementara.txt, satu domain per baris; diunduh browser
// cuma pas popup kupon dibuka. Butuh Node.js 18 ke atas (pakai fetch bawaan).
const fs = require('fs');
const path = require('path');

const SUMBER = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf';
const TUJUAN = path.join(__dirname, '..', 'assets', 'data', 'email-sementara.txt');
// jaga-jaga kalau daftar sumbernya pernah salah masukin layanan email biasa
const JANGAN_DIBLOKIR = ['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.id', 'ymail.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'mail.com', 'gmx.com', 'aol.com', 'zoho.com'];

(async () => {
  const res = await fetch(SUMBER);
  if (!res.ok) throw new Error(`Gagal ngunduh daftar (HTTP ${res.status})`);
  const domain = [...new Set(
    (await res.text())
      .split('\n')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) && !JANGAN_DIBLOKIR.includes(d)),
  )].sort();
  if (domain.length < 1000) throw new Error(`Daftarnya cuma ${domain.length} domain, kayaknya ada yang salah. File lama nggak diubah.`);
  fs.mkdirSync(path.dirname(TUJUAN), { recursive: true });
  fs.writeFileSync(TUJUAN, domain.join('\n') + '\n');
  console.log(`OK: ${domain.length} domain -> ${path.relative(process.cwd(), TUJUAN)} (${(fs.statSync(TUJUAN).size / 1024).toFixed(0)} KB)`);
})().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
