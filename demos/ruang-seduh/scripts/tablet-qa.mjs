import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {puppeteer}=await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
const browser=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,userDataDir:path.join(root,'qa','.tablet-profile')});
try {
  const page=await browser.newPage();
  await page.setViewport({width:768,height:844,deviceScaleFactor:1});
  for(const route of ['index.html','shop.html']) {
    await page.goto((process.env.DEMO_URL||'http://127.0.0.1:4173/demos/ruang-seduh/')+route,{waitUntil:'networkidle0'});
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(route==='index.html') {
      assert.equal(await page.evaluate(()=>Math.round(document.querySelector('h1').clientHeight/parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight))),2);
      assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.story')).gridTemplateColumns.split(' ').length),1);
    }
    const height=await page.evaluate(()=>document.documentElement.scrollHeight);
    for(let y=0;y<height;y+=700){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForNetworkIdle({idleTime:100,timeout:5000});}
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(root,'qa',`${route==='index.html'?'home':'shop'}-768.png`),fullPage:true});
  }
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  await page.goto((process.env.DEMO_URL||'http://127.0.0.1:4173/demos/ruang-seduh/')+'shop.html',{waitUntil:'networkidle0'});
  await page.click('[data-detail="jeda-pagi"]');
  assert.equal(await page.evaluate(()=>document.querySelector('.detail-form .button svg').getBoundingClientRect().width),16);
  assert.ok(await page.evaluate(()=>document.querySelector('.detail-form .button').getBoundingClientRect().height<60));
  await page.screenshot({path:path.join(root,'qa','detail-390.png')});
  await page.evaluate(()=>document.querySelector('.detail-form .button').scrollIntoView({block:'center',behavior:'instant'}));
  assert.ok(await page.evaluate(()=>{const close=document.querySelector('#product-dialog .dialog-close').getBoundingClientRect();const dialog=document.getElementById('product-dialog').getBoundingClientRect();return close.top>=dialog.top&&close.bottom<=dialog.top+80;}));
  await page.screenshot({path:path.join(root,'qa','detail-controls-390.png')});
  await fs.writeFile(path.join(root,'qa','tablet-results.json'),JSON.stringify({width:768,overflow:false,heroLines:2,storyColumns:1,mobileDetailIcon:16,mobileDetailButtonUnder60px:true,detailCloseVisibleAfterScroll:true,passed:true},null,2));
  console.log('Tablet checks and screenshots passed.');
} finally {await browser.close();}
