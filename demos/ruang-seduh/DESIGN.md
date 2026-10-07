# Ruang Seduh — keputusan desain

Ditetapkan sebelum implementasi, 7 Oktober 2026. Demo brand dan produk fiktif untuk portofolio Masyubi; tanpa transaksi atau klaim pelanggan.

## Referensi dan batas riset

- Komposisi beranda: [Blue Bottle](https://bluebottlecoffee.com/us/eng). Halaman yang dapat dibaca menghubungkan foto kampanye, judul singkat, CTA belanja, produk dengan harga/tombol tambah, koleksi, lalu cerita ritual. Pelajaran: produk muncul awal dan cerita memiliki tempat berbeda dari katalog. Tidak mengambil carousel, promosi, teks, logo, atau foto mereka.
- Fotografi: [Onyx Coffee Lab](https://onyxcoffeelab.com/collections/coffee), [detail Tropical Weather](https://onyxcoffeelab.com/products/tropical-weather). Pelajaran dari penyajian yang terbaca: identitas produk, catatan rasa, dan pilihan produk ditempatkan dekat tindakan tambah. Kemasan Ruang Seduh dan seluruh foto dibuat khusus, tidak memakai aset Onyx.
- Kemudahan shop: [Trade — All Specialty Coffee](https://www.drinktrade.com/collections/all). Navigasi membedakan kopi, peralatan, dan pembelajaran; judul koleksi/deskripsi langsung menjelaskan isi. Katalog dinamis tidak muncul dalam ekstraksi. Ambil prinsip jalur kategori yang jelas, bukan meniru antarmuka yang belum dapat diamati.

Akses teks referensi berhasil; browser visual terhubung tidak tersedia saat riset. Proporsi foto, ukuran judul, alignment, dan jarak aktual situs referensi belum dapat diverifikasi. Angka di bawah merupakan keputusan desain sendiri, bukan hasil pengukuran referensi. Review screenshot lokal digunakan untuk memeriksa implementasi jika alat tersedia.

## Identitas dan sistem

Karakter hangat, tenang, dekat dengan ritual menyeduh. Copy konkret: “Kopi untuk jeda sehari-hari.” Kemasan zaitun, label cream, detail garis sederhana. Tanpa testimoni, statistik penjualan, atau klaim sumber kopi nyata.

| Token | Nilai / peran |
| --- | --- |
| Background | `#F7F4ED` cream; permukaan foto `#ECE6DB` |
| Teks | `#302B25`; sekunder `#6C6257` |
| Aksen | `#46513A` zaitun; hover `#313C28` |
| Border | `#D8D1C5`; struktur memakai garis dan ruang |
| Font UI | Plus Jakarta Sans normal, variable 400–700, lokal WOFF2, swap |
| Font editorial | Lora tegak 400–500, lokal WOFF2, swap |
| Ukuran | Isi 16px/1.65, metadata 12–14px, kartu 16px, heading 32–48px, hero clamp 40–68px |
| Spacing | 8, 16, 24, 32, 48, 64, 96px |
| Konten | Maksimal 1280px, gutter 24px mobile / 48px desktop |
| Radius | 4px tombol/input; 8px dialog, tanpa radius dekoratif lain |
| Tombol | Solid zaitun, minimum tinggi 44px; sekunder outline/tautan bergaris |

Semua diterapkan melalui CSS variables. Fokus outline jelas, hover sederhana, state aktif filter memakai underline, empty/error memiliki tindakan pemulihan. Ikon SVG stroke seragam; shadow hanya dialog yang menunjukkan lapisan.

## Komposisi

- Desktop hero 40% teks / 60% foto. Judul sengaja dua baris, satu foto kemasan bersama cangkir, catatan foto di luar gambar. Mobile: judul, foto, deskripsi pendek dan CTA dalam layar awal pada tinggi umum 844px.
- Kategori berupa tiga tautan horizontal dengan nomor dan deskripsi pendek, tanpa kartu gambar berulang.
- Empat produk pilihan mengikuti grid katalog. Cerita editorial memakai foto ritual dan teks berdampingan; CTA akhir memakai bidang zaitun dengan satu tindakan.
- Shop: judul ringkas, pencarian, kategori, sort, jumlah hasil. Grid 2/3/4 kolom untuk mobile/tablet/desktop; foto rasio 1:1, area nama dua baris, harga/tombol sejajar. Detail dalam dialog; keranjang drawer dengan subtotal dan ringkasan checkout demo.

## Foto dan performa

Foto dibuat menggunakan ImageGen bawaan: cahaya alami hangat, kemasan hijau zaitun konsisten, latar cream sederhana, produk utuh dengan ruang kosong. Katalog ukuran/skala dan posisi terpusat; alat berwarna netral. Hero dan cerita memiliki tekstur linen/kayu. Simpan turunan WebP lokal dengan ukuran responsif; hero eager/fetchpriority high, gambar berikutnya lazy. Ukuran eksplisit mencegah CLS.

HTML/CSS/JavaScript statis tanpa framework/dependency runtime. Tidak ada ticker, carousel, parallax, scroll handler, gradient, glow, video, atau animasi berulang. Transisi singkat menghormati reduced motion. Filter berjalan lokal; update keranjang tidak merender ulang katalog.
