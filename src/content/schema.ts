// Shared by the website (browser) and the server (Cloudflare Worker).
// Defines what the dashboard can edit, the default values, and strict validation.
import type { Language } from '../types';
import { COMPANY_INFO, SERVICES_LIST, UI_TEXT } from '../i18n/translations';
import { PRIVACY_DEFAULT, PRIVACY_UPDATED } from './privacyDefault';
import { DEFAULT_DAYS, type DayHours } from '../lib/hours';

export const LANGS: Language[] = ['ar', 'en', 'fr'];
export type L = Record<Language, string>;

export type { DayHours };
export interface ServiceText { title: L; shortDesc: L; description: L; benefits: Record<Language, string[]> }
export interface AboutStat { val: string; label: L }

export interface SiteContent {
  contact: { phone: string; whatsapp: string; email: string; address: string; facebookUrl: string; googleReviewsUrl: string };
  hours: { days: DayHours[] }; // index 0 = Sunday … 6 = Saturday (Ottawa time)
  services: { order: string[]; hidden: string[]; items: Record<string, ServiceText> };
  campaign: { enabled: boolean; title: L; subtitle: L; cta: L };
  hero: { badge: L; h1: L; subtitle: L };
  about: { name: L; title: L; role: L; showVerifiedBadge: boolean; verifiedBadge: L; bioP1: L; bioP2: L; stats: AboutStat[]; photo: string };
  trust: { showCraBadge: boolean; craBadge: L };
  newsletter: { enabled: boolean; title: L; text: L };
  seo: { title: L; description: L };
  privacy: { updated: string; body: L };
}

export type SectionName = keyof SiteContent;
export const SECTION_NAMES: SectionName[] = ['contact', 'hours', 'services', 'campaign', 'hero', 'about', 'trust', 'newsletter', 'seo', 'privacy'];
export const SERVICE_IDS = SERVICES_LIST.map((s) => s.id);

const copyL = (v: L): L => ({ ar: v.ar, en: v.en, fr: v.fr });

export function defaultContent(): SiteContent {
  const items: Record<string, ServiceText> = {};
  for (const s of SERVICES_LIST) {
    items[s.id] = {
      title: copyL(s.title),
      shortDesc: copyL(s.shortDesc ?? s.description),
      description: copyL(s.description),
      benefits: { ar: [...s.benefits.ar], en: [...s.benefits.en], fr: [...s.benefits.fr] },
    };
  }
  const o = UI_TEXT.owner;
  return {
    contact: {
      phone: COMPANY_INFO.phone,
      whatsapp: COMPANY_INFO.whatsappUrl.replace(/\D/g, ''),
      email: COMPANY_INFO.email,
      address: COMPANY_INFO.address,
      facebookUrl: COMPANY_INFO.facebookUrl,
      googleReviewsUrl: 'https://share.google/yn0yKvLw7xZeVxkUa',
    },
    hours: { days: DEFAULT_DAYS.map((d) => ({ ...d })) },
    services: { order: [...SERVICE_IDS], hidden: [], items },
    campaign: { enabled: true, title: copyL(UI_TEXT.taxCampaign.title), subtitle: copyL(UI_TEXT.taxCampaign.subtitle), cta: copyL(UI_TEXT.taxCampaign.cta) },
    hero: {
      badge: copyL(UI_TEXT.hero.badge),
      h1: { ar: 'شريكك المالي والضريبي المعتمد', en: 'Your Certified Tax & Financial Partner', fr: 'Votre partenaire fiscal et financier agréé' },
      subtitle: copyL(UI_TEXT.hero.subtitle),
    },
    about: {
      name: copyL(o.name), title: copyL(o.title), role: copyL(o.role),
      showVerifiedBadge: true, verifiedBadge: copyL(o.verifiedBadge),
      bioP1: copyL(o.bioP1), bioP2: copyL(o.bioP2),
      stats: o.stats.map((s) => ({ val: s.val, label: copyL(s.label) })),
      photo: '',
    },
    trust: { showCraBadge: true, craBadge: { ar: 'ممثل معتمد ومقدّم إلكتروني لدى CRA', en: 'Authorized CRA Representative & E-Filer', fr: 'Représentant autorisé et déclarant électronique de l’ARC' } },
    newsletter: {
      enabled: true,
      title: { ar: 'اشترك لتصلك عروضنا', en: 'Subscribe to receive our offers', fr: 'Abonnez-vous pour recevoir nos offres' },
      text: {
        ar: 'عروض موسم الضرائب وتذكيرات المواعيد المهمة ونصائح محاسبية، مباشرة إلى بريدك الإلكتروني.',
        en: 'Tax-season offers, reminders of important deadlines and practical accounting tips, straight to your inbox.',
        fr: 'Offres de la saison des impôts, rappels des échéances importantes et conseils comptables, directement dans votre boîte de réception.',
      },
    },
    seo: {
      title: { ar: 'IBMA Accounting Ltd | المحاسبة والضرائب في أوتاوا', en: 'IBMA Accounting Ltd | Accounting & Tax Services in Ottawa', fr: 'IBMA Accounting Ltd | Services comptables et fiscaux à Ottawa' },
      description: {
        ar: 'مكتب IBMA للمحاسبة والضرائب في أوتاوا ونيبيان: إقرارات ضريبة الدخل للأفراد والشركات، مسك الدفاتر، الرواتب، ضريبة HST، وتأسيس الشركات. خدمة بالعربية والإنجليزية والفرنسية.',
        en: 'IBMA Accounting Ltd in Ottawa and Nepean: personal and corporate income tax returns, bookkeeping, payroll, HST/GST filing and business registration. Service in English, French and Arabic.',
        fr: 'IBMA Accounting Ltd à Ottawa et Nepean : déclarations de revenus des particuliers et des sociétés, tenue de livres, paie, TPS/TVH et immatriculation d’entreprise. Service en français, en anglais et en arabe.',
      },
    },
    privacy: { updated: PRIVACY_UPDATED, body: { ...PRIVACY_DEFAULT } },
  };
}

// ---------------------------------------------------------------- validation

export class ContentError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Removes control characters (keeps line breaks when multiline) and trims. */
export function cleanText(v: unknown, max: number, multiline = false): string {
  if (typeof v !== 'string') throw new ContentError('قيمة نصية غير صالحة');
  let s = v.replace(/\r\n?/g, '\n');
  s = multiline ? s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '') : s.replace(/[\u0000-\u001F\u007F]/g, ' ');
  s = s.trim();
  if (s.length > max) throw new ContentError(`النص أطول من الحد المسموح (${max} حرفًا)`);
  return s;
}

function textL(v: unknown, max: number, field: string, required = true, multiline = false): L {
  if (!isObj(v)) throw new ContentError(`الحقل «${field}» ناقص`);
  const out = {} as L;
  for (const lang of LANGS) {
    out[lang] = cleanText(v[lang] ?? '', max, multiline);
    if (required && !out[lang]) throw new ContentError(`الحقل «${field}» فارغ في لغة ${lang.toUpperCase()}`);
  }
  return out;
}

const bool = (v: unknown) => v === true;

function httpsUrl(v: unknown, field: string, allowEmpty = true): string {
  const s = cleanText(v ?? '', 300);
  if (!s && allowEmpty) return '';
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' || !u.hostname.includes('.')) throw new Error();
    return u.toString();
  } catch {
    throw new ContentError(`رابط «${field}» يجب أن يبدأ بـ https://`);
  }
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

function validators(): { [K in SectionName]: (v: unknown) => SiteContent[K] } {
  return {
    contact(v) {
      if (!isObj(v)) throw new ContentError('بيانات التواصل ناقصة');
      const phone = cleanText(v.phone, 30);
      if (!/^[+\d\s().-]{7,30}$/.test(phone)) throw new ContentError('رقم الهاتف غير صالح');
      const whatsapp = cleanText(v.whatsapp, 20).replace(/\D/g, '');
      if (!/^\d{7,15}$/.test(whatsapp)) throw new ContentError('رقم واتساب يجب أن يكون أرقامًا فقط مع رمز الدولة (مثال: 16138800300)');
      const email = cleanText(v.email, 254).toLowerCase();
      if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email)) throw new ContentError('البريد الإلكتروني غير صالح');
      const address = cleanText(v.address, 200);
      if (address.length < 5) throw new ContentError('العنوان قصير جدًا');
      return { phone, whatsapp, email, address, facebookUrl: httpsUrl(v.facebookUrl, 'فيسبوك'), googleReviewsUrl: httpsUrl(v.googleReviewsUrl, 'تقييمات Google') };
    },
    hours(v) {
      if (!isObj(v) || !Array.isArray(v.days) || v.days.length !== 7) throw new ContentError('ساعات العمل يجب أن تحتوي على 7 أيام');
      const days = v.days.map((d: unknown) => {
        if (!isObj(d)) throw new ContentError('يوم غير صالح');
        const closed = bool(d.closed);
        const open = String(d.open ?? ''), close = String(d.close ?? '');
        if (!TIME_RE.test(open) || !TIME_RE.test(close)) throw new ContentError('صيغة الوقت يجب أن تكون HH:MM');
        if (!closed && toMinutes(close) <= toMinutes(open)) throw new ContentError('وقت الإغلاق يجب أن يكون بعد وقت الفتح');
        return { closed, open, close };
      });
      if (days.every((d) => d.closed)) throw new ContentError('يجب أن يكون يوم واحد على الأقل مفتوحًا');
      return { days };
    },
    services(v) {
      if (!isObj(v) || !Array.isArray(v.order) || !Array.isArray(v.hidden) || !isObj(v.items)) throw new ContentError('بيانات الخدمات ناقصة');
      const order = v.order.filter((id): id is string => typeof id === 'string' && SERVICE_IDS.includes(id));
      if (new Set(order).size !== SERVICE_IDS.length) throw new ContentError('ترتيب الخدمات غير صالح');
      const hidden = [...new Set(v.hidden.filter((id): id is string => typeof id === 'string' && SERVICE_IDS.includes(id)))];
      if (hidden.length >= SERVICE_IDS.length) throw new ContentError('يجب أن تبقى خدمة واحدة ظاهرة على الأقل');
      const items: Record<string, ServiceText> = {};
      for (const id of SERVICE_IDS) {
        const it = v.items[id];
        if (!isObj(it)) throw new ContentError('خدمة ناقصة');
        const benefits = {} as Record<Language, string[]>;
        for (const lang of LANGS) {
          const list = isObj(it.benefits) && Array.isArray(it.benefits[lang]) ? (it.benefits[lang] as unknown[]) : [];
          benefits[lang] = list.map((b) => cleanText(b, 80)).filter(Boolean).slice(0, 6);
        }
        items[id] = {
          title: textL(it.title, 90, 'اسم الخدمة'),
          shortDesc: textL(it.shortDesc, 220, 'الوصف المختصر'),
          description: textL(it.description, 600, 'الوصف الكامل'),
          benefits,
        };
      }
      return { order, hidden, items };
    },
    campaign(v) {
      if (!isObj(v)) throw new ContentError('بيانات الحملة ناقصة');
      return { enabled: bool(v.enabled), title: textL(v.title, 120, 'العنوان'), subtitle: textL(v.subtitle, 400, 'النص'), cta: textL(v.cta, 50, 'نص الزر') };
    },
    hero(v) {
      if (!isObj(v)) throw new ContentError('بيانات الواجهة ناقصة');
      return { badge: textL(v.badge, 120, 'الشارة'), h1: textL(v.h1, 90, 'العنوان الرئيسي'), subtitle: textL(v.subtitle, 400, 'النص التعريفي') };
    },
    about(v) {
      if (!isObj(v)) throw new ContentError('بيانات «عن المحاسب» ناقصة');
      const stats = Array.isArray(v.stats) ? v.stats.slice(0, 4).map((s: unknown) => {
        if (!isObj(s)) throw new ContentError('رقم غير صالح');
        const val = cleanText(s.val, 12);
        if (!val) throw new ContentError('قيمة الرقم فارغة');
        return { val, label: textL(s.label, 50, 'وصف الرقم') };
      }) : [];
      const photo = cleanText(v.photo ?? '', 120);
      if (photo && !/^\/media\/about\/[a-z0-9-]+\.(jpg|png|webp)$/.test(photo)) throw new ContentError('رابط الصورة غير صالح');
      return {
        name: textL(v.name, 60, 'الاسم'), title: textL(v.title, 160, 'عنوان القسم'), role: textL(v.role, 160, 'الصفة'),
        showVerifiedBadge: bool(v.showVerifiedBadge), verifiedBadge: textL(v.verifiedBadge, 100, 'الشارة', bool(v.showVerifiedBadge)),
        bioP1: textL(v.bioP1, 900, 'الفقرة الأولى', true, true), bioP2: textL(v.bioP2, 900, 'الفقرة الثانية', false, true),
        stats, photo,
      };
    },
    trust(v) {
      if (!isObj(v)) throw new ContentError('بيانات الشارة ناقصة');
      return { showCraBadge: bool(v.showCraBadge), craBadge: textL(v.craBadge, 80, 'نص الشارة', bool(v.showCraBadge)) };
    },
    newsletter(v) {
      if (!isObj(v)) throw new ContentError('بيانات الاشتراك ناقصة');
      return { enabled: bool(v.enabled), title: textL(v.title, 80, 'العنوان'), text: textL(v.text, 300, 'النص') };
    },
    seo(v) {
      if (!isObj(v)) throw new ContentError('بيانات SEO ناقصة');
      return { title: textL(v.title, 70, 'عنوان الصفحة'), description: textL(v.description, 300, 'وصف الصفحة') };
    },
    privacy(v) {
      if (!isObj(v)) throw new ContentError('سياسة الخصوصية ناقصة');
      const updated = cleanText(v.updated, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(updated) || Number.isNaN(Date.parse(updated))) throw new ContentError('تاريخ التحديث غير صالح');
      return { updated, body: textL(v.body, 20000, 'نص السياسة', true, true) };
    },
  };
}

const VALIDATORS = validators();

/** Validates one section; throws ContentError with an Arabic message. */
export function validateSection<K extends SectionName>(name: K, value: unknown): SiteContent[K] {
  if (!SECTION_NAMES.includes(name)) throw new ContentError('قسم غير معروف');
  return VALIDATORS[name](value) as SiteContent[K];
}

/** Merges stored sections over the defaults; any invalid stored section falls back to its default. */
export function mergeContent(stored: unknown): SiteContent {
  const base = defaultContent();
  if (!isObj(stored)) return base;
  const out = base as unknown as Record<string, unknown>;
  for (const name of SECTION_NAMES) {
    if (stored[name] === undefined) continue;
    try { out[name] = validateSection(name, stored[name]); } catch { /* keep default */ }
  }
  return base;
}
