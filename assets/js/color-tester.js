/* ============================================================
   Color Tester Widget — Masyubi (v2)
   - Floating button bisa digeser (drag)
   - Posisi terakhir disimpan di localStorage
   - Panel terbuka mengikuti posisi button
   ============================================================ */
(function () {
  const VARS = {
    primary:   '--brand-primary',
    secondary: '--brand-secondary',
    accent:    '--brand-accent',
    bg:        '--brand-bg',
    text:      '--brand-text',
  };

  const LABELS = {
    primary:   'Warna utama',
    secondary: 'Warna kedua',
    accent:    'Warna aksen',
    bg:        'Latar belakang',
    text:      'Warna teks',
  };

  const STORAGE_KEY = 'masyubi_ct_pos';
  const PANEL_GAP = 12; // jarak antar button & panel

  const root = document.documentElement;
  const defaults = {};

  Object.keys(VARS).forEach((key) => {
    defaults[key] = getComputedStyle(root).getPropertyValue(VARS[key]).trim() || '#000000';
  });

  const norm = (hex) => (hex || '').toUpperCase();

  /* ---------------- Panel ---------------- */
  function buildPanel() {
    const panel = document.createElement('div');
    panel.className = 'ct-panel';
    panel.id = 'ctPanel';

    const rows = Object.keys(VARS).map((key) => `
      <div class="ct-row">
        <label for="ct-${key}">${LABELS[key]}</label>
        <input type="color" id="ct-${key}" data-key="${key}" value="${defaults[key]}">
        <input type="text" id="ct-${key}-hex" data-key="${key}" value="${norm(defaults[key])}" maxlength="7">
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="ct-drag-handle" id="ctDragHandle">
        <p class="ct-title" style="margin:0">🎨 Coba Warna</p>
        <button class="ct-close" id="ctClose" aria-label="Tutup">✕</button>
      </div>
      <p class="ct-subtitle">Ubah warna, lihat perubahannya langsung. Kalau suka, klik <strong>Salin Warna</strong> lalu kirim ke kami via WhatsApp.</p>
      ${rows}
      <div class="ct-actions">
        <button class="ct-btn ct-btn-primary" id="ctCopy">Salin Warna</button>
        <button class="ct-btn ct-btn-ghost" id="ctReset">Reset</button>
      </div>
      <p class="ct-hint">Hasilnya bisa ditempel di chat WhatsApp 💬</p>
    `;
    return panel;
  }

  /* ---------------- Toggle button ---------------- */
  function buildToggle() {
    const btn = document.createElement('button');
    btn.className = 'ct-toggle';
    btn.id = 'ctToggle';
    btn.setAttribute('aria-label', 'Coba warna (bisa digeser)');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/>
        <circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
        <path d="M12 2a10 10 0 100 20c1.1 0 2-.9 2-2v-1a2 2 0 012-2h1a4 4 0 004-4 10 10 0 00-9-9z"/>
      </svg>
      <span class="ct-hint-badge">Drag</span>
    `;
    return btn;
  }

  function buildToast() {
    const t = document.createElement('div');
    t.className = 'ct-copied';
    t.id = 'ctCopied';
    t.textContent = '✓ Tersalin!';
    return t;
  }

  /* ---------------- Warna ---------------- */
  function applyColor(key, value) {
    root.style.setProperty(VARS[key], value);
  }

  /* ---------------- Drag & posisi ---------------- */
  const drag = {
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  };

  function getViewport() {
    return {
      w: window.innerWidth,
      h: window.innerHeight,
    };
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function setPosition(el, left, top) {
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  }

  function savePosition(left, top) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ left, top }));
    } catch (e) { /* ignore */ }
  }

  function loadPosition() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const pos = JSON.parse(raw);
      if (typeof pos.left === 'number' && typeof pos.top === 'number') return pos;
    } catch (e) { /* ignore */ }
    return null;
  }

  function initPosition(btn) {
    const saved = loadPosition();
    const { w, h } = getViewport();
    const size = btn.offsetWidth || 48;

    let left, top;
    if (saved) {
      // Pastikan masih dalam viewport (mis. kalau window resize)
      left = clamp(saved.left, 8, w - size - 8);
      top  = clamp(saved.top,  8, h - size - 8);
    } else {
      // Default: tengah kanan
      left = w - size - 16;
      top  = h / 2 - size / 2;
    }
    setPosition(btn, left, top);
  }

  function attachDrag(btn, onDragEnd) {
    const onDown = (e) => {
      // Kalau yang di-klik adalah child svg, tetap lanjut
      drag.active = true;
      drag.moved = false;
      btn.classList.add('dragging');

      const point = e.touches ? e.touches[0] : e;
      drag.startX = point.clientX;
      drag.startY = point.clientY;
      const rect = btn.getBoundingClientRect();
      drag.startLeft = rect.left;
      drag.startTop = rect.top;

      btn.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      if (!drag.active) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - drag.startX;
      const dy = point.clientY - drag.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;

      const { w, h } = getViewport();
      const size = btn.offsetWidth;
      const left = clamp(drag.startLeft + dx, 8, w - size - 8);
      const top  = clamp(drag.startTop + dy,  8, h - size - 8);

      setPosition(btn, left, top);

      if (e.cancelable) e.preventDefault();
    };

    const onUp = () => {
      if (!drag.active) return;
      drag.active = false;
      btn.classList.remove('dragging');

      const rect = btn.getBoundingClientRect();
      savePosition(rect.left, rect.top);

      // Kalau tidak bergeser → anggap klik
      if (!drag.moved) onDragEnd();
    };

    btn.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);

    // Touch fallback untuk browser lama
    if (!('PointerEvent' in window)) {
      btn.addEventListener('touchstart', onDown, { passive: true });
      btn.addEventListener('touchmove', onMove, { passive: false });
      btn.addEventListener('touchend', onUp);
    }
  }

  /* ---------------- Posisi panel mengikuti tombol ---------------- */
  function positionPanel(panel, btn) {
    const { w, h } = getViewport();
    const btnRect = btn.getBoundingClientRect();
    const panelW = panel.offsetWidth || 300;
    const panelH = panel.offsetHeight || 340;

    // Buka ke kiri kalau tombol di kanan, sebaliknya
    const spaceRight = w - btnRect.right;
    const openLeft = spaceRight < panelW + PANEL_GAP;

    let left;
    if (openLeft) {
      left = btnRect.left - panelW - PANEL_GAP;
    } else {
      left = btnRect.right + PANEL_GAP;
    }

    // Vertikal: coba sejajar dengan tombol, lalu clamp
    let top = btnRect.top + btnRect.height / 2 - panelH / 2;
    top = clamp(top, 12, h - panelH - 12);
    left = clamp(left, 12, w - panelW - 12);

    panel.style.left = left + 'px';
    panel.style.top  = top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  /* ---------------- Copy ke clipboard ---------------- */
  function copyColors() {
    const lines = Object.keys(VARS).map((key) => {
      const val = getComputedStyle(root).getPropertyValue(VARS[key]).trim();
      return `- ${LABELS[key]}: ${norm(val)}`;
    });
    const demoName = (document.title.split('—')[0] || '').trim() || 'demo ini';
    const text = `Halo Masyubi 👋\n\nSaya sudah coba-coba warna di *${demoName}* dan suka kombinasi ini:\n\n${lines.join('\n')}\n\nTolong pakai kombinasi ini untuk website saya ya 🙏`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(); }
    catch (e) { alert('Copy manual:\n\n' + text); }
    document.body.removeChild(ta);
  }

  function showToast() {
    const t = document.getElementById('ctCopied');
    if (!t) return;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------------- Init ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = buildToggle();
    const panel = buildPanel();
    const toast = buildToast();
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    document.body.appendChild(toast);

    // Taruh posisi awal
    requestAnimationFrame(() => initPosition(btn));

    // Fungsi buka/tutup
    function togglePanel() {
      const willOpen = !panel.classList.contains('open');
      panel.classList.toggle('open');
      if (willOpen) positionPanel(panel, btn);
    }

    function closePanel() {
      panel.classList.remove('open');
    }

    // Drag button + click handler
    attachDrag(btn, togglePanel);

    // Tombol close di panel
    document.getElementById('ctClose').addEventListener('click', closePanel);

    // Klik di luar → tutup
    document.addEventListener('click', (e) => {
      if (panel.classList.contains('open') &&
          !panel.contains(e.target) &&
          !btn.contains(e.target)) {
        closePanel();
      }
    });

    // Color pickers
    panel.querySelectorAll('input[type="color"]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        applyColor(key, e.target.value);
        document.getElementById(`ct-${key}-hex`).value = norm(e.target.value);
      });
    });

    // Hex input
    panel.querySelectorAll('input[type="text"]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          const key = e.target.dataset.key;
          applyColor(key, val);
          document.getElementById(`ct-${key}`).value = val;
        }
      });
    });

    // Copy & reset
    document.getElementById('ctCopy').addEventListener('click', copyColors);
    document.getElementById('ctReset').addEventListener('click', () => {
      Object.keys(VARS).forEach((key) => {
        applyColor(key, defaults[key]);
        document.getElementById(`ct-${key}`).value = defaults[key];
        document.getElementById(`ct-${key}-hex`).value = norm(defaults[key]);
      });
    });

    // Reposisi kalau window resize
    window.addEventListener('resize', () => {
      const size = btn.offsetWidth;
      const rect = btn.getBoundingClientRect();
      const { w, h } = getViewport();
      const left = clamp(rect.left, 8, w - size - 8);
      const top  = clamp(rect.top,  8, h - size - 8);
      setPosition(btn, left, top);
      if (panel.classList.contains('open')) positionPanel(panel, btn);
    });
  });
})();