// Database tables and shared queries (Cloudflare D1).
import type { Env } from './env';
import { mergeContent, type SiteContent } from '../src/content/schema';
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
    status TEXT NOT NULL DEFAULT 'active', unsubscribed_at INTEGER, token TEXT NOT NULL UNIQUE)`,
  `CREATE TABLE IF NOT EXISTS stats (day TEXT NOT NULL, event TEXT NOT NULL, lang TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, event, lang))`,
];

let schemaReady: Promise<void> | null = null;

export function ensureSchema(env: Env) {
  if (!schemaReady) {
    schemaReady = env.DB.batch(SCHEMA.map((sql) => env.DB.prepare(sql))).then(() => undefined);
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

let contentCache: { at: number; stored: Record<string, unknown>; merged: SiteContent; updatedAt: number } | null = null;
const CONTENT_TTL_MS = 15_000;

export async function loadContent(env: Env, fresh = false) {
  if (!fresh && contentCache && Date.now() - contentCache.at < CONTENT_TTL_MS) return contentCache;
  const row = await env.DB.prepare("SELECT value, updated_at FROM settings WHERE key = 'content'").first<{ value: string; updated_at: number }>();
  let stored: Record<string, unknown> = {};
  try { if (row) stored = JSON.parse(row.value); } catch { stored = {}; }
  contentCache = { at: Date.now(), stored, merged: mergeContent(stored), updatedAt: row?.updated_at ?? 0 };
  return contentCache;
}

export async function saveStoredContent(env: Env, stored: Record<string, unknown>) {
  await setSetting(env, 'content', JSON.stringify(stored));
  contentCache = null;
}

// ------------------------------------------------------------- statistics

export const STAT_EVENTS = ['view', 'view_privacy', 'whatsapp', 'call', 'email', 'booking_open', 'service_open', 'directions', 'map', 'booking', 'subscribe', 'unsubscribe'] as const;
export type StatEvent = typeof STAT_EVENTS[number];

export async function countEvent(env: Env, event: StatEvent, lang: string) {
  const l = lang === 'en' || lang === 'fr' ? lang : 'ar';
  await env.DB.prepare('INSERT INTO stats (day, event, lang, count) VALUES (?1, ?2, ?3, 1) ON CONFLICT(day, event, lang) DO UPDATE SET count = count + 1')
    .bind(officeClock().date, event, l).run();
}

// ------------------------------------------------------------- rate limiting

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

// ------------------------------------------------------------- daily clean-up (privacy promises)

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
