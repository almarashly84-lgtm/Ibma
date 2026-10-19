// Applies the content saved in the dashboard to the website before the first render.
// The server injects it into the page as <script type="application/json" id="site-content">,
// so there is no extra network request. If anything is missing or invalid, defaults are used.
import { COMPANY_INFO, SERVICES_LIST, UI_TEXT } from '../i18n/translations';
import { setOfficeHours } from '../lib/hours';
import { defaultContent, mergeContent, type SiteContent } from './schema';
import type { ServiceItem } from '../types';

export let SITE: SiteContent = defaultContent();

const ORIGINAL_SERVICES: ServiceItem[] = SERVICES_LIST.map((s) => ({ ...s }));

export function mapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function applyContent(raw: unknown) {
  const c = mergeContent(raw);
  SITE = c;

  COMPANY_INFO.phone = c.contact.phone;
  COMPANY_INFO.phoneClean = '+' + c.contact.phone.replace(/\D/g, '');
  COMPANY_INFO.whatsappUrl = `https://wa.me/${c.contact.whatsapp}`;
  COMPANY_INFO.email = c.contact.email;
  COMPANY_INFO.address = c.contact.address;
  COMPANY_INFO.facebookUrl = c.contact.facebookUrl;
  COMPANY_INFO.mapEmbedUrl = mapEmbedUrl(c.contact.address);

  setOfficeHours(c.hours.days);

  const visible = c.services.order
    .filter((id) => !c.services.hidden.includes(id))
    .map((id, index) => {
      const base = ORIGINAL_SERVICES.find((s) => s.id === id)!;
      const t = c.services.items[id];
      return { ...base, number: String(index + 1).padStart(2, '0'), title: t.title, shortDesc: t.shortDesc, description: t.description, benefits: t.benefits };
    });
  SERVICES_LIST.splice(0, SERVICES_LIST.length, ...visible);

  Object.assign(UI_TEXT.taxCampaign, { title: c.campaign.title, subtitle: c.campaign.subtitle, cta: c.campaign.cta });
  Object.assign(UI_TEXT.hero, { badge: c.hero.badge, subtitle: c.hero.subtitle });
  Object.assign(UI_TEXT.owner, {
    name: c.about.name, title: c.about.title, role: c.about.role, verifiedBadge: c.about.verifiedBadge,
    bioP1: c.about.bioP1, bioP2: c.about.bioP2, stats: c.about.stats,
  });
}

export function readInjectedContent(): unknown {
  try {
    const el = document.getElementById('site-content');
    return el?.textContent ? JSON.parse(el.textContent) : null;
  } catch {
    return null;
  }
}
