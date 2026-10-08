# Ruang Reka Photo

Demo portofolio dan jasa fotografer fiktif Raka Pradana untuk Masyubi. HTML, CSS, JavaScript vanilla, aset lokal; tidak memerlukan npm, build, backend, database, atau layanan berbayar.

## Preview

Buka `index.html` di folder ini secara langsung, atau jalankan server statis dari root repository. Pilihan preview yang disediakan menggunakan Node bawaan tanpa instalasi package:

```powershell
node demos/portofolio-fotografer/qa/preview.mjs
```

Buka `http://127.0.0.1:4180/masyubi/demos/portofolio-fotografer/`. Indeks utama: `http://127.0.0.1:4180/masyubi/index.html#portofolio`. Hentikan dengan Ctrl+C. File demo juga dapat diunggah langsung sebagai folder ke hosting statis/GitHub Pages.

## Fitur

- Sembilan foto stok dengan kredit asli, filter empat jenis karya, lightbox dengan tombol panah dan pemulihan fokus.
- Menu mobile dengan keyboard dan Escape, navigasi anchor, tombol kembali ke atas.
- Paket jasa details/summary dan CTA yang memilih jenis sesi pada formulir.
- Tombol WhatsApp/email placeholder yang mengarah ke simulasi lokal.
- Formulir demo tanpa pengiriman/storage, reduced motion, serta fallback tanpa JS.

Foto bukan karya Raka. Semua harga/detail paket adalah contoh, brand dan identitas fotografer fiktif, pemesanan belum tersedia. Sumber serta lisensi: `ASSETS.md`. Keputusan visual: `DESIGN.md`.

## QA

`qa/verify.mjs` menggunakan Chrome dan Puppeteer dari instalasi chrome-devtools-mcp yang sudah tersedia, bukan dependensi runtime website. Set `CHROME_TEST_BUNDLE` ke file `chrome-devtools-mcp/build/src/third_party/index.js`, opsional `CHROME_PATH` untuk executable Chrome, lalu jalankan:

```powershell
node demos/portofolio-fotografer/qa/verify.mjs
```

Hasil dan screenshot tersimpan pada folder `qa/`. Browser/server pengujian ditutup otomatis. Preview tetap bisa digunakan tanpa alat QA tersebut. Audit Lighthouse tidak dijalankan.
