(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const statuses = ['Menunggu', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
  const statusClasses = ['waiting', 'processing', 'shipped', 'done', 'cancelled'];
  const categories = ['Alat tulis', 'Kertas & cetak', 'Perlengkapan kantor'];
  const storageKey = 'masyubi-lajur-orders-v1';
  const clients = [
    ['PT Arunika Digital', 'admin@arunika.co.id'], ['Studio Akar', 'halo@studioakar.id'],
    ['Klinik Sehat Bersama', 'pengadaan@sehatbersama.id'], ['CV Bumi Persada', 'kantor@bumipersada.id'],
    ['Kopi Titik Temu', 'tim@kopititiktemu.id'], ['Yayasan Tumbuh', 'admin@yayasantumbuh.id'],
    ['PT Sagara Teknologi', 'finance@sagara.co.id'], ['Ruang Rintis', 'halo@ruangrintis.id'],
    ['Koperasi Maju Bersama', 'sekretariat@maju.id'], ['Hotel Puri Asri', 'pengadaan@puriasri.id']
  ];
  // Each record: customer, day, category, amount, status, product summary.
  const sampleRows = [
    [0,28,1,2450000,0,'35 rim kertas A4 80 gsm'], [1,27,0,875000,1,'Paket alat tulis untuk 25 staf'],
    [2,26,2,3200000,2,'8 rak dokumen dan 4 papan tulis'], [3,25,1,1680000,3,'24 rim kertas A4 80 gsm'],
    [4,24,0,460000,0,'Buku kas, spidol, dan nota pesanan'], [5,22,2,1850000,1,'Papan tulis dan perlengkapan kelas'],
    [6,20,1,4200000,3,'60 rim kertas A4 80 gsm'], [7,18,2,2750000,2,'Lemari arsip dan organizer meja'],
    [8,17,0,1250000,3,'Paket alat tulis rapat tahunan'], [9,15,1,3500000,3,'50 rim kertas A4 80 gsm'],
    [0,14,2,1680000,3,'12 organizer meja dan label arsip'], [3,12,0,720000,4,'Paket pena dan buku catatan'],
    [2,10,1,2100000,3,'30 rim kertas A4 80 gsm'], [1,8,2,1350000,3,'3 lampu meja dan organizer'],
    [5,7,0,980000,3,'Alat tulis untuk kegiatan belajar'], [6,5,2,3600000,3,'Perlengkapan ruang rapat'],
    [7,3,0,640000,3,'Paket alat tulis untuk 16 staf'], [9,2,1,1750000,3,'25 rim kertas A4 80 gsm']
  ];
  function seedOrders() {
    const october = sampleRows.map(([client, day, category, amount, status, product], i) => ({
      id: `LJR-${String(1042 - i).padStart(4, '0')}`, customer: clients[client][0], email: clients[client][1],
      date: `2026-10-${String(day).padStart(2, '0')}`, category: categories[category], amount,
      status: statuses[status], product, notes: i === 0 ? 'Kirim ke kantor pusat Bandung. Hubungi admin sebelum pengiriman.' : ''
    }));
    return [...october, ...[0,3,6].map((client, i) => ({
      id: `LJR-${1024-i}`, customer: clients[client][0], email: clients[client][1], date: `2026-09-${28-i*7}`,
      category: categories[i], amount: [2100000,1450000,3200000][i], status: 'Selesai',
      product: ['Paket alat tulis bulanan','Kertas untuk operasional kantor','Perlengkapan meja kerja'][i], notes: ''
    }))];
  }
  function validOrder(order) {
    if (!order || typeof order !== 'object') return false;
    const textFields = ['id','customer','email','date','category','status','product','notes'];
    return textFields.every(key => typeof order[key] === 'string' && order[key].length <= 500) &&
      /^LJR-\d{4,}$/.test(order.id) && order.customer.trim() && order.product.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email) &&
      /^\d{4}-\d{2}-\d{2}$/.test(order.date) && Number.isFinite(Date.parse(`${order.date}T12:00:00`)) &&
      new Date(`${order.date}T12:00:00Z`).toISOString().slice(0,10) === order.date &&
      categories.includes(order.category) && statuses.includes(order.status) &&
      Number.isFinite(order.amount) && order.amount >= 1000 && order.amount <= 1000000000;
  }
  let orders = seedOrders();
  let storageWarning = '';
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length > 1000 || !parsed.every(validOrder) || new Set(parsed.map(o => o.id)).size !== parsed.length) throw new Error('Invalid data');
      orders = parsed;
    }
  } catch {
    storageWarning = 'Data tersimpan tidak dapat dibaca. Data contoh ditampilkan; perubahan berlaku selama sesi ini.';
  }
  const state = { view: 'overview', period: '2026-10', status: 'all', search: '', category: 'all', sort: 'newest', page: 1 };
  const pageSize = 6;
  let toastTimer;
  const escape = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const rupiah = value => new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
  const number = value => new Intl.NumberFormat('id-ID').format(value);
  const dateLabel = value => new Intl.DateTimeFormat('id-ID', {day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`));
  const initials = name => name.replace(/^(PT |CV |Yayasan |Koperasi )/, '').split(/\s+/).slice(0,2).map(word => word[0]).join('').toUpperCase();
  const icon = id => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const badge = status => `<span class="badge ${statusClasses[statuses.indexOf(status)]}">${status}</span>`;
  const periodLabel = () => $('#period').selectedOptions[0].textContent;
  const periodOrders = () => orders.filter(order => state.period === 'all' || order.date.startsWith(state.period));
  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5000);
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(orders)); return true; }
    catch { return false; }
  }
  function ensurePeriodOption(date) {
    const month = date.slice(0,7);
    if ([...$('#period').options].some(option => option.value === month)) return;
    const option = document.createElement('option');
    option.value = month;
    const label = new Intl.DateTimeFormat('id-ID', {month:'long',year:'numeric'}).format(new Date(`${month}-01T12:00:00`));
    option.textContent = label[0].toUpperCase() + label.slice(1);
    $('#period').insertBefore(option, $('#period').lastElementChild);
  }
  orders.forEach(order => ensurePeriodOption(order.date));
  function filteredOrders() {
    const query = state.search.trim().toLocaleLowerCase('id');
    return periodOrders().filter(order =>
      (state.status === 'all' || state.view === 'customers' || order.status === state.status) &&
      (state.category === 'all' || order.category === state.category) &&
      (!query || [order.id,order.customer,order.email,order.product].some(value => value.toLocaleLowerCase('id').includes(query)))
    );
  }
  function customerGroups(rows) {
    const groups = new Map();
    rows.forEach(order => {
      if (!groups.has(order.email.toLowerCase())) groups.set(order.email.toLowerCase(), {customer:order.customer,email:order.email,amount:0,date:order.date,rows:[]});
      const group = groups.get(order.email.toLowerCase());
      group.rows.push(order);
      if (order.status !== 'Dibatalkan') group.amount += order.amount;
      if (order.date > group.date) { group.date = order.date; group.customer = order.customer; }
    });
    return [...groups.values()];
  }
  function tableRows() {
    const filtered = filteredOrders();
    const rows = state.view === 'customers' ? customerGroups(filtered) : [...filtered];
    return rows.sort((a,b) => state.sort === 'name' ? a.customer.localeCompare(b.customer,'id') :
      state.sort === 'highest' ? b.amount-a.amount : state.sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date) || (b.id || '').localeCompare(a.id || ''));
  }
  function renderStats(rows) {
    const active = rows.filter(order => order.status !== 'Dibatalkan');
    const total = active.reduce((sum, order) => sum + order.amount, 0);
    $('#stat-value').textContent = total >= 1000000 ? `Rp ${new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(total/1000000)} jt` : rupiah(total);
    $('#stat-value').title = rupiah(total);
    $('#stat-orders').textContent = number(rows.length);
    $('#stat-orders-note').textContent = `${rows.filter(order=>order.status==='Selesai').length} selesai · ${rows.filter(order=>order.status==='Dibatalkan').length} dibatalkan`;
    $('#stat-pending').textContent = number(rows.filter(order=>order.status==='Menunggu').length);
    $('#stat-customers').textContent = number(new Set(active.map(order=>order.email.toLowerCase())).size);
    $('#nav-count').textContent = orders.length;
  }
  function renderChart(rows) {
    const groups = state.period === 'all'
      ? [...new Set(orders.map(order=>order.date.slice(0,7)))].sort().map(month=>({label:new Intl.DateTimeFormat('id-ID',{month:'short',year:'2-digit'}).format(new Date(`${month}-01T12:00:00`)),value:rows.filter(order=>order.date.startsWith(month)&&order.status!=='Dibatalkan').reduce((sum,order)=>sum+order.amount,0)}))
      : Array.from({length:5},(_,i)=>({label:['1–7','8–14','15–21','22–28','29–31'][i],value:rows.filter(order=>Math.min(4,Math.floor((Number(order.date.slice(8))-1)/7))===i&&order.status!=='Dibatalkan').reduce((sum,order)=>sum+order.amount,0)}));
    const max = Math.max(3000000,...groups.map(group=>group.value));
    const ceiling = Math.ceil(max/3000000)*3000000;
    $('#chart').innerHTML = [0,1,2,3].map(i=>`<div class="grid-line" style="bottom:calc(22px + ${i/3} * (100% - 22px))"><span>${number(ceiling*i/3/1000000).replace(/,\d+$/,'')}</span></div>`).join('') +
      `<div class="bars">${groups.map(group=>`<div class="bar-group"><span class="bar-value" style="bottom:calc(${group.value/ceiling*100}% + 5px)">${new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(group.value/1000000)}</span><div class="bar" style="height:${group.value/ceiling*100}%"></div><span class="bar-label">${escape(group.label)}</span></div>`).join('')}</div>`;
    $('#chart').setAttribute('aria-label', `Nilai pesanan ${periodLabel()}: ${groups.map(group=>`${group.label}: ${rupiah(group.value)}`).join('; ')}`);
    $('#chart-caption').textContent = state.period === 'all' ? 'Ringkasan per bulan' : `Tanggal · ${periodLabel()}`;
    const pending = rows.filter(order=>order.status==='Menunggu');
    $('#attention-title').textContent = pending.length ? `${pending.length} pesanan menunggu.` : 'Antrean sudah beres.';
    $('#attention-description').textContent = pending.length ? `Senilai ${rupiah(pending.reduce((sum,order)=>sum+order.amount,0))} siap ditinjau sebelum masuk proses pengiriman.` : 'Tidak ada pesanan yang menunggu konfirmasi pada periode ini.';
    $('#attention-customers').innerHTML = pending.length ? pending.slice(0,3).map(order=>`<span class="avatar" title="${escape(order.customer)}">${escape(initials(order.customer))}</span>`).join('') + `<span>${pending.length} pesanan perlu ditinjau</span>` : '';
    $('#review-pending').disabled = !pending.length;
  }
  function renderTabs(rows) {
    $('#status-tabs').hidden = state.view === 'customers';
    $('#status-tabs').innerHTML = ['all',...statuses].map(status=>`<button class="status-tab" data-status="${status}" aria-pressed="${state.status===status}">${status==='all'?'Semua pesanan':status}<span>${status==='all'?rows.length:rows.filter(order=>order.status===status).length}</span></button>`).join('');
  }
  function renderTable() {
    const customers = state.view === 'customers';
    const rows = tableRows();
    const pages = Math.max(1,Math.ceil(rows.length/pageSize));
    state.page = Math.min(state.page,pages);
    const start = (state.page-1)*pageSize;
    const visible = rows.slice(start,start+pageSize);
    $('#table-title').innerHTML = `${customers?'Daftar pelanggan':'Daftar pesanan'} <span class="count-pill">${rows.length}</span>`;
    $('#table-description').textContent = customers ? 'Ringkasan pelanggan berdasarkan pesanan yang cocok dengan filter.' : 'Dari pesanan masuk sampai diterima pelanggan.';
    $('#table-caption').textContent = customers ? 'Daftar pelanggan Nusa Kantor' : 'Daftar pesanan Nusa Kantor';
    $('#table-head').innerHTML = `<tr>${(customers?['Pelanggan','Pesanan','Terakhir memesan','Nilai pesanan','Aksi']:['No. pesanan','Pelanggan','Tanggal','Total','Status','Aksi']).map(label=>`<th scope="col">${label}</th>`).join('')}</tr>`;
    const customerCell = row => `<div class="customer-cell"><span class="avatar" aria-hidden="true">${escape(initials(row.customer))}</span><div><strong>${escape(row.customer)}</strong><small>${escape(row.email)}</small></div></div>`;
    $('#table-body').innerHTML = visible.map(row=>customers ?
      `<tr><td>${customerCell(row)}</td><td>${row.rows.length} pesanan</td><td>${dateLabel(row.date)}</td><td class="money">${rupiah(row.amount)}</td><td><button class="detail-button" data-customer="${escape(row.email)}" aria-label="Detail pelanggan ${escape(row.customer)}">Detail ${icon('arrow')}</button></td></tr>` :
      `<tr><td class="order-id">${escape(row.id)}</td><td>${customerCell(row)}</td><td>${dateLabel(row.date)}</td><td class="money">${rupiah(row.amount)}</td><td>${badge(row.status)}</td><td><button class="detail-button" data-order="${row.id}" aria-label="Detail pesanan ${row.id}">Detail ${icon('arrow')}</button></td></tr>`).join('');
    $('#empty-state').hidden = rows.length > 0;
    $('.table-scroll').hidden = !rows.length;
    $('#export-button').disabled = !rows.length;
    $('#clear-filters').hidden = !state.search && state.category==='all' && state.status==='all' && state.sort==='newest';
    $('#pagination-info').textContent = rows.length ? `Menampilkan ${start+1}–${Math.min(start+pageSize,rows.length)} dari ${rows.length} ${customers?'pelanggan':'pesanan'}` : `0 ${customers?'pelanggan':'pesanan'} ditemukan`;
    $('#page-info').textContent = `${state.page} / ${pages}`;
    $('#prev-page').disabled = state.page===1;
    $('#next-page').disabled = state.page===pages;
    $('#result-announcement').textContent = `${rows.length} ${customers?'pelanggan':'pesanan'} ditemukan. Halaman ${state.page} dari ${pages}.`;
  }
  function render() {
    const rows = periodOrders();
    renderStats(rows); renderChart(rows); renderTabs(rows); renderTable();
  }
  function resetFilters() {
    Object.assign(state,{status:'all',search:'',category:'all',sort:'newest',page:1});
    $('#search').value=''; $('#category').value='all'; $('#sort').value='newest';
    render();
  }
  function closeMenu() {
    const wasOpen = $('#sidebar').classList.contains('open');
    $('#sidebar').classList.remove('open'); $('#menu-backdrop').hidden=true;
    $('#menu-toggle').setAttribute('aria-expanded','false');
    if(wasOpen) $('#menu-toggle').focus();
  }
  function changeView(view) {
    state.view=view;
    const labels={overview:['Ringkasan','Semua terkendali.','Pantau pesanan dan lihat bagaimana bisnis Anda bergerak.'],orders:['Pesanan','Setiap pesanan, tercatat.','Kelola pesanan dari konfirmasi hingga diterima pelanggan.'],customers:['Pelanggan','Kenali pelanggan Anda.','Lihat riwayat dan nilai pesanan setiap pelanggan bisnis.']};
    $('#breadcrumb-current').textContent=labels[view][0]; $('#page-title').textContent=labels[view][1]; $('#page-description').textContent=labels[view][2];
    $('#overview-section').hidden=view!=='overview';
    $('#search').placeholder=view==='customers'?'Cari pelanggan atau email…':'Cari pesanan atau pelanggan…';
    document.querySelectorAll('[data-view]').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('active',active);if(active) button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    resetFilters(); closeMenu();
  }
  function openDialog(dialog) { if(!dialog.open) dialog.showModal(); }
  function openOrder(id) {
    const order=orders.find(item=>item.id===id); if(!order) return;
    $('#detail-eyebrow').textContent='DETAIL PESANAN'; $('#detail-title').textContent=order.id;
    $('#detail-content').innerHTML=`<div class="detail-summary"><span>Nilai pesanan</span><strong>${rupiah(order.amount)}</strong>${badge(order.status)}</div><dl class="detail-list">${[['Pelanggan',order.customer],['Email',order.email],['Tanggal pesanan',dateLabel(order.date)],['Kategori',order.category],['Produk',order.product],['Catatan',order.notes||'Tidak ada catatan tambahan.']].map(([key,value])=>`<div><dt>${key}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl><form class="status-form" id="status-form"><label for="detail-status">Perbarui status pesanan</label><select id="detail-status" name="status">${statuses.map(status=>`<option${status===order.status?' selected':''}>${status}</option>`).join('')}</select><button class="button primary" type="submit">Simpan perubahan</button><p id="detail-feedback" role="status" style="margin-top:12px;font-size:12px;color:var(--muted)"></p></form>`;
    $('#status-form').addEventListener('submit',event=>{
      event.preventDefault(); const status=$('#detail-status').value;
      if(status===order.status){$('#detail-feedback').textContent='Status sudah sesuai. Tidak ada perubahan.';return;}
      order.status=status; const saved=save();render();
      $('.detail-summary .badge').outerHTML=badge(status);
      $('#detail-feedback').textContent=saved?`Status ${order.id} diperbarui menjadi ${status}.`:'Status diperbarui untuk sesi ini. Penyimpanan browser tidak tersedia.';
      notify(saved?'Status pesanan berhasil diperbarui.':'Status diperbarui untuk sesi ini. Penyimpanan browser tidak tersedia.');
    });
    openDialog($('#detail-dialog'));
  }
  function openCustomer(email) {
    const group=customerGroups(filteredOrders()).find(item=>item.email===email); if(!group)return;
    $('#detail-eyebrow').textContent='DETAIL PELANGGAN'; $('#detail-title').textContent=group.customer;
    $('#detail-content').innerHTML=`<div class="detail-summary"><span>Nilai pesanan · ${escape(periodLabel())}</span><strong>${rupiah(group.amount)}</strong><span>${group.rows.length} pesanan · di luar nilai pembatalan</span></div><dl class="detail-list"><div><dt>Email</dt><dd>${escape(group.email)}</dd></div></dl><h3 style="font-size:14px;margin-top:24px">Pesanan sesuai filter</h3>${group.rows.sort((a,b)=>b.date.localeCompare(a.date)).map(order=>`<div class="customer-order"><div><strong class="order-id">${order.id}</strong><small>${dateLabel(order.date)} · ${rupiah(order.amount)}</small>${badge(order.status)}</div><button class="detail-button" data-order="${order.id}">Buka ${icon('arrow')}</button></div>`).join('')}`;
    openDialog($('#detail-dialog'));
  }
  document.addEventListener('click',event=>{
    const close=event.target.closest('[data-close]'); if(close) close.closest('dialog').close();
    const orderButton=event.target.closest('[data-order]'); if(orderButton) openOrder(orderButton.dataset.order);
    const customerButton=event.target.closest('[data-customer]'); if(customerButton) openCustomer(customerButton.dataset.customer);
  });
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>changeView(button.dataset.view)));
  $('#menu-toggle').addEventListener('click',()=>{
    const open=$('#sidebar').classList.toggle('open');
    $('#menu-backdrop').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));
    if(open) $('.nav-item.active').focus();
  });
  $('#menu-backdrop').addEventListener('click',closeMenu);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#sidebar').classList.contains('open')){closeMenu();$('#menu-toggle').focus();}});
  $('#help-button').addEventListener('click',()=>{closeMenu();openDialog($('#help-dialog'));});
  $('#reset-demo').addEventListener('click',()=>{closeMenu();openDialog($('#reset-dialog'));});
  $('#confirm-reset').addEventListener('click',()=>{
    orders=seedOrders();const saved=save();state.period='2026-10';$('#period').value=state.period;
    [...$('#period').options].forEach(option=>{if(!['2026-10','2026-09','all'].includes(option.value))option.remove();});
    resetFilters();$('#reset-dialog').close();notify(saved?'Data contoh berhasil dikembalikan.':'Data contoh dikembalikan untuk sesi ini. Penyimpanan browser tidak tersedia.');
  });
  $('#period').addEventListener('change',event=>{state.period=event.target.value;state.page=1;render();});
  $('#search').addEventListener('input',event=>{state.search=event.target.value;state.page=1;renderTable();});
  $('#category').addEventListener('change',event=>{state.category=event.target.value;state.page=1;renderTable();});
  $('#sort').addEventListener('change',event=>{state.sort=event.target.value;state.page=1;renderTable();});
  $('#status-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-status]');if(!button)return;state.status=button.dataset.status;state.page=1;renderTabs(periodOrders());renderTable();});
  $('#clear-filters').addEventListener('click',resetFilters);
  $('#empty-reset').addEventListener('click',()=>{state.period='all';$('#period').value='all';resetFilters();});
  $('#prev-page').addEventListener('click',()=>{state.page--;renderTable();});
  $('#next-page').addEventListener('click',()=>{state.page++;renderTable();});
  $('#review-pending').addEventListener('click',()=>{changeView('orders');state.status='Menunggu';render();$('.data-panel').scrollIntoView({behavior:'smooth',block:'start'});});
  $('#add-button').addEventListener('click',()=>{
    $('#order-form').reset();
    $('#order-error').hidden = true;
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    $('#order-form').elements.date.value = state.period === 'all' || localDate.startsWith(state.period) ? localDate : `${state.period}-01`;
    openDialog($('#order-dialog'));
  });
  $('#order-form').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;
    const values=Object.fromEntries(new FormData(form));
    const nextId=Math.max(1042,...orders.map(order=>Number(order.id.slice(4))))+1;
    const order={...values,id:`LJR-${nextId}`,customer:values.customer.trim(),email:values.email.trim().toLowerCase(),product:values.product.trim(),notes:values.notes.trim(),amount:Number(values.amount)};
    if(!validOrder(order)){
      $('#order-error').textContent='Periksa kembali nama, email lengkap (contoh: admin@bisnis.id), produk, tanggal, dan nilai pesanan.';
      $('#order-error').hidden=false;
      return;
    }
    if(orders.length>=1000){
      $('#order-error').textContent='Ruang demo ini sudah memuat 1.000 pesanan. Ekspor data lalu atur ulang demo untuk mencoba lagi.';
      $('#order-error').hidden=false;
      return;
    }
    orders.unshift(order);const saved=save();ensurePeriodOption(order.date);
    state.period=order.date.slice(0,7);$('#period').value=state.period;
    changeView('orders');state.search=order.id;$('#search').value=order.id;renderTable();
    $('#order-dialog').close();notify(saved?`${order.id} berhasil ditambahkan.`:`${order.id} ditambahkan untuk sesi ini. Penyimpanan browser tidak tersedia.`);
  });
  function csvCell(value) {
    let text=String(value);
    if(/^[\s]*[=+@-]/.test(text))text=`'${text}`;
    return `"${text.replace(/"/g,'""')}"`;
  }
  $('#export-button').addEventListener('click',()=>{
    const rows=tableRows();const customers=state.view==='customers';
    const headings=customers?['Pelanggan','Email','Jumlah pesanan','Terakhir memesan','Nilai pesanan']:['Nomor pesanan','Pelanggan','Email','Tanggal','Kategori','Produk','Nilai pesanan','Status','Catatan'];
    const values=rows.map(row=>customers?[row.customer,row.email,row.rows.length,row.date,row.amount]:[row.id,row.customer,row.email,row.date,row.category,row.product,row.amount,row.status,row.notes]);
    const content='\uFEFF'+[headings,...values].map(row=>row.map(csvCell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'}));
    const link=document.createElement('a');link.href=url;link.download=`lajur-${customers?'pelanggan':'pesanan'}-${state.period}.csv`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    notify(`${rows.length} ${customers?'pelanggan':'pesanan'} diekspor sesuai filter.`);
  });
  render();
  if(storageWarning)notify(storageWarning);
})();
