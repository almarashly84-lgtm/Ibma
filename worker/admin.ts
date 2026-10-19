// Dashboard API (/api/admin/*). Every route except login requires a valid session cookie.
import type { Env } from './env';
import { loadContent, saveStoredContent, STAT_EVENTS } from './db';
import { errorJson, json, readJson, sameOrigin } from './http';
import {
  clearSessionCookie, createSession, currentSession, deleteSession, getAdminPasswordHash, hashPassword, ipHash,
  passwordProblem, safeEqual, setAdminPasswordHash, verifyPassword,
} from './security';
import { ContentError, defaultContent, SECTION_NAMES, validateSection, type SectionName } from '../src/content/schema';
import { officeClock } from '../src/lib/hours';

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
const BOOKING_STATUSES = ['new', 'contacted', 'confirmed', 'done', 'cancelled'];

async function loginLocked(env: Env, ip: string) {
  const row = await env.DB.prepare('SELECT locked_until FROM login_attempts WHERE ip = ?1').bind(ip).first<{ locked_until: number }>();
  return row && row.locked_until > Date.now() ? row.locked_until : 0;
}

async function recordFail(env: Env, ip: string) {
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO login_attempts (ip, fails, locked_until, updated_at) VALUES (?1, 1, 0, ?2)
     ON CONFLICT(ip) DO UPDATE SET fails = CASE WHEN locked_until > 0 AND locked_until <= ?2 THEN 1 ELSE fails + 1 END,
       locked_until = 0, updated_at = ?2
     RETURNING fails`,
  ).bind(ip, now).first<{ fails: number }>();
  if ((row?.fails ?? 0) >= MAX_FAILS) {
    await env.DB.prepare('UPDATE login_attempts SET locked_until = ?1, fails = 0 WHERE ip = ?2').bind(now + LOCK_MS, ip).run();
    return true;
  }
  return false;
}

/** True while no personal password has been set (first login used the temporary secret). */
async function mustChangePassword(env: Env) {
  return !(await getAdminPasswordHash(env));
}

async function login(request: Request, env: Env) {
  const body = await readJson(request, 1024);
  const password = typeof body.password === 'string' ? body.password : '';
  const ip = await ipHash(env, request);
  const lockedUntil = await loginLocked(env, ip);
  if (lockedUntil) return errorJson(429, `تم إيقاف الدخول مؤقتًا بسبب محاولات خاطئة. حاول بعد ${Math.ceil((lockedUntil - Date.now()) / 60000)} دقيقة.`);

  const stored = await getAdminPasswordHash(env);
  let ok = false;
  if (stored) ok = password.length > 0 && password.length <= 200 && await verifyPassword(password, stored);
  else {
    const initial = env.ADMIN_INITIAL_PASSWORD;
    if (!initial) return errorJson(503, 'لوحة التحكم غير مفعّلة بعد: أضف السر ADMIN_INITIAL_PASSWORD في إعدادات Cloudflare.');
    ok = safeEqual(password, initial);
  }
  if (!ok) {
    const locked = await recordFail(env, ip);
    return errorJson(401, locked ? 'تم إيقاف الدخول 15 دقيقة بسبب 5 محاولات خاطئة.' : 'كلمة السر غير صحيحة.');
  }
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?1').bind(ip).run();
  const cookie = await createSession(env);
  return json({ ok: true, mustChange: !stored }, 200, { 'Set-Cookie': cookie });
}

async function changePassword(request: Request, env: Env) {
  const body = await readJson(request, 1024);
  const current = typeof body.current === 'string' ? body.current : '';
  const next = typeof body.next === 'string' ? body.next : '';
  const stored = await getAdminPasswordHash(env);
  const currentOk = stored ? await verifyPassword(current, stored) : !!env.ADMIN_INITIAL_PASSWORD && safeEqual(current, env.ADMIN_INITIAL_PASSWORD);
  if (!currentOk) return errorJson(400, 'كلمة السر الحالية غير صحيحة.');
  const problem = passwordProblem(next);
  if (problem) return errorJson(400, problem);
  if (safeEqual(current, next)) return errorJson(400, 'اختر كلمة سر جديدة مختلفة عن الحالية.');
  await setAdminPasswordHash(env, await hashPassword(next));
  // Sign out every other device, then open a fresh session here.
  await env.DB.prepare('DELETE FROM sessions').run();
  return json({ ok: true }, 200, { 'Set-Cookie': await createSession(env) });
}

// ------------------------------------------------------------- content

async function getContent(env: Env) {
  const { merged, stored } = await loadContent(env, true);
  return json({ ok: true, content: merged, defaults: defaultContent(), customized: Object.keys(stored) });
}

/** Media files (R2 keys) referenced by a stored section, so removed images can be deleted from storage. */
function mediaKeys(name: SectionName, value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  if (name === 'about') {
    const photo = (value as { photo?: string }).photo;
    return photo ? [photo] : [];
  }
  if (name === 'slider') {
    const slides = (value as { slides?: { src?: string }[] }).slides || [];
    return slides.map((s) => s.src || '').filter((src) => src.startsWith('/media/'));
  }
  return [];
}

async function deleteUnused(env: Env, before: string[], after: string[]) {
  for (const url of before) {
    if (!after.includes(url)) await env.MEDIA.delete(url.replace('/media/', '')).catch(() => undefined);
  }
}

async function putSection(request: Request, env: Env, name: SectionName) {
  const body = await readJson(request, 200_000);
  let value;
  try { value = validateSection(name, body.value); } catch (e) {
    return errorJson(400, e instanceof ContentError ? e.message : 'بيانات غير صالحة');
  }
  const { stored } = await loadContent(env, true);
  const before = mediaKeys(name, stored[name]);
  await saveStoredContent(env, { ...stored, [name]: value });
  await deleteUnused(env, before, mediaKeys(name, value));
  return json({ ok: true, value });
}

async function resetSection(env: Env, name: SectionName) {
  const { stored } = await loadContent(env, true);
  const next = { ...stored };
  const before = mediaKeys(name, stored[name]);
  delete next[name];
  await saveStoredContent(env, next);
  await deleteUnused(env, before, []);
  return json({ ok: true, value: defaultContent()[name] });
}

function imageType(bytes: Uint8Array): { ext: 'jpg' | 'png' | 'webp'; type: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { ext: 'png', type: 'image/png' };
  const ascii = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { ext: 'webp', type: 'image/webp' };
  return null;
}

async function uploadPhoto(request: Request, env: Env, url: URL) {
  const folder = url.searchParams.get('kind') === 'slide' ? 'slides' : 'about';
  const declared = Number(request.headers.get('Content-Length') || 0);
  const MAX = (folder === 'slides' ? 5 : 3) * 1024 * 1024;
  const tooBig = `الصورة أكبر من ${MAX / 1024 / 1024} ميغابايت.`;
  if (declared > MAX) return errorJson(413, tooBig);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > MAX) return errorJson(413, tooBig);
  if (bytes.length < 100) return errorJson(400, 'الملف فارغ.');
  const kind = imageType(bytes); // checked from the file content, not its name
  if (!kind) return errorJson(400, 'نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP.');
  const key = `${folder}/${crypto.randomUUID()}.${kind.ext}`;
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: kind.type } });
  return json({ ok: true, url: `/media/${key}` });
}

// ------------------------------------------------------------- statistics

async function stats(env: Env, url: URL) {
  const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 30, 1), 365);
  const today = officeClock().date;
  const from = new Date(Date.parse(`${today}T12:00:00Z`) - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const [rows, newBookings, totalBookings, active, unsub] = await Promise.all([
    env.DB.prepare('SELECT day, event, lang, count FROM stats WHERE day >= ?1 ORDER BY day').bind(from).all<{ day: string; event: string; lang: string; count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status = 'new'").first<{ n: number }>(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM bookings').first<{ n: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE status = 'active'").first<{ n: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE status = 'unsubscribed'").first<{ n: number }>(),
  ]);
  return json({
    ok: true, from, to: today, events: STAT_EVENTS, rows: rows.results,
    counts: { newBookings: newBookings?.n ?? 0, bookings: totalBookings?.n ?? 0, activeSubscribers: active?.n ?? 0, unsubscribed: unsub?.n ?? 0 },
  });
}

// ------------------------------------------------------------- bookings

const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;

async function listBookings(env: Env, url: URL) {
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  const page = Math.max(Number(url.searchParams.get('page')) || 1, 1);
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (BOOKING_STATUSES.includes(status)) { params.push(status); where.push(`status = ?${params.length}`); }
  if (q) { params.push(likeTerm(q)); where.push(`(name LIKE ?${params.length} ESCAPE '\\' OR email LIKE ?${params.length} ESCAPE '\\' OR phone LIKE ?${params.length} ESCAPE '\\')`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await env.DB.prepare(`SELECT COUNT(*) AS n FROM bookings ${clause}`).bind(...params).first<{ n: number }>();
  const rows = await env.DB.prepare(`SELECT * FROM bookings ${clause} ORDER BY created_at DESC LIMIT 50 OFFSET ${(page - 1) * 50}`).bind(...params).all();
  const byStatus = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM bookings GROUP BY status').all<{ status: string; n: number }>();
  return json({ ok: true, total: total?.n ?? 0, page, pageSize: 50, rows: rows.results, byStatus: byStatus.results });
}

async function updateBooking(request: Request, env: Env, id: number) {
  const body = await readJson(request, 4096);
  const sets: string[] = [];
  const params: (string | number)[] = [];
  if (body.status !== undefined) {
    if (!BOOKING_STATUSES.includes(String(body.status))) return errorJson(400, 'حالة غير صالحة');
    params.push(String(body.status)); sets.push(`status = ?${params.length}`);
  }
  if (body.admin_note !== undefined) {
    const note = String(body.admin_note).replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();
    if (note.length > 1000) return errorJson(400, 'الملاحظة أطول من 1000 حرف');
    params.push(note); sets.push(`admin_note = ?${params.length}`);
  }
  if (!sets.length) return errorJson(400, 'لا يوجد تعديل');
  params.push(id);
  const res = await env.DB.prepare(`UPDATE bookings SET ${sets.join(', ')} WHERE id = ?${params.length}`).bind(...params).run();
  return res.meta.changes ? json({ ok: true }) : errorJson(404, 'الطلب غير موجود');
}

// ------------------------------------------------------------- subscribers

async function listSubscribers(env: Env, url: URL) {
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  const page = Math.max(Number(url.searchParams.get('page')) || 1, 1);
  const where: string[] = [];
  const params: string[] = [];
  if (status === 'active' || status === 'unsubscribed') { params.push(status); where.push(`status = ?${params.length}`); }
  if (q) { params.push(likeTerm(q)); where.push(`(name LIKE ?${params.length} ESCAPE '\\' OR email LIKE ?${params.length} ESCAPE '\\')`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await env.DB.prepare(`SELECT COUNT(*) AS n FROM subscribers ${clause}`).bind(...params).first<{ n: number }>();
  const rows = await env.DB.prepare(`SELECT id, email, name, language, source, consent_at, status, unsubscribed_at FROM subscribers ${clause} ORDER BY consent_at DESC LIMIT 50 OFFSET ${(page - 1) * 50}`).bind(...params).all();
  return json({ ok: true, total: total?.n ?? 0, page, pageSize: 50, rows: rows.results });
}

/** Neutralises spreadsheet formulas (CSV injection) and quotes every cell. */
function csvCell(v: unknown) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function csvResponse(name: string, header: string[], rows: unknown[][]) {
  const body = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="${name}-${officeClock().date}.csv"`, 'X-Content-Type-Options': 'nosniff',
    },
  });
}

const iso = (ms: number | null) => (ms ? new Date(ms).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '');

async function subscribersCsv(env: Env, url: URL) {
  const origin = url.origin;
  const rows = await env.DB.prepare("SELECT email, name, language, source, consent_at, consent_text, token FROM subscribers WHERE status = 'active' ORDER BY consent_at").all<Record<string, string | number>>();
  return csvResponse('ibma-subscribers', ['email', 'name', 'language', 'source', 'consent_date', 'consent_text', 'unsubscribe_link'],
    rows.results.map((r) => [r.email, r.name, r.language, r.source, iso(Number(r.consent_at)), r.consent_text, `${origin}/unsubscribe?t=${r.token}`]));
}

async function bookingsCsv(env: Env) {
  const rows = await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all<Record<string, string | number>>();
  return csvResponse('ibma-appointment-requests', ['received', 'status', 'name', 'phone', 'email', 'service', 'preferred_date', 'preferred_time_ottawa', 'notes', 'language', 'office_note'],
    rows.results.map((r) => [iso(Number(r.created_at)), r.status, r.name, r.phone, r.email, r.service_title, r.preferred_date, r.preferred_time, r.notes, r.language, r.admin_note]));
}

// ------------------------------------------------------------- router

export async function handleAdmin(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.slice('/api/admin'.length) || '/';
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD' && !sameOrigin(request)) return errorJson(403, 'forbidden');

  if (path === '/login' && method === 'POST') return login(request, env);

  const session = await currentSession(env, request);
  if (!session) return errorJson(401, 'unauthorized', { 'Set-Cookie': clearSessionCookie() });

  if (path === '/logout' && method === 'POST') {
    await deleteSession(env, session);
    return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
  }
  const mustChange = await mustChangePassword(env);
  if (path === '/me' && method === 'GET') return json({ ok: true, mustChange });
  if (path === '/password' && method === 'POST') return changePassword(request, env);
  if (mustChange) return errorJson(403, 'must_change_password');

  if (path === '/logout-all' && method === 'POST') {
    await env.DB.prepare('DELETE FROM sessions').run();
    return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
  }
  if (path === '/content' && method === 'GET') return getContent(env);
  const section = path.match(/^\/content\/([a-z]+)(\/reset)?$/);
  if (section && SECTION_NAMES.includes(section[1] as SectionName)) {
    const name = section[1] as SectionName;
    if (!section[2] && method === 'PUT') return putSection(request, env, name);
    if (section[2] && method === 'POST') return resetSection(env, name);
  }
  if (path === '/photo' && method === 'POST') return uploadPhoto(request, env, url);
  if (path === '/stats' && method === 'GET') return stats(env, url);

  if (path === '/bookings' && method === 'GET') return listBookings(env, url);
  if (path === '/bookings.csv' && method === 'GET') return bookingsCsv(env);
  const booking = path.match(/^\/bookings\/(\d{1,10})$/);
  if (booking) {
    const id = Number(booking[1]);
    if (method === 'PATCH') return updateBooking(request, env, id);
    if (method === 'DELETE') {
      const res = await env.DB.prepare('DELETE FROM bookings WHERE id = ?1').bind(id).run();
      return res.meta.changes ? json({ ok: true }) : errorJson(404, 'الطلب غير موجود');
    }
  }

  if (path === '/subscribers' && method === 'GET') return listSubscribers(env, url);
  if (path === '/subscribers.csv' && method === 'GET') return subscribersCsv(env, url);
  const sub = path.match(/^\/subscribers\/(\d{1,10})(\/unsubscribe)?$/);
  if (sub) {
    const id = Number(sub[1]);
    if (sub[2] && method === 'POST') {
      const res = await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?1 WHERE id = ?2 AND status = 'active'").bind(Date.now(), id).run();
      return res.meta.changes ? json({ ok: true }) : errorJson(404, 'المشترك غير موجود أو ملغى مسبقًا');
    }
    if (!sub[2] && method === 'DELETE') {
      const res = await env.DB.prepare('DELETE FROM subscribers WHERE id = ?1').bind(id).run();
      return res.meta.changes ? json({ ok: true }) : errorJson(404, 'المشترك غير موجود');
    }
  }
  return errorJson(404, 'not_found');
}
