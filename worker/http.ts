// Response helpers and security headers.

const BASE_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export const SITE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

export function withSecurity(headers: Headers, csp = SITE_CSP) {
  for (const [k, v] of Object.entries(BASE_SECURITY_HEADERS)) headers.set(k, v);
  headers.set('Content-Security-Policy', csp);
  return headers;
}

export function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  const headers = withSecurity(new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }), "default-src 'none'; frame-ancestors 'none'");
  return new Response(JSON.stringify(data), { status, headers });
}

export const errorJson = (status: number, error: string, extra: Record<string, string> = {}) => json({ ok: false, error }, status, extra);

export function html(body: string, status = 200, extra: Record<string, string> = {}) {
  const headers = withSecurity(new Headers({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', ...extra }));
  return new Response(body, { status, headers });
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/** Safe JSON for embedding inside a <script> element. */
export function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Blocks requests sent from other websites (CSRF). Browsers always send Origin on POST/PUT/PATCH/DELETE. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  if (!origin || origin !== new URL(request.url).origin) return false;
  const site = request.headers.get('Sec-Fetch-Site');
  return !site || site === 'same-origin';
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Reads a JSON body with a size limit. */
export async function readJson(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > maxBytes) throw new HttpError(413, 'too_large');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new HttpError(413, 'too_large');
  try {
    const data = JSON.parse(text);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid_json');
  }
}

export const isBot = (request: Request) =>
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|monitor|headless|lighthouse|curl|wget|python|httpclient/i.test(request.headers.get('User-Agent') || '');
