// Database tables and shared queries (Cloudflare D1).
import type { Env } from './env';
import { defaultContent, mergeContent, type SectionName, type SiteContent } from '../src/content/schema';
import { officeClock } from '../src/lib/hours';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, fails INTEGER NOT NULL, locked_until INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER NOT NULL,
    name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
    service_id TEXT NOT NULL, service_title TEXT NOT NULL, preferred_date TEXT NOT NULL, preferred_time TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '', language TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
    admin_note TEXT NOT NULL DEFAULT '', subscribed INTEGER NOT NULL DEFAULT 0)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at)`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, language TEXT NOT NULL,
    source TEXT NOT NULL, consent_text TEXT NOT NULL, consent_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', unsubscribed_at INTEGER, token TEXT NOT NULL UNIQUE,
    resubscribe_requested_at INTEGER)`,
  `CREATE TABLE IF NOT EXISTS stats (day TEXT NOT NULL, event TEXT NOT NULL, lang TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, event, lang))`,
];

/** Columns added after the first release (CREATE TABLE IF NOT EXISTS does not add them to existing tables). */
const COLUMNS: { table: string; column: string; ddl: string }[] = [
  { table: 'subscribers', column: 'resubscribe_requested_at', ddl: 'ALTER TABLE subscribers ADD COLUMN resubscribe_requested_at INTEGER' },
];

let schemaReady: Promise<void> | null = null;

async function migrate(env: Env) {
  await env.DB.batch(SCHEMA.map((sql) => env.DB.prepare(sql)));
  for (const c of COLUMNS) {
    const cols = await env.DB.prepare(`SELECT name FROM pragma_table_info('${c.table}')`).all<{ name: string }>();
    if (!cols.results.some((r) => r.name === c.column)) {
      try { await env.DB.prepare(c.ddl).run(); } catch (e) {
        // Another instance may have added it at the same moment.
        if (!/duplicate column/i.test(String(e))) throw e;
      }
    }
  }
}

export function ensureSchema(env: Env) {
  if (!schemaReady) {
    schemaReady = migrate(env);
    schemaReady.catch(() => { schemaReady = null; });
  }
  return schemaReady;
}

export async function getSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setSetting(env: Env, key: string, value: string) {
  await env.DB.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind(key, value, Date.now()).run();
}

// ------------------------------------------------------------- site content

type ContentState = { at: number; stored: Record<string, unknown>; merged: SiteContent; updatedAt: number };
let contentCache: ContentState | null = null;
const CONTENT_TTL_MS = 15_000;

export async function loadContent(env: Env, fresh = false): Promise<ContentState> {
  if (!fresh && contentCache && Date.now() - contentCache.at < CONTENT_TTL_MS) return contentCache;
  const row = await env.DB.prepare("SELECT value, updated_at FROM settings WHERE key = 'content'").first<{ value: string; updated_at: number }>();
  let stored: Record<string, unknown> = {};
  try {
    const parsed = row ? JSON.parse(row.value) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) stored = parsed;
  } catch { stored = {}; }
  contentCache = { at: Date.now(), stored, merged: mergeContent(stored), updatedAt: row?.updated_at ?? 0 };
  return contentCache;
}

/**
 * Content for public pages. Never throws: if the database is unavailable (outage or daily quota reached),
 * the last known content or the built-in defaults are used, so the website stays online.
 */
export async function loadContentSafe(env: Env): Promise<ContentState> {
  try {
    return await loadContent(env);
  } catch (error) {
    console.error('Content unavailable, using fallback', String(error));
    return contentCache ?? { at: 0, stored: {}, merged: defaultContent(), updatedAt: 0 };
  }
}

/** Saves one section atomically (two dashboard saves at the same moment cannot overwrite each other). */
export async function saveSection(env: Env, name: SectionName, value: unknown) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('content', json_object(?1, json(?2)), ?3)
     ON CONFLICT(key) DO UPDATE SET
       value = json_set(CASE WHEN json_valid(value) AND json_type(value) = 'object' THEN value ELSE '{}' END, '$.' || ?1, json(?2)),
       updated_at = ?3`,
  ).bind(name, JSON.stringify(value), now).run();
  contentCache = null;
}

export async function removeSection(env: Env, name: SectionName) {
  await env.DB.prepare(
    `UPDATE settings SET value = json_remove(CASE WHEN json_valid(value) THEN value ELSE '{}' END, '$.' || ?1), updated_at = ?2 WHERE key = 'content'`,
  ).bind(name, Date.now()).run();
  contentCache = null;
}

// ------------------------------------------------------------- statistics

export const STAT_EVENTS = ['view', 'view_privacy', 'whatsapp', 'call', 'email', 'booking_open', 'service_open', 'directions', 'map', 'booking', 'subscribe', 'unsubscribe'] as const;
export type StatEvent = typeof STAT_EVENTS[number];

/**
 * Daily ceiling for statistics writes. The free Cloudflare plan allows 100,000 database writes per day for the
 * whole account (shared by all sites); fake traffic must never be able to use them up and stop bookings.
 */
export const DAILY_STATS_BUDGET = 15_000;
let budget: { day: string; used: number; checkedAt: number } | null = null;

async function statsAllowed(env: Env, day: string) {
  const now = Date.now();
  if (!budget || budget.day !== day || now - budget.checkedAt > 60_000) {
    const row = await env.DB.prepare('SELECT COALESCE(SUM(count), 0) AS n FROM stats WHERE day = ?1').bind(day).first<{ n: number }>();
    budget = { day, used: row?.n ?? 0, checkedAt: now };
  }
  if (budget.used >= DAILY_STATS_BUDGET) return false;
  budget.used += 1;
  return true;
}

/** Counts one anonymous event. Never throws (statistics must not break the site or a booking). */
export async function countEvent(env: Env, event: StatEvent, lang: string) {
  try {
    const l = lang === 'en' || lang === 'fr' ? lang : 'ar';
    const day = officeClock().date;
    if (!(await statsAllowed(env, day))) return;
    await env.DB.prepare('INSERT INTO stats (day, event, lang, count) VALUES (?1, ?2, ?3, 1) ON CONFLICT(day, event, lang) DO UPDATE SET count = count + 1')
      .bind(day, event, l).run();
  } catch (error) {
    console.error('countEvent failed', String(error));
  }
}

// ------------------------------------------------------------- rate limiting (hourly, stored in D1)

/** Fixed-window counter. Returns true when the request is allowed. */
export async function rateLimit(env: Env, key: string, limit: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN window_start <= ?2 - ?3 THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN window_start <= ?2 - ?3 THEN ?2 ELSE window_start END
     RETURNING count`,
  ).bind(key, now, windowSeconds).first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}

// ------------------------------------------------------------- daily clean-up (privacy promises + storage)

export async function purgeOldData(env: Env) {
  const now = Date.now();
  const day = 86_400_000;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM bookings WHERE created_at < ?1').bind(now - 730 * day), // requests: max 24 months
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?1').bind(now),
    env.DB.prepare('DELETE FROM login_attempts WHERE updated_at < ?1').bind(now - day), // hashed IPs: < 48 h
    env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?1').bind(Math.floor((now - day) / 1000)),
    env.DB.prepare('DELETE FROM stats WHERE day < ?1').bind(new Date(now - 3 * 365 * day).toISOString().slice(0, 10)),
  ]);
}

/** Deletes uploaded images that are no longer used by the website (for example uploaded but never saved). */
export async function purgeUnusedMedia(env: Env) {
  const { stored } = await loadContent(env, true);
  const used = new Set<string>();
  const about = stored.about as { photo?: string } | undefined;
  if (about?.photo) used.add(about.photo.replace('/media/', ''));
  const slider = stored.slider as { slides?: { src?: string }[] } | undefined;
  for (const s of slider?.slides ?? []) if (s.src?.startsWith('/media/')) used.add(s.src.replace('/media/', ''));
  const cutoff = Date.now() - 86_400_000; // keep fresh uploads for a day (they may be saved later)
  for (const prefix of ['about/', 'slides/']) {
    let cursor: string | undefined;
    do {
      const list = await env.MEDIA.list({ prefix, cursor, limit: 500 });
      const stale = list.objects.filter((o) => !used.has(o.key) && o.uploaded.getTime() < cutoff).map((o) => o.key);
      if (stale.length) await env.MEDIA.delete(stale);
      cursor = list.truncated ? list.cursor : undefined;
    } while (cursor);
  }
}
