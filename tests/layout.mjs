import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4174, strictPort: true } });
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ timeout: 15000, args: ['--disable-gpu'] });
try {
  for (const width of [320, 360, 390, 473, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 640 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await page.goto('http://127.0.0.1:4174', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('h1').waitFor();
    await page.waitForFunction(() => document.fonts.status === 'loaded');
    await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0));
    for (const language of ['ENG', 'FR', 'AR']) {
      await page.getByRole('button', { name: language, exact: true }).click();
      const sizes = await page.evaluate(() => {
        const label = document.getElementById('orbit-instruction');
        const text = label.getBoundingClientRect(), pill = label.parentElement.getBoundingClientRect();
        const stage = document.getElementById('services-orbit').getBoundingClientRect();
        const about = document.querySelector('#about h2').getBoundingClientRect();
        const photo = document.querySelector('#about img').getBoundingClientRect();
        return {
          textFits: text.left >= pill.left + 4 && text.right <= pill.right - 4,
          textHeight: text.height,
          lineHeight: parseFloat(getComputedStyle(label).lineHeight),
          orbitGap: stage.top - pill.bottom,
          photoGap: photo.top - about.bottom,
          noOverflow: document.documentElement.scrollWidth <= innerWidth,
        };
      });
      assert(sizes.textFits, `${width}/${language}: instruction clipped`);
      assert(sizes.textHeight <= sizes.lineHeight + 2, `${width}/${language}: instruction wraps`);
      assert(sizes.orbitGap >= 8 && sizes.orbitGap <= (width < 640 ? 20 : 40), `${width}/${language}: excess orbit gap`);
      if (width < 1024) assert(sizes.photoGap <= (width < 640 ? 56 : 72), `${width}/${language}: excess heading/photo gap`);
      assert(sizes.noOverflow, `${width}/${language}: horizontal overflow`);
      assert.equal(await page.getByRole('button', { name: /^(Pause|Play|إيقاف|دوران)$/ }).count(), 0);
      const credit = page.locator('#site-credit');
      const name = credit.getByRole('link', { name: 'Alaa Eddin Digital', exact: true });
      assert.equal(await name.getAttribute('href'), 'https://www.alaadigital.at');
      assert.equal((await credit.innerText()).match(/Alaa Eddin Digital/g)?.length, 1);
      if (language === 'AR') assert((await credit.innerText()).includes('هذا الموقع صمم بواسطة'));
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction(() => {
        const bar = document.querySelector('nav[aria-label="Bottom contact bar"]').getBoundingClientRect();
        const credit = document.getElementById('site-credit').getBoundingClientRect();
        const gap = bar.top - credit.bottom;
        return gap >= 6 && gap <= 16;
      });
    }
    if (width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: 'test-results/compact-hero.png', animations: 'disabled', timeout: 15000 });
      await page.locator('#about').evaluate(element => element.scrollIntoView());
      await page.screenshot({ path: 'test-results/compact-about.png', animations: 'disabled', timeout: 15000 });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.screenshot({ path: 'test-results/compact-footer.png', animations: 'disabled', timeout: 15000 });
    }
    console.log(`PASS: ${width}px, all three languages: one-line instruction, compact gaps, credit link and unobscured footer`);
    await context.close();
  }
  console.log('All 18 responsive-language layout combinations passed.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server.httpServer.closeAllConnections();
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
