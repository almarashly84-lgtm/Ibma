import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, COMPANY_INFO } from '../i18n/translations';
import {
  Award,
  ShieldCheck,
  CheckCircle,
  FileText,
  Calendar,
  Briefcase
} from 'lucide-react';

interface AboutOwnerSectionProps {
  onOpenBooking: () => void;
}

export const AboutOwnerSection: React.FC<AboutOwnerSectionProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const t = UI_TEXT.owner;

  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{t.badge[language]}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.title[language]}
          </h2>
        </div>

        {/* Profile Card & Bio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-sm">
          
          {/* Left Column: Official Photograph */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group">
              {/* Outer Glow & Gradient Ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-[#1E3A8A] to-[#0F2847] rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>

              {/* Photo Container */}
              <div className="relative w-64 sm:w-72 md:w-80 h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-200">
                <img
                  src={COMPANY_INFO.ownerPhoto}
                  alt="المحاسب إبراهيم - خبرة أكثر من 15 سنة في المحاسبة المالية والضرائب"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Bottom Overlay Badge on Photo */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent text-white">
                  <p className="font-extrabold text-lg text-amber-300">{t.name[language]}</p>
                  <p className="text-xs text-slate-200 font-medium">{t.role[language]}</p>
                </div>
              </div>
            </div>

            {/* CRA Accreditation Pill */}
            <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.verifiedBadge[language]}</span>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Stats */}
          <div className="lg:col-span-7 space-y-6">
            
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.name[language]}
              </h3>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">
                {t.role[language]}
              </p>
            </div>

            {/* Bio Paragraphs */}
            <div className="space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{t.bioP1[language]}</p>
              <p>{t.bioP2[language]}</p>
            </div>

            {/* Stats Counter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {t.stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
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
