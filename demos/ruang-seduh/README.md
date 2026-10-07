# Ruang Seduh

Demo toko kopi fiktif untuk portofolio Masyubi, dibuat terpisah dari halaman utama. HTML, CSS, dan JavaScript statis; tanpa framework, dependency runtime, backend, atau pembayaran. Tidak dideploy.

## Preview

Dari root repository `masyubi-web`:

```powershell
npm run serve
```

Buka alamat localhost yang muncul di terminal, lalu tambahkan `/demos/ruang-seduh/index.html` untuk Beranda atau `/demos/ruang-seduh/shop.html` untuk Shop. Bisa juga membuka `index.html` demo langsung atau memakai Live Server di VS Code. Tidak perlu Python atau build Tailwind. URL folder `/demos/ruang-seduh` tanpa garis miring di akhir juga didukung: base URL disesuaikan sebelum CSS, JavaScript, dan gambar dimuat.

Demo juga terhubung dari kartu **Ruang Seduh** pada bagian **Contoh** di `index.html` utama Masyubi. Tautannya menunjuk langsung ke `demos/ruang-seduh/index.html`, sehingga bisa dibuka ketika `index.html` utama dibuka langsung dari file lokal. Folder Kopi Nusantara lama tetap tersedia.

## Isi dan keputusan

- `index.html`: hero 40/60, kategori, empat produk pilihan, cerita ritual, dan CTA.
- `shop.html`: 12 produk, grid 2/3/4 kolom, pencarian nama, kategori, sort harga, dan kondisi kosong.
- `assets/app.js`: data contoh, detail/varian/jumlah, keranjang, subtotal, localStorage tervalidasi, dan checkout demo. Fokus dialog berputar, Escape menutup, fokus kembali ke pembuka. Menambah barang tidak merender ulang katalog.
- `assets/style.css`: sistem cream/zaitun, CSS variables, font lokal, state hover/fokus/aktif, serta reduced motion.
- [DESIGN.md](DESIGN.md): keputusan sebelum implementasi, tiga URL referensi, dan batas riset. Akses teks referensi berhasil; penampilan visual referensi tidak dapat diperiksa menggunakan browser terhubung. Proporsi dan spacing adalah keputusan desain sendiri.
- `assets/images/`: foto orisinal brand fiktif dari **ImageGen bawaan**, masing-masing dibuat terpisah, lalu di-resize/encode menjadi WebP. Hero 640/960/1440 px, katalog 320/640 px, cerita 640/960/1440 px. [Prompt lengkap](assets/image-prompts.json) mencatat generation dan koreksi label hero.
- `assets/fonts/`: Plus Jakarta Sans dan Lora Latin WOFF2 dengan font-display swap dan salinan lisensi OFL dari Google Fonts.
- `qa/`: screenshot, laporan fungsi JSON, serta laporan Lighthouse HTML/JSON. Profil browser lokal diabaikan oleh Git.

Keranjang memakai kunci `ruang-seduh-cart-v1`; varian dan jumlah 1–99 divalidasi sebelum dipakai. Data rusak diabaikan dengan pesan pemulihan. Jika penyimpanan diblokir, keranjang tetap berfungsi dalam sesi halaman. Checkout hanya ringkasan; pesanan tidak dikirim dan tidak ada data pembayaran/pribadi yang diminta.

## Validasi

Pengujian Chrome headless lokal pada 7 Oktober 2026: **57 pemeriksaan lulus**, tanpa error console/page. Lebar 360, 390, 768, dan 1440 px diperiksa untuk beranda dan shop; tidak ada horizontal overflow. Pencarian gabungan dengan kategori, reset, dua urutan harga, deep link kategori, detail, jumlah tidak valid, varian terpisah, penambahan/pengurangan/penghapusan, subtotal, checkout, reload, data storage rusak/varian tidak valid/storage diblokir, Escape, pengembalian fokus, 12 kali Tab dalam modal, dan reduced motion teruji. Rincian: [functional-results.json](qa/functional-results.json).

Screenshot beranda/shop tersedia untuk semua empat lebar. Review pertama menemukan teks penjelas terlalu kecil dan label hero 250 g berbeda dari katalog 200 g; keduanya diperbaiki. Pemeriksaan keyboard menemukan Tab bisa keluar dari dialog, lalu diperbaiki dan diuji ulang. Pada tablet, judul awal terputus di tanda hubung dan foto cerita terlalu kecil: ukuran judul disesuaikan menjadi dua baris, dan bagian cerita memakai foto lebar dengan teks di bawahnya. Pemeriksaan tambahan 768 px dicatat di `qa/tablet-results.json`. Screenshot full-page diambil setelah menggulir untuk memuat gambar lazy; dialog diambil pada viewport.

Lighthouse **13.5.0 lengkap**, Chrome **154.0.0.0** headless Windows, HTTP localhost, emulasi mobile 390 × 844 px dengan DPR 1.75, simulated throttling RTT 150 ms, throughput 1638.4 Kbps, dan CPU ×4. Audit dijalankan terpisah dari pengujian fungsi pada hasil terakhir; metrik laboratorium, bukan pengukuran perangkat HP nyata atau hosting produksi.

| Halaman | Performance | Accessibility | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
| Beranda | 100 | 100 | 1,87 s | 0 | 0 ms |
| Shop | 95 | 100 | 1,88 s | 0 | 236 ms |

Best Practices dan SEO: 100 pada kedua halaman. Target Performance ≥90, Accessibility ≥95, LCP ≤2,5 s, dan CLS ≤0,1 tercapai dalam kondisi tersebut. Skor dapat berubah sesuai mesin, jaringan, dan hosting. Shop masih memiliki TBT 236 ms pada simulasi CPU ×4; tidak diklaim bebas lag.

Audit sebelumnya menghasilkan Performance 99/90. Formatter rupiah kemudian dipakai ulang dan jumlah gambar eager disesuaikan menjadi 2/3/4 menurut lebar layar. Hasil terakhir di atas tidak mengisolasi kontribusi masing-masing optimasi; jangan menganggap seluruh selisih skor berasal dari satu perubahan. Audit awal memakai bundle DevTools yang tidak menyediakan seluruh metrik performa, sehingga tidak dijadikan hasil akhir.

Laporan: [Beranda](qa/lighthouse-home.html), [Shop](qa/lighthouse-shop.html), [Ringkasan metrik](qa/lighthouse-summary.json). Screenshot utama: [Beranda 390](qa/home-390.png), [Beranda 1440](qa/home-1440.png), [Shop 390](qa/shop-390.png), [Shop 1440](qa/shop-1440.png).

## Mengulang pemeriksaan

Server preview harus berjalan. Alat QA menggunakan Puppeteer dari bundle Chrome DevTools yang sudah tersedia di cache lingkungan; Lighthouse resmi dipasang sebagai alat sementara ke cache npm, tanpa mengubah `package.json`/lockfile proyek. Set `CHROME_TEST_BUNDLE` ke `chrome-devtools-mcp/build/src/third_party/index.js`, dan `LIGHTHOUSE_MODULE` ke `lighthouse/core/index.js` di instalasi alat lokal. Chrome executable pada skrip memakai instalasi Windows standar; sesuaikan bila perlu.

```powershell
node demos/ruang-seduh/scripts/browser-qa.mjs
node demos/ruang-seduh/scripts/lighthouse-qa.mjs
```

Opsional: `DEMO_URL` mengganti base URL. `browser-qa.mjs --functional-only` melewati screenshot. Browser QA menghapus hanya kunci keranjang demo pada profil uji miliknya sebelum menjalankan skenario.

Seluruh kode tampilan memakai HTML, CSS, dan JavaScript. Gambar WebP dan font lokal sudah tersedia di `assets/`; tidak ada langkah persiapan Python yang perlu dijalankan. Skrip Python persiapan aset sudah dihapus.

Pemeriksaan visual tambahan memperbaiki ukuran ikon tambah pada detail produk menjadi 16 px agar tinggi CTA tetap 48 px. Tombol tutup dialog tetap terlihat saat konten detail digulir. Verifikasi khusus kedua hal ini dan komposisi tablet: `node demos/ruang-seduh/scripts/tablet-qa.mjs`.
