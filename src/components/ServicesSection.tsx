import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES_LIST, UI_TEXT } from '../i18n/translations';
import { ServiceItem } from '../types';
import { PosterSlider } from './PosterSlider';
import {
  FileSpreadsheet,
  BookOpenCheck,
  ClipboardCheck,
  Building2,
  TrendingUp,
  Receipt,
  Users,
  ShieldAlert,
  Scale,
  Calendar,
  ZoomIn,
  Sparkles
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
  onBookService: (service: ServiceItem) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  FileSpreadsheet: <FileSpreadsheet className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  BookOpenCheck: <BookOpenCheck className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  ClipboardCheck: <ClipboardCheck className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  Building2: <Building2 className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  TrendingUp: <TrendingUp className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  Receipt: <Receipt className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  Users: <Users className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />,
  Scale: <Scale className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onBookService
}) => {
  const { language } = useLanguage();
  const t = UI_TEXT.services;

  return (
    <section id="services" className="py-10 sm:py-16 bg-[#0A0E15] border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* One section for all IBMA services and integrated solutions */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.badge[language]}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t.title[language]}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300">
            {t.subtitle[language]}
          </p>
        </div>

        <PosterSlider />

        {/* Compact icon tiles: 2 per row on phones, 3 on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4.5">
            {SERVICES_LIST.map((service) => (
              <div
                key={service.id}
                onClick={() => onSelectService(service)}
                className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#131924] to-[#0D121B] border border-slate-800 hover:border-amber-400/80 hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Amber Glow Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500 pointer-events-none" />

                {/* Top: Icon + Number Badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300 shadow-sm">
                      {ICON_MAP[service.iconName] || <FileSpreadsheet className="w-6 h-6 text-amber-400" />}
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-amber-400 group-hover:border-amber-400/50 transition-colors">
                      #{service.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {service.title[language]}
                  </h3>
                </div>

                {/* Bottom: Zoom / Details Action Bar */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(service);
                    }}
                    className="p-1 sm:px-2 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-400 hover:text-amber-200 hover:bg-amber-500/10 flex items-center gap-1 transition-all"
                    title={{ ar: 'انقر لعرض تفاصيل الخدمة', en: 'Click to view service details', fr: 'Cliquez pour voir les détails du service' }[language]}
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>{{ ar: 'تفاصيل', en: 'Details', fr: 'Détails' }[language]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookService(service);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-black border border-amber-500/40 transition-colors flex items-center gap-1"
                    title={{ ar: 'احجز مباشرة', en: 'Book directly', fr: 'Réserver directement' }[language]}
                  >
                    <Calendar className="w-3 h-3" />
                    <span className="hidden sm:inline">{{ ar: 'حجز', en: 'Book', fr: 'Réserver' }[language]}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

      </div>
    </section>
  );
};
