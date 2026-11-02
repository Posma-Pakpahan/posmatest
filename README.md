# Klik Indomaret — Playwright + TypeScript

Proyek sederhana: satu test pengunjung, satu setup login manual, dan satu test dengan sesi. Tidak memakai Cucumber, Page Object Model, atau framework tambahan.

## Instalasi

Gunakan Node.js 22.16 atau lebih baru dan Google Chrome yang sudah terpasang. Playwright menjalankan Chrome lewat `channel: 'chrome'`.

```powershell
npm ci
Copy-Item .env.example .env
```

Isi `LOGIN_EMAIL` dan `LOGIN_PASSWORD` di `.env`. Di komputer proyek ini, `.env` sudah diisi; jangan timpa jika masih akan memakai akun yang sama.

## Jalankan

```powershell
npm test
```

Browser terlihat secara default saat dijalankan lokal. Alurnya:

1. Buka beranda Klik Indomaret.
2. Klik Kategori → Makanan → Madu.
3. Pilih satu produk madu dan buka halaman detailnya.
4. Klik tombol keranjang pada detail produk.
5. Pastikan form Masuk Akun muncul dan tombol Selanjutnya belum aktif ketika email kosong.

Test pengunjung memang selesai di form login. Test ini tidak mengirim kredensial atau meminta OTP.

## Verifikasi email dan sesi

```powershell
npm run auth
```

Setup membuka login dari tombol Masuk di beranda, mengisi email dari `.env`, dan mengisi password ketika inputnya muncul. Selesaikan verifikasi human dan OTP email langsung di browser yang terbuka. Jika Enter tidak mengirim form password, klik tombol konfirmasinya secara manual. Jangan tutup browser sebelum terminal menyatakan sesi tersimpan.

Sesudah berhasil login, state browser disimpan di `playwright/.auth/user.json`. Ini memakai [storageState Playwright](https://playwright.dev/docs/auth), bukan melewati verifikasi server.

```powershell
npm run test:session
```

Test sesi mengulang alur kategori dan detail produk, lalu memeriksa keberhasilan respons mutasi keranjang. Filter URL API keranjang dan properti `success: true` masih asumsi awal; cocokkan dengan respons situs saat akses live tersedia. Test ini **skipped** jika file sesi belum tersedia. Jika sesi kedaluwarsa, jalankan `npm run auth` lagi. OTP tidak disimpan dan tidak dibaca otomatis dari email.

Test sesi dapat menambah satu produk ke keranjang akun asli. Tidak melakukan checkout atau pembayaran.

## Pemeriksaan dan report

```powershell
npm run typecheck
npm run report
```

Report lokal ada di `playwright-report/`. Rekaman trace dan screenshot dimatikan untuk setup login dan test sesi agar data akun tidak terekam di artefak tersebut.

## Cloudflare dan gambar kosong

Pada pemeriksaan 2 November 2026, akses otomatis sempat mendapat verifikasi Cloudflare; beberapa endpoint gambar juga mengembalikan HTTP 403, meskipun beranda mendapat HTTP 200. Menunggu lebih lama tidak menyelesaikan request yang ditolak. Tidak ada pemblokiran gambar atau script stealth di proyek ini.

Jika verifikasi human muncul, selesaikan manual di browser. Jika tetap ditolak, pengujian situs produksi memerlukan akses yang diizinkan pemilik situs, misalnya lingkungan staging atau allowlist untuk pengujian. Sesi login aplikasi tidak menjamin lolos pemeriksaan Cloudflare. Produk dan stok juga mengikuti area belanja yang dipilih situs.

Untuk memberi waktu hingga dua menit menyelesaikan verifikasi human pada beranda dan halaman kategori, tambahkan `MANUAL_VERIFICATION=1` di `.env`, lalu jalankan `npm test`. Test melanjutkan otomatis ketika halaman yang diperlukan sudah tampil. Kembalikan ke `0` untuk timeout biasa. Pengaturan ini hanya memperpanjang waktu tunggu.

Selector kategori sudah diperiksa pada DOM langsung. Alur setelah masuk kategori, login berhasil, dan mutasi keranjang masih perlu divalidasi ketika akses Cloudflare dan OTP tersedia. Kegagalan akses tetap dilaporkan sebagai kegagalan test.

Acuan form login adalah screenshot yang diberikan: judul **Masuk Akun**, placeholder **Masukkan nomor handphone atau email**, serta tombol **Selanjutnya** yang nonaktif ketika input kosong. Screenshot memperlihatkan modal di halaman daftar produk; test tetap mengikuti permintaan membuka detail produk terlebih dahulu. Struktur DOM detail produk dan alur sesudah memasukkan email belum dikonfirmasi, sehingga bagian tersebut masih perlu penyesuaian setelah pengujian live memungkinkan.

Pemeriksaan lokal: TypeScript lolos. Pada percobaan ulang, beranda dan menu Kategori → Makanan → Madu berhasil diklik setelah selector Makanan dibatasi ke menu kategori. Halaman kategori Madu kemudian menampilkan verifikasi manusia Cloudflare sehingga daftar produk belum dapat diperiksa. Belum ada hasil E2E lulus atau sesi login yang tersimpan.

Percobaan dengan waktu tunggu dua menit untuk verifikasi manual juga berakhir di halaman Cloudflare. Test sesi tanpa file autentikasi berhasil dilaporkan `skipped`.

## Unggah ke GitHub

`.env`, sesi login, `node_modules`, report, dan file pemeriksaan sementara sudah masuk `.gitignore`. `.env.example` hanya berisi placeholder.

```powershell
git add package.json package-lock.json playwright.config.ts tsconfig.json tests README.md .gitignore .env.example
git commit -m "Add Klik Indomaret Playwright tests"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Ganti URL dengan repository Anda. Jika remote `origin` sudah ada, lewati langkah penambahannya. Jangan unggah `.env` atau `playwright/.auth/user.json`, termasuk ke repository privat. Orang lain perlu membuat `.env` dan sesi login sendiri.
