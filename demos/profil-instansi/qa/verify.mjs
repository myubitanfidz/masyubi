import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const demo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(demo, '../..');
const output = path.join(demo, 'qa');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const relative = pathname.startsWith('/masyubi/') ? pathname.slice('/masyubi'.length) : pathname;
    let filename = path.resolve(repo, '.' + relative);
    if (!filename.startsWith(repo + path.sep)) throw new Error('Outside repository');
    if ((await fs.stat(filename)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301,{Location:pathname+'/'}); res.end(); return; }
      filename = path.join(filename, 'index.html');
    }
    res.writeHead(200,{'Content-Type':mime[path.extname(filename)] || 'application/octet-stream'});
    res.end(await fs.readFile(filename));
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(4178,'127.0.0.1',resolve));
console.log('Local preview: http://127.0.0.1:4178/masyubi/demos/profil-instansi/');
if (process.argv.includes('--serve')) {
  await new Promise(resolve => process.on('SIGINT', resolve));
  server.close();
} else {
  if (!process.env.CHROME_TEST_BUNDLE) throw new Error('Set CHROME_TEST_BUNDLE to the installed chrome-devtools-mcp/build/src/third_party/index.js');
  const {puppeteer} = await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
  const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--disable-extensions']});
  const page = await browser.newPage();
  const checks = [];
  const errors = [];
  const check = (name, result) => { assert.ok(result,name); checks.push(name); };
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400 && r.url().includes('/profil-instansi/'))errors.push(`${r.status()} ${r.url()}`);});
  const base = 'http://127.0.0.1:4178/masyubi/demos/profil-instansi/';
  const load = async (url=base) => page.goto(url,{waitUntil:'networkidle0'});
  const sweep = async () => {
    for (let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=650) {
      await page.evaluate(y=>scrollTo(0,y),y);
      await page.waitForNetworkIdle({idleTime:60});
    }
    await page.evaluate(()=>scrollTo(0,0));
  };
  try {
    for (const width of [360,390,768,1024,1440]) {
      await page.setViewport({width,height:900,deviceScaleFactor:1});
      await load(); await sweep();
      check(`No horizontal overflow: ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      check(`Images loaded: ${width}`,await page.evaluate(()=>[...document.images].filter(i=>!i.closest('dialog')).every(i=>i.complete&&i.naturalWidth>0)));
      check(`Exactly one h1: ${width}`,await page.evaluate(()=>document.querySelectorAll('h1').length===1));
      check(`Anchor targets exist: ${width}`,await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].every(a=>document.getElementById(a.hash.slice(1)))));
      check(`Interactive controls at least 44px: ${width}`,await page.evaluate(()=>[...document.querySelectorAll('.button,.menu-toggle,input,select,summary,.navigation a')].filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)));
      await page.screenshot({path:path.join(output,`page-${width}.png`),fullPage:true});
    }
    await page.setViewport({width:390,height:844}); await load();
    await page.click('.menu-toggle');
    check('Menu opens with aria-expanded',await page.$eval('.menu-toggle',e=>e.getAttribute('aria-expanded')==='true'));
    await page.keyboard.press('Tab');
    check('Keyboard enters navigation',await page.evaluate(()=>document.activeElement===document.querySelector('#navigasi a')));
    await page.keyboard.press('Escape');
    check('Escape closes menu and restores focus',await page.evaluate(()=>document.activeElement===document.querySelector('.menu-toggle')&&document.activeElement.getAttribute('aria-expanded')==='false'));
    for(const hash of ['#beranda','#tentang','#program','#kegiatan','#pendaftaran','#kontak']) {
      await page.click('.menu-toggle'); await page.click(`#navigasi a[href="${hash}"]`);
      check(`Mobile anchor works: ${hash}`,await page.evaluate(hash=>location.hash===hash&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false',hash));
    }
    await page.click('details summary');
    check('Native FAQ opens',await page.$eval('details',e=>e.open));
    await page.click('[data-gallery]');
    check('Lightbox opens',await page.$eval('dialog',e=>e.open));
    await page.keyboard.press('ShiftLeft');await page.keyboard.press('Tab');await page.keyboard.up('ShiftLeft');
    check('Lightbox traps keyboard focus',await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)));
    await page.keyboard.press('ArrowRight');
    check('Lightbox next keyboard',await page.$eval('#photo-count',e=>e.textContent==='2 / 4'));
    await page.click('#photo-prev');
    check('Lightbox previous button',await page.$eval('#photo-count',e=>e.textContent==='1 / 4'));
    await page.click('#photo-next');
    check('Lightbox next button',await page.$eval('#photo-count',e=>e.textContent==='2 / 4'));
    await page.screenshot({path:path.join(output,'lightbox-390.png')});
    await page.keyboard.press('Escape');
    check('Lightbox closes and restores focus',await page.evaluate(()=>!document.querySelector('dialog').open&&document.activeElement.matches('[data-gallery]')));
    await page.click('[data-gallery]');await page.click('#photo-close');
    check('Lightbox close button',await page.$eval('dialog',e=>!e.open));
    let formRequests=0;
    const onRequest = r=>{if(r.method()!=='GET')formRequests++;};
    page.on('request',onRequest);
    await page.type('#nama','Pengunjung demo');await page.type('#pertanyaan','Apa contoh kegiatan belajar?');await page.click('#form-submit');
    check('Demo form message',await page.$eval('#form-status',e=>e.textContent==='Ini hanya demo; pesan tidak dikirim.'));
    check('Demo form sends no request',formRequests===0);
    check('Demo form clears example data',await page.$eval('#nama',e=>e.value===''));
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    check('Reduced motion respected',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'));
    await page.click('footer a[href="#beranda"]');
    check('Back to top works',await page.evaluate(()=>location.hash==='#beranda'));
    for(const url of [base+'index.html',base.replace('/masyubi',''),pathToFileURL(path.join(demo,'index.html')).href]) {
      await load(url);
      check(`Styles and JS load: ${url}`,await page.evaluate(()=>getComputedStyle(document.body).color==='rgb(24, 56, 75)'&&!document.querySelector('#form-submit').disabled));
    }
    await page.setJavaScriptEnabled(false);await load(base);await sweep();
    check('No-JS navigation visible',await page.$eval('#navigasi',e=>getComputedStyle(e).display!=='none'));
    check('No-JS mobile header does not cover content',await page.$eval('.site-header',e=>getComputedStyle(e).position==='static'));
    check('No-JS all programs visible',await page.$$eval('.program-list article',e=>e.length===3));
    check('No-JS form safely disabled',await page.$eval('#form-submit',e=>e.disabled));
    await page.click('details summary');
    check('No-JS FAQ opens',await page.$eval('details',e=>e.open));
    await page.screenshot({path:path.join(output,'no-js-390.png'),fullPage:true});
    await page.setJavaScriptEnabled(true);
    await load('http://127.0.0.1:4178/masyubi/index.html#portofolio');
    const card = await page.$('.case-card:has(.t-sekolah)');
    check('Six portfolio entries preserved',await page.$$eval('.case-card',e=>e.length===6));
    await card.screenshot({path:path.join(output,'portfolio-card-390.png')});
    await page.click('.t-sekolah + .case-body .case-link');
    check('Portfolio path works under GitHub Pages prefix',page.url()===base);
    await page.click('footer a[href="../../index.html#portofolio"]');
    check('Return to portfolio works under GitHub Pages prefix',page.url()==='http://127.0.0.1:4178/masyubi/index.html#portofolio');
    for(const width of [390,1440]) {
      await page.setViewport({width,height:950});
      for(const [name,url] of [['masyubi','index.html'],['ruang-seduh','demos/ruang-seduh/'],['rona','demos/rona/'],['blog-fotografi','demos/blog-fotografi/'],['profil-instansi','demos/profil-instansi/']]) {
        await load('http://127.0.0.1:4178/masyubi/'+url);
        await page.screenshot({path:path.join(output,`compare-${name}-${width}.png`)});
      }
    }
    check('No demo console errors or failed resources',errors.length===0);
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({date:'2026-10-08',checks,errors,widths:[360,390,768,1024,1440]},null,2));
    console.log(JSON.stringify({passed:checks.length,errors}));
  } finally { await browser.close();server.close(); }
}
