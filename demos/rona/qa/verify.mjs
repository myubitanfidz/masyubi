import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repository = path.resolve(root, '../..');
const {puppeteer} = await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const server = http.createServer(async (request,response) => {
  try {
    let filename = path.resolve(repository, '.' + decodeURIComponent(new URL(request.url,'http://localhost').pathname));
    if (!filename.startsWith(repository + path.sep)) throw new Error('Invalid path');
    if ((await fs.stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
    response.writeHead(200,{'Content-Type':mime[path.extname(filename)] || 'application/octet-stream'});
    response.end(await fs.readFile(filename));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(4176,'127.0.0.1',resolve));
let browser = await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--disable-extensions']});
const page = await browser.newPage();
const errors = [];
const checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type()==='error') errors.push({message:message.text(),location:message.location()}); });
page.on('response', response => { if (response.status()>=400) console.log('HTTP ERROR',response.status(),response.url()); });
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
const base = 'http://127.0.0.1:4176/demos/rona';
const load = async (url=base+'/index.html') => { await page.goto(url,{waitUntil:'networkidle0'}); await page.evaluate(()=>document.fonts.ready); };
const sweep = async () => {
  for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=650) { await page.evaluate(y=>scrollTo(0,y),y); await page.waitForNetworkIdle({idleTime:100}); }
  await page.evaluate(()=>scrollTo(0,0));
};
try {
  if (!process.argv.includes('--audit-only')) {
  for (const width of process.argv.includes('--quick') ? [390] : [360,390,768,1024,1440]) {
    await page.setViewport({width,height:900,deviceScaleFactor:1});
    await load();
    await sweep();
    check(`No overflow at ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check(`All page images loaded at ${width}`,await page.evaluate(()=>[...document.images].filter(image=>!image.closest('dialog')).every(image=>image.complete&&image.naturalWidth>0)));
    check(`Fonts loaded at ${width}`,await page.evaluate(()=>document.fonts.check('16px Jakarta')&&document.fonts.check('16px Lora')));
    check(`One h1 at ${width}`,await page.evaluate(()=>document.querySelectorAll('h1').length===1));
    await page.screenshot({path:path.join(root,'qa',`page-${width}.png`),fullPage:true});
  }
  for (const route of [base,base+'/',pathToFileURL(path.join(root,'index.html')).href]) {
    await load(route);
    check(`CSS and JS load: ${route}`,await page.evaluate(()=>getComputedStyle(document.body).backgroundColor==='rgb(243, 240, 232)'&&!document.querySelector('.variant-controls').hidden));
    check(`Correct asset base: ${route}`,await page.evaluate(()=>new URL('assets/images/camera-paper.svg',document.baseURI).pathname.endsWith('/demos/rona/assets/images/camera-paper.svg')));
  }
  await page.setViewport({width:390,height:844,deviceScaleFactor:1}); await load();
  await page.click('.menu-toggle');
  check('Mobile menu opens',await page.evaluate(()=>!document.getElementById('navigation').hidden&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true'));
  await page.keyboard.press('Escape');
  check('Menu Escape and focus',await page.evaluate(()=>document.getElementById('navigation').hidden&&document.activeElement.matches('.menu-toggle')));
  await page.click('.menu-toggle'); await page.click('#navigation a[href="#detail"]');
  check('Menu anchor and closing',await page.evaluate(()=>location.hash==='#detail'&&document.getElementById('navigation').hidden));
  for (const color of ['charcoal','olive','paper']) {
    await page.click(`[data-color="${color}"]`);
    check(`Variant ${color}`,await page.evaluate(color=>document.querySelectorAll('[aria-pressed="true"]').length===1&&document.querySelector(`[data-color="${color}"]`).getAttribute('aria-pressed')==='true'&&document.getElementById('variant-image').src.endsWith(`camera-${color}.webp`),color));
  }
  await page.click('[data-color="olive"]'); await page.click('.summary-trigger');
  check('Summary selected color',await page.evaluate(()=>document.getElementById('summary-dialog').open&&document.getElementById('summary-color').textContent==='Olive'&&document.getElementById('summary-image').src.endsWith('camera-olive.webp')));
  await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
  check('Summary reverse focus trap',await page.evaluate(()=>document.activeElement.matches('#summary-dialog .button')));
  await page.keyboard.press('Tab');
  check('Summary forward focus trap',await page.evaluate(()=>document.activeElement.matches('#summary-dialog .dialog-close')));
  await page.keyboard.press('Escape');
  check('Summary Escape restores focus',await page.evaluate(()=>!document.getElementById('summary-dialog').open&&document.activeElement.matches('.summary-trigger')));
  await page.click('.summary-trigger'); await page.click('#summary-dialog .button');
  check('Summary button closes',await page.evaluate(()=>!document.getElementById('summary-dialog').open));
  await page.click('[data-photo="0"]');
  check('Lightbox opens',await page.evaluate(()=>document.getElementById('lightbox').open&&document.getElementById('photo-count').textContent==='1 / 6'));
  await page.click('#previous-photo');
  check('Lightbox previous wraps',await page.evaluate(()=>document.getElementById('photo-count').textContent==='6 / 6'));
  await page.keyboard.press('ArrowRight');
  check('Lightbox right key wraps',await page.evaluate(()=>document.getElementById('photo-count').textContent==='1 / 6'));
  await page.click('#next-photo');
  check('Lightbox next button',await page.evaluate(()=>document.getElementById('photo-count').textContent==='2 / 6'));
  await page.keyboard.press('ArrowLeft');
  check('Lightbox left key',await page.evaluate(()=>document.getElementById('photo-count').textContent==='1 / 6'));
  await page.click('#lightbox .dialog-close');
  check('Lightbox close restores focus',await page.evaluate(()=>!document.getElementById('lightbox').open&&document.activeElement.matches('[data-photo="0"]')));
  await page.click('[data-photo="2"]');
  for (let n=0;n<12;n++) { await page.keyboard.press('Tab'); check(`Lightbox focus stays inside ${n}`,await page.evaluate(()=>document.getElementById('lightbox').contains(document.activeElement))); }
  await page.screenshot({path:path.join(root,'qa','lightbox-390.png')});
  await page.keyboard.press('Escape');
  check('Lightbox Escape restores focus',await page.evaluate(()=>document.activeElement.matches('[data-photo="2"]')&&!document.body.classList.contains('modal-open')));
  for (let n=1;n<=4;n++) { await page.click(`.faq-list details:nth-child(${n}) summary`); check(`FAQ ${n} opens`,await page.evaluate(n=>document.querySelector(`.faq-list details:nth-child(${n})`).open,n)); }
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  check('Reduced motion',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'&&getComputedStyle(document.querySelector('.button')).transitionDuration==='0s'));
  await page.setJavaScriptEnabled(false); await load();
  check('Without JS: navigation visible',await page.evaluate(()=>!document.getElementById('navigation').hidden));
  check('Without JS: content and FAQ available',await page.evaluate(()=>document.querySelector('h1').getClientRects().length>0&&document.querySelectorAll('details').length===4&&document.querySelector('[data-photo]').hasAttribute('href')));
  check('Without JS: no dead action controls',await page.evaluate(()=>document.querySelector('.summary-trigger').hidden&&document.querySelector('.variant-controls').hidden&&document.querySelector('.menu-toggle').hidden));
  await page.setJavaScriptEnabled(true);
  if(errors.length) console.log(JSON.stringify({errors}));
  check('No browser errors',errors.length===0);
  await fs.writeFile(path.join(root,'qa','results.json'),JSON.stringify({date:'2026-10-07',browser:await browser.version(),conditions:'Local HTTP and file URLs, headless Chrome Windows, DPR 1, widths 360/390/768/1024/1440, no throttling',passed:checks.length,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
  }
  if (process.env.LIGHTHOUSE_MODULE) {
    // Audit in a fresh browser, separate from screenshot and functional test workloads.
    await browser.close();
    browser = await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--disable-extensions']});
    const {default:lighthouse} = await import(pathToFileURL(process.env.LIGHTHOUSE_MODULE).href);
    const audit = await lighthouse(base+'/index.html',{port:Number(new URL(browser.wsEndpoint()).port),output:'html',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1.75,disabled:false},throttlingMethod:'simulate',throttling:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4},maxWaitForLoad:30000});
    const report = audit.lhr;
    if (process.argv.includes('--trace')) await fs.writeFile(path.join(root,'qa','diagnostic-trace.json'),JSON.stringify(audit.artifacts.Trace));
    const summary = {version:report.lighthouseVersion,fetchTime:report.fetchTime,conditions:report.configSettings,scores:Object.fromEntries(Object.entries(report.categories).map(([k,v])=>[k,v.score*100])),metrics:Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(k=>[k,report.audits[k].numericValue])),failed:Object.values(report.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,details:a.details}))};
    await fs.writeFile(path.join(root,'qa','lighthouse.html'),audit.report);
    await fs.writeFile(path.join(root,'qa','lighthouse-summary.json'),JSON.stringify(summary,null,2));
    console.log(JSON.stringify({scores:summary.scores,metrics:summary.metrics}));
  }
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
