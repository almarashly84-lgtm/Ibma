import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { availableTimes, bookingUrl, officeToday, validateBooking } from '../src/lib/booking.ts';

// Needs the full site with its server: run `npx wrangler dev --local` first (see README).

const now = new Date('2026-10-19T13:00:00Z');
const valid = { fullName: 'Test Visitor', email: 'visitor@example.test', phone: '', serviceId: 'test', preferredDate: '2026-10-19', preferredTime: '10:00 AM', notes: 'General consultation' };
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:8787';
function nextBookable() {
  let d = new Date(`${officeToday()}T12:00:00Z`);
  for (let i = 0; i < 14; i++) {
    d = new Date(d.getTime() + 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    const times = availableTimes(iso);
    if (times.length) return { date: iso, time: times[0] };
  }
  throw new Error('no bookable date');
}
const upcoming = nextBookable();
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
    const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert.match(response.headers()['content-security-policy'], /script-src 'self'/);
    console.log(`${name}: document loaded`);
    await page.locator('h1').waitFor();
    console.log(`${name}: main heading visible`);
    for (const [button, lang, dir, path] of [['ENG', 'en', 'ltr', '/en/'], ['FR', 'fr', 'ltr', '/fr/'], ['AR', 'ar', 'rtl', '/']]) {
      await page.getByRole('button', { name: button, exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal(await page.locator('html').getAttribute('dir'), dir);
      assert.equal(new URL(page.url()).pathname, path, 'each language has its own address');
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
    assert.equal(await page.locator('#business-needs').count(), 0, 'one services section only');
    const slider = page.locator('#poster-slider');
    assert.equal(await slider.getAttribute('aria-roledescription'), 'carousel');
    const firstSlide = slider.locator('[aria-roledescription="slide"]').first();
    assert.equal(await firstSlide.getAttribute('aria-hidden'), 'false');
    await slider.getByRole('button', { name: /Next image|الصورة التالية|Image suivante/ }).click();
    assert.equal(await firstSlide.getAttribute('aria-hidden'), 'true', 'next button moves the slider');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: slider causes no overflow`);
    pass(`${name}: page, all images, three languages, RTL/LTR, no overflow, CSP, one services section with slider`);

    await page.getByRole('button', { name: 'ENG', exact: true }).click();
    const trigger = page.locator('#services').getByRole('button', { name: 'Details', exact: true }).first();
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

    await page.locator('#booking-name').fill(`Smoke ${name}`);
    await page.locator('#booking-email').fill(`smoke-${name}@example.test`);
    await page.locator('#booking-date').fill(upcoming.date);
    await page.locator('#booking-time').selectOption(upcoming.time);
    await page.getByRole('button', { name: 'Send appointment request', exact: true }).click();
    await page.getByText('Your appointment request has been received').waitFor();
    const draft = new URL(await page.getByRole('link', { name: 'Send the request by WhatsApp' }).getAttribute('href'));
    assert.equal(draft.hostname, 'wa.me');
    assert(draft.searchParams.get('text').includes(`smoke-${name}@example.test`));
    assert(draft.searchParams.get('text').includes('not confirmed'));
    assert(!(await page.evaluate(() => JSON.stringify(localStorage))).includes('@example.test'), 'no personal data kept in the browser');
    assert(posts.some((url) => url.endsWith('/api/booking')), 'request saved on the server');
    await page.getByRole('button', { name: 'Request another appointment', exact: true }).click();
    assert.equal(await page.locator('#booking-name').inputValue(), '');
    assert.equal(await page.locator('#booking-email').inputValue(), '');
    pass(`${name}: appointment request saved for the office, WhatsApp option, no data kept in the browser, form reset`);
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
  console.log(`All ${passed} verification groups passed. No real WhatsApp messages were sent.`);
} catch (error) {
  console.error('VERIFICATION FAILED:', error);
  process.exitCode = 1;
} finally {
  await browser?.close();
}
