import type { Language } from '../types';

// The exact consent wording shown to the visitor. The server stores the wording the visitor agreed to
// together with the date, as proof of express consent (Canada's anti-spam law, CASL).
export const CONSENT_TEXT: Record<'newsletter' | 'booking', Record<Language, string>> = {
  newsletter: {
    ar: 'أوافق على أن تراسلني IBMA Accounting Ltd بالعروض والأخبار عبر البريد الإلكتروني. يمكنني إلغاء الاشتراك في أي وقت.',
    en: 'I agree to receive offers and news from IBMA Accounting Ltd by email. I can unsubscribe at any time.',
    fr: 'J’accepte de recevoir par courriel les offres et les nouvelles d’IBMA Accounting Ltd. Je peux me désabonner en tout temps.',
  },
  booking: {
    ar: 'أريد أيضًا أن تصلني العروض والأخبار عبر البريد الإلكتروني (يمكنني إلغاء الاشتراك في أي وقت).',
    en: 'I would also like to receive offers and news by email (I can unsubscribe at any time).',
    fr: 'Je souhaite aussi recevoir les offres et les nouvelles par courriel (je peux me désabonner en tout temps).',
  },
};
