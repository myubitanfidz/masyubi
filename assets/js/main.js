// ============ MOBILE MENU ============
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn?.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = !answer.classList.contains('hidden');

    // Tutup semua
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').classList.add('hidden');
    });

    // Buka yang diklik (kalau sebelumnya tertutup)
    if (!isOpen) {
      item.classList.add('open');
      answer.classList.remove('hidden');
    }
  });
});

// ============ NAVBAR SHADOW ON SCROLL ============
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('shadow-soft', window.scrollY > 10);
}, { passive: true });

// ============ CONTACT FORM → KIRIM VIA WHATSAPP ============
const form = document.getElementById('contactForm');
const formFallback = document.getElementById('contactFormFallback');
form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nama     = form.nama.value.trim();
  const kontak   = form.kontak.value.trim();
  const kebutuhan = form.kebutuhan.value;
  const pesan    = form.pesan.value.trim();

  if (!nama || !kontak || !kebutuhan) {
    alert('Isi nama, kontak, dan pilihan kebutuhan ya 🙏');
    return;
  }

  const nomorWA = '62811142660';
  const teks = [
    'Halo Masyubi, saya mau konsultasi.',
    '',
    `Nama: ${nama}`,
    `Kontak: ${kontak}`,
    `Kebutuhan: ${kebutuhan}`,
    ...(pesan ? [`Pesan: ${pesan}`] : [])
  ].join('\n');

  const urlWhatsApp = `https://wa.me/${nomorWA}?${new URLSearchParams({ text: teks })}`;
  window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
});
if (form && formFallback) formFallback.hidden = true;
