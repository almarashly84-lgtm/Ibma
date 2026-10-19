// Public endpoints used by the website: appointment requests, subscriptions, click statistics, unsubscribe.
import type { Env } from './env';
import { countEvent, loadContent, rateLimit, STAT_EVENTS, type StatEvent } from './db';
import { errorJson, escapeHtml, html, json, readJson, sameOrigin } from './http';
import { ipHash, randomToken } from './security';
import { validateBooking, EMAIL_RE } from '../src/lib/booking';
import { cleanText, LANGS } from '../src/content/schema';
import { CONSENT_TEXT } from '../src/content/consent';
import type { BookingFormData, Language } from '../src/types';

const asLang = (v: unknown): Language => (LANGS.includes(v as Language) ? (v as Language) : 'ar');
const str = (v: unknown) => (typeof v === 'string' ? v : '');

const RATE_MSG: Record<Language, string> = {
  ar: 'محاولات كثيرة. يرجى المحاولة بعد قليل.',
  en: 'Too many attempts. Please try again shortly.',
  fr: 'Trop de tentatives. Veuillez réessayer dans un instant.',
};

async function upsertSubscriber(env: Env, email: string, name: string, lang: Language, source: 'newsletter' | 'booking') {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO subscribers (email, name, language, source, consent_text, consent_at, status, unsubscribed_at, token)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'active', NULL, ?7)
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, language = excluded.language, source = excluded.source,
       consent_text = excluded.consent_text, consent_at = excluded.consent_at, status = 'active', unsubscribed_at = NULL`,
  ).bind(email, name, lang, source, CONSENT_TEXT[source][lang], now, randomToken(24)).run();
}

export async function handleSubscribe(request: Request, env: Env, ctx: ExecutionContext) {
  if (!sameOrigin(request)) return errorJson(403, 'forbidden');
  const body = await readJson(request, 4096);
  const lang = asLang(body.language);
  if (str(body.website)) return json({ ok: true }); // bot trap: pretend success, store nothing
  if (!(await rateLimit(env, `sub:${await ipHash(env, request)}`, 5, 3600))) return errorJson(429, RATE_MSG[lang]);
  const { merged } = await loadContent(env);
  if (!merged.newsletter.enabled) return errorJson(400, 'disabled');
  const name = cleanText(str(body.name), 100);
  const email = cleanText(str(body.email), 254).toLowerCase();
  if (name.length < 2) return errorJson(400, 'name');
  if (!EMAIL_RE.test(email)) return errorJson(400, 'email');
  if (body.consent !== true) return errorJson(400, 'consent');
  await upsertSubscriber(env, email, name, lang, 'newsletter');
  ctx.waitUntil(countEvent(env, 'subscribe', lang));
  return json({ ok: true });
}

export async function handleBooking(request: Request, env: Env, ctx: ExecutionContext) {
  if (!sameOrigin(request)) return errorJson(403, 'forbidden');
  const body = await readJson(request, 8192);
  const lang = asLang(body.language);
  if (str(body.website)) return json({ ok: true });
  if (!(await rateLimit(env, `book:${await ipHash(env, request)}`, 5, 3600))) return errorJson(429, RATE_MSG[lang]);

  const { merged } = await loadContent(env);
  const data: BookingFormData = {
    fullName: str(body.fullName).slice(0, 200), email: str(body.email).trim().slice(0, 300), phone: str(body.phone).slice(0, 60),
    serviceId: str(body.serviceId), preferredDate: str(body.preferredDate), preferredTime: str(body.preferredTime),
    notes: str(body.notes).slice(0, 2000), subscribe: body.subscribe === true,
  };
  const visible = merged.services.order.filter((id) => !merged.services.hidden.includes(id));
  const problem = validateBooking(data, lang, visible, new Date(), merged.hours.days);
  if (problem) return errorJson(400, problem);

  const name = cleanText(data.fullName, 100);
  const email = cleanText(data.email, 254).toLowerCase();
  const phone = cleanText(data.phone, 30);
  const notes = cleanText(data.notes, 500, true);
  await env.DB.prepare(
    `INSERT INTO bookings (created_at, name, email, phone, service_id, service_title, preferred_date, preferred_time, notes, language, subscribed)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
  ).bind(Date.now(), name, email, phone, data.serviceId, merged.services.items[data.serviceId].title[lang], data.preferredDate, data.preferredTime, notes, lang, data.subscribe ? 1 : 0).run();

  if (data.subscribe && email && merged.newsletter.enabled) {
    await upsertSubscriber(env, email, name, lang, 'booking');
    ctx.waitUntil(countEvent(env, 'subscribe', lang));
  }
  ctx.waitUntil(countEvent(env, 'booking', lang));
  return json({ ok: true });
}

const CLIENT_EVENTS = new Set<StatEvent>(['whatsapp', 'call', 'email', 'booking_open', 'service_open', 'directions', 'map']);

export async function handleEvent(request: Request, env: Env) {
  // Beacons are fire-and-forget: always answer 204 and never reveal anything.
  try {
    if (!sameOrigin(request)) return new Response(null, { status: 204 });
    const body = await readJson(request, 256);
    const event = str(body.e) as StatEvent;
    if (!STAT_EVENTS.includes(event) || !CLIENT_EVENTS.has(event)) return new Response(null, { status: 204 });
    if (await rateLimit(env, `evt:${await ipHash(env, request)}`, 60, 600)) await countEvent(env, event, asLang(body.l));
  } catch { /* ignore */ }
  return new Response(null, { status: 204 });
}

// ------------------------------------------------------------- unsubscribe page (link included in each email)

const UNSUB: Record<Language, { title: string; ask: string; button: string; done: string; invalid: string; home: string }> = {
  ar: { title: 'إلغاء الاشتراك', ask: 'هل تريد إيقاف رسائل العروض والأخبار من IBMA Accounting Ltd إلى هذا البريد؟', button: 'نعم، ألغِ اشتراكي', done: 'تم إلغاء اشتراكك. لن تصلك رسائل العروض بعد الآن.', invalid: 'الرابط غير صالح أو منتهي.', home: 'العودة إلى الموقع' },
  en: { title: 'Unsubscribe', ask: 'Do you want to stop receiving offers and news from IBMA Accounting Ltd at this email address?', button: 'Yes, unsubscribe me', done: 'You have been unsubscribed. You will not receive offers any more.', invalid: 'This link is not valid.', home: 'Back to the website' },
  fr: { title: 'Désabonnement', ask: 'Voulez-vous cesser de recevoir les offres et les nouvelles d’IBMA Accounting Ltd à cette adresse?', button: 'Oui, me désabonner', done: 'Votre désabonnement est confirmé. Vous ne recevrez plus d’offres.', invalid: 'Ce lien n’est pas valide.', home: 'Retour au site' },
};

function unsubPage(lang: Language, body: string, status = 200) {
  const t = UNSUB[lang];
  const home = lang === 'ar' ? '/' : `/${lang}/`;
  return html(`<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${t.title} | IBMA Accounting Ltd</title><link rel="stylesheet" href="/unsubscribe.css"></head><body><main><h1>${t.title}</h1>${body}<p><a href="${home}">${t.home}</a></p></main></body></html>`, status, { 'X-Robots-Tag': 'noindex' });
}

export async function handleUnsubscribe(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);
  let token = url.searchParams.get('t') || '';
  if (request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    token = token || String(form?.get('t') || '');
  }
  token = token.slice(0, 64);
  const row = /^[A-Za-z0-9_-]{20,64}$/.test(token)
    ? await env.DB.prepare('SELECT id, language, status FROM subscribers WHERE token = ?1').bind(token).first<{ id: number; language: string; status: string }>()
    : null;
  const lang = asLang(row?.language ?? url.searchParams.get('l'));
  const t = UNSUB[lang];
  if (!row) return unsubPage(lang, `<p>${t.invalid}</p>`, 404);
  if (request.method === 'POST') {
    // Allowed from mail apps too (one-click unsubscribe, RFC 8058); the secret token is the authorisation.
    if (!(await rateLimit(env, `unsub:${await ipHash(env, request)}`, 20, 3600))) return unsubPage(lang, `<p>${RATE_MSG[lang]}</p>`, 429);
    if (row.status !== 'unsubscribed') {
      await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?1 WHERE id = ?2").bind(Date.now(), row.id).run();
      ctx.waitUntil(countEvent(env, 'unsubscribe', lang));
    }
    return unsubPage(lang, `<p class="ok">${t.done}</p>`);
  }
  if (row.status === 'unsubscribed') return unsubPage(lang, `<p class="ok">${t.done}</p>`);
  return unsubPage(lang, `<p>${t.ask}</p><form method="post" action="/unsubscribe"><input type="hidden" name="t" value="${escapeHtml(token)}"><button type="submit">${t.button}</button></form>`);
}
