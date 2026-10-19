import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, COMPANY_INFO } from '../i18n/translations';
import { ASSETS } from '../i18n/assets';
import { ShieldCheck } from 'lucide-react';
import { SITE } from '../content/apply';
import { pathFor } from '../lib/route';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = UI_TEXT.footer;
  const currentYear = new Date().getFullYear();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On the privacy page the sections are on the home page.
      window.location.href = `${pathFor(language, 'home')}#${id}`;
    }
  };

  return (
    <footer id="site-footer" style={{ paddingBottom: 'calc(var(--contact-bar-height, 76px) + 10px)' }} className="bg-[#070A0F] text-slate-300 border-t border-slate-800 pt-8 sm:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand and compact navigation; contact details live in the contact section. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-800/80">
          
          {/* Brand & Mission (5 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-14 sm:h-16 w-auto flex items-center">
                <img
                  src={ASSETS.officialLogo}
                  alt="IBMA Accounting Ltd Official Logo"
                  className="h-full w-auto object-contain drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">
                  IBMA <span className="text-amber-400">Accounting Ltd</span>
                </span>
                <p className="text-xs text-slate-400">Accounting and Tax Services</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {COMPANY_INFO.subtitle[language]}
            </p>

            {SITE.trust.showCraBadge && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>{SITE.trust.craBadge[language]}</span>
              </div>
            )}
          </div>

          <nav id="footer-navigation" aria-label={language === 'ar' ? 'أقسام الموقع' : language === 'fr' ? 'Navigation du site' : 'Site sections'} className="lg:col-span-5 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {language === 'ar' ? 'أقسام الموقع' : language === 'fr' ? 'Navigation' : 'Quick Navigation'}
            </h4>
            <ul className="grid grid-cols-2 grid-rows-3 grid-flow-col gap-x-4 gap-y-1 text-sm text-slate-400 [&_button]:min-h-11 [&_button]:text-start">
              <li>
                <button onClick={() => scrollTo('hero')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.home[language]}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('self-employed')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.selfEmployed[language]}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('about')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.about[language]}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('services')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.services[language]}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('booking')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.booking[language]}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('contact')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.contact[language]}
                </button>
              </li>
            </ul>
          </nav>

        </div>

        {/* Bottom Bar: Copyright & Designer Credit Link */}
        <div className="pt-4 space-y-3 text-center text-xs text-slate-400">
          
          <p className="leading-relaxed">
            © {currentYear} {t.rights[language]} • {t.locationBadge[language]}
          </p>

          <p>
            <a id="privacy-link" href={pathFor(language, 'privacy')} className="inline-flex min-h-11 items-center text-slate-300 underline underline-offset-4 hover:text-amber-300">
              {{ ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de confidentialité' }[language]}
            </a>
          </p>

          {/* Designer credit (English on every language) linking to https://www.alaadigital.at */}
          <p id="site-credit" dir="ltr" className="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-1 leading-relaxed">
            <span className="text-slate-400">by</span>
            <a
              href={ASSETS.designerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-amber-400 font-bold hover:text-amber-300 hover:underline"
            >
              {ASSETS.designerName}
            </a>
          </p>

        </div>

      </div>
    </footer>
  );
};
