import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT } from '../i18n/translations';
import { ASSETS } from '../i18n/assets';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface TaxCampaignSectionProps {
  onOpenBooking: () => void;
}

export const TaxCampaignSection: React.FC<TaxCampaignSectionProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const t = UI_TEXT.taxCampaign;

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-[#0C1017] via-[#161D29] to-[#0C1017] border-y border-amber-500/30 relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Poster Image */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black/60 shadow-2xl shadow-amber-500/10 max-w-md mx-auto">
              <img
                src={ASSETS.taxCampaignImage}
                alt="Need a hand with your taxes? Let us make things easy!"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column: Catchy Text and Direct Booking Action */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-start">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{{ ar: 'دعم ضريبي وراحة بال', en: 'CRA Tax Support & Peace of Mind', fr: 'Soutien fiscal et tranquillité d’esprit' }[language]}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {t.title[language]}
            </h2>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              {t.subtitle[language]}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105"
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
