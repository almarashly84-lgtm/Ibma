import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../content/apply';
import { ASSETS } from '../i18n/assets';

const BUILTIN: Record<string, string> = {
  'builtin:business-needs': ASSETS.businessNeedsImage,
  'builtin:self-employed': ASSETS.selfEmployedImage,
  'builtin:tax-campaign': ASSETS.taxCampaignImage,
};

const INTERVAL_MS = 5000;

const COPY = {
  ar: { label: 'صور خدمات IBMA', prev: 'الصورة السابقة', next: 'الصورة التالية', pause: 'إيقاف التمرير التلقائي', play: 'تشغيل التمرير التلقائي', slide: (i: number, n: number) => `الصورة ${i} من ${n}` },
  en: { label: 'IBMA service posters', prev: 'Previous image', next: 'Next image', pause: 'Pause automatic sliding', play: 'Start automatic sliding', slide: (i: number, n: number) => `Image ${i} of ${n}` },
  fr: { label: 'Affiches des services IBMA', prev: 'Image précédente', next: 'Image suivante', pause: 'Mettre en pause le défilement', play: 'Reprendre le défilement', slide: (i: number, n: number) => `Image ${i} sur ${n}` },
};

/** Automatic image slider (posters designed for IBMA + images added from the dashboard). */
export const PosterSlider: React.FC = () => {
  const { language, dir } = useLanguage();
  const c = COPY[language];
  const rtl = dir === 'rtl';
  const slides = SITE.slider.slides
    .map((s) => ({ src: BUILTIN[s.src] ?? s.src, alt: s.alt[language] || s.alt.en || 'IBMA Accounting Ltd' }))
    .filter((s) => !!s.src);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (!playing || hovered || focused || count < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, hovered, focused, count]);

  if (count === 0) return null;

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    // Swipe towards the start of the reading direction shows the next image.
    if (Math.abs(dx) > 40) go((dx < 0) !== rtl ? index + 1 : index - 1);
  };

  return (
    <div
      id="poster-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label={c.label}
      className="relative max-w-xl mx-auto mb-6 sm:mb-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(rtl ? index + 1 : index - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(rtl ? index - 1 : index + 1); }
      }}
    >
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/15 via-yellow-400/5 to-amber-600/15 blur-xl pointer-events-none" aria-hidden="true" />
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-amber-500/35 bg-[#0D121B] shadow-2xl shadow-black aspect-[10/9]"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `translateX(${rtl ? '' : '-'}${index * 100}%)` }}>
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={c.slide(i + 1, count)}
              aria-hidden={i !== index}
              className="w-full h-full shrink-0"
            >
              <img src={slide.src} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" className="w-full h-full object-contain" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="relative mt-3 flex items-center justify-center gap-2">
          <button type="button" onClick={() => go(index - 1)} aria-label={c.prev} className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-amber-500/40 bg-slate-900/90 text-amber-300 hover:bg-amber-500/20">
            {language === 'ar' ? <ChevronRight className="w-5 h-5" aria-hidden="true" /> : <ChevronLeft className="w-5 h-5" aria-hidden="true" />}
          </button>
          <div className="flex items-center" role="group" aria-label={c.label}>
            {slides.map((slide, i) => (
              <button key={slide.src} type="button" onClick={() => setIndex(i)} aria-label={c.slide(i + 1, count)} aria-current={i === index ? 'true' : undefined}
                className="w-7 h-10 inline-flex items-center justify-center">
                <span className={`block h-2 rounded-full transition-all ${i === index ? 'w-5 bg-amber-400' : 'w-2 bg-slate-600'}`} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label={c.next} className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-amber-500/40 bg-slate-900/90 text-amber-300 hover:bg-amber-500/20">
            {language === 'ar' ? <ChevronLeft className="w-5 h-5" aria-hidden="true" /> : <ChevronRight className="w-5 h-5" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? c.pause : c.play} aria-pressed={!playing}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white">
            {playing ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
};
