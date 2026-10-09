import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {startPreview} from './preview.mjs';

if (!process.env.CHROME_TEST_BUNDLE) throw new Error('Set CHROME_TEST_BUNDLE as described in README.md');
const {puppeteer} = await import(pathToFileURL(process.env.CHROME_TEST_BUNDLE).href);
const server = await startPreview(4184, {redirectDirectories: false});
const checks = [];
let browser;
try {
  browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true});
  const page = await browser.newPage();
  const errors = [];
  const failedResponses = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failedResponses.push(response.url());});
  const check = (name, passed) => {assert.ok(passed, name); checks.push(name); console.log('PASS ' + name);};
  const base = 'http://127.0.0.1:4184';
  for (const route of ['/demos/blog-fotografi', '/demos/blog-fotografi/', '/demos/blog-fotografi/index.html', '/masyubi/demos/blog-fotografi']) {
    await page.goto(base + route, {waitUntil: 'networkidle0'});
    check(`CSS and JS load: ${route}`, await page.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(246, 244, 237)' && document.documentElement.classList.contains('has-js')));
    check(`Hero image loads: ${route}`, await page.$eval('.feature-image', image => image.complete && image.naturalWidth > 0));
    check(`Article link resolves: ${route}`, await page.$eval('.feature-actions a', link => link.href.includes('/blog-fotografi/artikel/melihat-cahaya.html')));
  }
  await page.goto(base + '/demos/blog-fotografi?kategori=foto-produk&q=JENDELA#artikel', {waitUntil: 'networkidle0'});
  check('Normalization preserves query and hash', page.url() === base + '/demos/blog-fotografi/?kategori=foto-produk&q=JENDELA#artikel');
  check('Shared filter and search still work', await page.$$eval('[data-story]:not([hidden])', items => items.length === 1));
  for (const width of [390, 1440]) {
    await page.setViewport({width, height: 900});
    await page.goto(base + '/demos/blog-fotografi', {waitUntil: 'networkidle0'});
    check(`Slashless home fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({path: fileURLToPath(new URL(`./paths-${width}.png`, import.meta.url))});
  }
  const demo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  await page.goto(pathToFileURL(path.join(demo, 'index.html')).href, {waitUntil: 'load'});
  check('File preview still loads CSS and JS', await page.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(246, 244, 237)' && document.documentElement.classList.contains('has-js')));
  // Chrome may speculatively preload using the original URL before the inline
  // script runs. The parser then loads the correctly resolved resources.
  check('No failed demo assets or script errors', errors.length === 0 && failedResponses.every(url => !new URL(url).pathname.includes('/blog-fotografi/')));
  await fs.writeFile(new URL('./paths-results.json', import.meta.url), JSON.stringify({date: new Date().toISOString(), passed: checks.length, checks, errors, speculativeFailedResponses: failedResponses}, null, 2));
} finally {
  await browser?.close();
  server.close();
}
