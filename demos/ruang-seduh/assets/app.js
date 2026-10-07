(() => {
  'use strict';
  const coffeeVariants = ['Biji utuh', 'Giling filter', 'Giling tubruk'];
  const products = [
    {id:'jeda-pagi',name:'Jeda Pagi Blend',category:'biji',size:'200 g',price:85000,notes:'Cokelat · karamel · almond',description:'Contoh blend dengan profil cokelat dan karamel yang lembut. Dibayangkan untuk kopi hitam sehari-hari atau dipadukan dengan susu.',variants:coffeeVariants},
    {id:'gayo-senja',name:'Gayo Senja',category:'biji',size:'200 g',price:95000,notes:'Kakao · rempah · gula aren',description:'Contoh kopi dengan karakter kakao dan rempah, serta body yang terasa penuh. Coba seduh dengan metode tubruk atau French press.',variants:coffeeVariants},
    {id:'kintamani',name:'Kintamani Pagi',category:'biji',size:'200 g',price:105000,notes:'Jeruk · madu · teh hitam',description:'Contoh profil rasa yang lebih ringan, dengan kesan jeruk dan madu. Dibayangkan untuk seduhan filter yang jernih.',variants:coffeeVariants},
    {id:'flores',name:'Flores Bajawa',category:'biji',size:'200 g',price:98000,notes:'Cokelat susu · kacang · vanila',description:'Contoh kopi dengan profil cokelat susu dan kacang. Pilihan ilustratif untuk seduhan yang terasa bulat dan hangat.',variants:coffeeVariants},
    {id:'toraja',name:'Toraja Sore',category:'biji',size:'200 g',price:110000,notes:'Kakao · kayu manis · karamel',description:'Contoh karakter kopi yang dalam dengan kesan kakao dan kayu manis. Dibayangkan menemani jeda sore dengan seduhan hangat.',variants:coffeeVariants},
    {id:'drip-pagi',name:'Drip Bag Jeda Pagi',category:'drip',size:'5 × 10 g',price:45000,notes:'Cokelat · karamel',description:'Lima contoh drip bag untuk pagi yang singkat. Buka kantong, kaitkan pada cangkir, lalu tuang sekitar 150 ml air hangat secara bertahap.',variants:['5 kantong']},
    {id:'drip-gayo',name:'Drip Bag Gayo',category:'drip',size:'5 × 10 g',price:50000,notes:'Kakao · gula aren',description:'Kopi berprofil kakao dalam contoh kemasan drip bag. Lima kantong satu porsi, dibayangkan mudah dibawa untuk ritual kopi di luar rumah.',variants:['5 kantong']},
    {id:'drip-kintamani',name:'Drip Bag Kintamani',category:'drip',size:'5 × 10 g',price:55000,notes:'Jeruk · madu',description:'Contoh drip bag dengan profil jeruk dan madu. Seduh perlahan menggunakan air hangat, lalu nikmati tanpa perlu membawa alat tambahan.',variants:['5 kantong']},
    {id:'dripper',name:'Dripper Keramik',category:'alat',size:'1–2 cangkir',price:165000,notes:'Keramik cream · pour over',description:'Contoh dripper keramik berbentuk kerucut untuk satu sampai dua cangkir. Gunakan bersama filter kertas dan tuangkan air perlahan melingkar.',variants:['Cream']},
    {id:'server',name:'Server Kaca',category:'alat',size:'400 ml',price:145000,notes:'Kaca bening · tutup zaitun',description:'Contoh server kaca 400 ml untuk menampung hasil seduhan filter. Mulut lebar dan pegangan samping membantu ritual menuang kopi.',variants:['400 ml']},
    {id:'filter',name:'Filter Kertas',category:'alat',size:'40 lembar',price:35000,notes:'Bentuk kerucut · unbleached',description:'Contoh isi ulang filter kertas kerucut untuk dripper. Bilas dengan air hangat sebelum menambahkan kopi. Satu kemasan berisi 40 lembar.',variants:['40 lembar']},
    {id:'mug',name:'Mug Keramik Zaitun',category:'alat',size:'250 ml',price:125000,notes:'Keramik zaitun · bagian dalam cream',description:'Contoh mug keramik 250 ml berwarna zaitun dengan bagian dalam cream. Dibayangkan sebagai cangkir sederhana di sudut favorit rumah.',variants:['Zaitun']}
  ];
  const categoryNames = {biji:'Biji Kopi',drip:'Drip Bag',alat:'Alat Seduh'};
  const byId = new Map(products.map(p => [p.id,p]));
  const rupiah = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
  const money = value => rupiah.format(value);
  const keyOf = item => `${item.id}|${item.variant}`;
  const storageKey = 'ruang-seduh-cart-v1';
  let storageMessage = '';
  let cart = [];
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length > 100) throw new Error('Invalid cart');
      for (const item of parsed) {
        const product = item && byId.get(item.id);
        if (!product || !product.variants.includes(item.variant) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
          storageMessage = 'Sebagian data keranjang tidak valid dan telah diabaikan.';
          continue;
        }
        const existing = cart.find(row => keyOf(row) === keyOf(item));
        if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
        else cart.push({id:item.id,variant:item.variant,quantity:item.quantity});
      }
    }
  } catch {
    storageMessage = 'Keranjang tersimpan tidak dapat dibaca. Kamu tetap bisa berbelanja dalam sesi ini.';
  }
  const plus = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
  const image = (p, eager=false) => `<img src="assets/images/${p.id}-320.webp" srcset="assets/images/${p.id}-320.webp 320w, assets/images/${p.id}-640.webp 640w" sizes="(max-width: 767px) calc((100vw - 64px)/2), (max-width: 1023px) 30vw, 300px" width="640" height="640" ${eager?'loading="eager"':'loading="lazy"'} alt="${p.name} — ${p.category==='biji'?'kemasan kopi zaitun':p.category==='drip'?'kotak dan sachet drip bag':'alat seduh'}.">`;
  const card = (p,eager=false) => `<article class="product-card" data-product="${p.id}"><button class="product-image" type="button" data-detail="${p.id}" aria-label="Lihat detail ${p.name}">${image(p,eager)}</button><p class="product-meta">${categoryNames[p.category]} / ${p.size}</p><h3><button type="button" data-detail="${p.id}">${p.name}</button></h3><p class="product-notes">${p.notes}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button type="button" class="add-button" data-add="${p.id}" aria-label="Tambah ${p.name} ke keranjang">${plus} Tambah</button></div></article>`;
  const featured = document.querySelector('[data-featured]');
  if (featured) featured.innerHTML = ['jeda-pagi','kintamani','drip-pagi','dripper'].map(id => card(byId.get(id))).join('');

  const catalog = document.getElementById('catalog');
  if (catalog) {
    const firstRowCount = matchMedia('(min-width:1024px)').matches ? 4 : matchMedia('(min-width:768px)').matches ? 3 : 2;
    const form = document.getElementById('catalog-form');
    const search = document.getElementById('search');
    const sort = document.getElementById('sort');
    const params = new URLSearchParams(location.search);
    const initialCategory = params.get('category');
    if (['biji','drip','alat'].includes(initialCategory)) form.elements.category.value = initialCategory;
    if (['asc','desc'].includes(params.get('sort'))) sort.value = params.get('sort');
    search.value = (params.get('q') || '').slice(0,100);
    const renderCatalog = () => {
      const query = search.value.trim().toLocaleLowerCase('id-ID');
      const category = form.elements.category.value;
      const filtered = products.filter(p => (category==='all' || p.category===category) && p.name.toLocaleLowerCase('id-ID').includes(query));
      if (sort.value!=='default') filtered.sort((a,b) => sort.value==='asc' ? a.price-b.price : b.price-a.price);
      catalog.innerHTML = filtered.map((p,index) => card(p,index<firstRowCount)).join('');
      document.getElementById('result-count').textContent = `${filtered.length} produk${category!=='all'?' · '+categoryNames[category]:''}`;
      document.getElementById('no-results').hidden = filtered.length!==0;
      const next = new URLSearchParams();
      if (category!=='all') next.set('category',category);
      if (query) next.set('q',search.value.trim());
      if (sort.value!=='default') next.set('sort',sort.value);
      try { history.replaceState(null,'',location.pathname+(next.size?'?'+next.toString():'')); } catch { /* file preview also works */ }
    };
    form.addEventListener('submit',e => {e.preventDefault();renderCatalog();});
    search.addEventListener('input',renderCatalog);
    form.addEventListener('change',renderCatalog);
    document.getElementById('reset-filters').addEventListener('click',() => {form.reset();renderCatalog();search.focus();});
    renderCatalog();
    window.addEventListener('pageshow',updateBadge);
  }

  document.body.insertAdjacentHTML('beforeend',`
    <dialog id="product-dialog" aria-labelledby="detail-title"><button type="button" class="dialog-close" data-close aria-label="Tutup detail produk">${closeIcon}</button><div id="product-content"></div></dialog>
    <dialog id="cart-dialog" class="cart-dialog" aria-labelledby="cart-title"><button type="button" class="dialog-close" data-close aria-label="Tutup keranjang">${closeIcon}</button><h2 id="cart-title" tabindex="-1">Keranjangmu.</h2><p class="cart-heading-note">Satu langkah menuju jeda yang kamu pilih.</p><div class="cart-items" id="cart-items"></div><div class="cart-summary" id="cart-summary"></div><p id="storage-note" class="storage-note" role="status" hidden></p></dialog>
    <dialog id="checkout-dialog" class="checkout-dialog" aria-labelledby="checkout-title"><button type="button" class="dialog-close" data-close aria-label="Tutup ringkasan pesanan">${closeIcon}</button><p class="eyebrow">CHECKOUT DEMO</p><h2 id="checkout-title">Ringkasan pesanan.</h2><p class="checkout-notice">Ini website demo, pesanan tidak dikirim. Tidak ada pembayaran atau data pribadi yang diminta.</p><ul class="checkout-list" id="checkout-list"></ul><div class="subtotal"><span>Total demo</span><strong id="checkout-total"></strong></div><button type="button" class="button" id="finish-demo">Selesai, kembali berbelanja</button></dialog>
  `);
  const productDialog = document.getElementById('product-dialog');
  const cartDialog = document.getElementById('cart-dialog');
  const checkoutDialog = document.getElementById('checkout-dialog');
  let opener = null;
  let switching = false;
  function openDialog(dialog,trigger) {
    switching = true;
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    switching = false;
    opener = trigger || document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  for (const dialog of [productDialog,cartDialog,checkoutDialog]) {
    dialog.addEventListener('keydown',e => {
      if (e.key!=='Tab') return;
      const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => el.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length-1];
      if (!first) {e.preventDefault();return;}
      if (e.shiftKey && (document.activeElement===first || !dialog.contains(document.activeElement))) {e.preventDefault();last.focus();}
      else if (!e.shiftKey && (document.activeElement===last || !dialog.contains(document.activeElement))) {e.preventDefault();first.focus();}
    });
    dialog.addEventListener('close',() => {
      if (document.querySelector('dialog[open]')) return;
      document.body.classList.remove('modal-open');
      if (!switching && opener?.isConnected) opener.focus();
    });
    dialog.addEventListener('click',e => {
      const bounds = dialog.getBoundingClientRect();
      if (e.target===dialog && (e.clientX<bounds.left || e.clientX>bounds.right || e.clientY<bounds.top || e.clientY>bounds.bottom)) dialog.close();
    });
  }
  let notifyTimer;
  function notify(message) {
    const el = document.getElementById('notifications');
    clearTimeout(notifyTimer);
    el.textContent = message;
    el.classList.add('is-visible');
    notifyTimer = setTimeout(() => el.classList.remove('is-visible'),3200);
  }
  function saveCart() {
    try { localStorage.setItem(storageKey,JSON.stringify(cart)); }
    catch { storageMessage = 'Penyimpanan tidak tersedia. Keranjang hanya tersimpan selama sesi halaman ini.'; }
    updateBadge();
  }
  function updateBadge() {
    const count = cart.reduce((sum,item) => sum+item.quantity,0);
    document.querySelectorAll('[data-cart-count]').forEach(el => {el.textContent=count;});
    document.querySelectorAll('[data-open-cart]').forEach(el => el.setAttribute('aria-label',`Buka keranjang, ${count} barang`));
  }
  const subtotal = () => cart.reduce((sum,item) => sum+byId.get(item.id).price*item.quantity,0);
  function addToCart(id,variant,quantity) {
    const p = byId.get(id);
    if (!p || !p.variants.includes(variant) || !Number.isInteger(quantity) || quantity<1 || quantity>99) return;
    const item = cart.find(row => row.id===id && row.variant===variant);
    if (item && item.quantity+quantity>99) {notify('Maksimal 99 barang untuk setiap varian.');return false;}
    if (item) item.quantity+=quantity;
    else cart.push({id,variant,quantity});
    saveCart();
    notify(`${quantity} ${p.name} ditambahkan ke keranjang.`);
    return true;
  }
  function renderCart() {
    document.getElementById('cart-items').innerHTML = cart.length ? cart.map((item,index) => {
      const p = byId.get(item.id);
      return `<article class="cart-item"><img src="assets/images/${p.id}-320.webp" width="320" height="320" alt="${p.name}"><div><h3>${p.name}</h3><p>${item.variant} · ${p.size}</p><p>${money(p.price)} / item</p><div class="cart-item-controls"><div class="quantity"><button type="button" data-cart-action="minus" data-index="${index}" aria-label="Kurangi ${p.name}, ${item.variant}" ${item.quantity===1?'disabled':''}>−</button><span aria-label="Jumlah ${item.quantity}">${item.quantity}</span><button type="button" data-cart-action="plus" data-index="${index}" aria-label="Tambah jumlah ${p.name}, ${item.variant}" ${item.quantity===99?'disabled':''}>+</button></div><button class="remove-button" type="button" data-cart-action="remove" data-index="${index}" aria-label="Hapus ${p.name}, ${item.variant}">Hapus</button></div><p>${money(p.price*item.quantity)}</p></div></article>`;
    }).join('') : '<div class="cart-empty"><p class="eyebrow">JEDAMU DIMULAI DI SINI</p><h3>Keranjang masih kosong.</h3><p>Pilih kopi atau alat seduh untuk mencoba alur belanja demo.</p><a href="shop.html" class="button">Jelajahi Shop ↗</a></div>';
    document.getElementById('cart-summary').innerHTML = cart.length ? `<div class="subtotal"><span>Subtotal</span><strong>${money(subtotal())}</strong></div><p>Demo tanpa ongkir atau pembayaran. Pesanan tidak dikirim.</p><button class="button" type="button" id="checkout">Lihat ringkasan pesanan →</button>` : '';
    const note = document.getElementById('storage-note');
    note.textContent = storageMessage;
    note.hidden = !storageMessage;
  }
  function showProduct(id,trigger) {
    const p = byId.get(id);
    if (!p) return;
    document.getElementById('product-content').innerHTML = `<div class="detail-layout"><img src="assets/images/${p.id}-640.webp" width="640" height="640" alt="${p.name}"><div class="detail-copy"><p class="eyebrow">${categoryNames[p.category]} / ${p.size}</p><h2 id="detail-title">${p.name}</h2><p class="price">${money(p.price)}</p><p class="detail-description">${p.description}</p><form class="detail-form" id="detail-form" novalidate><label for="variant">${p.category==='biji'?'Bentuk kopi':'Varian'}</label><select id="variant" name="variant">${p.variants.map(v => `<option>${v}</option>`).join('')}</select><label for="detail-quantity">Jumlah</label><div class="quantity"><button type="button" data-step="-1" aria-label="Kurangi jumlah">−</button><input id="detail-quantity" name="quantity" type="number" inputmode="numeric" min="1" max="99" step="1" value="1" aria-describedby="quantity-error"><button type="button" data-step="1" aria-label="Tambah jumlah">+</button></div><p class="form-error" id="quantity-error" role="alert" hidden>Masukkan jumlah bulat antara 1 dan 99.</p><button class="button" type="submit">Tambah ke keranjang ${plus}</button></form><p class="fiction-note">Produk dan profil rasa fiktif untuk demo.</p></div></div>`;
    const form = document.getElementById('detail-form');
    const quantityInput = form.elements.quantity;
    const error = document.getElementById('quantity-error');
    function validate() {
      const quantity = Number(quantityInput.value);
      const valid = quantityInput.value!=='' && Number.isInteger(quantity) && quantity>=1 && quantity<=99;
      error.hidden = valid;
      quantityInput.setAttribute('aria-invalid',String(!valid));
      return valid;
    }
    form.addEventListener('click',e => {
      const step = e.target.closest('[data-step]');
      if (!step) return;
      const current = Number(quantityInput.value);
      quantityInput.value = Math.max(1,Math.min(99,(Number.isFinite(current)?Math.round(current):1)+Number(step.dataset.step)));
      validate();
    });
    quantityInput.addEventListener('input',validate);
    form.addEventListener('submit',e => {
      e.preventDefault();
      if (!validate()) {quantityInput.focus();return;}
      if (addToCart(p.id,form.elements.variant.value,Number(quantityInput.value))) productDialog.close();
    });
    openDialog(productDialog,trigger);
  }
  document.addEventListener('click',e => {
    const target = e.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-close')) {target.closest('dialog').close();return;}
    if (target.hasAttribute('data-open-cart')) {renderCart();openDialog(cartDialog,target);return;}
    if (target.dataset.detail) {showProduct(target.dataset.detail,target);return;}
    if (target.dataset.add) {const p=byId.get(target.dataset.add);addToCart(p.id,p.variants[0],1);return;}
    if (target.dataset.cartAction) {
      const index = Number(target.dataset.index);
      const item = cart[index];
      if (!item) return;
      const action = target.dataset.cartAction;
      if (action==='remove') cart.splice(index,1);
      else item.quantity = Math.max(1,Math.min(99,item.quantity+(action==='plus'?1:-1)));
      saveCart();renderCart();
      const next = document.querySelector(`[data-cart-action="${action}"][data-index="${index}"]:not(:disabled)`);
      (next || document.getElementById('cart-title')).focus();
      return;
    }
    if (target.id==='checkout' && cart.length) {
      document.getElementById('checkout-list').innerHTML = cart.map(item => {const p=byId.get(item.id);return `<li><span>${p.name}<small>${item.variant} · ${item.quantity} × ${money(p.price)}</small></span><strong>${money(p.price*item.quantity)}</strong></li>`;}).join('');
      document.getElementById('checkout-total').textContent = money(subtotal());
      openDialog(checkoutDialog,document.querySelector('[data-open-cart]'));
      return;
    }
    if (target.id==='finish-demo') {checkoutDialog.close();notify('Demo selesai. Keranjangmu tetap tersimpan.');}
  });
  // Synchronize changes made in another tab without touching the catalog.
  window.addEventListener('storage',e => {if (e.key===storageKey) {notify('Keranjang berubah di tab lain. Muat ulang untuk melihat perubahan.');}});
  updateBadge();
})();
