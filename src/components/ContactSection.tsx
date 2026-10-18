import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, WORKING_HOURS, COMPANY_INFO } from '../i18n/translations';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { language } = useLanguage();
  const t = UI_TEXT.contact;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(COMPANY_INFO.address);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  };

  // Canadian Eastern Time approximate check
  const isCurrentlyOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 0) return false;
    if (day === 6) return hour >= 10 && hour < 16;
    return hour >= 10 && hour < 18;
  };

  const openNow = isCurrentlyOpen();

  return (
    <section id="contact" className="py-10 sm:py-12 bg-[#080C14] border-t border-slate-800 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.badge[language]}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.title[language]}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                openNow
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {openNow ? t.todayStatusOpen[language] : t.todayStatusClosed[language]}
            </span>

          </div>
        </div>

        {/* Compact Two-Column Row: 4 Small Chips on Left, Narrow Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 4 Small Contact Chips (Phone, Email, Address, Hours) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* 1. Phone Chip */}
            <div
              id="contact-phone"
              className="p-3.5 rounded-xl bg-[#0E1420] border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.phoneTitle[language]}
                </span>
                <a href={`tel:${COMPANY_INFO.phoneClean}`} aria-label={`${t.callBtn[language]} ${COMPANY_INFO.phone}`} className="inline-flex min-h-11 max-w-full flex-col justify-center hover:text-amber-300 transition-colors">
                  <span className="text-xs sm:text-sm font-bold text-white" dir="ltr">{COMPANY_INFO.phone}</span>
                  <span className="text-[10px] text-amber-300">{t.callBtn[language]}</span>
                </a>
              </div>
              <a id="contact-whatsapp" href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={UI_TEXT.floating.whatsapp[language]} title={UI_TEXT.floating.whatsapp[language]} className="w-11 h-11 shrink-0 inline-flex flex-col items-center justify-center gap-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span className="text-[9px] leading-3">{t.whatsappBtn[language]}</span>
              </a>
            </div>

            {/* 2. Email Chip */}
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="p-3.5 rounded-xl bg-[#0E1420] border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.emailTitle[language]}
                </span>
                <p className="text-xs sm:text-sm font-bold text-white truncate" dir="ltr">
                  {COMPANY_INFO.email}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  24h Response
                </span>
              </div>
            </a>

            {/* 3. Address Chip */}
            <div id="contact-address" className="p-3.5 rounded-xl bg-[#0E1420] border border-slate-800 grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-2 items-start sm:col-span-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.addressTitle[language]}
                </span>
                <p id="office-address" dir="ltr" className="text-xs sm:text-sm font-bold text-white leading-snug text-start select-text">
                  {COMPANY_INFO.address}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Nepean Business Park • Free Parking
                </span>
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-2">
                <button id="copy-address" type="button" onClick={copyAddress} aria-label={t.copyAddress[language]} className="inline-flex min-h-11 items-center justify-center gap-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800 text-[11px] text-white hover:bg-slate-700 transition-colors">
                  {copyStatus === 'success' ? <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{t.copyAddress[language]}</span>
                </button>
                <a id="address-directions" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY_INFO.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 px-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-300 hover:bg-amber-500/20 transition-colors">
                  <Navigation className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.directionsBtn[language]}</span>
                </a>
              </div>
              {copyStatus !== 'idle' && <p role="status" className={`col-span-2 text-xs leading-relaxed ${copyStatus === 'success' ? 'text-emerald-400' : 'text-amber-300'}`}>{copyStatus === 'success' ? t.copied[language] : t.copyError[language]}</p>}
            </div>

            {/* 4. Hours Summary Chip */}
            <div className="p-3.5 rounded-xl bg-[#0E1420] border border-slate-800 flex items-start gap-3 sm:col-span-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.hoursTitle[language]}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{WORKING_HOURS[0].day[language]}:</span>
                    <span className="text-white font-semibold" dir="ltr">{WORKING_HOURS[0].hours[language]}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{WORKING_HOURS[1].day[language]}:</span>
                    <span className="text-white font-semibold" dir="ltr">{WORKING_HOURS[1].hours[language]}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Compact Google Map (Reduced Height, Sleek Frame) */}
          <div className="lg:col-span-5 h-44 sm:h-52 lg:h-full min-h-[170px] rounded-2xl overflow-hidden border border-slate-800 shadow-md relative group">
            <iframe
              title="IBMA Accounting Office Location"
              src={COMPANY_INFO.mapEmbedUrl}
              width="100%"
              height="100%"
              className="w-full h-full border-0 filter grayscale-[20%] contrast-105 group-hover:grayscale-0 transition-all duration-300"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-2 start-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Nepean, ON</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
