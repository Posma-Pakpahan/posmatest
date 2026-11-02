# Klik Indomaret — Playwright + TypeScript

Test utama mengikuti alur **beranda → Kategori → Makanan → Madu → detail produk** dan selesai ketika nama serta harga produk tampil. Setup login dan test keranjang tersedia sebagai skenario opsional. Tidak memakai Cucumber, Page Object Model, atau framework tambahan.

## Instalasi

Gunakan Node.js 22.16 atau lebih baru dan Google Chrome yang sudah terpasang. Playwright menjalankan Chrome lewat `channel: 'chrome'`.

```powershell
npm ci
```

Test utama tidak memerlukan `.env`, kredensial, atau OTP. Untuk login opsional, salin `.env.example` menjadi `.env` dan isi `LOGIN_EMAIL` serta `LOGIN_PASSWORD`. Jangan menimpa `.env` lokal yang sudah berisi kredensial Anda.

## Jalankan

```powershell
npm test
```

Browser terlihat secara default saat dijalankan lokal. Alurnya:

1. Buka beranda Klik Indomaret.
2. Klik Kategori → Makanan → Madu.
3. Pilih satu produk madu dan buka halaman detailnya.
4. Memastikan URL sesuai tautan detail produk yang dipilih.
5. Memastikan judul sesuai nama produk dan harga rupiah tampil.

Test utama selesai di halaman detail produk tanpa menambahkan barang ke keranjang. Harga mengikuti produk, promo, dan area belanja, sehingga nilainya tidak dikunci ke screenshot.

## Login dan keranjang opsional

Perintah berikut terpisah dari test utama yang berhenti di detail produk.

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

Acuan screenshot terbaru adalah kategori Madu dan keranjang berisi **Madurasa Madu Jahe Merah Lemon 160g**. Test utama memilih salah satu produk di kategori dan memeriksa nama yang sama pada halaman detail. Selector detail mengasumsikan nama produk tampil sebagai heading dan harga sebagai teks rupiah. Struktur DOM detail dan alur login lanjutan belum dikonfirmasi, sehingga masih perlu validasi live.

Perubahan terakhir diperiksa dengan TypeScript dan daftar test tanpa membuka browser, sesuai permintaan pengguna. Alur E2E terbaru belum dijalankan.

Pemeriksaan lokal: TypeScript lolos. Pada percobaan ulang, beranda dan menu Kategori → Makanan → Madu berhasil diklik setelah selector Makanan dibatasi ke menu kategori. Halaman kategori Madu kemudian menampilkan verifikasi manusia Cloudflare sehingga daftar produk belum dapat diperiksa. Belum ada hasil E2E lulus atau sesi login yang tersimpan.

Percobaan dengan waktu tunggu dua menit untuk verifikasi manual juga berakhir di halaman Cloudflare. Test sesi tanpa file autentikasi berhasil dilaporkan `skipped`.

## Unggah ke GitHub

Repository: [Posma-Pakpahan/posmatest](https://github.com/Posma-Pakpahan/posmatest/tree/codex/klikindomaret-playwright), branch `codex/klikindomaret-playwright`.

`.env`, sesi login, `node_modules`, report, dan file pemeriksaan sementara sudah masuk `.gitignore`. `.env.example` hanya berisi placeholder.

```powershell
git add package.json package-lock.json playwright.config.ts tsconfig.json tests README.md .gitignore .env.example
git commit -m "Add Klik Indomaret Playwright tests"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Ganti URL dengan repository Anda. Jika remote `origin` sudah ada, lewati langkah penambahannya. Jangan unggah `.env` atau `playwright/.auth/user.json`, termasuk ke repository privat. Orang lain perlu membuat `.env` dan sesi login sendiri.
