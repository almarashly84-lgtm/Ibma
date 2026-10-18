import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, ASSETS } from '../i18n/translations';
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  BookOpenCheck,
  Users,
  Receipt,
  ShieldCheck,
  Building2,
  FileText,
  Scale,
  ZoomIn,
  X
} from 'lucide-react';

interface ExpertiseBusinessSectionProps {
  onOpenBooking: (serviceName?: string) => void;
}

const EXPERTISE_ICONS = [
  <TrendingUp className="w-5 h-5 text-amber-400" />,
  <BookOpenCheck className="w-5 h-5 text-amber-400" />,
  <Users className="w-5 h-5 text-amber-400" />,
  <Receipt className="w-5 h-5 text-amber-400" />,
  <ShieldCheck className="w-5 h-5 text-amber-400" />,
  <Building2 className="w-5 h-5 text-amber-400" />,
  <FileText className="w-5 h-5 text-amber-400" />,
  <Scale className="w-5 h-5 text-amber-400" />
];

export const ExpertiseBusinessSection: React.FC<ExpertiseBusinessSectionProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const t = UI_TEXT.businessNeeds;
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const activeItem = activeItemIndex !== null ? t.items[activeItemIndex] : null;

  return (
    <section id="business-needs" className="py-16 sm:py-20 bg-[#0B0F17] border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            {t.badge[language]}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t.title[language]}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300">
            {language === 'ar'
              ? 'حلول متكاملة في شبكة أيقونات مدمجة - انقر على أي مجال للزووم والاطلاع على التفاصيل والحجز'
              : language === 'fr'
              ? 'Solutions intégrées en grille compacte - Cliquez sur un domaine pour zoomer et réserver'
              : 'Integrated solutions in a compact icon grid - Click any capability to zoom and book'}
          </p>
        </div>

        {/* Content Layout */}
        <div className="space-y-8">
          
          {/* Top Banner / Poster */}
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-amber-600/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-[#121822] shadow-2xl shadow-black">
              <img
                src={ASSETS.businessNeedsImage}
                alt="Our Expertise Meet All of Your Business Needs"
                className="w-full h-auto max-h-[320px] object-cover transform group-hover:scale-101 transition-transform duration-500"
              />
            </div>
          </div>

          {/* 8 Business Capabilities in Compact Side-by-Side Modern Grid (4 cols on desktop, 2 cols on mobile) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {t.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveItemIndex(idx)}
                className="group relative p-3.5 sm:p-4 rounded-2xl bg-[#121822] border border-slate-800 hover:border-amber-400/80 hover:bg-[#161F2C] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/15 active:scale-95 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-black transition-all">
                      {EXPERTISE_ICONS[idx % EXPERTISE_ICONS.length]}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {item.title[language]}
                  </h4>
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <ZoomIn className="w-3 h-3" />
                    <span>{language === 'ar' ? 'زووم' : 'Zoom'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBooking(item.title[language]);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors font-bold text-[10px]"
                  >
                    {language === 'ar' ? 'حجز' : 'Book'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Interactive Zoom / Detail Modal for Business Capabilities */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveItemIndex(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0F172A] rounded-2xl shadow-2xl border border-amber-500/40 p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  {EXPERTISE_ICONS[activeItemIndex! % EXPERTISE_ICONS.length]}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {language === 'ar' ? 'حلول الشركات المعتمدة' : 'Corporate Certified Solution'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    {activeItem.title[language]}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveItemIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-slate-200">
                {activeItem.desc[language]}
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'خدمة محاسبية احترافية معتمدة وفق المعايير واللوائح الكندية'
                    : 'Certified professional accounting in full compliance with Canadian laws'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  const serviceName = activeItem.title[language];
                  setActiveItemIndex(null);
                  onOpenBooking(serviceName);
                }}
                className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'ar' ? 'احجز موعد لهذه الخدمة الآن' : 'Book Appointment for this Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
