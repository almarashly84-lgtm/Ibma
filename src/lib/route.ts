import type { Language } from '../types';

export type Page = 'home' | 'privacy';

/** Each language has its own address so Google can index all three: / (AR), /en/ (EN), /fr/ (FR). */
export function parsePath(pathname: string): { lang: Language; page: Page; explicit: boolean } {
  const parts = pathname.split('/').filter(Boolean);
  let lang: Language = 'ar';
  let explicit = false;
  if (parts[0] === 'en' || parts[0] === 'fr') { lang = parts[0]; explicit = true; parts.shift(); }
  return { lang, page: parts[0] === 'privacy' ? 'privacy' : 'home', explicit };
}

export function pathFor(lang: Language, page: Page = 'home') {
  const prefix = lang === 'ar' ? '/' : `/${lang}/`;
  return page === 'privacy' ? `${prefix}privacy` : prefix;
}
