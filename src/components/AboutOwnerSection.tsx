import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, COMPANY_INFO } from '../i18n/translations';
import {
  Award,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface AboutOwnerSectionProps {
  onOpenBooking: () => void;
}

export const AboutOwnerSection: React.FC<AboutOwnerSectionProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const t = UI_TEXT.owner;

  return (
    <section id="about" className="py-8 sm:py-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{t.badge[language]}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl leading-snug font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.title[language]}
          </h2>
        </div>

        {/* Profile Card & Bio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-center bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          
          {/* Left Column: Official Photograph */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="portrait-panel">
              <div id="ibrahim-portrait" className="portrait-scene">
                <span className="portrait-orbit portrait-orbit-outer" aria-hidden="true" />
                <span className="portrait-orbit portrait-orbit-inner" aria-hidden="true" />
                <img
                  src={COMPANY_INFO.ownerPhoto}
                  alt={`${t.name[language]} — ${t.role[language]}`}
                  className="portrait-photo"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-black/20 text-amber-100 border border-amber-400/20 text-[11px] sm:text-xs text-center font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{t.verifiedBadge[language]}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Stats */}
          <div className="lg:col-span-7 space-y-4">
            
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.name[language]}
              </h3>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">
                {t.role[language]}
              </p>
            </div>

            {/* Bio Paragraphs */}
            <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{t.bioP1[language]}</p>
              <p>{t.bioP2[language]}</p>
            </div>

            {/* Stats Counter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              {t.stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0F2847] dark:text-amber-400 font-sans block">
                    {stat.val}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
                    {stat.label[language]}
                  </span>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0F2847] hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95 border border-amber-400/30"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{t.consultBtn[language]}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
