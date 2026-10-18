import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_INFO } from '../i18n/translations';
import {
  MessageCircle,
  Phone,
  Mail,
  CalendarCheck,
} from 'lucide-react';

interface FloatingContactBarProps {
  onOpenBooking: () => void;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();

  return (
    <>
      {/* ========================================================
          1. LEFT SIDE FLOATING CAPSULE BAR
          Fixed precisely on the LEFT of the viewport on all screens
          Sleek small golden icons with smooth hover & tap feedback
          ======================================================== */}
      <aside
        aria-label="Social media floating capsule"
        className="fixed top-1/2 -translate-y-1/2 left-2 sm:left-3.5 z-50 hidden sm:flex flex-col items-center gap-2.5 sm:gap-3 py-3 px-1.5 sm:px-2 rounded-full bg-[#0D121B]/95 backdrop-blur-md border border-amber-500/50 shadow-[0_4px_30px_rgba(0,0,0,0.85)] transition-all hover:border-amber-400"
      >
        {/* Facebook */}
        <a
          href={COMPANY_INFO.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          className="text-amber-400 hover:text-amber-200 hover:scale-120 transition-all p-1"
        >
          <span aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 block font-bold text-center">f</span>
        </a>

        <div className="w-4 h-px bg-amber-500/30 my-0.5" />

        {/* Email */}
        <a
          href={`mailto:${COMPANY_INFO.email}`}
          title="Email"
          className="text-amber-400 hover:text-amber-200 hover:scale-120 transition-all p-1"
        >
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>

        {/* WhatsApp */}
        <a
          href={COMPANY_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
          className="text-amber-400 hover:text-emerald-400 hover:scale-120 transition-all p-1"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>

        {/* Direct Call */}
        <a
          href={`tel:${COMPANY_INFO.phoneClean}`}
          title="Phone"
          className="text-amber-400 hover:text-amber-200 hover:scale-120 transition-all p-1"
        >
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>

        {/* Quick Booking Anchor */}
        <button
          onClick={onOpenBooking}
          title={language === 'ar' ? 'حجز موعد' : 'Book Appointment'}
          className="text-black bg-amber-400 hover:bg-amber-300 rounded-full p-1.5 hover:scale-115 transition-all shadow-md shadow-amber-500/30 mt-0.5"
        >
          <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </aside>

      {/* ========================================================
          2. BOTTOM CONTACT BAR WITH TOP GOLDEN BORDER & VERTICAL ICONS
          Full width at the bottom of the page
          ======================================================== */}
      <footer
        aria-label="Bottom contact bar"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        className="fixed bottom-0 inset-x-0 w-full z-40 bg-[#050C18] border-t-2 border-amber-400/80 shadow-[0_-8px_30px_rgba(0,0,0,0.9)]"
      >
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-2.5">
          <div className="grid grid-cols-4 items-center text-center">
            
            {/* WhatsApp */}
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 group py-1 transition-transform hover:scale-105"
            >
              <div className="text-[#25D366] group-hover:brightness-110">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[#25D366] font-bold text-[11px] sm:text-xs tracking-wide">
                {language === 'ar' ? 'واتساب' : 'WhatsApp'}
              </span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="flex flex-col items-center justify-center gap-1 group py-1 transition-transform hover:scale-105"
            >
              <div className="text-white group-hover:text-slate-200">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-white font-bold text-[11px] sm:text-xs tracking-wide">
                {language === 'ar' ? 'اتصال' : language === 'fr' ? 'Appel' : 'Call'}
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="flex flex-col items-center justify-center gap-1 group py-1 transition-transform hover:scale-105"
            >
              <div className="text-white group-hover:text-slate-200">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-white font-bold text-[11px] sm:text-xs tracking-wide">
                {language === 'ar' ? 'بريد' : 'E-Mail'}
              </span>
            </a>

            {/* Instant Booking */}
            <button
              onClick={onOpenBooking}
              className="flex flex-col items-center justify-center gap-1 group py-1 transition-transform hover:scale-105"
            >
              <div className="text-amber-400 group-hover:text-amber-300">
                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-amber-400 font-bold text-[11px] sm:text-xs tracking-wide">
                {language === 'ar' ? 'حجز موعد' : language === 'fr' ? 'RDV' : 'Booking'}
              </span>
            </button>

          </div>
        </div>
      </footer>
    </>
  );
};
