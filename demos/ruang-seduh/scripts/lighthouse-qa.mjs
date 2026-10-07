import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {puppeteer}=await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
if(!process.env.LIGHTHOUSE_MODULE) throw new Error('Set LIGHTHOUSE_MODULE to the official lighthouse/core/index.js');
const {default:lighthouse}=await import(pathToFileURL(process.env.LIGHTHOUSE_MODULE).href);
const browser=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,userDataDir:path.join(root,'qa','.lighthouse-profile'),args:['--disable-extensions']});
const output=path.join(root,'qa');
await fs.mkdir(output,{recursive:true});
const summaries=[];
try {
  const port=Number(new URL(browser.wsEndpoint()).port);
  for(const route of ['index.html','shop.html']) {
    const url=(process.env.DEMO_URL||'http://127.0.0.1:4173/demos/ruang-seduh/')+route;
    const result=await lighthouse(url,{port,output:'html',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1.75,disabled:false},throttlingMethod:'simulate',throttling:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4},maxWaitForLoad:30000});
    const lhr=result.lhr;
    const name=route==='index.html'?'home':'shop';
    await fs.writeFile(path.join(output,`lighthouse-${name}.json`),JSON.stringify(lhr,null,2));
    await fs.writeFile(path.join(output,`lighthouse-${name}.html`),result.report);
    const summary={page:name,lighthouseVersion:lhr.lighthouseVersion,fetchTime:lhr.fetchTime,settings:lhr.configSettings,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score*100])),metrics:Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','first-contentful-paint','total-blocking-time','speed-index'].filter(k=>lhr.audits[k]).map(k=>[k,lhr.audits[k].numericValue])),failed:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,displayValue:a.displayValue,details:a.details}))};
    summaries.push(summary);
    console.log(JSON.stringify({page:name,scores:summary.scores,metrics:summary.metrics},null,2));
  }
  await fs.writeFile(path.join(output,'lighthouse-summary.json'),JSON.stringify(summaries,null,2));
} finally {await browser.close();}
