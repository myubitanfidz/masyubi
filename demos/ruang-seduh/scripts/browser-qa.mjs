/** Headless local QA using the already cached Chrome DevTools testing bundle. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundle = process.env.CHROME_TEST_BUNDLE;
if (!bundle) throw new Error('Set CHROME_TEST_BUNDLE to chrome-devtools-mcp/build/src/third_party/index.js');
const {puppeteer} = await import(pathToFileURL(bundle).href);
const output = path.join(root,'qa');
await fs.mkdir(output,{recursive:true});
const browser = await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--disable-extensions'],userDataDir:path.join(output,'.chrome-test-profile')});
const base = process.env.DEMO_URL || 'http://127.0.0.1:4173/demos/ruang-seduh/';
const checks=[];
const errors=[];
const page=await browser.newPage();
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
const click = selector => page.click(selector);
const evaluate = fn => page.evaluate(fn);
const load = async url=>{await page.goto(base+url,{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);};
const screenshot=async name=>{
  if(process.argv.includes('--functional-only')) return;
  if(await evaluate(()=>Boolean(document.querySelector('dialog[open]')))) {
    await page.screenshot({path:path.join(output,name+'.png'),fullPage:false});
    return;
  }
  // Visit the full document so native lazy images load before a full-page capture.
  const height=await evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<height;y+=700){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForNetworkIdle({idleTime:100,timeout:5000});}
  await evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
};
const check = (label,value)=>{assert.ok(value,label);checks.push(label);};
try {
  await load('index.html');
  await evaluate(()=>localStorage.removeItem('ruang-seduh-cart-v1'));
  for(const width of [360,390,768,1440]) {
    await page.setViewport({width,height:width>1000?1000:844,deviceScaleFactor:1});
    for(const route of ['index.html','shop.html']) {
      await load(route);
      check(`No horizontal overflow: ${route} ${width}`,await evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const broken=await evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));
      check(`Images loaded: ${route} ${width}`,broken.length===0);
      if(route==='shop.html') {
        const columns=await evaluate(()=>getComputedStyle(document.getElementById('catalog')).gridTemplateColumns.split(' ').length);
        check(`Grid columns: ${width}`,columns===(width<768?2:width<1024?3:4));
      }
      await screenshot(`${route==='index.html'?'home':'shop'}-${width}`);
    }
  }
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  await load('shop.html');
  check('12 initial products',await evaluate(()=>document.querySelectorAll('#catalog .product-card').length===12));
  await page.type('#search','Kintamani');
  check('Search: Kintamani yields two products',await evaluate(()=>document.querySelectorAll('#catalog .product-card').length===2));
  await click('input[value="drip"]');
  check('Search + category yields one product',await evaluate(()=>document.querySelectorAll('#catalog .product-card').length===1));
  await page.$eval('#search',el=>{el.value='zzzz';el.dispatchEvent(new Event('input',{bubbles:true}));});
  check('Empty search state',await evaluate(()=>!document.getElementById('no-results').hidden));
  await screenshot('empty-search-390');
  await click('#reset-filters');
  check('Reset restores 12 products',await evaluate(()=>document.querySelectorAll('#catalog .product-card').length===12));
  await page.select('#sort','asc');
  check('Ascending price',await evaluate(()=>document.querySelector('#catalog .product-card').dataset.product==='filter'));
  await page.select('#sort','desc');
  check('Descending price',await evaluate(()=>document.querySelector('#catalog .product-card').dataset.product==='dripper'));
  await load('shop.html?category=biji');
  check('Category deep link',await evaluate(()=>document.querySelectorAll('#catalog .product-card').length===5));
  await click('[data-detail="jeda-pagi"]');
  check('Product detail dialog',await evaluate(()=>document.getElementById('product-dialog').open));
  await screenshot('detail-390');
  await page.select('#variant','Giling filter');
  await page.$eval('#detail-quantity',el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await click('#detail-form button[type="submit"]');
  check('Invalid quantity blocked',await evaluate(()=>!document.getElementById('quantity-error').hidden&&document.querySelector('[data-cart-count]').textContent==='0'));
  await page.$eval('#detail-quantity',el=>{el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await click('#detail-form button[type="submit"]');
  check('Variant and quantity add',await evaluate(()=>document.querySelector('[data-cart-count]').textContent==='2'));
  check('Focus returns after detail',await evaluate(()=>document.activeElement.dataset.detail==='jeda-pagi'));
  await click('[data-add="jeda-pagi"]');
  await click('[data-open-cart]');
  check('Distinct variants in cart',await evaluate(()=>document.querySelectorAll('.cart-item').length===2));
  check('Subtotal 255000',await evaluate(()=>document.querySelector('.cart-summary strong').textContent.replace(/\D/g,'')==='255000'));
  await screenshot('cart-390');
  await click('[data-cart-action="plus"][data-index="0"]');
  check('Increment subtotal 340000',await evaluate(()=>document.querySelector('.cart-summary strong').textContent.replace(/\D/g,'')==='340000'));
  await click('[data-cart-action="minus"][data-index="0"]');
  await click('[data-cart-action="remove"][data-index="1"]');
  check('Remove item subtotal 170000',await evaluate(()=>document.querySelector('.cart-summary strong').textContent.replace(/\D/g,'')==='170000'));
  await click('#checkout');
  check('Checkout demo disclosure and total',await evaluate(()=>document.getElementById('checkout-dialog').open&&document.querySelector('.checkout-notice').textContent.includes('pesanan tidak dikirim')&&document.getElementById('checkout-total').textContent.replace(/\D/g,'')==='170000'));
  await screenshot('checkout-390');
  await page.keyboard.press('Escape');
  check('Escape and focus restore',await evaluate(()=>!document.querySelector('dialog[open]')&&document.activeElement.hasAttribute('data-open-cart')));
  await page.reload({waitUntil:'networkidle0'});
  check('Cart persisted after reload',await evaluate(()=>document.querySelector('[data-cart-count]').textContent==='2'));
  await click('[data-open-cart]');
  await click('[data-cart-action="remove"]');
  check('Empty cart state',await evaluate(()=>document.querySelector('.cart-empty')&& !document.getElementById('checkout')));
  await screenshot('cart-empty-390');
  await page.keyboard.press('Escape');
  await evaluate(()=>localStorage.setItem('ruang-seduh-cart-v1','{broken'));
  await page.reload({waitUntil:'networkidle0'});
  await click('[data-open-cart]');
  check('Corrupt storage recovery',await evaluate(()=>document.querySelector('.cart-empty')&&!document.getElementById('storage-note').hidden));
  await page.keyboard.press('Escape');
  await evaluate(()=>localStorage.setItem('ruang-seduh-cart-v1',JSON.stringify([{id:'jeda-pagi',variant:'<script>bad</script>',quantity:2},{id:'filter',variant:'40 lembar',quantity:1}])));
  await page.reload({waitUntil:'networkidle0'});
  check('Invalid storage variant ignored',await evaluate(()=>document.querySelector('[data-cart-count]').textContent==='1'));
  const blocked=await browser.newPage();
  blocked.on('pageerror',error=>errors.push(error.message));
  await blocked.evaluateOnNewDocument(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
  await blocked.goto(base+'shop.html',{waitUntil:'networkidle0'});
  await blocked.click('[data-add="jeda-pagi"]');
  await blocked.click('[data-open-cart]');
  check('Storage unavailable: session cart remains usable',await blocked.evaluate(()=>document.querySelectorAll('.cart-item').length===1&&!document.getElementById('storage-note').hidden));
  await blocked.close();
  await page.keyboard.press('Escape');
  await click('[data-detail="jeda-pagi"]');
  for(let i=0;i<12;i++) {
    await page.keyboard.press('Tab');
    check(`Dialog focus trap ${i}`,await evaluate(()=>document.getElementById('product-dialog').contains(document.activeElement)));
  }
  await page.keyboard.press('Escape');
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  check('Reduced motion honored',await evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'));
  check('No browser console/page errors',errors.length===0);
  await fs.writeFile(path.join(output,'functional-results.json'),JSON.stringify({base,viewportWidths:[360,390,768,1440],checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors,screenshots:output},null,2));
} finally {await browser.close();}
