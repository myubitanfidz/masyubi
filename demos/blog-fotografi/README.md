# Ruang Cahaya

Blog fotografi fiktif untuk demo Masyubi. HTML/CSS/JavaScript vanilla dengan delapan halaman artikel statis, aset lokal, tanpa npm atau build.

## Preview

Buka index.html langsung, gunakan Live Server, atau jalankan dari root repository:

```powershell
node demos/blog-fotografi/qa/preview.mjs
```

Buka http://127.0.0.1:4182/masyubi/demos/blog-fotografi/ . Hentikan server dengan Ctrl+C. Prefix /masyubi/ mensimulasikan project GitHub Pages. Folder tanpa slash dan file HTML langsung juga didukung.

## Isi

- index.html: artikel unggulan, delapan tulisan, filter/pencarian, tentang, jasa konsep, konsultasi simulasi.
- artikel/: delapan artikel HTML dengan daftar isi, kredit, latihan, terkait, berbagi dan CTA.
- assets/css/style.css, assets/js/main.js, assets/images/: seluruh aset runtime lokal.
- DESIGN.md: sistem desain dan perbedaan UX.
- ASSETS.md: pembuat, sumber, lisensi foto, dan rujukan editorial.
- qa/: preview, pemeriksaan browser, hasil dan screenshot.

Tanggal artikel, identitas penulis, layanan, dan skenario adalah konsep. Foto stok bukan karya Raka. Kontak placeholder; form tidak mengirim atau menyimpan data.

## QA opsional

Website tidak memerlukan dependency. Script qa/verify.mjs hanya untuk pengujian pengembang, memakai Chrome dan Puppeteer dari instalasi chrome-devtools-mcp yang sudah tersedia. Set CHROME_TEST_BUNDLE ke chrome-devtools-mcp/build/src/third_party/index.js dan opsional CHROME_PATH ke executable Chrome, lalu jalankan node demos/blog-fotografi/qa/verify.mjs. Hasil aktual tercatat di qa/results.json. Cabang Web Share, clipboard, penolakan izin, dan pembatalan diuji dengan stub API; dialog berbagi sistem operasi tidak dibuka. Lighthouse tidak dijalankan.

Pemeriksaan tambahan: `node demos/blog-fotografi/qa/edge-cases.mjs` dengan environment yang sama. Menguji layar 320–1440px, pencarian 120 karakter tanpa spasi, reset hasil, serta pencarian dari halaman artikel. Hasil disimpan di `qa/edge-results.json`, dengan screenshot pencarian panjang di `qa/long-search-390.png`.

Untuk memeriksa hanya thumbnail, tautan masuk, dan tautan kembali ke portofolio utama, jalankan `node demos/blog-fotografi/qa/verify.mjs --integration`. Hasil terpisah disimpan di `qa/results-integration.json`.

Tambahkan `--compare` bila ingin memperbarui screenshot perbandingan dengan demo lain. Langkah ini dijalankan setelah hasil uji fungsi disimpan; situs pembanding dapat memuat font atau aset eksternal. `--quick` menguji fungsi yang sama dengan screenshot pada lebar 390px saja dan menyimpan hasil di `qa/results-quick.json`.

Regresi URL tanpa slash: `node demos/blog-fotografi/qa/paths.mjs`. Server pengujian sengaja tidak mengalihkan direktori ke URL dengan slash, seperti sebagian server preview. Memeriksa CSS/JS, gambar, tautan, query/hash, prefix `/masyubi/`, dan preview file; hasil di `qa/paths-results.json`. Beranda menormalkan URL HTTP sebelum aset relatif dimuat.
