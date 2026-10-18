import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, COMPANY_INFO, ASSETS } from '../i18n/translations';
import { ShieldCheck, ExternalLink, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = UI_TEXT.footer;
  const currentYear = new Date().getFullYear();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#070A0F] text-slate-300 border-t border-slate-800 pt-16 pb-28 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Contact Info Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Mission (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
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

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authorized CRA Representative & E-Filer</span>
            </div>
          </div>

          {/* Quick Nav Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {language === 'ar' ? 'أقسام الموقع' : language === 'fr' ? 'Navigation' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
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
                <button onClick={() => scrollTo('business-needs')} className="hover:text-amber-400 transition-colors">
                  {UI_TEXT.nav.businessNeeds[language]}
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
          </div>

          {/* Contact Details Side-by-Side (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {language === 'ar' ? 'معلومات التواصل المباشر' : language === 'fr' ? 'Coordonnées Directes' : 'Direct Contact'}
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5" dir="ltr">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${COMPANY_INFO.phoneClean}`} className="hover:text-amber-400 hover:underline font-semibold">
                  {COMPANY_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5" dir="ltr">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-amber-400 hover:underline">
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.workingHours.weekdays[language]}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Designer Credit Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <p>
            © {currentYear} {t.rights[language]} • {t.locationBadge[language]}
          </p>

          {/* Designer Credit with direct link to https://www.alaadigital.at */}
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors">
            <span className="text-slate-400">{t.designerSignature[language]}</span>
            <a
              href={ASSETS.designerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 font-bold hover:text-amber-300 hover:underline"
            >
              <span>{ASSETS.designerName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};
