import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, COMPANY_INFO } from '../i18n/translations';
import { ServiceItem } from '../types';
import {
  X,
  Calendar,
  CheckCircle,
  Phone,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  Building2,
  TrendingUp,
  Receipt,
  Users,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookService: (service: ServiceItem) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  onClose,
  onBookService,
}) => {
  const { language, dir } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    if (!service) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]') || [])
      .filter((element) => !element.hasAttribute('disabled') && element.getClientRects().length > 0);
    (focusable()[0] || dialog)?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) { e.preventDefault(); dialog?.focus(); return; }
        if (e.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [service, onClose]);

  if (!service) return null;

  const t = UI_TEXT.modal;

  const getIcon = (name: string) => {
    const cls = 'w-7 h-7 text-amber-400';
    switch (name) {
      case 'FileSpreadsheet': return <FileSpreadsheet className={cls} />;
      case 'Calculator': return <Calculator className={cls} />;
      case 'ShieldCheck': return <ShieldCheck className={cls} />;
      case 'Building2': return <Building2 className={cls} />;
      case 'TrendingUp': return <TrendingUp className={cls} />;
      case 'Receipt': return <Receipt className={cls} />;
      case 'Users': return <Users className={cls} />;
      case 'FileText': return <FileText className={cls} />;
      case 'Award': return <Award className={cls} />;
      default: return <Calculator className={cls} />;
    }
  };

  const detailedDescription =
    service.fullDesc?.[language] ||
    service.description?.[language] ||
    (language === 'ar' ? 'خدمة محاسبية وضريبية متكاملة تقدمها شركة IBMA Accounting Ltd' : 'Comprehensive accounting and tax service by IBMA Accounting Ltd');

  const benefitsList = service.benefits?.[language] || [];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-[#0D131D] text-slate-100 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-2 border-amber-500/50 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        {/* Header with Dark Luxury Gradient & Gold Accent */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#080D15] via-[#101726] to-[#0A101A] border-b border-amber-500/30 flex items-start justify-between">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              {getIcon(service.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-black shadow-sm">
                  {language === 'ar' ? `الخدمة #${service.number}` : `Service #${service.number}`}
                </span>
                <span className="text-[11px] text-amber-300 font-mono tracking-wider">
                  IBMA Accounting Ltd
                </span>
              </div>
              <h3 id="service-modal-title" className="text-lg sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
                {service.title?.[language] || ''}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-sm">
          
          {/* Detailed Description */}
          <div className="bg-[#121927] p-4 sm:p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'وصف تفصيلي للخدمة' : language === 'fr' ? 'Description détaillée' : 'Detailed Overview'}</span>
            </h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {detailedDescription}
            </p>
          </div>

          {/* Key Deliverables & Advantages */}
          {benefitsList.length > 0 && (
            <div className="bg-[#121927] p-4 sm:p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.keyAdvantages?.[language] || (language === 'ar' ? 'أبرز المزايا والمخرجات' : 'Key Advantages')}</span>
              </h4>
              <ul className="space-y-2.5">
                {benefitsList.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-sm shadow-amber-400"></span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct Phone Assistance Prompt */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30">
            <span className="font-medium">
              {language === 'ar' ? 'هل لديك أسئلة محددة عن متطلبات هذه الخدمة؟ تواصل معنا مباشرة:' : 'Questions regarding this service? Call us directly:'}
            </span>
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{COMPANY_INFO.phone}</span>
            </a>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-[#090E17] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/80"
          >
            {t.close?.[language] || (language === 'ar' ? 'إغلاق' : 'Close')}
          </button>

          <button
            onClick={() => {
              onBookService(service);
              onClose();
            }}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-500 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>{t.instantBook?.[language] || (language === 'ar' ? 'احجز هذه الخدمة الآن' : 'Book This Service Now')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
