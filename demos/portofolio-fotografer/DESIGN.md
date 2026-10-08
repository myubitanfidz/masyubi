# Ruang Reka Photo — contact sheet personal

Dibuat 8 Oktober 2026. Brand, fotografer, narasi pendekatan, angka paket, dan kontak adalah konsep fiktif. Foto tetap diatribusikan kepada fotografer aslinya. Tidak ada testimoni, daftar klien, penghargaan, pengalaman kerja, atau klaim bahwa foto stok adalah karya Raka Pradana.

## Pemeriksaan repository

Tidak ditemukan AGENTS.md di checkout maupun direktori induk yang diperiksa. Struktur, HTML, CSS, dokumentasi, aset, dan screenshot demo Masyubi, Ruang Seduh, RONA, serta SMA Nusa Cendekia ditinjau sebelum memilih komposisi. Tidak menggunakan stylesheet atau JavaScript bersama dari demo tersebut.

## Konsep visual

Contact sheet fotografi: foto dipasang pada bidang abu hangat, dilengkapi nomor frame, kategori, caption, dan kredit. Bingkai tipis membentuk ritme; foto tidak dibulatkan atau diberi shadow. Penomoran melekat pada foto, indeks navigasi, dan urutan proses. Tidak menambahkan nomor sebagai dekorasi di seluruh elemen.

| Token | Nilai dan fungsi |
| --- | --- |
| Paper | `#F1EFE8`, putih gading untuk latar |
| Ink | `#272723`, arang untuk teks dan garis utama |
| Muted | `#65635B`, caption dan penjelasan sekunder |
| Accent | `#8E3F30`, merah bata untuk aksi, status filter, dan kontak |
| Mount | `#E4E0D7`, abu hangat untuk bidang pemasangan foto dan proses |
| Line | `#CCC8BD`, pemisah dan bingkai |
| Sans | Arial/Helvetica/sans-serif, isi 16px dengan line-height 1.65 |
| Serif | Times New Roman/Times/serif, judul editorial tegak, normal |
| Heading | Hero 43–104px, h2 35–65px, caption judul 20–25px |
| Spacing | 8, 12, 16, 20, 24, 32, 40, 56, 72, 88px |
| Grid | Lebar maksimum 1320px, gutter 20/32/48px, rail desktop 120–150px |

Font sistem membatasi ketergantungan dan tetap memakai maksimum dua keluarga font aktif. Tidak ada italic headline, handwriting, gradient, blob, carousel, ticker, counter, parallax, atau animasi reveal. Transisi hanya warna dan simbol detail, serta menghormati reduced motion.

## Komposisi dan UX

Alur pengunjung: lihat karakter foto → saring jenis karya → buka paket yang relevan → pahami proses → baca pendekatan → konsultasi simulasi. Header ringkas memberi wordmark dan satu CTA jadwal; pada desktop, navigasi berpindah ke indeks vertikal di sisi halaman, bukan bar menu utama seperti demo lain.

Hero memakai judul besar di atas komposisi tidak simetris: teks dan aksi pada margin kiri, satu foto portrait utuh dengan metadata frame di sisi kanan. Foto tidak menjadi latar teks. Di HP urutannya judul, deskripsi, foto, caption, lalu aksi. Tinggi foto diatur untuk menjaga CTA tetap dekat dengan foto; tidak memakai hero 100vh.

Galeri sembilan foto memakai enam kolom desktop dengan satu frame dominan, pasangan foto kecil, bentang landscape, dan akhir yang sengaja renggang. Proporsi asli dipertahankan agar kepala, tangan, objek, serta konteks foto tidak terpotong. HP memakai satu foto pembuka lebar lalu pasangan frame yang lebih kecil dan bentang landscape. Filter menyederhanakan susunan menjadi kelompok foto yang relevan, tanpa carousel. Status jumlah foto diumumkan melalui live region; lightbox hanya menavigasi hasil filter aktif.

Jasa disajikan sebagai lembar paket A/B/C yang bisa dibuka, bukan tiga kartu harga seragam. Satu paket awal terbuka agar informasi langsung tersedia. Harga, durasi, dan jumlah foto diberi label contoh di dekat angka. CTA paket memilih jenis sesi pada formulir tanpa membuat pemesanan. Proses memakai timeline statis; bagian tentang memakai catatan personal fiktif tanpa foto yang diakui sebagai Raka.

Bagian kontak membedakan simulasi dari pemesanan nyata. WhatsApp dan email menggunakan label placeholder, menuju formulir lokal, dan tidak membuka wa.me atau mailto. Formulir tidak meminta kontak pribadi, menyimpan isian, atau mengirim permintaan jaringan. Tombol submit awalnya disabled dan diaktifkan setelah handler JS tersedia. Setelah submit muncul pesan demo lalu isian dibersihkan.

## Perbedaan dari demo lain

| Demo | Pola yang diamati | Keputusan Ruang Reka |
| --- | --- | --- |
| Masyubi utama | Hero layanan dan ilustrasi chat, CTA chat, kartu portofolio membulat | Pembuka berupa contact sheet, indeks samping, aksi konsultasi yang dijelaskan sebagai simulasi. Hanya struktur kartu indeks yang dipertahankan untuk entri pengganti. |
| Ruang Seduh | Hero kemasan/cangkir, kategori belanja, katalog dan keranjang | Karya mendahului jasa; tidak ada katalog transaksi, jumlah item keranjang, atau checkout. |
| RONA | Kamera dominan, hero produk 40/60, swatch, dialog ringkasan varian | Foto manusia utuh dengan margin metadata, filter genre karya, detail paket jasa. Tidak ada pemilihan varian produk. |
| Nusa Cendekia | Header dua tingkat bertab, foto perpustakaan horizontal, garis buku dan program belajar | Rail navigasi vertikal, bingkai foto portrait, montase contact sheet dan rincian jasa yang dibuka sesuai minat. Tidak memakai aksen tab kuning atau struktur informasi sekolah. |

Pola native HTML seperti anchor, details, dan dialog dipakai untuk aksesibilitas; tampilan serta logika dibuat khusus. Foto baru dan tanda bingkai lokal membuat folder ini mandiri.

## Aksesibilitas dan fallback

Satu h1, heading berurutan, alt bermakna, indikator fokus, tombol minimal 44px, dan menu dengan aria-expanded. Menu mendukung Tab, Escape, tutup setelah memilih, klik di luar, dan perubahan breakpoint. Menu terbuka dalam aliran halaman, bukan overlay yang menutupi isi. Rail desktop sticky untuk orientasi, tanpa listener scroll.

Dialog native dilengkapi pengelolaan Tab/Shift+Tab agar fokus tetap pada kontrol dialog, mendukung Escape, tombol sebelumnya/berikutnya, panah kiri/kanan, dan mengembalikan fokus ke foto. Caption serta kredit berganti bersama gambar. Pengelolaan fokus eksplisit ditambahkan setelah review keyboard menemukan fokus dapat keluar dari tombol tutup pada arah mundur. Tanpa JS, semua karya dan navigasi terlihat, paket tetap bisa dibuka, dan tautan foto langsung membuka aset; filter disembunyikan dan formulir tidak dapat mengirim.

## Review

`qa/results.json` berisi hasil aktual, `qa/page-*.png` dan `qa/hero-*.png` mencakup 360, 390, 768, 1024, dan 1440px. `qa/comparison.html` serta `qa/comparison.png` membandingkan tampilan desktop/mobile dengan demo lain. Review memeriksa subjek foto, lebar form, ukuran CTA, dan ritme galeri. Path diuji dengan prefix `/masyubi/`, dari root server, dan file lokal. Tidak mengasumsikan skor Lighthouse; Lighthouse tidak dijalankan.
