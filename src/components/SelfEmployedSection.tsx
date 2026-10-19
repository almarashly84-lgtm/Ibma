import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT } from '../i18n/translations';
import { ASSETS } from '../i18n/assets';
import { CheckCircle2, Calendar, Stethoscope, HardHat, Truck, Briefcase } from 'lucide-react';

interface SelfEmployedSectionProps {
  onOpenBooking: () => void;
}

export const SelfEmployedSection: React.FC<SelfEmployedSectionProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const t = UI_TEXT.selfEmployed;

  const audienceIcons = [
    <Stethoscope key="1" className="w-5 h-5 text-amber-400" />,
    <HardHat key="2" className="w-5 h-5 text-amber-400" />,
    <Truck key="3" className="w-5 h-5 text-amber-400" />,
    <Briefcase key="4" className="w-5 h-5 text-amber-400" />
  ];

  return (
    <section id="self-employed" className="py-10 sm:py-16 bg-[#090D14] border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Left Column: Poster Image */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-[#121822] shadow-2xl shadow-black">
              <img
                src={ASSETS.selfEmployedImage}
                alt="IBMA Accounting Services for Self-Employed"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5">
                <p className="text-amber-400 font-bold text-sm">
                  {t.slogan[language]}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Checklist, Target Sectors */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              {t.badge[language]}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t.title[language]}
            </h2>

            <p className="text-base sm:text-lg text-amber-300/90 font-medium leading-relaxed bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
              «{t.slogan[language]}»
            </p>

            {/* 5 Core Checklist Points */}
            <div className="space-y-3 pt-2">
              {t.points.map((pt, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#111722] border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-200">{pt[language]}</span>
                </div>
              ))}
            </div>

            {/* Target Sectors */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.audiencesTitle[language]}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {t.audiences.map((aud, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
                      {audienceIcons[idx]}
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{aud[language]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.cta[language]}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
