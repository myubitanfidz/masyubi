# RONA Pocket — arah visual

Katalog objek bertemu jurnal keseharian. Hero 40/60, wordmark lebar, judul dua baris tegak, kamera dominan pada bidang sand. Komposisi berlanjut ke manfaat berupa baris bernomor, galeri dengan satu foto dominan, detail varian, FAQ, dan penutup olive. Garis tipis menggantikan kartu.

- Warna: paper #F3F0E8, ink #20231F, orange #D95632 hanya untuk CTA/penanda, olive #68705A untuk penutup. Teks muted tetap berkontras pada paper.
- Tipografi: Plus Jakarta Sans 400–700 untuk UI; Lora 400–500 tegak untuk judul editorial. Headline utama Jakarta semibold dengan pemenggalan sengaja. Font WOFF2 lokal, swap.
- Spacing: 8, 16, 24, 32, 48, 64, 96 px; konten 1200 px, gutter responsif 24–48 px. Body 16 px / 1.65.
- Produk: ilustrasi SVG orisinal, tiga varian dengan geometri/sudut/cahaya identik. Website memakai hasil render WebP ringan; sumber SVG tetap disertakan. Bukan foto produk nyata. Detail memakai crop dari ilustrasi yang sama; tidak memakai filter pewarnaan foto.
- Galeri: enam foto ilustrasi keseharian berlisensi Unsplash, disimpan lokal sebagai WebP. Caption jujur, bukan sampel kamera. Grid 8 kolom desktop, 6 kolom tablet, dan 2 kolom mobile.
- Komponen: tombol persegi radius 3 px, tautan bergaris bawah, swatch dengan aria-pressed, native dialog/lightbox, details/summary. Tanpa reveal yang menyembunyikan konten, carousel, animasi terus-menerus, atau shadow dekoratif.
- Mobile: headline, deskripsi, gambar, CTA. Navigasi tersedia tanpa JS; JS menambahkan menu lipat dengan Escape. Semua modal mengembalikan fokus.

## Referensi yang dipelajari, 7 Oktober 2026

- https://www.fujifilm-x.com/global/products/cameras/x100vi/ — urutan pengenalan karakter kamera, bagian contoh visual, lalu uraian fitur. Diterapkan sebagai alur produk → galeri → detail; tidak memakai merek, teks, spesifikasi, atau fotonya.
- https://www.kinfolk.com/ — pasangan kategori kecil, judul editorial, foto dominan, dan caption pendek pada cerita. Diterapkan pada penomoran galeri dan hirarki teks. Tidak memakai aset atau carousel situs.

Referensi dibaca melalui ekstraksi halaman web; tata letak visual referensi tidak diperiksa langsung. Semua keputusan grid, crop, warna, dan ilustrasi RONA mengikuti brief, bukan salinan layout referensi.

## Perbaikan setelah review

Screenshot desktop/mobile diperiksa. Foto pendukung desktop diperbesar dan disusun bertumpuk di sebelah foto dominan. Detail lensa memakai crop lebih dekat. Orange tombol dipergelap menjadi #BA4223 untuk memenuhi kontras teks putih (rasio terukur 5,40:1); #D95632 tetap sebagai warna aksen. Teks isi utama dijaga 16 px. Preview file lokal memakai font tertanam, sedangkan HTTP memakai file WOFF2 lokal. Hero WebP tertanam dan pemuatan CSS/JS dilakukan setelah base URL diselesaikan agar URL folder tanpa slash tidak mengirim permintaan spekulatif ke folder yang salah. Ilustrasi kamera memakai bidang warna tipis dan render WebP, dengan sumber SVG yang tetap dapat diedit.
