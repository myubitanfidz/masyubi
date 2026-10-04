// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn?.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Close mobile menu saat link diklik
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});

// FAQ accordion
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

// Navbar shadow saat scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.classList.add('shadow-sm');
  } else {
    header.classList.remove('shadow-sm');
  }
});