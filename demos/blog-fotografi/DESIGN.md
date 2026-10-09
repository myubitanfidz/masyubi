# Ruang Cahaya — majalah fotografi independen

## Arah dan pemeriksaan awal

Struktur repository, HTML, CSS, dan dokumentasi Masyubi, Ruang Seduh, RONA, profil instansi, serta Ruang Reka Photo diperiksa. Tidak ditemukan AGENTS.md di repository maupun direktori induk yang diperiksa. Demo lama hanya memiliki dua file khusus; dependensi bersama yang dirujuknya tetap dipertahankan.

Konsep visual: halaman majalah dengan masthead besar, garis redaksi, metadata pendek, dan foto sebagai pembuka cerita. Tidak menggunakan bingkai contact sheet, penomoran karya, hero produk, atau kartu membulat. Identitas Ruang Cahaya dan penulis Raka adalah fiktif; ini bukan perubahan brand Ruang Reka Photo.

## Sistem visual

| Elemen | Keputusan |
|---|---|
| Paper | #F6F4ED, bidang baca hangat |
| Ink | #20251F, teks dan garis redaksi |
| Olive | #424F36, satu aksen untuk navigasi aktif, CTA, fokus |
| Muted | #5F665B, metadata dan caption |
| Tint | #E8EBDF, latihan, layanan, daftar isi mobile |
| Line | #C7CBBB, pemisah editorial |
| Judul | Georgia tegak, regular, 38–66px; masthead hingga 88px |
| Isi / UI | Arial, 16–17px, line-height 1.7–1.85; dua keluarga font sistem |
| Grid | Maksimum 1320px, gutter 20px HP / 24px desktop |
| Kolom baca | Maksimum 680px, sidebar daftar isi 180px, gap 48px |
| Spacing | 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80px |
| Komponen | Garis tipis, tautan bergaris, tombol siku, tanpa shadow dekoratif |

## Beranda dan penemuan tulisan

Hero merupakan artikel utama: foto dominan di kiri, judul serta ringkasan di kanan, dengan kredit di bawah. Arah cahaya dan kursi menjadi contoh langsung dari isi tulisan, bukan objek dekoratif di belakang headline. Satu aksi membaca dan satu tautan ke daftar tulisan.

Indeks memadukan dua artikel dengan bobot berbeda, kemudian kelompok lebih kecil. Kategori berada pada margin kiri dan tidak menjadi tombol pil. Foto, judul, ringkasan, tanggal demo, waktu baca perkiraan, serta kredit tersedia dalam HTML. Filter memakai kategori dan pencarian secara bersamaan, tanpa reload. Status jumlah hasil diumumkan dengan live region; hasil kosong memberi instruksi perbaikan. URL query kategori/q dapat dibagikan dan dibaca saat halaman dibuka ulang. Tidak menyimpan data pencarian di storage.

## Pengalaman membaca

Semua delapan tulisan mempunyai halaman HTML sendiri, bukan modal atau konten yang hanya dirender JS. Breadcrumb kembali ke daftar dan kategori, daftar isi anchor, foto dengan kredit, paragraf singkat, subjudul, latihan konkret, catatan penulis fiktif, dua artikel terkait, dan CTA jasa sesuai topik. Kolom isi dibatasi; tidak ada listener scroll, popup langganan, atau promosi di tengah paragraf. Tombol berbagi memakai Web Share API, fallback clipboard, lalu input tautan jika clipboard tidak diizinkan. Penolakan berbagi tidak dianggap sukses.

## Mobile dirancang ulang

Masthead diperkecil dan navigasi masuk menu dalam aliran halaman; pencarian tetap terlihat. Urutan hero adalah judul, metadata, ringkasan, foto, kemudian tautan. Tidak ada tinggi 100vh. Kategori menjadi indeks dua kolom yang terlihat seluruhnya. Artikel pertama lebar; berikutnya daftar dengan thumbnail kecil dan teks di samping, sehingga pembaca tidak perlu melewati delapan gambar layar penuh. Di halaman artikel, daftar isi berada sebelum paragraf pembuka, bukan sidebar sempit. Formulir satu kolom.

## Jasa dan transparansi

Layanan hadir sesudah daftar bacaan dan tentang jurnal, dengan baris kebutuhan alih-alih kartu harga. Semua detail berlabel contoh paket demo; tidak ada harga atau fasilitas yang dijanjikan. CTA artikel membawa jenis layanan melalui query string dan memilih formulir. Kontak .example adalah placeholder; formulir hanya simulasi lokal, tanpa jaringan atau penyimpanan. Pesan submit tepat: “Ini hanya demo; pesan tidak dikirim.” Formulir disabled sebelum handler JS siap.

## Perbandingan dengan demo lain

| Demo | Karakter yang diamati | Pilihan Ruang Cahaya |
|---|---|---|
| Masyubi | Hero jasa, ilustrasi percakapan, kartu portofolio | Masthead majalah, artikel utama, navigasi topik dan pencarian |
| Ruang Seduh | Katalog, filter produk, keranjang dan checkout | Filter tulisan, ringkasan yang dapat dibaca, tanpa alur transaksi |
| RONA | Hero kamera, pilihan varian, ringkasan produk | Foto kontekstual untuk cerita, halaman baca terpisah, tanpa seleksi produk |
| Nusa Cendekia | Header informasi sekolah, tab aksen, program/penerimaan | Garis editorial olive, daftar tulisan dan kolom baca |
| Ruang Reka Photo | Indeks vertikal sticky, potret besar, contact sheet, lightbox | Navigasi horizontal, masthead, pencarian, halaman baca; tidak memakai lightbox |

Salinan beberapa foto dipakai karena relevan dan sudah berlisensi. Komposisi, konten, CSS, JS, favicon, serta navigasi dibuat khusus; tidak menggunakan CSS/JS bersama. Hanya desain kartu utama dipertahankan sesuai identitas indeks Masyubi.

## Aksesibilitas dan verifikasi

Satu h1 per halaman, heading logis, skip link, label input, alt bermakna, ukuran foto, fokus terlihat, target kontrol 44px. Menu mempunyai aria-expanded, keyboard, Escape dan pemulihan fokus. Reduced motion menghentikan smooth scrolling. Tanpa JS, artikel, anchor, kategori URL, dan rincian jasa tetap terlihat; semua tulisan ditampilkan dan keterbatasan filter dijelaskan. Formulir tetap disabled dan tombol berbagi disembunyikan.

Hasil aktual tersimpan di qa/results.json; screenshot beranda dan artikel pada lima lebar serta perbandingan dengan demo lain berada di qa/. Audit Lighthouse tidak dijalankan. Hasil pemeriksaan hanya meliputi pengujian yang tercatat, bukan klaim performa tanpa pengukuran.

