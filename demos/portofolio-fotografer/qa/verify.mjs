import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {startPreview} from './preview.mjs';

const output = path.dirname(fileURLToPath(import.meta.url));
const demo = path.resolve(output,'..');
const bundle = process.env.CHROME_TEST_BUNDLE;
if (!bundle) throw new Error('Set CHROME_TEST_BUNDLE to chrome-devtools-mcp/build/src/third_party/index.js');
const {puppeteer} = await import(pathToFileURL(bundle).href);
const server = await startPreview();
let browser;
const checks = [];
const errors = [];
const widths = process.argv.includes('--quick') ? [390] : [360,390,768,1024,1440];
const check = (name,condition) => {assert.ok(condition,name);checks.push(name);console.log('PASS '+name);};
const base = 'http://127.0.0.1:4180/masyubi/demos/portofolio-fotografer/';
try {
  browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--disable-extensions']});
  const page = await browser.newPage();
  page.on('pageerror',error=>{if(page.url().includes('/portofolio-fotografer/'))errors.push(error.message);});
  page.on('console',message=>{if(message.type()==='error'&&page.url().includes('/portofolio-fotografer/'))errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400&&response.url().includes('/portofolio-fotografer/'))errors.push(`${response.status()} ${response.url()}`);});
  const load = async (url=base) => page.goto(url,{waitUntil:'networkidle0'});
  const sweep = async () => {
    for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForNetworkIdle({idleTime:70});}
    await page.evaluate(()=>scrollTo(0,0));
  };
  for(const width of widths) {
    await page.setViewport({width,height:900,deviceScaleFactor:1});await load();await sweep();
    check(`No overflow at ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check(`All images loaded at ${width}`,await page.evaluate(()=>[...document.images].filter(i=>!i.closest('dialog')).every(i=>i.complete&&i.naturalWidth>0)));
    check(`Nine gallery photos at ${width}`,await page.$$eval('[data-photo]',items=>items.length===9));
    check(`One h1 at ${width}`,await page.$$eval('h1',items=>items.length===1));
    check(`Anchor targets exist at ${width}`,await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].every(a=>document.getElementById(a.hash.slice(1)))));
    check(`Touch controls at least 44px at ${width}`,await page.evaluate(()=>[...document.querySelectorAll('button,input,select,summary,.action,#navigasi>a')].filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)));
    await page.screenshot({path:path.join(output,`page-${width}.png`),fullPage:true});
    await page.screenshot({path:path.join(output,`hero-${width}.png`)});
  }
  await page.setViewport({width:390,height:844});await load();
  await page.click('.menu-toggle');
  check('Mobile menu opens',await page.$eval('.menu-toggle',e=>e.getAttribute('aria-expanded')==='true'));
  await page.keyboard.press('Tab');
  check('Tab reaches first menu link',await page.evaluate(()=>document.activeElement===document.querySelector('#navigasi a')));
  await page.keyboard.press('Escape');
  check('Escape closes menu and restores focus',await page.evaluate(()=>document.activeElement===document.querySelector('.menu-toggle')&&document.activeElement.getAttribute('aria-expanded')==='false'));
  for(const anchor of ['karya','jasa','proses','tentang','kontak']) {
    await page.click('.menu-toggle');await page.click(`#navigasi a[href="#${anchor}"]`);
    check(`Navigation works: ${anchor}`,await page.evaluate(anchor=>location.hash==='#'+anchor&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false',anchor));
  }
  await page.click('.menu-toggle');await page.setViewport({width:1024,height:900});
  check('Resize closes mobile menu state',await page.$eval('.menu-toggle',e=>e.getAttribute('aria-expanded')==='false'));
  await page.setViewport({width:390,height:844});
  for(const [category,count] of [['potret',3],['acara',2],['brand',2],['keseharian',2],['semua',9]]) {
    await page.click(`[data-filter="${category}"]`);
    check(`Filter ${category}: ${count} photos`,await page.$$eval('.work-photo:not([hidden])',(items,expected)=>items.length===expected,count));
    check(`Filter status ${category}`,await page.$eval('#filter-status',(e,n)=>e.textContent.startsWith(n+' foto'),count));
  }
  await page.focus('[data-filter="potret"]');await page.keyboard.press('Space');
  check('Filter works with keyboard',await page.$$eval('.work-photo:not([hidden])',items=>items.length===3));
  await page.screenshot({path:path.join(output,'filter-potret-390.png'),fullPage:true});
  await page.click('.work-photo:not([hidden]) [data-photo]');
  check('Lightbox opens',await page.$eval('#lightbox',e=>e.open));
  await page.keyboard.down('Shift');await page.keyboard.press('Tab');await page.keyboard.up('Shift');
  check('Lightbox focus wraps backward',await page.evaluate(()=>document.activeElement.id==='lightbox-source'));
  await page.keyboard.press('Tab');
  check('Lightbox focus wraps forward',await page.evaluate(()=>document.activeElement.id==='lightbox-close'));
  await page.keyboard.press('ArrowLeft');
  check('Filtered lightbox wraps to last photo',await page.$eval('#lightbox-count',e=>e.textContent==='3 / 3'));
  await page.keyboard.press('ArrowRight');
  check('Filtered lightbox wraps to first photo',await page.$eval('#lightbox-count',e=>e.textContent==='1 / 3'));
  await page.click('#lightbox-next');
  check('Lightbox next button',await page.$eval('#lightbox-count',e=>e.textContent==='2 / 3'));
  check('Lightbox credit follows photo',await page.$eval('#lightbox-source',e=>e.textContent.includes('Alef Morais')));
  await page.click('#lightbox-prev');
  check('Lightbox previous button',await page.$eval('#lightbox-count',e=>e.textContent==='1 / 3'));
  await page.screenshot({path:path.join(output,'lightbox-390.png')});
  await page.keyboard.press('Escape');
  check('Lightbox Escape restores focus',await page.evaluate(()=>!document.querySelector('#lightbox').open&&document.activeElement.matches('[data-photo]')));
  await page.click('.work-photo:not([hidden]) [data-photo]');await page.click('#lightbox-close');
  check('Lightbox close button',await page.$eval('#lightbox',e=>!e.open));
  await page.click('[data-filter="semua"]');
  for(let index=0;index<9;index++) {
    await page.evaluate(index=>document.querySelectorAll('[data-photo]')[index].click(),index);
    await page.waitForNetworkIdle({idleTime:70});
    check(`Full photo ${index+1} loads with credit`,await page.evaluate(()=>document.querySelector('#lightbox-image').naturalWidth>0&&document.querySelector('#lightbox-source').href.startsWith('https://unsplash.com/photos/')));
    await page.click('#lightbox-close');
  }
  for(const value of ['Potret personal','Fotografi acara','Produk dan brand']) {
    await page.evaluate(value=>{
      const link=[...document.querySelectorAll('[data-service]')].find(a=>a.dataset.service===value);
      link.closest('details').open=true;link.click();
    },value);
    check(`Service CTA selects ${value}`,await page.$eval('#jenis',(e,value)=>e.value===value,value));
  }
  await page.setViewport({width:768,height:900});
  check('All expanded packages fit tablet width',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewport({width:390,height:844});
  for(const method of ['WhatsApp','Email']) {
    await page.click(`[data-contact="${method}"]`);
    check(`${method} demo stays local`,await page.evaluate(method=>location.hash==='#formulir'&&document.querySelector('#contact-status').textContent.startsWith(method+' hanya placeholder'),method));
  }
  const formRequests=[];
  page.on('request',request=>{if(['fetch','xhr','document'].includes(request.resourceType()))formRequests.push(request.url());});
  await page.type('#nama','Pengunjung demo');await page.type('#lokasi','Studio fiktif');await page.type('#cerita','Sesi contoh dengan cahaya alami.');await page.click('#submit-demo');
  check('Form displays demo-only message',await page.$eval('#form-status',e=>e.textContent==='Ini hanya demo, pesan tidak dikirim.'));
  check('Form sends no network request',formRequests.length===0);
  check('Form clears inputs and stores no data',await page.evaluate(()=>document.querySelector('#nama').value===''&&localStorage.length===0&&sessionStorage.length===0));
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  check('Reduced motion supported',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'));
  await page.click('footer a[href="#atas"]');
  check('Back-to-top anchor works',await page.evaluate(()=>location.hash==='#atas'));
  const localPaths=await page.evaluate(()=>[...new Set([...document.querySelectorAll('a[href],link[href],script[src],img[src],source[srcset]')].flatMap(e=>e.hasAttribute('srcset')?e.getAttribute('srcset').split(',').map(v=>v.trim().split(' ')[0]):[e.getAttribute('href')||e.getAttribute('src')]).filter(s=>s&&!s.startsWith('#')&&!s.startsWith('https:')).map(s=>new URL(s,document.baseURI).href))]);
  for(const url of localPaths)check(`Local path resolves: ${new URL(url).pathname}`,(await fetch(url)).ok);
  for(const url of [base+'index.html',base.slice(0,-1),base.replace('/masyubi',''),pathToFileURL(path.join(demo,'index.html')).href]) {
    await load(url);
    check(`Styles and JS load: ${url}`,await page.evaluate(()=>getComputedStyle(document.body).backgroundColor==='rgb(241, 239, 232)'&&!document.querySelector('#submit-demo').disabled));
  }
  await page.setJavaScriptEnabled(false);await load();await sweep();
  check('No-JS navigation visible',await page.$eval('#navigasi',e=>getComputedStyle(e).display!=='none'));
  check('No-JS all nine photos visible',await page.$$eval('.work-photo:not([hidden])',items=>items.length===9));
  check('No-JS form safely disabled',await page.$eval('#submit-demo',e=>e.disabled));
  await page.click('.service-list details:nth-child(2) summary');
  check('No-JS service details work',await page.$eval('.service-list details:nth-child(2)',e=>e.open));
  await page.click('#navigasi a[href="#jasa"]');
  check('No-JS anchor navigation works',await page.evaluate(()=>location.hash==='#jasa'));
  await page.screenshot({path:path.join(output,'no-js-390.png'),fullPage:true});
  await page.setJavaScriptEnabled(true);
  await load('http://127.0.0.1:4180/masyubi/index.html#portofolio');
  check('Six portfolio entries retained',await page.$$eval('.case-card',cards=>cards.length===6));
  await page.evaluate(()=>document.querySelector('.t-photo').scrollIntoView());await page.waitForNetworkIdle({idleTime:100});
  check('Portfolio thumbnail loads',await page.$eval('.t-photo img',image=>image.complete&&image.naturalWidth>0));
  await (await page.$('.case-card:has(.t-photo)')).screenshot({path:path.join(output,'portfolio-card-390.png')});
  await page.click('.t-photo + .case-body .case-link');
  check('Index link works under GitHub Pages prefix',page.url()===base);
  await page.click('footer a[href="../../index.html#portofolio"]');
  check('Return link works under GitHub Pages prefix',page.url()==='http://127.0.0.1:4180/masyubi/index.html#portofolio');
  check('No demo console errors or failed resources',errors.length===0);
  for(const width of [390,1440]) {
    await page.setViewport({width,height:950});
    for(const [name,url] of [['masyubi','index.html'],['ruang-seduh','demos/ruang-seduh/'],['rona','demos/rona/'],['profil-instansi','demos/profil-instansi/'],['fotografer','demos/portofolio-fotografer/']]) {
      await load('http://127.0.0.1:4180/masyubi/'+url);
      await page.screenshot({path:path.join(output,`compare-${name}-${width}.png`)});
    }
  }
  const comparisons=[['masyubi','Masyubi'],['ruang-seduh','Ruang Seduh'],['rona','RONA'],['profil-instansi','Nusa Cendekia'],['fotografer','Ruang Reka Photo']];
  const html=`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Perbandingan visual demo</title><style>body{font:15px Arial,sans-serif;margin:32px;background:#f1efe8;color:#272723}section{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}figure{margin:0}img{width:100%;border:1px solid #ccc8bd}figcaption{padding:12px 0}h2{margin-top:32px}.mobile{grid-template-columns:repeat(5,minmax(0,260px))}@media(max-width:800px){section,.mobile{grid-template-columns:1fr 1fr}}</style><h1>Satu portofolio, lima identitas.</h1><p>Screenshot lokal · 8 Oktober 2026</p>${[1440,390].map(width=>`<h2>${width===1440?'Desktop':'Mobile'} · ${width}px</h2><section class="${width===390?'mobile':''}">${comparisons.map(([name,label])=>`<figure><img src="compare-${name}-${width}.png" alt="${label} pada ${width}px"><figcaption>${label}</figcaption></figure>`).join('')}</section>`).join('')}</html>`;
  await fs.writeFile(path.join(output,'comparison.html'),html);
  await page.setViewport({width:1800,height:1200});await load(base+'qa/comparison.html');
  await page.screenshot({path:path.join(output,'comparison.png'),fullPage:true});
  await fs.writeFile(path.join(output,process.argv.includes('--quick')?'results-quick.json':'results.json'),JSON.stringify({date:'2026-10-08',widths,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
} finally {await browser?.close();server.close();}
