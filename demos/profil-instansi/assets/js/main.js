const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigasi');
const desktop = window.matchMedia('(min-width: 768px)');
document.documentElement.classList.add('menu-ready');
menuButton.hidden = false;
function closeMenu(restoreFocus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
navigation.addEventListener('focusout', () => {
  requestAnimationFrame(() => {
    if (!navigation.contains(document.activeElement) && document.activeElement !== menuButton) closeMenu();
  });
});
desktop.addEventListener('change', () => closeMenu());
function markLocation() {
  const hash = location.hash || '#beranda';
  navigation.querySelectorAll('a').forEach(link => {
    if (link.hash === hash) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('hashchange', markLocation);
markLocation();

const form = document.querySelector('#question-form');
document.querySelector('#form-submit').disabled = false;
form.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#form-status').textContent = 'Ini hanya demo; pesan tidak dikirim.';
  form.reset();
});

const photos = [...document.querySelectorAll('[data-gallery]')];
const dialog = document.querySelector('#photo-dialog');
let photoIndex = 0;
let trigger;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const large = document.querySelector('#photo-large');
  large.src = photo.href;
  large.alt = photo.querySelector('img').alt;
  document.querySelector('#photo-title').textContent = photo.closest('figure').querySelector('h3').textContent;
  document.querySelector('#photo-count').textContent = `${photoIndex + 1} / ${photos.length}`;
}
if (typeof dialog.showModal === 'function') {
  photos.forEach((photo, index) => photo.addEventListener('click', event => {
    event.preventDefault();
    trigger = photo;
    showPhoto(index);
    dialog.showModal();
    document.querySelector('#photo-close').focus();
  }));
  document.querySelector('#photo-close').addEventListener('click', () => dialog.close());
  document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  document.querySelector('#photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus());
}
