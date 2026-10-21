import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NAV_ITEMS, COMPANY_INFO, UI_TEXT } from '../i18n/translations';
import { ASSETS } from '../i18n/assets';
import { Phone, Menu, X, Globe } from 'lucide-react';
import { SITE } from '../content/apply';
import { track } from '../lib/track';
import { pathFor } from '../lib/route';
import { Language } from '../types';

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const callUs = { ar: 'اتصل بنا', en: 'Call us', fr: 'Appelez-nous' }[language];

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `${pathFor(language, 'home')}#${id}`;
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'AR' },
    { code: 'en', label: 'ENG' },
    { code: 'fr', label: 'FR' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090D13]/95 backdrop-blur-md border-b border-amber-500/30 shadow-xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Brand Logo - Enlarged and prominent without clutter */}
          <button type="button" aria-label="IBMA — Home / الرئيسية" className="flex items-center gap-3 cursor-pointer group py-1 shrink-0" onClick={() => scrollTo('hero')}>
            <div className="relative h-14 sm:h-16 md:h-20 w-auto transition-transform group-hover:scale-105 flex items-center">
              <img
                src={ASSETS.officialLogo}
                alt="IBMA Accounting Ltd Official Logo"
                className="h-full w-auto max-w-[26vw] sm:max-w-none max-h-16 sm:max-h-20 object-contain drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]"
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
                IBMA {SITE.trust.showCraBadge && <span className="text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">CRA E-Filer</span>}
              </span>
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                Accounting & Tax Services
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3.5 py-2 rounded-lg text-xs xl:text-sm font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 transition-all"
              >
                {item.label[language]}
              </button>
            ))}
          </nav>

          {/* Actions: Languages & Direct Phone (Booking button removed as requested) */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Language Selector: ENG, FR, AR (Clean and concise) */}
            <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 text-xs">
              <Globe className="hidden sm:block w-4 h-4 text-amber-400 ml-1.5 mr-1" />
              {languages.map((l) => (
                <button
                  key={l.code}
                    type="button"
                    aria-pressed={language === l.code}
                    lang={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-1.5 sm:px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                    language === l.code
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* "Call us" icon (the number itself is in the contact section) */}
            <a
              id="header-call"
              href={`tel:${COMPANY_INFO.phoneClean}`}
              onClick={() => track('call', language)}
              aria-label={`${callUs} ${COMPANY_INFO.phone}`}
              title={`${callUs} ${COMPANY_INFO.phone}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:px-3.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-400 hover:text-black transition-all shadow-sm"
            >
              <Phone className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{callUs}</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              type="button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-[#0C1118] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="w-full text-start px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
              >
                {item.label[language]}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              onClick={() => track('call', language)}
              className="flex items-center justify-center gap-2 min-h-11 rounded-lg bg-amber-500/10 text-amber-200 text-sm font-semibold border border-amber-500/40"
            >
              <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>{callUs}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
