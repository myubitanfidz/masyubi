(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = (restore = false) => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu +';
    if (restore) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Tutup −' : 'Menu +';
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width:701px)').addEventListener('change', () => closeMenu());

  const stories = [...document.querySelectorAll('[data-story]')];
  const search = document.querySelector('#article-search');
  const searchForm = document.querySelector('.site-search');
  const filterLinks = [...document.querySelectorAll('[data-category]')];
  if (stories.length) {
    const result = document.querySelector('#result-count');
    const empty = document.querySelector('#empty-results');
    const reset = document.querySelector('#reset-filters');
    let category = 'semua';
    const valid = new Set(filterLinks.map(a => a.dataset.category));
    const syncFromURL = () => {
      const params = new URLSearchParams(location.search);
      category = valid.has(params.get('kategori')) ? params.get('kategori') : 'semua';
      search.value = (params.get('q') || '').slice(0, 120);
    };
    const update = (writeURL = true) => {
      const query = search.value.trim().toLocaleLowerCase('id');
      let count = 0;
      for (const item of stories) {
        const visible = (category === 'semua' || item.dataset.categoryName === category) && item.dataset.search.toLocaleLowerCase('id').includes(query);
        item.hidden = !visible;
        item.classList.toggle('filtered', category !== 'semua' || !!query);
        if (visible) count++;
      }
      for (const link of filterLinks) link.setAttribute('aria-current', String(link.dataset.category === category));
      result.textContent = `${count} dari ${stories.length} tulisan` + (query ? ` untuk “${search.value.trim()}”` : '');
      empty.hidden = count > 0;
      reset.hidden = category === 'semua' && !query;
      if (writeURL) {
        const url = new URL(location.href);
        if (category === 'semua') url.searchParams.delete('kategori'); else url.searchParams.set('kategori', category);
        if (query) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
        try { history.replaceState(null, '', url); } catch { /* file preview can restrict history */ }
      }
    };
    filterLinks.forEach(link => link.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); category = link.dataset.category; update();
    }));
    search.addEventListener('input', () => update());
    searchForm.addEventListener('submit', e => { e.preventDefault(); update(); document.querySelector('#artikel').scrollIntoView(); });
    reset.addEventListener('click', () => { category = 'semua'; search.value = ''; update(); search.focus(); });
    addEventListener('popstate', () => { syncFromURL(); update(false); });
    syncFromURL(); update(false);
  }

  const share = document.querySelector('#share-article');
  if (share) {
    const status = document.querySelector('#share-status');
    const fallback = document.querySelector('#share-fallback');
    const input = fallback.querySelector('input');
    share.hidden = false;
    share.addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      if (navigator.share) {
        try { await navigator.share({ title: document.querySelector('h1').textContent, url }); status.textContent = 'Opsi berbagi dibuka.'; return; }
        catch (e) { if (e.name === 'AbortError') { status.textContent = 'Berbagi dibatalkan.'; return; } }
      }
      try { await navigator.clipboard.writeText(url); status.textContent = 'Tautan artikel disalin.'; }
      catch { fallback.hidden = false; input.value = url; input.focus(); input.select(); status.textContent = 'Pilih dan salin tautan di bawah.'; }
    });
  }

  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    const select = document.querySelector('#service');
    if (select) select.value = link.dataset.service;
  }));
  const form = document.querySelector('#demo-form');
  if (form) {
    const status = document.querySelector('#form-status');
    form.addEventListener('submit', e => {
      e.preventDefault(); status.textContent = 'Ini hanya demo; pesan tidak dikirim.'; form.reset();
    });
    form.querySelector('button[type=submit]').disabled = false;
    const value = new URLSearchParams(location.search).get('jasa');
    if ([...form.querySelector('select').options].some(option => option.value === value)) form.querySelector('select').value = value;
  }
})();
