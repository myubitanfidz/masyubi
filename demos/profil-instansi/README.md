# Profil instansi — SMA Nusa Cendekia

Demo profil sekolah fiktif untuk portofolio Masyubi. HTML, CSS, JavaScript vanilla; tanpa build atau backend. Semua aset runtime berada di folder demo.

## Preview

Dari root repository, jalankan:

```powershell
node demos/profil-instansi/qa/verify.mjs --serve
```

Buka `http://127.0.0.1:4178/masyubi/demos/profil-instansi/`. Indeks portofolio tersedia di `http://127.0.0.1:4178/masyubi/index.html#portofolio`. Hentikan dengan Ctrl+C. Bisa juga memakai server statis pilihan Anda dari root repository, atau langsung membuka `index.html` demo.

## Fitur

Anchor navigasi, menu mobile dengan Escape dan keyboard, galeri dialog dengan tombol panah, FAQ native, formulir yang hanya menampilkan status demo, tautan kembali ke portofolio, serta dukungan reduced motion. Isi, navigasi, dan FAQ tetap tersedia tanpa JS; tautan foto langsung membuka file. Formulir tidak mengirim atau menyimpan data.

## Verifikasi

`qa/verify.mjs` memakai Puppeteer dari instalasi chrome-devtools-mcp yang sudah tersedia. Set `CHROME_TEST_BUNDLE` ke path `chrome-devtools-mcp/build/src/third_party/index.js`; opsional `CHROME_PATH` untuk lokasi Chrome. Jalankan tanpa `--serve` untuk menguji. Tidak menambah dependensi ke package.json website utama.

Screenshot dan hasil: `qa/page-*.png`, `qa/results.json`, dan `qa/comparison.html`. Arah desain serta lisensi foto dijelaskan di DESIGN.md dan ASSETS.md. Lighthouse tidak dijalankan.
