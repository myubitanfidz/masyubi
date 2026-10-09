import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {startPreview} from './preview.mjs';

const output=path.dirname(fileURLToPath(import.meta.url));
const demo=path.resolve(output,'..');
if(!process.env.CHROME_TEST_BUNDLE) throw new Error('Set CHROME_TEST_BUNDLE to the installed chrome-devtools-mcp third_party/index.js');
const {puppeteer}=await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
const base='http://127.0.0.1:4182/masyubi/demos/blog-fotografi/';
const server=await startPreview();
const checks=[],errors=[];
const testDate=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'});
const widths=process.argv.includes('--quick')?[390]:[360,390,768,1024,1440];
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);console.log('PASS '+name);};
let browser;
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--disable-extensions']});
 const page=await browser.newPage();
 page.on('pageerror',e=>{if(page.url().includes('/blog-fotografi/'))errors.push(e.message);});
 page.on('console',m=>{if(m.type()==='error'&&page.url().includes('/blog-fotografi/'))errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400&&r.url().includes('/blog-fotografi/'))errors.push(`${r.status()} ${r.url()}`);});
 const load=async(url=base)=>{await page.goto(url,{waitUntil:'load'});await page.waitForNetworkIdle({idleTime:100});await page.evaluate(()=>document.fonts.ready);};
 const navigate=async(selector)=>{await page.focus(selector);try{await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.keyboard.press('Enter')]);}catch(error){throw new Error(`Navigation failed: ${selector} at ${page.url()}`,{cause:error});}};
 const sweep=async()=>{for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=900){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForNetworkIdle({idleTime:60});}await page.evaluate(()=>scrollTo(0,0));};
 const fit=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 const images=()=>page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 if(!process.argv.includes('--integration')){
 for(const width of widths){
  await page.setViewport({width,height:900,deviceScaleFactor:1});await load();await sweep();
  check(`Home fits ${width}px`,await fit());check(`Home images load ${width}px`,await images());
  check(`Home single h1 ${width}px`,await page.$$eval('h1',e=>e.length===1));
  check(`Eight articles visible ${width}px`,await page.$$eval('[data-story]:not([hidden])',e=>e.length===8));
  check(`Home controls meet 44px ${width}px`,await page.evaluate(()=>[...document.querySelectorAll('button,input,select,.navigation>a,.filter,.read-link')].filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)));
  await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});await page.screenshot({path:path.join(output,`hero-${width}.png`)});
  await load(base+'artikel/melihat-cahaya.html');await sweep();
  check(`Article fits ${width}px`,await fit());check(`Article photo loads ${width}px`,await images());
  check(`Reading column at most 680px ${width}px`,await page.$eval('.reading-body',e=>e.getBoundingClientRect().width<=680));
  await page.screenshot({path:path.join(output,`article-${width}.png`),fullPage:true});await page.screenshot({path:path.join(output,`article-hero-${width}.png`)});
 }
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.setViewport({width:390,height:844});await load();
 await page.click('.menu-toggle');check('Mobile menu opens',await page.$eval('.menu-toggle',e=>e.getAttribute('aria-expanded')==='true'));
 await page.keyboard.press('Tab');check('Menu first link receives keyboard focus',await page.evaluate(()=>document.activeElement===document.querySelector('#navigation a')));
 await page.keyboard.press('Escape');check('Escape closes menu and restores focus',await page.evaluate(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'&&document.activeElement===document.querySelector('.menu-toggle')));
 for(const anchor of ['artikel','kategori','tentang','jasa']){await page.click('.menu-toggle');await page.click(`#navigation a[href$="#${anchor}"]`);await page.waitForFunction(anchor=>location.hash==='#'+anchor&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false',{},anchor);await new Promise(resolve=>setTimeout(resolve,700));check(`Menu anchor ${anchor}`,await page.evaluate(anchor=>location.hash==='#'+anchor&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false',anchor));}
 await page.click('.menu-toggle');await page.setViewport({width:1024,height:900});check('Resize resets menu',await page.$eval('.menu-toggle',e=>e.getAttribute('aria-expanded')==='false'));
 await page.setViewport({width:390,height:844});
 for(const [cat,count] of [['belajar-foto',2],['cerita-pemotretan',2],['foto-produk',2],['perlengkapan',1],['persiapan-sesi',1],['semua',8]]){
  await page.click(`[data-category="${cat}"]`);check(`Filter ${cat}`,await page.$$eval('[data-story]:not([hidden])',(e,count)=>e.length===count,count));
  check(`Filter URL ${cat}`,await page.evaluate(cat=>(new URLSearchParams(location.search).get('kategori')||'semua')===cat,cat));
 }
 await page.focus('[data-category="foto-produk"]');await page.keyboard.press('Enter');check('Category keyboard activation',await page.$$eval('[data-story]:not([hidden])',e=>e.length===2));
 await page.type('#article-search','JENDELA');check('Search combines with category and ignores case',await page.$$eval('[data-story]:not([hidden])',e=>e.length===1&&e[0].textContent.includes('Satu Jendela')));
 check('Search is encoded in URL',new URL(page.url()).searchParams.get('q')==='JENDELA');
 const sharedURL=page.url();await load(sharedURL);check('Shared query restores category/search',await page.evaluate(()=>document.querySelector('#article-search').value==='JENDELA'&&document.querySelector('[data-category="foto-produk"]').getAttribute('aria-current')==='true'&&document.querySelectorAll('[data-story]:not([hidden])').length===1));
 await page.$eval('#article-search',e=>{e.value='xyz-tidak-ada';e.dispatchEvent(new Event('input',{bubbles:true}));});
 check('Empty result message',await page.$eval('#empty-results',e=>!e.hidden));check('Zero result announced',await page.$eval('#result-count',e=>e.textContent.startsWith('0 dari 8')));
 await page.click('#reset-filters');check('Reset restores all articles',await page.$$eval('[data-story]:not([hidden])',e=>e.length===8));
 check('Reset clears query',!new URL(page.url()).search);
 const inputRequests=[];const capture=r=>{if(['document','fetch','xhr'].includes(r.resourceType()))inputRequests.push(r.url());};page.on('request',capture);
 await page.type('#article-search','potret');await page.click('.site-search button');check('Search/filter do not reload or fetch',inputRequests.length===0);page.off('request',capture);
 await page.click('#reset-filters');
 const links=await page.$$eval('[data-story] h3 a',e=>e.map(a=>a.href));
 check('Eight unique article destinations',links.length===8&&new Set(links).size===8);
 const localURLs=new Set();
 for(const url of [base,...links]){
  await load(url);await sweep();
  check(`Page and images: ${new URL(url).pathname}`,await images()&&await fit());
  check(`Single title: ${new URL(url).pathname}`,await page.$$eval('h1',e=>e.length===1));
  check(`Anchor targets: ${new URL(url).pathname}`,await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].every(a=>document.getElementById(a.hash.slice(1)))));
  if(url!==base){
   check(`Article body and author: ${new URL(url).pathname}`,await page.evaluate(()=>document.querySelectorAll('.reading-body>h2').length>=3&&document.querySelector('.author-note').textContent.includes('fiktif')&&document.querySelectorAll('.related-grid article').length===2));
   check(`Article touch controls: ${new URL(url).pathname}`,await page.evaluate(()=>[...document.querySelectorAll('button,.reading-tools nav a,.navigation>a')].filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)));
  }
  const paths=await page.evaluate(()=>[...document.querySelectorAll('a[href],link[href],script[src],img[src]')].map(e=>e.getAttribute('href')||e.getAttribute('src')).filter(s=>s&&!s.startsWith('#')&&!/^https?:/.test(s)).map(s=>new URL(s,document.baseURI).href));paths.forEach(u=>localURLs.add(u));
 }
 for(const url of localURLs){check(`Local path ${new URL(url).pathname+new URL(url).search}`,(await fetch(url)).ok);}
 await load(links[0]);await navigate('.breadcrumb a');check('Breadcrumb returns to article index',page.url()===base+'index.html#artikel');
 await load(links[0]);const related=await page.$eval('.related-grid a',a=>a.href);await navigate('.related-grid a');check('Related article opens',page.url()===related);
 await load(links[0]);await page.click('.reading-tools nav a');check('Contents anchor works',page.url().endsWith('#bagian-1'));
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async(data)=>{window.shared=data;}});});await page.click('#share-article');check('Web Share receives title and URL',await page.evaluate(()=>window.shared.title===document.querySelector('h1').textContent&&window.shared.url.endsWith('melihat-cahaya.html')));
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{window.copied=text;}}});});await page.focus('#share-article');await page.keyboard.press('Enter');await page.waitForFunction(()=>typeof window.copied==='string');check('Clipboard fallback copies URL',await page.evaluate(()=>window.copied.endsWith('melihat-cahaya.html')&&document.querySelector('#share-status').textContent==='Tautan artikel disalin.'));
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}});});await page.click('#share-article');check('Clipboard denial exposes selectable URL',await page.evaluate(()=>!document.querySelector('#share-fallback').hidden&&document.activeElement===document.querySelector('#share-fallback input')&&document.querySelector('#share-fallback input').value.endsWith('melihat-cahaya.html')));
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('cancelled','AbortError');}});});await page.click('#share-article');check('Share cancellation handled',await page.$eval('#share-status',e=>e.textContent==='Berbagi dibatalkan.'));
 await navigate('.article-cta');check('Article CTA reaches selected consultation',await page.$eval('#service',e=>e.value==='Potret personal'));
 for(const service of ['Potret personal','Dokumentasi acara kecil','Foto produk dan brand']){await page.click(`[data-service="${service}"]`);check(`Service CTA: ${service}`,await page.$eval('#service',(e,service)=>e.value===service,service));}
 const formRequests=[];page.on('request',r=>{if(['document','xhr','fetch'].includes(r.resourceType()))formRequests.push(r.url());});
 await page.type('input[name="nama"]','Nama rekaan');await page.type('textarea[name="cerita"]','Contoh sesi di lokasi rekaan.');await page.click('#demo-form button');
 check('Exact demo form response',await page.$eval('#form-status',e=>e.textContent==='Ini hanya demo; pesan tidak dikirim.'));
 check('Form sends no request or storage',formRequests.length===0&&await page.evaluate(()=>localStorage.length===0&&sessionStorage.length===0));
 check('Form clears example inputs',await page.$eval('input[name="nama"]',e=>e.value===''));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);check('Reduced motion disables smooth scrolling',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'));
 for(const url of [base+'index.html',base.slice(0,-1),base.replace('/masyubi',''),pathToFileURL(path.join(demo,'index.html')).href,pathToFileURL(path.join(demo,'artikel/melihat-cahaya.html')).href]){await load(url);check(`Direct preview ${url}`,await page.evaluate(()=>getComputedStyle(document.body).backgroundColor==='rgb(246, 244, 237)'&&document.documentElement.classList.contains('has-js')));}
 await page.setJavaScriptEnabled(false);await load();await sweep();
 check('No-JS all eight articles visible',await page.$$eval('[data-story]:not([hidden])',e=>e.length===8));check('No-JS navigation visible',await page.$eval('#navigation',e=>getComputedStyle(e).display!=='none'));check('No-JS form disabled',await page.$eval('#demo-form button',e=>e.disabled));
 await navigate('[data-story] h3 a');check('No-JS article link works',page.url()===links[0]);await page.click('.reading-tools nav a');check('No-JS contents work',page.url().endsWith('#bagian-1'));check('No-JS share safely hidden',await page.$eval('#share-article',e=>e.hidden));
 await page.screenshot({path:path.join(output,'no-js-article-390.png'),fullPage:true});await page.setJavaScriptEnabled(true);
 }
 await page.setViewport({width:390,height:844});
 await load('http://127.0.0.1:4182/masyubi/index.html#portofolio');check('Six main portfolio cards',await page.$$eval('.case-card',e=>e.length===6));
 await page.$eval('.t-blog',e=>e.scrollIntoView({behavior:'instant'}));await page.waitForFunction(()=>{const image=document.querySelector('.t-blog img');return image.complete&&image.naturalWidth>0;}).catch(async error=>{console.log(await page.$eval('.t-blog img',e=>({src:e.src,rect:e.getBoundingClientRect().toJSON(),complete:e.complete,naturalWidth:e.naturalWidth,scrollY,innerWidth,innerHeight})));await page.screenshot({path:path.join(output,'integration-debug.png')});throw error;});check('New portfolio thumbnail loads',await page.$eval('.t-blog img',e=>e.complete&&e.naturalWidth>0));await navigate('.t-blog + .case-body .case-link');check('Main portfolio link works',page.url()===base);await navigate('footer a[href="../../index.html#portofolio"]');check('Return link works',page.url()==='http://127.0.0.1:4182/masyubi/index.html#portofolio');
 check('No demo console errors or failed resources',errors.length===0);
 await fs.writeFile(path.join(output,process.argv.includes('--integration')?'results-integration.json':process.argv.includes('--quick')?'results-quick.json':'results.json'),JSON.stringify({date:testDate,widths,passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors}));
 if(process.argv.includes('--compare')){
 for(const width of [390,1440]){await page.setViewport({width,height:950});for(const [name,url] of [['masyubi','index.html'],['ruang-seduh','demos/ruang-seduh/'],['rona','demos/rona/'],['profil-instansi','demos/profil-instansi/'],['portofolio','demos/portofolio-fotografer/'],['blog','demos/blog-fotografi/']]){await load('http://127.0.0.1:4182/masyubi/'+url);await page.screenshot({path:path.join(output,`compare-${name}-${width}.png`)});}}
 const names=[['masyubi','Masyubi'],['ruang-seduh','Ruang Seduh'],['rona','RONA'],['profil-instansi','Nusa Cendekia'],['portofolio','Ruang Reka'],['blog','Ruang Cahaya']];
 const html=`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Perbandingan Ruang Cahaya</title><style>body{font:15px Arial;background:#f6f4ed;color:#20251f;margin:24px}section{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}figure{margin:0}img{width:100%;border:1px solid #c7cbbb}figcaption{padding:12px 0}@media(max-width:800px){section{grid-template-columns:1fr 1fr}}</style><h1>Enam arah visual dalam satu portofolio.</h1><p>Screenshot lokal / ${testDate}</p>${[1440,390].map(w=>`<h2>${w}px</h2><section>${names.map(([n,label])=>`<figure><img src="compare-${n}-${w}.png" alt="${label} ${w}px"><figcaption>${label}</figcaption></figure>`).join('')}</section>`).join('')}</html>`;
 await fs.writeFile(path.join(output,'comparison.html'),html);await page.setViewport({width:1800,height:1200});await load(base+'qa/comparison.html');await page.screenshot({path:path.join(output,'comparison.png'),fullPage:true});
 }
}finally{await browser?.close();server.close();}
