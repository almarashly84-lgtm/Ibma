import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { availableTimes, bookingUrl, officeToday, validateBooking } from '../src/lib/booking.ts';

const now = new Date('2026-10-19T13:00:00Z');
const valid = { fullName: 'Test Visitor', email: 'visitor@example.test', phone: '', serviceId: 'test', preferredDate: '2026-10-19', preferredTime: '10:00 AM', notes: 'General consultation' };
const baseURL = 'http://127.0.0.1:4173';
const csp = (await readFile('public/_headers', 'utf8')).split('\n')
  .find((line) => line.trim().startsWith('Content-Security-Policy:')).trim().slice('Content-Security-Policy:'.length).trim();
let passed = 0;
function pass(name) { passed += 1; console.log(`PASS ${passed}: ${name}`); }

assert.equal(officeToday(new Date('2026-10-20T01:00:00Z')), '2026-10-19');
for (const date of ['2026-10-25', '2026-02-30', '2026-10-17']) assert.deepEqual(availableTimes(date, now), []);
assert(!availableTimes('2026-10-24', now).includes('04:30 PM'));
assert(!availableTimes('2026-10-19', new Date('2026-10-19T15:01:00Z')).includes('11:00 AM'));
assert.equal(validateBooking(valid, 'en', ['test'], now), null);
for (const change of [{ fullName: ' ' }, { email: '', phone: '' }, { email: 'bad-email' }, { phone: 'abc' }, { serviceId: 'unknown' }, { preferredDate: '2026-10-25' }, { preferredTime: '02:00 AM' }, { notes: 'x'.repeat(501) }]) {
  assert.notEqual(validateBooking({ ...valid, ...change }, 'en', ['test'], now), null);
}
const encoded = new URL(bookingUrl({ ...valid, fullName: 'Test & العربية #1' }, 'Tax', 'ar', 'https://wa.me/16138800300'));
assert.equal(encoded.origin + encoded.pathname, 'https://wa.me/16138800300');
assert(encoded.searchParams.get('text').includes('Test & العربية #1'));
assert(encoded.searchParams.get('text').includes('غير مؤكد'));
pass('office-time validation, weekends, invalid input, and WhatsApp encoding');

await mkdir('test-results', { recursive: true });
console.log('Starting local production-preview server...');
const server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
let browser;
try {
  console.log('Starting Chromium...');
  browser = await chromium.launch({
    timeout: 15000,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
    args: ['--disable-gpu'],
  });
  console.log('Chromium ready.');
  for (const [name, options] of [['desktop', { viewport: { width: 1440, height: 1000 } }], ['mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }]]) {
    const context = await browser.newContext({ ...options, reducedMotion: 'reduce' });
    console.log(`Checking ${name}...`);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const pageErrors = [];
    const cspErrors = [];
    const posts = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('request', (request) => { if (request.method() === 'POST') posts.push(request.url()); });
    page.on('console', (message) => {
      if (message.type() === 'error' && /content security policy|refused to/i.test(message.text())) cspErrors.push(message.text());
    });
    await page.route(`${baseURL}/`, async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } });
    });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log(`${name}: document loaded`);
    await page.locator('h1').waitFor();
    console.log(`${name}: main heading visible`);
    for (const [button, lang, dir] of [['ENG', 'en', 'ltr'], ['FR', 'fr', 'ltr'], ['AR', 'ar', 'rtl']]) {
      await page.getByRole('button', { name: button, exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal(await page.locator('html').getAttribute('dir'), dir);
    }
    console.log(`${name}: language switching complete`);
    const imageSources = await page.locator('img').evaluateAll((images) =>
      images.map((image) => { image.loading = 'eager'; return image.src; })
    );
    for (const src of new Set(imageSources)) {
      const response = await context.request.get(src);
      assert.equal(response.status(), 200, src);
    }
    await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
    console.log(`${name}: images loaded`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
    console.log(`${name}: layout checked`);
    await page.screenshot({ path: `test-results/${name}-home.png`, animations: 'disabled', timeout: 15000 });
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(cspErrors, []);
    pass(`${name}: page, all images, three languages, RTL/LTR, no overflow, and CSP`);

    await page.getByRole('button', { name: 'ENG', exact: true }).click();
    const trigger = page.getByRole('button', { name: 'Details & Zoom', exact: true }).first();
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await dialog.getAttribute('aria-modal'), 'true');
    for (const key of ['Shift+Tab', 'Tab']) {
      await page.keyboard.press(key);
      assert(await dialog.evaluate((element) => element.contains(document.activeElement)));
    }
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 0);
    assert(await trigger.evaluate((element) => element === document.activeElement));
    pass(`${name}: service-dialog keyboard focus, Escape, and focus restoration`);

    await page.clock.setFixedTime(now);
    await page.locator('#booking-name').fill(valid.fullName);
    await page.locator('#booking-email').fill(valid.email);
    await page.locator('#booking-date').fill(valid.preferredDate);
    await page.locator('#booking-time').selectOption(valid.preferredTime);
    await page.getByRole('button', { name: 'Prepare WhatsApp request', exact: true }).click();
    assert((await page.getByRole('status').innerText()).includes('has not been sent or confirmed'));
    const draft = new URL(await page.getByRole('link', { name: 'Open WhatsApp to send request' }).getAttribute('href'));
    assert.equal(draft.hostname, 'wa.me');
    assert(draft.searchParams.get('text').includes(valid.email));
    assert(draft.searchParams.get('text').includes('not confirmed'));
    assert(!(await page.evaluate(() => JSON.stringify(localStorage))).includes(valid.email));
    assert.deepEqual(posts, []);
    await page.getByRole('button', { name: 'Prepare another request', exact: true }).click();
    assert.equal(await page.locator('#booking-name').inputValue(), '');
    assert.equal(await page.locator('#booking-email').inputValue(), '');
    pass(`${name}: WhatsApp draft only, no submission or contact storage, and form reset`);
    if (name === 'mobile') {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
      await page.waitForFunction(() => Array.from(document.querySelectorAll('#hero [role="button"]')).every((element) => {
        const box = element.getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth;
      }));
      const menu = page.getByRole('button', { name: 'Toggle Navigation' });
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await menu.click();
      pass('320px narrow viewport: navigation and service nodes are not clipped');
    }
    await context.close();
  }

  const blocked = await browser.newContext({ reducedMotion: 'reduce' });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  const page = await blocked.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.getByRole('button', { name: 'FR', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('lang'), 'fr');
  pass('page and language switching work with blocked localStorage');
  await blocked.close();
  const moving = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
  const movingPage = await moving.newPage();
  movingPage.setDefaultTimeout(10000);
  await movingPage.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await movingPage.getByRole('button', { name: 'ENG', exact: true }).click();
  assert.equal(await movingPage.locator('html').getAttribute('lang'), 'en');
  pass('normal-motion page remains interactive while the service orbit rotates');
  await moving.close();
  console.log(`All ${passed} verification groups passed. No real booking messages were sent.`);
} catch (error) {
  console.error('VERIFICATION FAILED:', error);
  process.exitCode = 1;
} finally {
  server.httpServer.closeAllConnections();
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
