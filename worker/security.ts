// Passwords, sessions and privacy-friendly IP hashing.
import type { Env } from './env';
import { getSetting, setSetting } from './db';

const enc = new TextEncoder();

export function randomToken(bytes = 32) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of two strings. */
export function safeEqual(a: string, b: string) {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

// ------------------------------------------------------------- passwords (PBKDF2-SHA256)

const ITERATIONS = 100_000; // highest value supported by Cloudflare Workers

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(bits)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iter || !salt || !hash) return false;
  const bits = await pbkdf2(password, fromB64(salt), Number(iter));
  return safeEqual(toB64(bits), hash);
}

/** Password rules for the dashboard. Returns an Arabic error or null. */
export function passwordProblem(next: string) {
  if (next.length < 12) return 'كلمة السر يجب ألا تقل عن 12 حرفًا.';
  if (next.length > 200) return 'كلمة السر طويلة جدًا.';
  if (!/[A-Za-z؀-ۿ]/.test(next) || !/\d/.test(next)) return 'كلمة السر يجب أن تحتوي على حروف وأرقام.';
  return null;
}

// ------------------------------------------------------------- sessions

export const SESSION_COOKIE = '__Host-ibma_admin';
const SESSION_MS = 7 * 86_400_000;

export async function createSession(env: Env) {
  const token = randomToken(32);
  const now = Date.now();
  await env.DB.prepare('INSERT INTO sessions (id, created_at, expires_at) VALUES (?1, ?2, ?3)').bind(await sha256Hex(token), now, now + SESSION_MS).run();
  return `${SESSION_COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MS / 1000}`;
}

export const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`;

function sessionToken(request: Request) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === SESSION_COOKIE) return v.join('=');
  }
  return null;
}

export async function currentSession(env: Env, request: Request) {
  const token = sessionToken(request);
  if (!token || token.length > 100) return null;
  const id = await sha256Hex(token);
  const row = await env.DB.prepare('SELECT id FROM sessions WHERE id = ?1 AND expires_at > ?2').bind(id, Date.now()).first<{ id: string }>();
  return row ? id : null;
}

export async function deleteSession(env: Env, id: string) {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?1').bind(id).run();
}

// ------------------------------------------------------------- IP hashing (no IP address is ever stored)

let saltCache: string | null = null;

async function ipSalt(env: Env) {
  if (saltCache) return saltCache;
  let salt = await getSetting(env, 'ip_salt');
  if (!salt) {
    await env.DB.prepare("INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('ip_salt', ?1, ?2)").bind(randomToken(32), Date.now()).run();
    salt = await getSetting(env, 'ip_salt');
  }
  saltCache = salt!;
  return saltCache;
}

export async function ipHash(env: Env, request: Request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return (await sha256Hex(`${await ipSalt(env)}|${ip}`)).slice(0, 32);
}

// ------------------------------------------------------------- admin password storage

export const getAdminPasswordHash = (env: Env) => getSetting(env, 'admin_password');
export const setAdminPasswordHash = (env: Env, hash: string) => setSetting(env, 'admin_password', hash);
