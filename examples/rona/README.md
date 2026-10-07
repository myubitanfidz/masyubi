# RONA Pocket

Landing page kamera fiktif untuk portofolio Masyubi. HTML, CSS, JavaScript vanilla, aset lokal. Tidak membutuhkan npm, build, Python, backend, atau koneksi internet saat dibuka. Tidak dideploy; website utama tidak diubah.

## Preview

Buka `examples/rona/index.html` langsung di browser, atau klik kanan file tersebut di VS Code → **Open with Live Server**. Jika server proyek sudah berjalan, buka `/examples/rona/index.html`. URL folder `/examples/rona` dengan atau tanpa garis miring juga didukung.

## File

- `index.html`: seluruh konten, anchor, FAQ, dan native dialog.
- `assets/css/style.css`: sistem desain, layout responsif, fokus, reduced motion, dan font lokal.
- `assets/js/main.js`: menu mobile, pilihan tiga varian, ringkasan, dan lightbox enam foto.
- `assets/images/`: sumber ilustrasi kamera orisinal SVG, render WebP kamera, dan foto ilustrasi WebP lokal. Hero menyematkan WebP langsung dalam HTML.
- `assets/css/fonts.css` dan `fonts-local.css`: font WOFF2 lokal untuk HTTP dan versi tertanam untuk preview file lokal.
- `assets/fonts/`: dua font WOFF2 beserta lisensi.
- `DESIGN.md`: arah visual dan referensi yang dipelajari sebelum implementasi.
- `ASSETS.md`: asal aset, lisensi, dan batas penggunaan ilustrasi.
- `qa/`: alat verifikasi dan hasil yang benar-benar diukur.

## Interaksi

Menu mobile mendukung Escape dan `aria-expanded`. Swatch Paper, Charcoal, Olive memakai `aria-pressed` dan ilustrasi varian yang sesuai. Ringkasan dan lightbox mengunci fokus, mendukung Escape, dan mengembalikan fokus ke pemicu. Galeri memiliki navigasi sebelumnya/berikutnya dan tombol panah keyboard. FAQ memakai `details/summary`.

Tanpa JavaScript, konten, navigasi, FAQ, dan tautan foto tetap berfungsi. Kontrol yang memerlukan JavaScript hanya ditampilkan setelah inisialisasi. Produk dan spesifikasi bersifat konsep; tidak ada transaksi atau pemesanan.

## Verifikasi

Hasil uji browser dicatat di `qa/results.json`. Skrip `qa/verify.mjs` memakai Puppeteer dari alat pengujian yang sudah tersedia di lingkungan pengembangan, bukan dependency halaman. Jalankan dengan `CHROME_TEST_BUNDLE` menunjuk ke bundle `chrome-devtools-mcp/build/src/third_party/index.js` lokal dan Chrome Windows terpasang. Skrip membuat server uji sementara, menguji layout/interaksi, mengambil screenshot, lalu menutup server dan browser.

Pada 7 Oktober 2026, Chrome 154 headless Windows: **65 pemeriksaan lulus**, tanpa error console/page, gambar rusak pada konten, atau horizontal overflow. Lebar 360, 390, 768, 1024, 1440 px dengan DPR 1 diuji. Menu/Escape, anchor, semua varian, ringkasan, fokus dialog, navigasi lightbox, FAQ, reduced motion, URL folder dengan/tanpa slash, file lokal, dan penggunaan tanpa JavaScript diperiksa. Screenshot setiap lebar tersedia sebagai `qa/page-*.png`; screenshot desktop/mobile ditinjau setelah perbaikan.

Lighthouse 13.5.0: HTTP localhost, Chrome 154 headless, mobile 390 × 844, DPR 1,75, simulated throttling RTT 150 ms / 1638,4 Kbps / CPU ×4. Tiga audit kode final yang sama dicatat di `qa/measured-runs.json`:

| Audit | Performance | Accessibility | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 84 | 100 | 2,31 s | 0 | 529 ms |
| 2 | 99 | 100 | 1,39 s | 0,059 | 33 ms |
| 3 | 84 | 100 | 2,43 s | 0 | 511 ms |

Best Practices dan SEO: 100 pada ketiga audit. Target Accessibility ≥95 dan CLS ≤0,1 tercapai. Performance ≥90 tercapai pada audit kedua, tetapi **belum konsisten** pada host pengujian ini. Tidak diklaim bebas lag atau dijamin mendapat skor tertentu pada perangkat lain. Penyebab variasi antar-audit belum terisolasi. Laporan terakhir: `qa/lighthouse.html` dan `qa/lighthouse-summary.json`.

Opsional: set `LIGHTHOUSE_MODULE` ke modul resmi `lighthouse/core/index.js` lokal untuk menjalankan audit setelah pengujian, dalam browser baru. `node examples/rona/qa/verify.mjs --audit-only` menjalankan audit saja. Alat QA tidak diperlukan untuk preview atau hosting halaman.
