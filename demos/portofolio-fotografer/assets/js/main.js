const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigasi');
const desktop = matchMedia('(min-width: 768px)');
document.documentElement.classList.add('menu-ready');
menu.hidden = false;
function closeMenu(restore = false) {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
  if (restore) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.rail') && !event.target.closest('.menu-toggle')) closeMenu();
});
nav.addEventListener('focusout', () => requestAnimationFrame(() => {
  if (!nav.contains(document.activeElement) && document.activeElement !== menu) closeMenu();
}));
desktop.addEventListener('change', () => closeMenu());

const figures = [...document.querySelectorAll('.work-photo')];
const filters = document.querySelector('.filters');
filters.hidden = false;
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  const category = button.dataset.filter;
  figures.forEach(figure => { figure.hidden = category !== 'semua' && figure.dataset.category !== category; });
  filters.querySelectorAll('button').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
  document.querySelector('.contact-sheet').classList.toggle('is-filtered', category !== 'semua');
  const count = figures.filter(figure => !figure.hidden).length;
  document.querySelector('#filter-status').textContent = `${count} foto ditampilkan · ${button.textContent.replace('09', '').trim()}`;
});

const lightbox = document.querySelector('#lightbox');
let current;
let trigger;
function visibleFigures() { return figures.filter(figure => !figure.hidden); }
function showPhoto(figure) {
  current = figure;
  const image = figure.querySelector('img');
  const large = document.querySelector('#lightbox-image');
  large.src = figure.querySelector('[data-photo]').href;
  large.alt = image.alt;
  large.width = image.width;
  large.height = image.height;
  document.querySelector('#lightbox-title').textContent = figure.querySelector('h3').textContent;
  document.querySelector('#lightbox-index').textContent = figure.querySelector('.frame-number').textContent;
  const list = visibleFigures();
  document.querySelector('#lightbox-count').textContent = `${list.indexOf(figure) + 1} / ${list.length}`;
  const credit = figure.querySelector('.credit');
  const source = document.querySelector('#lightbox-source');
  source.href = credit.href;
  source.textContent = credit.textContent;
}
function movePhoto(direction) {
  const list = visibleFigures();
  showPhoto(list[(list.indexOf(current) + direction + list.length) % list.length]);
}
if (typeof lightbox.showModal === 'function') {
  figures.forEach(figure => figure.querySelector('[data-photo]').addEventListener('click', event => {
    event.preventDefault();
    trigger = event.currentTarget;
    showPhoto(figure);
    lightbox.showModal();
    document.querySelector('#lightbox-close').focus();
  }));
  document.querySelector('#lightbox-close').addEventListener('click', () => lightbox.close());
  document.querySelector('#lightbox-prev').addEventListener('click', () => movePhoto(-1));
  document.querySelector('#lightbox-next').addEventListener('click', () => movePhoto(1));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [...lightbox.querySelectorAll('button:not([disabled]), a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); movePhoto(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  lightbox.addEventListener('click', event => {
    if (event.target !== lightbox) return;
    const bounds = lightbox.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
  });
  lightbox.addEventListener('close', () => trigger?.focus());
}

const form = document.querySelector('#formulir');
document.querySelector('#submit-demo').disabled = false;
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#jenis').value = link.dataset.service;
}));
document.querySelectorAll('[data-contact]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#contact-status').textContent = `${link.dataset.contact} hanya placeholder demo. Coba formulir simulasi; tidak ada pesan yang dikirim.`;
}));
form.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#form-status').textContent = 'Ini hanya demo, pesan tidak dikirim.';
  form.reset();
});
