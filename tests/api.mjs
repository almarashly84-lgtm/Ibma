// Server + dashboard API tests. Run against a local `wrangler dev` (fresh local database):
//   npx wrangler dev --local   (with .dev.vars containing ADMIN_INITIAL_PASSWORD=Local-Test-Only-2026)
//   node --experimental-strip-types tests/api.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { availableTimes, officeToday } from '../src/lib/booking.ts';

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:8787';
const INITIAL = process.env.TEST_ADMIN_INITIAL || 'Local-Test-Only-2026';
const NEW_PASSWORD = 'Ibma-Dashboard-Test-2026';
let passed = 0;
const pass = (name) => console.log(`PASS ${++passed}: ${name}`);
let ipCounter = 10;
const nextIp = () => `203.0.113.${ipCounter++}`;

let cookie = '';
async function call(path, { method = 'GET', body, raw, origin = BASE, ip = '198.51.100.7', type, useCookie = true } = {}) {
  const headers = { 'CF-Connecting-IP': ip };
  if (origin) headers.Origin = origin;
  if (useCookie && cookie) headers.Cookie = cookie;
  let payload;
  if (raw !== undefined) { payload = raw; headers['Content-Type'] = type || 'application/octet-stream'; }
  else if (body !== undefined) { payload = typeof body === 'string' ? body : JSON.stringify(body); headers['Content-Type'] = type || 'application/json'; }
  const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' });
  const set = res.headers.get('set-cookie');
  if (set && useCookie) {
    const m = set.match(/__Host-ibma_admin=([^;]*)/);
    if (m) cookie = m[1] ? `__Host-ibma_admin=${m[1]}` : '';
  }
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text, headers: res.headers };
}

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

const slot = nextBookable();
const booking = (extra = {}) => ({ fullName: 'Test Visitor', email: 'visitor@example.test', phone: '+1 613 555 0100', serviceId: 'bookkeeping', preferredDate: slot.date, preferredTime: slot.time, notes: '=HYPERLINK("x")', language: 'en', subscribe: false, website: '', ...extra });

// ---------------------------------------------------------------- public endpoints
{
  const r = await call('/api/booking', { method: 'POST', body: booking(), origin: 'https://evil.example' });
  assert.equal(r.status, 403, 'cross-site booking must be refused');
  const bad = await call('/api/booking', { method: 'POST', body: booking({ preferredTime: '02:00 AM', language: 'fr' }), ip: nextIp() });
  assert.equal(bad.status, 400);
  assert.match(bad.json.error, /heure/);
  const closed = await call('/api/booking', { method: 'POST', body: booking({ serviceId: 'nope' }), ip: nextIp() });
  assert.equal(closed.status, 400);
  const ok = await call('/api/booking', { method: 'POST', body: booking({ subscribe: true, email: 'Booker@Example.test' }), ip: nextIp() });
  assert.equal(ok.status, 200, ok.text);
  const trap = await call('/api/booking', { method: 'POST', body: booking({ website: 'spam', fullName: 'Spam Bot' }), ip: nextIp() });
  assert.equal(trap.status, 200, 'bot trap answers ok but stores nothing');
  const big = await call('/api/booking', { method: 'POST', body: booking({ notes: 'x'.repeat(9000) }), ip: nextIp() });
  assert.equal(big.status, 413);
  pass('appointment requests: validation, cross-site block, bot trap, size limit, saved with subscription');
}
{
  const ip = nextIp();
  const noConsent = await call('/api/subscribe', { method: 'POST', body: { name: 'Sara', email: 'sara@example.test', language: 'ar', consent: false }, ip });
  assert.equal(noConsent.status, 400);
  const ok = await call('/api/subscribe', { method: 'POST', body: { name: 'Sara', email: 'sara@example.test', language: 'ar', consent: true }, ip });
  assert.equal(ok.status, 200);
  const again = await call('/api/subscribe', { method: 'POST', body: { name: 'Sara A.', email: 'SARA@example.test', language: 'ar', consent: true }, ip });
  assert.equal(again.status, 200, 'same email again is accepted without revealing it exists');
  const badEmail = await call('/api/subscribe', { method: 'POST', body: { name: 'X Y', email: 'bad', language: 'en', consent: true }, ip });
  assert.equal(badEmail.status, 400);
  const spamName = await call('/api/subscribe', { method: 'POST', body: { name: 'Win money www.spam.example', email: 'spam@example.test', language: 'en', consent: true }, ip });
  assert.equal(spamName.status, 400, 'links in names are refused');
  for (const n of [2, 3, 4]) {
    const r = await call('/api/subscribe', { method: 'POST', body: { name: 'Sara', email: `sara${n}@example.test`, language: 'ar', consent: true }, ip });
    assert.equal(r.status, 200);
  }
  const limited = await call('/api/subscribe', { method: 'POST', body: { name: 'Sara', email: 'sara5@example.test', language: 'ar', consent: true }, ip });
  assert.equal(limited.status, 429, 'sixth valid attempt within an hour is limited');
  pass('subscriptions: consent required, existing subscriber not overwritten, links in names refused, rate limit');
}
{
  // IPv6: changing the last part of the address (same /64 network) must not bypass the limit.
  let last;
  for (let i = 1; i <= 6; i++) {
    last = await call('/api/subscribe', { method: 'POST', body: { name: 'Rotating Visitor', email: `rot${i}@example.test`, language: 'en', consent: true }, ip: `2001:db8:77:88::${i}` });
    if (i <= 5) assert.equal(last.status, 200, `attempt ${i}`);
  }
  assert.equal(last.status, 429, 'IPv6 address rotation inside one /64 is limited');
  const other = await call('/api/subscribe', { method: 'POST', body: { name: 'Other Network', email: 'othernet@example.test', language: 'en', consent: true }, ip: '2001:db8:77:99::1' });
  assert.equal(other.status, 200, 'a different network is not affected');
  pass('rate limits group IPv6 addresses by /64 network');
}
{
  // Body sent without Content-Length (chunked): the server must stop reading at the limit.
  const big = new ReadableStream({ start(c) { for (let i = 0; i < 40; i++) c.enqueue(new TextEncoder().encode('x'.repeat(1024))); c.close(); } });
  const res = await fetch(BASE + '/api/booking', { method: 'POST', body: big, duplex: 'half', headers: { Origin: BASE, 'Content-Type': 'application/json', 'CF-Connecting-IP': nextIp() } });
  assert.equal(res.status, 413);
  const spam = await call('/api/booking', { method: 'POST', body: booking({ fullName: 'Visit https://spam.example' }), ip: nextIp() });
  assert.equal(spam.status, 400, 'links in booking names are refused');
  const ip = nextIp();
  const first = await call('/api/booking', { method: 'POST', body: booking({ email: 'twice@example.test', phone: '+1 613 555 0199' }), ip });
  const second = await call('/api/booking', { method: 'POST', body: booking({ email: 'twice@example.test', phone: '+1 613 555 0199' }), ip });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200, 'a repeated request gets the same friendly answer');
  pass('oversized bodies without Content-Length stopped; spam names refused; repeated request accepted once');
}
{
  for (const e of ['whatsapp', 'call', 'call', 'nonsense']) {
    const r = await call('/api/event', { method: 'POST', body: JSON.stringify({ e, l: 'fr' }), type: 'text/plain', ip: nextIp() });
    assert.equal(r.status, 204);
  }
  const page = await fetch(BASE + '/fr/', { headers: { 'User-Agent': 'Mozilla/5.0 Test' } });
  assert.equal(page.status, 200);
  await page.text();
  const bot = await fetch(BASE + '/fr/', { headers: { 'User-Agent': 'Googlebot/2.1' } });
  await bot.text();
  pass('anonymous click and page-view statistics accepted');
}

// ---------------------------------------------------------------- dashboard: login & forced password change
{
  const page = await fetch(BASE + '/admin/');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('x-robots-tag') || '', /noindex/);
  assert.match(page.headers.get('cache-control') || '', /no-store/);
  assert.equal((await call('/api/admin/content')).status, 401, 'no session → 401');
  const wrong = await call('/api/admin/login', { method: 'POST', body: { password: 'nope' } });
  assert.equal(wrong.status, 401);
  const csrf = await call('/api/admin/login', { method: 'POST', body: { password: INITIAL }, origin: 'https://evil.example' });
  assert.equal(csrf.status, 403);
  const ok = await call('/api/admin/login', { method: 'POST', body: { password: INITIAL } });
  assert.equal(ok.status, 200, ok.text);
  assert.equal(ok.json.mustChange, true);
  assert.match(ok.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.equal((await call('/api/admin/content')).status, 403, 'must change password first');
  const weak = await call('/api/admin/password', { method: 'POST', body: { current: INITIAL, next: 'short' } });
  assert.equal(weak.status, 400);
  const changed = await call('/api/admin/password', { method: 'POST', body: { current: INITIAL, next: NEW_PASSWORD } });
  assert.equal(changed.status, 200, changed.text);
  const oldLogin = await call('/api/admin/login', { method: 'POST', body: { password: INITIAL }, ip: nextIp(), useCookie: false });
  assert.equal(oldLogin.status, 401, 'temporary password no longer works');
  assert.equal((await call('/api/admin/me')).json.mustChange, false);
  pass('dashboard login: wrong password, cross-site block, forced change of temporary password');
}

// ---------------------------------------------------------------- content editing → website
{
  const r = await call('/api/admin/content');
  assert.equal(r.status, 200);
  const services = structuredClone(r.json.content.services);
  services.hidden = ['review-engagements'];
  services.order = [...services.order.slice(1), services.order[0]];
  services.items.bookkeeping.title.fr = 'Tenue de livres — test';
  const saved = await call('/api/admin/content/services', { method: 'PUT', body: { value: services } });
  assert.equal(saved.status, 200, saved.text);

  const hours = structuredClone(r.json.content.hours);
  hours.days[1].close = '09:00';
  const badHours = await call('/api/admin/content/hours', { method: 'PUT', body: { value: hours } });
  assert.equal(badHours.status, 400);
  assert.match(badHours.json.error, /الإغلاق/);

  const contact = structuredClone(r.json.content.contact);
  contact.facebookUrl = 'javascript:alert(1)';
  const badUrl = await call('/api/admin/content/contact', { method: 'PUT', body: { value: contact } });
  assert.equal(badUrl.status, 400);

  const seo = structuredClone(r.json.content.seo);
  seo.title.en = 'IBMA </script><script>alert(1)</script> " onload="x';
  assert.equal((await call('/api/admin/content/seo', { method: 'PUT', body: { value: seo } })).status, 200);

  await new Promise((resolve) => setTimeout(resolve, 16_000)); // public page cache is 15 s
  const html = await (await fetch(BASE + '/en/')).text();
  assert.match(html, /<title>IBMA &lt;\/script&gt;/, 'title is escaped');
  const outsideAttributes = html.replace(/"[^"]*"/g, '""');
  assert.ok(!outsideAttributes.includes('<script>alert(1)'), 'no script injection through content');
  assert.match(html, /property="og:title" content="IBMA &lt;\/script&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt; &quot; onload=&quot;x"/, 'attribute values are escaped');
  const data = JSON.parse(html.match(/<script type="application\/json" id="site-content">([^<]*)<\/script>/)[1]);
  assert.deepEqual(data.services.hidden, ['review-engagements']);
  pass('content: services saved and injected into the page; bad hours and javascript: links refused; no HTML injection');

  const reset = await call('/api/admin/content/seo/reset', { method: 'POST' });
  assert.equal(reset.status, 200);
}

// ---------------------------------------------------------------- hidden service cannot be booked
{
  const r = await call('/api/booking', { method: 'POST', body: booking({ serviceId: 'review-engagements' }), ip: nextIp() });
  assert.equal(r.status, 400);
  pass('hidden services are refused by the server');
}

// ---------------------------------------------------------------- requests & subscribers
let unsubscribeLink = '';
{
  const list = await call('/api/admin/bookings');
  assert.equal(list.status, 200);
  const mine = list.json.rows.find((b) => b.email === 'booker@example.test');
  assert.ok(mine, 'booking stored with lowercase email');
  assert.equal(list.json.rows.some((b) => b.name === 'Spam Bot'), false, 'bot trap stored nothing');
  assert.equal((await call(`/api/admin/bookings/${mine.id}`, { method: 'PATCH', body: { status: 'confirmed', admin_note: 'Called back' } })).status, 200);
  assert.equal((await call(`/api/admin/bookings/${mine.id}`, { method: 'PATCH', body: { status: 'weird' } })).status, 400);
  const csv = await call('/api/admin/bookings.csv');
  assert.match(csv.text, /"'=HYPERLINK/, 'spreadsheet formulas are neutralised');
  assert.match(csv.headers.get('content-disposition'), /attachment/);

  const subs = await call('/api/admin/subscribers?status=active');
  const emails = subs.json.rows.map((s) => s.email).sort();
  assert.deepEqual(emails, ['booker@example.test', 'othernet@example.test', 'rot1@example.test', 'rot2@example.test', 'rot3@example.test', 'rot4@example.test', 'rot5@example.test', 'sara2@example.test', 'sara3@example.test', 'sara4@example.test', 'sara@example.test']);
  assert.equal(subs.json.rows.find((x) => x.email === 'sara@example.test').name, 'Sara', 'a second sign-up cannot change the name');
  const twice = (await call('/api/admin/bookings?q=twice')).json;
  assert.equal(twice.total, 1, 'duplicate booking stored once');
  const subCsv = await call('/api/admin/subscribers.csv');
  unsubscribeLink = subCsv.text.match(/https?:\/\/[^"]+\/unsubscribe\?t=[A-Za-z0-9_-]+/)[0];
  pass('requests: listed, status and note saved, CSV export safe; subscribers listed with unsubscribe links');
}
{
  const url = new URL(unsubscribeLink);
  const page = await fetch(BASE + url.pathname + url.search);
  const body = await page.text();
  assert.equal(page.status, 200);
  assert.match(body, /<form method="post"/, 'GET only shows a confirmation (mail scanners cannot unsubscribe)');
  const form = new URLSearchParams({ t: url.searchParams.get('t') });
  const done = await fetch(BASE + '/unsubscribe', { method: 'POST', body: form, headers: { 'CF-Connecting-IP': nextIp() } });
  assert.equal(done.status, 200);
  const invalid = await fetch(BASE + '/unsubscribe?t=not-a-real-token-123456');
  assert.equal(invalid.status, 404);
  const subs = await call('/api/admin/subscribers?status=unsubscribed');
  assert.equal(subs.json.rows.length, 1);
  const gone = subs.json.rows[0];
  // Someone types the unsubscribed address again: it must NOT be reactivated automatically.
  const again = await call('/api/subscribe', { method: 'POST', body: { name: 'Someone Else', email: gone.email, language: 'en', consent: true }, ip: nextIp() });
  assert.equal(again.status, 200);
  const still = (await call('/api/admin/subscribers?status=unsubscribed')).json.rows[0];
  assert.equal(still.email, gone.email);
  assert.ok(still.resubscribe_requested_at, 'request flagged for the office');
  assert.equal((await call(`/api/admin/subscribers/${still.id}/reactivate`, { method: 'POST' })).status, 200);
  assert.equal((await call('/api/admin/subscribers?status=unsubscribed')).json.rows.length, 0);
  pass('unsubscribe link: confirmation page, one-click POST, invalid tokens refused; no automatic re-subscription');
}

// ---------------------------------------------------------------- photo upload
{
  const fake = await call('/api/admin/photo', { method: 'POST', raw: Buffer.from('<svg onload=alert(1)>'.padEnd(200, ' ')), type: 'image/png' });
  assert.equal(fake.status, 400, 'file type is checked from content, not from name/type');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const padded = Buffer.concat([png, Buffer.alloc(120)]);
  const up = await call('/api/admin/photo', { method: 'POST', raw: padded, type: 'image/png' });
  assert.equal(up.status, 200, up.text);
  const img = await fetch(BASE + up.json.url);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get('content-type'), 'image/png');
  assert.match(img.headers.get('content-security-policy') || '', /sandbox/, 'uploads can never run as a page');
  const r = await call('/api/admin/content');
  const about = { ...r.json.content.about, photo: up.json.url };
  assert.equal((await call('/api/admin/content/about', { method: 'PUT', body: { value: about } })).status, 200);
  const about2 = { ...about, photo: '/media/../secret.png' };
  assert.equal((await call('/api/admin/content/about', { method: 'PUT', body: { value: about2 } })).status, 400);
  pass('photo upload: real images only, served from storage, path tricks refused');
}

// ---------------------------------------------------------------- slider images
{
  const r = await call('/api/admin/content');
  assert.deepEqual(r.json.content.slider.slides.map((x) => x.src), ['builtin:business-needs', 'builtin:self-employed']);
  const bad = await call('/api/admin/content/slider', { method: 'PUT', body: { value: { slides: [{ src: 'https://evil.example/x.png', alt: { ar: '', en: '', fr: '' } }] } } });
  assert.equal(bad.status, 400, 'outside images refused');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const up = await call('/api/admin/photo?kind=slide', { method: 'POST', raw: Buffer.concat([png, Buffer.alloc(120)]), type: 'image/png' });
  assert.equal(up.status, 200, up.text);
  assert.match(up.json.url, /^\/media\/slides\//);
  const slides = [{ src: up.json.url, alt: { ar: 'عرض', en: 'Offer', fr: 'Offre' } }, { src: 'builtin:tax-campaign', alt: { ar: '', en: '', fr: '' } }];
  assert.equal((await call('/api/admin/content/slider', { method: 'PUT', body: { value: { slides } } })).status, 200);
  assert.equal((await fetch(BASE + up.json.url)).status, 200);
  const dup = await call('/api/admin/content/slider', { method: 'PUT', body: { value: { slides: [slides[1], slides[1]] } } });
  assert.equal(dup.status, 400, 'same image twice refused');
  assert.equal((await call('/api/admin/content/slider', { method: 'PUT', body: { value: { slides: [slides[1]] } } })).status, 200);
  assert.equal((await fetch(BASE + up.json.url)).status, 404, 'removed upload is deleted from storage');
  assert.equal((await call('/api/admin/content/slider/reset', { method: 'POST' })).status, 200);
  pass('slider: uploads, order, duplicates and outside links refused, removed images deleted');
}

// ---------------------------------------------------------------- page-view flood
{
  for (let i = 0; i < 45; i++) {
    const r = await fetch(BASE + '/fr/privacy', { headers: { 'User-Agent': 'Mozilla/5.0 Flood', 'CF-Connecting-IP': '198.51.100.250' } });
    assert.equal(r.status, 200, 'the page keeps working during a flood');
    await r.text();
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const s = (await call('/api/admin/stats?days=1')).json;
  const counted = s.rows.filter((r) => r.event === 'view_privacy').reduce((a, r) => a + r.count, 0);
  assert.ok(counted >= 1 && counted <= 35, `flood not fully counted (counted ${counted} of 45)`);
  pass('page reload flood: pages keep working, statistics writes capped per visitor');
}

// ---------------------------------------------------------------- statistics
{
  const s = await call('/api/admin/stats?days=7');
  assert.equal(s.status, 200);
  const total = (ev, lang) => s.json.rows.filter((r) => r.event === ev && (!lang || r.lang === lang)).reduce((a, r) => a + r.count, 0);
  assert.equal(total('call', 'fr'), 2);
  assert.equal(total('whatsapp', 'fr'), 1);
  assert.ok(total('view', 'fr') >= 1);
  assert.ok(total('booking') >= 1);
  assert.ok(total('subscribe') >= 3);
  pass('statistics: clicks, visits (bots excluded), requests and subscriptions counted');
}

// ---------------------------------------------------------------- sliding session
if (!process.env.TEST_BASE_URL || process.env.TEST_BASE_URL.includes('127.0.0.1')) {
  // Make the session look 5 days old, then use the dashboard: it must be extended (and the cookie refreshed).
  const soon = Date.now() + 2 * 86_400_000;
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'ibma-db', '--local', '--command', `UPDATE sessions SET expires_at = ${soon}`], { stdio: 'ignore' });
  const r = await call('/api/admin/me');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('set-cookie') || '', /__Host-ibma_admin=[A-Za-z0-9_-]+; .*Max-Age=604800/, 'session renewed while in use');
  pass('sessions are extended while the dashboard is in use');
}

// ---------------------------------------------------------------- logout & lockout
{
  assert.equal((await call('/api/admin/logout', { method: 'POST' })).status, 200);
  assert.equal((await call('/api/admin/content')).status, 401);
  const ip = nextIp();
  let last;
  for (let i = 0; i < 6; i++) last = await call('/api/admin/login', { method: 'POST', body: { password: 'wrong' + i }, ip, useCookie: false });
  assert.equal(last.status, 429, 'locked after 5 wrong passwords');
  const evenCorrect = await call('/api/admin/login', { method: 'POST', body: { password: NEW_PASSWORD }, ip, useCookie: false });
  assert.equal(evenCorrect.status, 429, 'locked even with the right password');
  pass('logout ends the session; 5 wrong passwords lock login for 15 minutes');
}

console.log(`All ${passed} API test groups passed.`);
