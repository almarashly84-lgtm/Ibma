// IBMA Accounting — Cloudflare Worker: website pages, public API, dashboard API, media and SEO files.
import type { Env } from './env';
import { ensureSchema, purgeOldData } from './db';
import { errorJson, HttpError } from './http';
import { handleAdmin } from './admin';
import { handleBooking, handleEvent, handleSubscribe, handleUnsubscribe } from './public';
import { robots, routePage, serveMedia, servePage, sitemap } from './pages';

async function route(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;

  if (pathname.startsWith('/api/')) {
    await ensureSchema(env);
    if (pathname.startsWith('/api/admin/')) return handleAdmin(request, env, url);
    if (pathname === '/api/booking' && method === 'POST') return handleBooking(request, env, ctx);
    if (pathname === '/api/subscribe' && method === 'POST') return handleSubscribe(request, env, ctx);
    if (pathname === '/api/event' && method === 'POST') return handleEvent(request, env);
    if (pathname === '/api/health' && method === 'GET') return new Response('ok', { headers: { 'Cache-Control': 'no-store' } });
    return errorJson(404, 'not_found');
  }

  if (pathname === '/unsubscribe' && (method === 'GET' || method === 'POST')) {
    await ensureSchema(env);
    return handleUnsubscribe(request, env, ctx);
  }
  if (method !== 'GET' && method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });

  if (pathname === '/robots.txt') return robots(request);
  if (pathname === '/sitemap.xml') { await ensureSchema(env); return sitemap(request, env); }
  if (pathname.startsWith('/media/')) return serveMedia(request, env, pathname);

  const page = routePage(pathname);
  if (page?.redirect) return Response.redirect(new URL(page.redirect + url.search, url).toString(), 301);
  if (page?.lang && page.page) {
    await ensureSchema(env);
    return servePage(request, env, ctx, page.lang, page.page);
  }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await route(request, env, ctx);
    } catch (error) {
      if (error instanceof HttpError) return errorJson(error.status, error.message);
      console.error('Unhandled error', error instanceof Error ? error.stack : error);
      return errorJson(500, 'server_error');
    }
  },

  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    await ensureSchema(env);
    await purgeOldData(env);
  },
} satisfies ExportedHandler<Env>;
