import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES_LIST, UI_TEXT, ASSETS } from '../i18n/translations';
import { ServiceItem } from '../types';
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
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HeroOrbit3DProps {
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  FileSpreadsheet: <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />,
  BookOpenCheck: <BookOpenCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
  ClipboardCheck: <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
  Building2: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
  TrendingUp: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
  Receipt: <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />,
  Users: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />,
  Scale: <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
};

export const HeroOrbit3D: React.FC<HeroOrbit3DProps> = ({
  onSelectService,
  onOpenBooking
}) => {
  const { language, dir } = useLanguage();
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [motionAllowed, setMotionAllowed] = useState<boolean>(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [activeHoveredIndex, setActiveHoveredIndex] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const isRotating = motionAllowed && activeHoveredIndex === null;

  // Smooth continuous rotation
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      if (!document.hidden) setRotationAngle((prev) => (prev + 0.7) % 360);
    }, 60);
    return () => clearInterval(interval);
  }, [isRotating]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setMotionAllowed(!preference.matches);
    preference.addEventListener('change', onChange);
    return () => preference.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const resize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const totalServices = SERVICES_LIST.length;
  // Radius for circular positioning
  const orbitRadiusDesktop = 270; // px
  const orbitRadiusMobile = Math.max(90, (Math.min(360, viewportWidth - 32) - 80) / 2);

  return (
    <section id="hero" className="relative bg-gradient-to-b from-[#080B10] via-[#0E141D] to-[#0A0D13] overflow-hidden pt-4 pb-10 sm:pt-6 sm:pb-14 flex flex-col justify-start">
      
      {/* Background Decorative Grid and Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col items-center">
        
        {/* 1. TOP SECTION: 3D Official Transparent Logo & Orbiting Services */}
        <div className="w-full max-w-4xl flex flex-col items-center justify-center pb-3 sm:pb-4">
          
          {/* One-line instruction, placed just above the service orbit. */}
          <div className="flex items-center justify-center gap-2 w-full max-w-xl px-2 py-2 mb-3 sm:mb-8 rounded-full bg-slate-900/95 border border-amber-500/40 text-slate-300 backdrop-blur-md shadow-lg shadow-amber-500/10">
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span id="orbit-instruction" className="font-bold text-white text-[clamp(11px,3.1vw,14px)] sm:text-sm whitespace-nowrap leading-5">
                {language === 'ar' ? 'مدار خدمات IBMA التفاعلي • اضغط على أي خدمة' : language === 'fr' ? 'Services IBMA • Cliquez sur un service' : 'IBMA Services Orbit • Click any service'}
              </span>
          </div>

          {/* Interactive Orbit Stage */}
          <div id="services-orbit" role="group" aria-labelledby="orbit-instruction" className="relative w-[min(360px,calc(100vw-32px))] h-[360px] sm:w-[600px] sm:h-[600px] flex items-center justify-center perspective-1000">
            
            {/* Outer Circular Tracks */}
            <div className="absolute inset-0 rounded-full border border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.08)] pointer-events-none" />
            <div className="absolute inset-8 sm:inset-14 rounded-full border border-dashed border-slate-700/60 pointer-events-none" />
            <div className="absolute inset-20 sm:inset-32 rounded-full border border-amber-500/10 pointer-events-none" />

            {/* Central 3D Official Transparent Logo (No Background Box, High-Def 3D Chrome) */}
            <div role="button" tabIndex={0} aria-label={language === 'ar' ? 'طلب موعد' : language === 'fr' ? 'Demander un rendez-vous' : 'Request an appointment'} className="relative z-20 flex flex-col items-center justify-center group cursor-pointer" onClick={onOpenBooking} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenBooking(); } }}>
              {/* Soft Ambient Radial Glow Behind Transparent Logo (No Box/Card) */}
              <div className="absolute inset-0 w-52 sm:w-80 h-32 sm:h-52 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-amber-500/15 blur-2xl pointer-events-none group-hover:bg-amber-400/25 transition-all duration-500" />
              
              {/* Clean Transparent Cut-Out Logo with metallic reflection */}
              <div className="relative w-36 sm:w-72 md:w-84 max-w-[85vw] transition-transform duration-300 transform group-hover:scale-105 flex flex-col items-center">
                <img
                  src={ASSETS.officialLogo}
                  alt="IBMA Accounting and Tax Services Transparent 3D Logo"
                  className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] filter group-hover:drop-shadow-[0_12px_30px_rgba(245,158,11,0.35)]"
                />

                {/* Subtle CRA E-Filer Badge Under the Logo */}
                <div className="mt-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-lg shadow-black/80 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized CRA E-Filer • Canada</span>
                </div>
              </div>
            </div>

            {/* Orbiting Service Nodes with Text Labels */}
            {SERVICES_LIST.map((service, index) => {
              const stepAngle = (360 / totalServices) * index;
              const currentAngle = (stepAngle + rotationAngle) % 360;
              const rad = (currentAngle * Math.PI) / 180;

              // Responsive radius calculation
              const r = viewportWidth < 640 ? orbitRadiusMobile : orbitRadiusDesktop;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;

              const isHovered = activeHoveredIndex === index;

              return (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  aria-label={service.title[language]}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    transition: isRotating ? 'none' : 'transform 0.2s ease-out'
                  }}
                  onMouseEnter={() => {
                    setActiveHoveredIndex(index);
                  }}
                  onMouseLeave={() => {
                    setActiveHoveredIndex(null);
                  }}
                  onFocus={() => setActiveHoveredIndex(index)}
                  onBlur={() => setActiveHoveredIndex(null)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectService(service); } }}
                  onClick={() => onSelectService(service)}
                  className="absolute z-30 group cursor-pointer flex flex-col items-center"
                >
                  {/* Service Node Card */}
                  <div
                    className={`relative flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 ${
                      isHovered
                        ? 'scale-125 bg-amber-500 text-black border-2 border-white gold-glow-lg z-40'
                        : 'bg-gradient-to-br from-[#1C2533] to-[#0E131A] text-amber-400 border border-amber-500/40 shadow-xl shadow-black/80 hover:border-amber-400'
                    }`}
                  >
                    {/* Node Number Badge */}
                    <span className={`absolute -top-1.5 -right-1.5 text-[8px] sm:text-[9px] font-black px-1 rounded-full ${
                      isHovered ? 'bg-black text-amber-400' : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}>
                      {service.number}
                    </span>

                    {/* Icon */}
                    {ICON_MAP[service.iconName] || <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  {/* Explicit Text Label under/beside the Node (Requested by User) */}
                  <div className="mt-1 max-w-[70px] sm:max-w-[95px] text-center pointer-events-none">
                    <span className="text-[9px] sm:text-[11px] font-bold text-slate-200 line-clamp-3 bg-[#0A0D13]/80 px-1 py-0.5 rounded border border-slate-800 shadow">
                      {service.title[language]}
                    </span>
                  </div>

                  {/* Full Tooltip on Hover / Focus */}
                  <div
                    aria-hidden="true"
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 sm:w-60 p-3 rounded-xl bg-slate-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-200 z-50 ${
                      isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 pb-1 border-b border-slate-800">
                      <span>#{service.number}</span>
                      <span className="truncate">{service.title[language]}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {service.description[language]}
                    </p>
                    <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
                      <span>{language === 'ar' ? 'انقر للتفاصيل والحجز' : 'Click to View & Book'}</span>
                      <ArrowRight className={`w-3 h-3 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* 2. BOTTOM SECTION: Titles, Description & Action Buttons (Positioned below the Orbit) */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-semibold text-amber-400 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{UI_TEXT.hero.badge[language]}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {language === 'ar' ? (
              <>
                شريكك المالي والضريبي المعتمد <br />
                <span className="gold-text-gradient">IBMA Accounting and Tax Services</span>
              </>
            ) : (
              <>
                Your Certified Tax & Financial Partner <br />
                <span className="gold-text-gradient">IBMA Accounting and Tax Services</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {UI_TEXT.hero.subtitle[language]}
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105"
            >
              <Calendar className="w-4 h-4" />
              <span>{UI_TEXT.hero.bookBtn[language]}</span>
            </button>
            <a
              href="#services"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-900/90 text-slate-200 border border-slate-700 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
            >
              <span>{UI_TEXT.hero.exploreBtn[language]}</span>
              <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
