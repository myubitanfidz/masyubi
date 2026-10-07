(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const mobile = matchMedia('(max-width: 600px)');
  const setMenu = open => {
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('span').textContent = open ? '−' : '＋';
    navigation.hidden = mobile.matches && !open;
  };
  menu.hidden = false;
  const adaptMenu = () => { menu.hidden = !mobile.matches; setMenu(false); };
  adaptMenu();
  mobile.addEventListener('change', adaptMenu);
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });

  const colors = {paper:'Paper', charcoal:'Charcoal', olive:'Olive'};
  let selected = 'paper';
  const variantImage = document.getElementById('variant-image');
  const controls = document.querySelector('.variant-controls');
  controls.hidden = false;
  document.querySelectorAll('[data-color]').forEach(button => {
    button.addEventListener('click', () => {
      selected = button.dataset.color;
      document.querySelectorAll('[data-color]').forEach(swatch => swatch.setAttribute('aria-pressed', String(swatch === button)));
      document.getElementById('color-name').textContent = colors[selected];
      variantImage.src = `assets/images/camera-${selected}.webp`;
      variantImage.alt = `Ilustrasi RONA Pocket warna ${colors[selected]}.`;
    });
  });

  const summary = document.getElementById('summary-dialog');
  const lightbox = document.getElementById('lightbox');
  const triggers = new WeakMap();
  const openDialog = (dialog, trigger) => {
    triggers.set(dialog, trigger);
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.querySelector('[data-close]').focus();
  };
  [summary, lightbox].forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      const trigger = triggers.get(dialog);
      if (trigger?.isConnected) trigger.focus({preventScroll:true});
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  });
  const summaryTrigger = document.querySelector('.summary-trigger');
  summaryTrigger.hidden = false;
  summaryTrigger.addEventListener('click', () => {
    document.getElementById('summary-color').textContent = colors[selected];
    document.getElementById('summary-image').src = variantImage.getAttribute('src');
    document.getElementById('summary-image').alt = variantImage.alt;
    openDialog(summary, summaryTrigger);
  });

  const photos = [...document.querySelectorAll('[data-photo]')];
  let currentPhoto = 0;
  const renderPhoto = () => {
    const link = photos[currentPhoto];
    const source = link.querySelector('img');
    const image = document.getElementById('lightbox-image');
    image.src = link.getAttribute('href');
    image.alt = source.alt;
    document.getElementById('lightbox-caption').textContent = link.parentElement.querySelector('figcaption span').textContent;
    document.getElementById('photo-count').textContent = `${currentPhoto + 1} / ${photos.length}`;
  };
  const advance = delta => { currentPhoto = (currentPhoto + delta + photos.length) % photos.length; renderPhoto(); };
  photos.forEach((link, index) => link.addEventListener('click', event => {
    // Preserve opening the original image in a new tab with modifier keys.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    currentPhoto = index;
    renderPhoto();
    openDialog(lightbox, link);
  }));
  document.getElementById('previous-photo').addEventListener('click', () => advance(-1));
  document.getElementById('next-photo').addEventListener('click', () => advance(1));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); advance(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); advance(1); }
  });
  document.querySelector('[data-lightbox-hint]').hidden = false;
})();
