/* ============================================================
   Color Tester Widget — Masyubi
   - Ubah 5 warna utama demo secara live
   - Copy kode warna ke clipboard untuk dikirim ke WhatsApp
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

  const root = document.documentElement;
  const defaults = {};

  // Simpan warna default
  Object.keys(VARS).forEach((key) => {
    defaults[key] = getComputedStyle(root).getPropertyValue(VARS[key]).trim() || '#000000';
  });

  // Helper: ubah hex (#rrggbb) jadi uppercase
  const norm = (hex) => (hex || '').toUpperCase();

  // Buat panel HTML
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
      <p class="ct-title">🎨 Coba Warna Sendiri</p>
      <p class="ct-subtitle">Ubah warna di bawah, lihat perubahannya langsung. Kalau suka, klik <strong>Salin Warna</strong> lalu kirim ke kami via WhatsApp.</p>
      ${rows}
      <div class="ct-actions">
        <button class="ct-btn ct-btn-primary" id="ctCopy">Salin Warna</button>
        <button class="ct-btn ct-btn-ghost" id="ctReset">Reset</button>
      </div>
      <p class="ct-hint">Hasilnya bisa ditempel di chat WhatsApp 💬</p>
    `;
    return panel;
  }

  // Buat tombol toggle
  function buildToggle() {
    const btn = document.createElement('button');
    btn.className = 'ct-toggle';
    btn.id = 'ctToggle';
    btn.setAttribute('aria-label', 'Coba warna');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/>
        <circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
        <path d="M12 2a10 10 0 100 20c1.1 0 2-.9 2-2v-1a2 2 0 012-2h1a4 4 0 004-4 10 10 0 00-9-9z"/>
      </svg>
    `;
    return btn;
  }

  // Buat toast "Tersalin!"
  function buildToast() {
    const t = document.createElement('div');
    t.className = 'ct-copied';
    t.id = 'ctCopied';
    t.textContent = '✓ Tersalin!';
    return t;
  }

  // Terapkan warna ke CSS variables
  function applyColor(key, value) {
    root.style.setProperty(VARS[key], value);
  }

  // Salin hasil ke clipboard
  function copyColors() {
    const lines = Object.keys(VARS).map((key) => {
      const val = getComputedStyle(root).getPropertyValue(VARS[key]).trim();
      return `- ${LABELS[key]}: ${norm(val)}`;
    });
    const demoName = document.title.split('—')[0].trim(); // ambil dari <title>
    const text = `Halo Masyubi 👋\n\nSaya sudah coba-coba warna di demo ${demoName} dan suka kombinasi ini:\n\n${lines.join('\n')}\n\nTolong pakai kombinasi ini untuk website saya ya 🙏`;

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

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(buildToggle());
    document.body.appendChild(buildPanel());
    document.body.appendChild(buildToast());

    const toggle = document.getElementById('ctToggle');
    const panel  = document.getElementById('ctPanel');

    toggle.addEventListener('click', () => panel.classList.toggle('open'));

    // Bind color pickers & hex input
    document.querySelectorAll('.ct-panel input[type="color"]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        applyColor(key, e.target.value);
        document.getElementById(`ct-${key}-hex`).value = norm(e.target.value);
      });
    });

    document.querySelectorAll('.ct-panel input[type="text"]').forEach((input) => {
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

    // Tutup panel kalau klik di luar
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
  });
})();