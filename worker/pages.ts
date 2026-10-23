// Serves the website pages with the right language, SEO tags and dashboard content.
import type { Env } from './env';
import { countEvent, ensureSchema, loadContentSafe } from './db';
import { statsAllowed } from './limits';
import { escapeHtml, isBot, scriptJson, withSecurity } from './http';
import type { SiteContent } from '../src/content/schema';
import { defaultContent } from '../src/content/schema';
import { parsePath, pathFor, type Page } from '../src/lib/route';
import type { Language } from '../src/types';

const LOCALE: Record<Language, string> = { ar: 'ar_CA', en: 'en_CA', fr: 'fr_CA' };
const PRIVACY_TITLE: Record<Language, string> = { ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de confidentialité' };
const PRIVACY_DESC: Record<Language, string> = {
  ar: 'كيف تجمع IBMA Accounting Ltd البيانات الشخصية وتستخدمها وتحميها، وحقوقك.',
  en: 'How IBMA Accounting Ltd collects, uses and protects personal information, and your rights.',
  fr: 'Comment IBMA Accounting Ltd recueille, utilise et protège les renseignements personnels, et vos droits.',
};
const DAY_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function structuredData(c: SiteContent, origin: string) {
  const def = defaultContent();
  const address = c.contact.address === def.contact.address
    ? { '@type': 'PostalAddress', streetAddress: '30 Concourse Gate Unit 102', addressLocality: 'Nepean', addressRegion: 'ON', postalCode: 'K2E 7V7', addressCountry: 'CA' }
    : c.contact.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    name: 'IBMA Accounting Ltd',
    url: `${origin}/`,
    image: `${origin}/og-image.png`,
    telephone: '+' + c.contact.phone.replace(/\D/g, ''),
    email: c.contact.email,
    address,
    areaServed: ['Ottawa', 'Nepean', 'Ontario', 'Canada'],
    availableLanguage: ['Arabic', 'English', 'French'],
    openingHoursSpecification: c.hours.days.flatMap((d, i) => (d.closed ? [] : [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_SCHEMA[i], opens: d.open, closes: d.close }])),
    ...(c.contact.facebookUrl ? { sameAs: [c.contact.facebookUrl] } : {}),
  };
}

/** HTMLRewriter writes attribute values as-is, so they must be escaped here (dashboard text can contain quotes). */
class SetAttr {
  constructor(private attr: string, private value: string) {}
  element(el: Element) { el.setAttribute(this.attr, escapeHtml(this.value)); }
}

export async function servePage(request: Request, env: Env, ctx: ExecutionContext, lang: Language, page: Page) {
  const origin = new URL(request.url).origin;
  const [asset, content] = await Promise.all([env.ASSETS.fetch(new Request(new URL('/', request.url))), loadContentSafe(env)]);
  if (!asset.ok) return asset;
  const c = content.merged;
  const path = pathFor(lang, page);
  const title = page === 'privacy' ? `${PRIVACY_TITLE[lang]} | IBMA Accounting Ltd` : c.seo.title[lang];
  const description = page === 'privacy' ? PRIVACY_DESC[lang] : c.seo.description[lang];
  const alt = (l: Language) => `${origin}${pathFor(l, page)}`;
  const others = (['ar', 'en', 'fr'] as Language[]).filter((l) => l !== lang);

  const rewritten = new HTMLRewriter()
    .on('html', new SetAttr('lang', lang))
    .on('html', new SetAttr('dir', lang === 'ar' ? 'rtl' : 'ltr'))
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', new SetAttr('content', description))
    .on('meta[property="og:title"]', new SetAttr('content', title))
    .on('meta[property="og:description"]', new SetAttr('content', description))
    .on('meta[property="og:url"]', new SetAttr('content', `${origin}${path}`))
    .on('meta[property="og:image"]', new SetAttr('content', `${origin}/og-image.png`))
    .on('meta[property="og:locale"]', new SetAttr('content', LOCALE[lang]))
    .on('meta[property="og:locale:alternate"]', { element(el) { el.remove(); } })
    .on('link[rel="canonical"]', new SetAttr('href', `${origin}${path}`))
    .on('link[hreflang="ar"]', new SetAttr('href', alt('ar')))
    .on('link[hreflang="en"]', new SetAttr('href', alt('en')))
    .on('link[hreflang="fr"]', new SetAttr('href', alt('fr')))
    .on('link[hreflang="x-default"]', new SetAttr('href', alt('en')))
    .on('script[type="application/ld+json"]', { element(el) { el.setInnerContent(scriptJson(structuredData(c, origin)), { html: true }); } })
    .on('noscript', {
      element(el) {
        const phone = escapeHtml(c.contact.phone), email = escapeHtml(c.contact.email);
        el.setInnerContent(`IBMA Accounting Ltd — <a href="tel:+${c.contact.phone.replace(/\D/g, '')}">${phone}</a> — <a href="mailto:${email}">${email}</a>`, { html: true });
      },
    })
    .on('head', {
      element(el) {
        const locales = others.map((l) => `<meta property="og:locale:alternate" content="${LOCALE[l]}" />`).join('');
        el.append(`${locales}<script type="application/json" id="site-content">${scriptJson(content.stored)}</script>`, { html: true });
      },
    })
    .transform(asset);

  if (request.method === 'GET' && !isBot(request)) {
    ctx.waitUntil((async () => {
      if (!(await statsAllowed(env, request))) return; // page reload floods are not counted (no database writes)
      await ensureSchema(env);
      await countEvent(env, page === 'privacy' ? 'view_privacy' : 'view', lang);
    })().catch(() => undefined));
  }

  const headers = withSecurity(new Headers({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'Content-Language': lang, Vary: 'Accept-Encoding' }));
  return new Response(request.method === 'HEAD' ? null : rewritten.body, { status: 200, headers });
}

/** Returns a redirect or page for the site's own addresses, or null when the path is not a page. */
export function routePage(pathname: string): { redirect?: string; lang?: Language; page?: Page } | null {
  if (pathname === '/index.html') return { redirect: '/' };
  if (pathname === '/en' || pathname === '/fr') return { redirect: `${pathname}/` };
  if (/^\/(en\/|fr\/)?privacy\/$/.test(pathname)) return { redirect: pathname.slice(0, -1) };
  if (!/^\/((en|fr)\/)?(privacy)?$/.test(pathname)) return null;
  const r = parsePath(pathname);
  return { lang: r.lang, page: r.page };
}

export async function sitemap(request: Request, env: Env) {
  const origin = new URL(request.url).origin;
  const { updatedAt } = await loadContentSafe(env);
  const lastmod = new Date(updatedAt || Date.parse('2026-10-19')).toISOString().slice(0, 10);
  const langs: Language[] = ['ar', 'en', 'fr'];
  const urls = (['home', 'privacy'] as Page[]).flatMap((page) => langs.map((lang) => {
    const links = langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${origin}${pathFor(l, page)}"/>`).join('');
    const xdef = `<xhtml:link rel="alternate" hreflang="x-default" href="${origin}${pathFor('en', page)}"/>`;
    return `<url><loc>${origin}${pathFor(lang, page)}</loc><lastmod>${lastmod}</lastmod>${links}${xdef}<priority>${page === 'home' ? '1.0' : '0.3'}</priority></url>`;
  }));
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

export function robots(request: Request) {
  const origin = new URL(request.url).origin;
  const body = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /unsubscribe\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

export async function serveMedia(request: Request, env: Env, pathname: string) {
  const key = pathname.slice('/media/'.length);
  if (!/^(about|slides)\/[a-z0-9-]+\.(jpg|png|webp)$/.test(key)) return new Response('Not found', { status: 404 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers({
    'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', ETag: object.httpEtag,
    // An uploaded file can only ever be shown as an image, never run as a page.
    'Content-Security-Policy': "default-src 'none'; sandbox", 'Cross-Origin-Resource-Policy': 'same-origin',
  });
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
