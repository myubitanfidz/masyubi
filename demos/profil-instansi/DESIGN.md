# SMA Nusa Cendekia — keputusan desain

Demo sekolah fiktif, dibuat 8 Oktober 2026. Seluruh informasi program, fasilitas, kegiatan, dan alur pendaftaran adalah konsep. Tidak memuat akreditasi, statistik, prestasi, tarif, testimoni, atau identitas kontak nyata.

## Pemeriksaan awal

Tidak ditemukan AGENTS.md di checkout atau direktori induk yang diperiksa. Sebelum implementasi, struktur, HTML, CSS, serta dokumentasi desain website utama, Ruang Seduh, RONA, Batik Lokal, dan demo lain diperiksa. Referensi visual lokal kemudian dibandingkan melalui screenshot desktop dan mobile di `qa/compare-*.png`.

## Identitas: margin buku belajar

Garis margin tipis dan tab kuning menjadi ciri utama: simbol buku orisinal, penanda bagian, daftar prinsip dengan garis vertikal, garis pada caption, dan tepi tombol. Dipakai sebagai struktur informasi, bukan dekorasi memenuhi layar. Tidak menggunakan sistem penomoran section seperti RONA; angka hanya digunakan untuk langkah pendaftaran yang memang berurutan.

| Elemen | Keputusan |
| --- | --- |
| Biru tinta | `#18384B`, teks utama, identitas, dan bagian pendaftaran |
| Putih kertas | `#FAFBF8`, latar utama |
| Biru abu muda | `#EDF2F4`, program belajar |
| Kuning | `#F1CB68`, penanda, caption, dan CTA pada bidang gelap; tidak digunakan untuk teks di latar terang |
| Teks sekunder | `#51616A` pada latar terang, `#D4E0E5` pada biru tinta |
| Garis | `#CBD5D9`, pemisah informasi |
| Isi dan UI | Arial, fallback Helvetica/sans-serif, 16px, line-height 1.7 |
| Judul editorial | Georgia, fallback Times New Roman/serif, tegak, normal; maksimum dua keluarga aktif |
| Grid | Maksimum 1200px, gutter 20px mobile / 40px tablet, ruang bagian 64–88px |
| Tombol | Tepi kiri beraksen, sudut siku, tinggi minimal 50px; fokus outline 3px |

Font sistem menghindari permintaan jaringan dan font unduhan. Tidak ada framework, shared stylesheet, shadow dekoratif, gradient, carousel, atau animasi scroll.

## Perbedaan dari demo yang ada

| Referensi lokal | Karakter yang diamati | Keputusan profil sekolah |
| --- | --- | --- |
| Website utama Masyubi | Cream dengan aksen warna brand, copy layanan yang santai, tulisan tangan aksen, kartu portofolio membulat, CTA chat | Biru tinta/putih, bahasa layanan pendidikan, tanpa tulisan tangan, navigasi bertab dalam header dua tingkat. Hanya struktur kartu entri di indeks dipertahankan. |
| Ruang Seduh | Hero foto kopi dengan judul dan area aksi di sisi, kategori belanja, grid produk, keranjang | Judul dan penjelasan di atas foto perpustakaan yang lebar. Jalur informasi sekolah, tanpa harga, kategori produk, keranjang, atau checkout. |
| RONA | Hero objek kamera 40/60, swatch varian, penomoran editorial, galeri dominan, ringkasan produk | Foto belajar horizontal, catatan margin, daftar program lintas kolom, empat foto dengan bobot setara, langkah pendaftaran dan kontak. Tidak memakai interaksi varian atau dialog produk. |
| Batik Lokal | Hero diagonal, tombol pil, katalog dan tindakan belanja | Tanpa bidang diagonal, tombol pil, atau kartu katalog. Program berupa baris panjang dengan proyek konkret; fasilitas berupa catatan pendukung. |

Native `details`, anchor, dan `dialog` merupakan pola aksesibilitas HTML umum. Markup, styling, dan JavaScript dibuat khusus di folder ini; tidak menyalin komponen demo lain.

## Alur UX

Identitas → pendekatan → program dan fasilitas → kegiatan → pendaftaran → FAQ → kontak. Label navigasi langsung mengikuti kebutuhan calon siswa, orang tua, dan masyarakat. Informasi konsep ditandai dekat bagian yang relevan, termasuk label foto dan footer.

Satu aksi utama pada hero menuju program; pendaftaran disajikan sebagai tautan sekunder. Panduan pendaftaran tidak berpura-pura membuka penerimaan siswa. Kontak berupa placeholder tanpa tautan telepon/email/peta yang dapat menghubungi pihak nyata.

Pada HP, urutan hero adalah judul → penjelasan → CTA → foto → caption. Header menyisakan identitas dan tombol Menu; navigasi terbuka dalam aliran halaman, maksimal dua kolom, dan dapat digulir jika tinggi layar pendek. Tidak memakai hero 100vh atau tombol mengambang. Galeri satu kolom pada HP, dua pada tablet, empat pada desktop. Program dan kontak berubah menjadi urutan baca tunggal.

Menu mendukung `aria-expanded`, Tab, Escape, tutup setelah memilih anchor, klik di luar, dan penyesuaian breakpoint. Tanpa JS, navigasi tetap terbuka dan header mobile berada dalam aliran normal agar tidak menghalangi konten. FAQ memakai details/summary. Galeri memakai dialog native dengan fokus modal, Escape, tombol sebelumnya/berikutnya, tombol panah keyboard, dan pemulihan fokus. Tinggi foto modal mengikuti proporsi foto agar tidak menimbulkan ruang kosong berlebihan pada HP. Tanpa JS, tautan galeri langsung membuka aset.

Formulir meminta isian contoh, tidak meminta email/telepon, tidak memakai fetch, storage, atau backend. Tombol awalnya disabled dan baru aktif saat JS siap; ini mencegah submit tanpa handler. Submit menunjukkan “Ini hanya demo; pesan tidak dikirim.” dan membersihkan isian.

## Review visual dan verifikasi

Lihat `qa/results.json` untuk hasil pemeriksaan aktual dan `qa/page-*.png` untuk screenshot lima ukuran layar. `qa/comparison.html` memperlihatkan hero Masyubi, e-commerce, landing page produk, dan sekolah berdampingan, dalam ukuran desktop maupun mobile. Screenshot pembanding hanya dokumentasi QA; file demo lain tidak diubah.

Pemeriksaan GitHub Pages menggunakan prefix lokal `/masyubi/`, bukan hanya root server. Tautan indeks ke demo, aset, anchor, dan tautan kembali diuji. Tidak ada hasil Lighthouse yang diasumsikan; audit Lighthouse tidak dijalankan.
