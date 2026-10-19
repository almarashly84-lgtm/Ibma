import React from 'react';
import { ArrowRight, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../content/apply';
import { ASSETS } from '../i18n/assets';
import { pathFor } from '../lib/route';
import type { Language } from '../types';
import { Footer } from './Footer';

/** Turns the plain-text policy ("## " headings, "- " list items, blank-line paragraphs) into elements. Text only, never HTML. */
function renderPolicy(text: string) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flushPara = () => { if (para.length) { blocks.push(<p key={blocks.length}>{para.join(' ')}</p>); para = []; } };
  const flushList = () => {
    if (list.length) {
      blocks.push(<ul key={blocks.length} className="list-disc ps-6 space-y-1.5">{list.map((item, i) => <li key={i}>{item}</li>)}</ul>);
      list = [];
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (line.startsWith('## ')) { flushPara(); flushList(); blocks.push(<h2 key={blocks.length} className="text-lg sm:text-xl font-bold text-amber-300 pt-4">{line.slice(3)}</h2>); continue; }
    if (line.startsWith('- ')) { flushPara(); list.push(line.slice(2)); continue; }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

const TITLE: Record<Language, string> = { ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de confidentialité' };
const UPDATED: Record<Language, string> = { ar: 'آخر تحديث', en: 'Last updated', fr: 'Dernière mise à jour' };
const BACK: Record<Language, string> = { ar: 'العودة إلى الصفحة الرئيسية', en: 'Back to the home page', fr: 'Retour à l’accueil' };

export const PrivacyPage: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const languages: { code: Language; label: string }[] = [{ code: 'ar', label: 'AR' }, { code: 'en', label: 'ENG' }, { code: 'fr', label: 'FR' }];
  const updated = new Intl.DateTimeFormat(language === 'ar' ? 'ar' : language === 'fr' ? 'fr-CA' : 'en-CA', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(`${SITE.privacy.updated}T00:00:00Z`));

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-[#090D13]/95 backdrop-blur-md border-b border-amber-500/30">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between gap-3">
          <a href={pathFor(language, 'home')} aria-label={BACK[language]} className="h-14 flex items-center">
            <img src={ASSETS.officialLogo} alt="IBMA Accounting Ltd" className="h-full w-auto object-contain" />
          </a>
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 text-xs">
            <Globe className="hidden sm:block w-4 h-4 text-amber-400 mx-1" aria-hidden="true" />
            {languages.map((l) => (
              <button key={l.code} type="button" lang={l.code} aria-pressed={language === l.code} onClick={() => setLanguage(l.code)}
                className={`min-h-9 px-2.5 rounded-lg font-bold ${language === l.code ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 py-8 sm:py-12">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 text-sm sm:text-base leading-relaxed text-slate-300">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{TITLE[language]}</h1>
          </div>
          <p className="text-xs text-slate-400">{UPDATED[language]}{language === 'fr' ? ' : ' : ': '}<time dateTime={SITE.privacy.updated}>{updated}</time></p>
          {renderPolicy(SITE.privacy.body[language])}
          <p className="pt-6">
            <a href={pathFor(language, 'home')} className="inline-flex min-h-11 items-center gap-2 font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4">
              <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? '' : 'rotate-180'}`} aria-hidden="true" />{BACK[language]}
            </a>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
};
