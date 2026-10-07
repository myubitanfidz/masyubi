# Aset RONA

## Ilustrasi produk

`assets/images/camera-paper.svg`, `camera-charcoal.svg`, dan `camera-olive.svg` adalah ilustrasi SVG orisinal yang dibuat untuk demo ini. Geometri, sudut, dan detail sama; warna bodi berbeda sesuai varian. `camera-detail.svg` memakai crop lensa dari gambar Paper yang sama. Website memakai render WebP dari masing-masing SVG (1200 × 912 px, kualitas 90) untuk mengurangi biaya rendering. Hero menyematkan WebP Paper sebagai data URL dalam HTML agar tampil tanpa permintaan gambar awal dan tetap mendukung URL folder tanpa slash. Sumber SVG tetap disertakan untuk penyuntingan. Ini ilustrasi konsep, bukan foto kamera yang diproduksi. `mark.svg` adalah favicon orisinal.

## Galeri ilustrasi

Foto diunduh pada 7 Oktober 2026 dari CDN Unsplash dengan ID tetap, lalu disimpan lokal dalam WebP, lebar 720–1200 px, kualitas 78. Tidak menggunakan endpoint gambar acak atau URL eksternal saat halaman dijalankan.

[Lisensi Unsplash](https://unsplash.com/license) mengizinkan pengunduhan dan pemakaian gratis, termasuk komersial. Foto dipakai sebagai ilustrasi editorial demo, bukan endorsement atau klaim hasil kamera. Tidak ada foto produk kamera dari brand lain.

| File | Sumber tetap |
| --- | --- |
| city.webp | https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b |
| window.webp | https://images.unsplash.com/photo-1484154218962-a197022b5858 |
| cafe.webp | https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb |
| journey.webp | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1 |
| neighborhood.webp | https://images.unsplash.com/photo-1516483638261-f4dbaf036963 |
| coffee.webp | https://images.unsplash.com/photo-1442512595331-e89e73853f31 |

## Font

Plus Jakarta Sans (400–700) dan Lora (400–500), Latin WOFF2 lokal, disalin dari aset demo Ruang Seduh yang sudah ada di repository. Lisensi SIL Open Font License tersedia sebagai `jakarta-OFL.txt` dan `lora-OFL.txt` di `assets/fonts/`. `assets/css/fonts.css` menunjuk ke WOFF2 lokal untuk HTTP; `fonts-local.css` menyematkan font sebagai data URL agar preview file lokal tidak diblokir CORS. Keduanya memakai font-display swap. Website tidak mengunduh font dari layanan eksternal.
