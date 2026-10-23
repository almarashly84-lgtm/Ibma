import React, { useState } from 'react';
import { BellRing, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../content/apply';
import { EMAIL_RE, validName } from '../lib/booking';
import { pathFor } from '../lib/route';
import { CONSENT_TEXT } from '../content/consent';

const COPY = {
  ar: {
    name: 'الاسم', email: 'البريد الإلكتروني', submit: 'اشترك', sending: 'جارٍ الاشتراك...',
    privacy: 'سياسة الخصوصية',
    ok: 'تم اشتراكك بنجاح. شكرًا لك!',
    errName: 'يرجى إدخال اسمك (من 2 إلى 100 حرف، دون روابط).', errEmail: 'البريد الإلكتروني غير صالح.', errConsent: 'يرجى وضع علامة على مربع الموافقة للاشتراك.',
    errServer: 'تعذّر الاشتراك الآن. يرجى المحاولة لاحقًا.', errRate: 'محاولات كثيرة. يرجى المحاولة بعد قليل.',
  },
  en: {
    name: 'Name', email: 'Email', submit: 'Subscribe', sending: 'Subscribing...',
    privacy: 'Privacy Policy',
    ok: 'You are subscribed. Thank you!',
    errName: 'Please enter your name (2–100 characters, no links).', errEmail: 'Please enter a valid email.', errConsent: 'Please tick the consent box to subscribe.',
    errServer: 'Subscription is not possible right now. Please try again later.', errRate: 'Too many attempts. Please try again shortly.',
  },
  fr: {
    name: 'Nom', email: 'Courriel', submit: 'S’abonner', sending: 'Abonnement en cours...',
    privacy: 'Politique de confidentialité',
    ok: 'Votre abonnement est confirmé. Merci!',
    errName: 'Veuillez saisir votre nom (2 à 100 caractères, sans lien).', errEmail: 'Le courriel est invalide.', errConsent: 'Veuillez cocher la case de consentement pour vous abonner.',
    errServer: 'L’abonnement est impossible pour le moment. Veuillez réessayer plus tard.', errRate: 'Trop de tentatives. Veuillez réessayer dans un instant.',
  },
};

export const NewsletterSection: React.FC = () => {
  const { language } = useLanguage();
  const c = COPY[language];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // hidden trap field for bots
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const n = name.trim(), e = email.trim();
    const fail = (m: string) => { setStatus('error'); setMessage(m); };
    if (!validName(n)) return fail(c.errName);
    if (e.length > 254 || !EMAIL_RE.test(e)) return fail(c.errEmail);
    if (!consent) return fail(c.errConsent);
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: e, language, consent: true, website }),
      });
      if (res.status === 429) return fail(c.errRate);
      if (!res.ok) return fail(c.errServer);
      setStatus('ok');
      setName('');
      setEmail('');
      setConsent(false);
    } catch {
      fail(c.errServer);
    }
  };

  return (
    <section id="newsletter" className="py-10 sm:py-12 bg-[#0B0F17] border-t border-amber-500/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-5">
          <BellRing className="w-7 h-7 text-amber-400 mx-auto" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">{SITE.newsletter.title[language]}</h2>
          <p className="text-sm text-slate-300">{SITE.newsletter.text[language]}</p>
        </div>

        {status === 'ok' ? (
          <p role="status" className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
            <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />{c.ok}
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3">
              <div>
                <label htmlFor="newsletter-name" className="sr-only">{c.name}</label>
                <input id="newsletter-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={c.name}
                  className="w-full min-h-11 px-3 rounded-xl bg-[#141B28] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label htmlFor="newsletter-email" className="sr-only">{c.email}</label>
                <input id="newsletter-email" name="email" type="email" dir="ltr" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.email}
                  className="w-full min-h-11 px-3 rounded-xl bg-[#141B28] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 text-start" />
              </div>
              <button type="submit" disabled={status === 'sending'}
                className="min-h-11 px-6 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 inline-flex items-center justify-center gap-2">
                {status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {status === 'sending' ? c.sending : c.submit}
              </button>
            </div>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="newsletter-website">Website</label>
              <input id="newsletter-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <label htmlFor="newsletter-consent" className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed cursor-pointer">
              <input id="newsletter-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-amber-500" />
              <span>{CONSENT_TEXT.newsletter[language]} <a href={pathFor(language, 'privacy')} className="underline text-amber-300 hover:text-amber-200">{c.privacy}</a></span>
            </label>
            {status === 'error' && (
              <p role="alert" className="flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />{message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};
