import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NAV_ITEMS, COMPANY_INFO, ASSETS, UI_TEXT } from '../i18n/translations';
import { Phone, Calendar, Menu, X, Globe, Shield } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const { language, setLanguage, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
                IBMA <span className="text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">CRA E-Filer</span>
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

            {/* Direct Phone Call Button */}
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-100 border border-slate-700 hover:border-amber-500/60 hover:text-amber-300 transition-all shadow-sm"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{COMPANY_INFO.phone}</span>
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
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700"
              dir="ltr"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>{COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
