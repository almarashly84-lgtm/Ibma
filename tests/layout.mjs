import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:4174';
const server = process.env.TEST_BASE_URL ? null : await preview({ preview: { host: '127.0.0.1', port: 4174, strictPort: true } });
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({
  timeout: 15000,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
  args: ['--disable-gpu'],
});
try {
  for (const width of [320, 360, 390, 473, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 640 ? 844 : 1000 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 15000 });
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
        const photo = document.querySelector('#about .portrait-panel').getBoundingClientRect();
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
      assert.equal(await page.locator('#ibrahim-portrait .portrait-orbit').count(), 2);
      assert.equal(await page.locator('.portrait-orbit-outer').evaluate(el => getComputedStyle(el).animationName), 'none', 'reduced-motion disables portrait decoration');
      const portrait = await page.locator('#ibrahim-portrait img').evaluate(el => ({ width: el.clientWidth, height: el.clientHeight, radius: getComputedStyle(el).borderRadius, transform: getComputedStyle(el).transform }));
      assert.equal(portrait.width, portrait.height, 'portrait remains circular');
      assert(portrait.width > 150);
      assert.equal(portrait.radius, '50%');
      assert.equal(portrait.transform, 'none', 'the person does not rotate');
      assert.equal(await page.getByRole('button', { name: /^(Pause|Play|إيقاف|دوران)$/ }).count(), 0);
      const credit = page.locator('#site-credit');
      const name = credit.getByRole('link', { name: 'Alaa Eddin Digital Media', exact: true });
      assert.equal(await name.getAttribute('href'), 'https://www.alaadigital.at');
      assert.equal((await credit.innerText()).match(/Alaa Eddin Digital Media/g)?.length, 1);
      assert.equal((await credit.innerText()).replace(/\s+/g, ' ').trim(), 'by Alaa Eddin Digital Media', 'English credit in every language');
      assert.equal(await page.locator('#site-footer a[href^="tel:"], #site-footer a[href^="mailto:"]').count(), 0, 'no repeated contact links in footer');
      const links = await page.locator('#footer-navigation li').evaluateAll(items => items.map(item => {
        const rect = item.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      }));
      assert.equal(links.length, 6);
      for (let row = 0; row < 3; row++) {
        assert(Math.abs(links[row].y - links[row + 3].y) < 2, 'footer links form three aligned pairs');
        assert(Math.abs(links[row].x - links[0].x) < 2, 'first three links share one column');
        assert(language === 'AR' ? links[row].x > links[row + 3].x : links[row].x < links[row + 3].x, 'footer column order follows language direction');
      }
      assert.equal(await page.locator('#contact-phone a[href="tel:+16138800300"]').count(), 1);
      const headerCall = page.locator('#header-call');
      assert.equal(await headerCall.getAttribute('href'), 'tel:+16138800300', 'header call icon dials the office');
      assert(!(await headerCall.innerText()).includes('880'), 'header shows the call icon, not the number');
      const box = await headerCall.boundingBox();
      assert(box.width >= 44 && box.height >= 44 && box.x >= 0 && box.x + box.width <= width, `${width}: header call icon visible and tappable`);
      const order = await page.evaluate(() => ['about', 'booking', 'contact'].map((id) => document.getElementById(id).getBoundingClientRect().top + scrollY));
      assert(order[0] < order[1] && order[1] < order[2], 'Ibrahim section, then booking, then contact');
      assert.equal(await page.locator('#contact-whatsapp').getAttribute('href'), 'https://wa.me/16138800300');
      assert.equal(await page.locator('#contact-whatsapp').getAttribute('target'), '_blank');
      const directions = page.locator('#address-directions');
      const mapUrl = new URL(await directions.getAttribute('href'));
      assert.equal(mapUrl.origin, 'https://www.google.com');
      assert.equal(mapUrl.pathname, '/maps/dir/');
      assert.equal(mapUrl.searchParams.get('api'), '1');
      const address = '30 Concourse Gate Unit 102, Nepean, ON K2E 7V7, Canada';
      assert.equal(mapUrl.searchParams.get('destination'), address);
      assert.equal(await directions.getAttribute('target'), '_blank');
      assert.equal(await page.locator('#contact-address #address-directions').count(), 1, 'directions belongs inside the address card');
      assert.equal(await page.locator('#contact a[href*="/maps/dir/"]').count(), 1, 'no duplicate directions button above the contact cards');
      await page.locator('#copy-address').click();
      await page.getByRole('status').filter({ hasText: { ENG: 'Address copied', FR: 'Adresse copiée', AR: 'تم نسخ العنوان' }[language] }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), address, 'copy uses the exact, correctly ordered postal address');
      assert.equal(await page.locator('#contact-email a').getAttribute('href'), 'mailto:info@ibmaaccounting.ca');
      await page.locator('#copy-email').click();
      await page.locator('#contact-email [role="status"]').filter({ hasText: { ENG: 'Email address copied', FR: 'Courriel copié', AR: 'تم نسخ البريد الإلكتروني' }[language] }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'info@ibmaaccounting.ca', 'email copy is separate from mailto');
      if (width === 390 && language === 'AR') {
        await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Blocked', 'NotAllowedError'); } } }));
        await page.locator('#copy-email').click();
        await page.locator('#contact-email [role="status"]').filter({ hasText: 'تعذّر النسخ' }).waitFor();
        await page.locator('#copy-address').click();
        await page.locator('#contact-address [role="status"]').filter({ hasText: 'تعذّر النسخ' }).waitFor();
        await page.evaluate(() => { delete navigator.clipboard; });
        await page.locator('#copy-email').click();
        await page.locator('#contact-email [role="status"]').filter({ hasText: 'تم نسخ البريد الإلكتروني' }).waitFor();
        await page.locator('#copy-address').click();
        await page.getByRole('status').filter({ hasText: 'تم نسخ العنوان' }).waitFor();
      }
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
      await page.locator('#contact').evaluate(element => element.scrollIntoView());
      await page.screenshot({ path: 'test-results/compact-contact.png', animations: 'disabled', timeout: 15000 });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.screenshot({ path: 'test-results/compact-footer.png', animations: 'disabled', timeout: 15000 });
    }
    console.log(`PASS: ${width}px, all three languages: circular portrait, reduced motion, email/address copy, contact links and compact layout`);
    await context.close();
  }
  const motionContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(origin, { waitUntil: 'domcontentloaded' });
  await motionPage.waitForFunction(() => document.fonts.status === 'loaded');
  await motionPage.locator('#ibrahim-portrait').scrollIntoViewIfNeeded();
  await motionPage.mouse.move(0, 0);
  const photoBefore = await motionPage.locator('#ibrahim-portrait img').boundingBox();
  const rotationBefore = await motionPage.locator('.portrait-orbit-outer').evaluate(el => getComputedStyle(el).transform);
  await motionPage.waitForFunction(previous => getComputedStyle(document.querySelector('.portrait-orbit-outer')).transform !== previous, rotationBefore);
  const photoAfter = await motionPage.locator('#ibrahim-portrait img').boundingBox();
  assert.deepEqual(photoAfter, photoBefore, 'only the decorative frame rotates, not the portrait');
  await motionPage.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await motionPage.locator('.portrait-orbit-outer').evaluate(el => getComputedStyle(el).animationName), 'none');
  await motionContext.close();
  console.log('PASS: gold frame rotates independently and stops when reduced motion is enabled');
  console.log('All 18 responsive-language layout combinations passed.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server?.httpServer.closeAllConnections();
  await browser.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
