import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {startPreview} from './preview.mjs';

if (!process.env.CHROME_TEST_BUNDLE) throw new Error('Set CHROME_TEST_BUNDLE as described in README.md');
const {puppeteer} = await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
const server = await startPreview(4183);
const checks = [];
let browser;
try {
  browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true});
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
  const base = 'http://127.0.0.1:4183/masyubi/demos/blog-fotografi/';
  const check = (name, result) => { checks.push({name, passed: result}); console.log(`${result ? 'PASS' : 'FAIL'} ${name}`); };
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewport({width, height: 900});
    await page.goto(base);
    check(`Home fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.type('#article-search', 'x'.repeat(120));
    check(`Long search fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (width === 390) {
      await page.$eval('#artikel', section => section.scrollIntoView());
      await page.screenshot({path: fileURLToPath(new URL('./long-search-390.png', import.meta.url))});
    }
    await page.click('#reset-filters');
    check(`Long search can be reset ${width}px`, await page.$$eval('[data-story]:not([hidden])', items => items.length === 8));
  }
  await page.setViewport({width: 390, height: 900});
  await page.goto(base + 'artikel/melihat-cahaya.html');
  await page.type('#article-search', 'JENDELA');
  await Promise.all([page.waitForNavigation(), page.click('.site-search button')]);
  check('Search from article opens matching index results', await page.evaluate(() => document.querySelector('#article-search').value === 'JENDELA' && document.querySelectorAll('[data-story]:not([hidden])').length === 1));
  await fs.writeFile(new URL('./edge-results.json', import.meta.url), JSON.stringify({date: new Date().toISOString(), checks}, null, 2));
  assert.ok(checks.every(check => check.passed), 'All edge cases must pass');
} finally {
  await browser?.close();
  server.close();
}
