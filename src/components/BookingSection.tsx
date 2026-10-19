import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UI_TEXT, SERVICES_LIST, COMPANY_INFO } from '../i18n/translations';
import { BookingFormData, ServiceItem } from '../types';
import { availableTimes, bookingUrl, officeToday, validateBooking } from '../lib/booking';
import { track } from '../lib/track';
import { pathFor } from '../lib/route';
import { CONSENT_TEXT } from '../content/consent';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface BookingSectionProps {
  preselectedService: ServiceItem | null;
  onClearPreselectedService: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  preselectedService,
  onClearPreselectedService,
}) => {
  const { language } = useLanguage();
  const t = UI_TEXT.booking;

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    email: '',
    phone: '',
    serviceId: preselectedService ? preselectedService.id : SERVICES_LIST[0].id,
    preferredDate: '',
    preferredTime: '10:00 AM',
    notes: '',
    subscribe: false,
  });
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedOnServer, setSavedOnServer] = useState(false);
  const [sending, setSending] = useState(false);
  const [preparedUrl, setPreparedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const copy = {
    ar: {
      savedTitle: 'تم تسجيل طلب موعدك لدى المكتب', savedMessage: 'سيتواصل معك المكتب لتأكيد الموعد. الموعد غير مؤكد حتى يصلك تأكيد من المكتب. لرد أسرع يمكنك أيضًا إرسال الطلب عبر واتساب.',
      title: 'الطلب جاهز للإرسال عبر واتساب', message: 'تعذّر حفظ الطلب على الموقع الآن. لإكمال الطلب افتح واتساب وأرسل الرسالة، ثم انتظر تأكيد المكتب.',
      open: 'إرسال الطلب عبر واتساب', reset: 'طلب موعد آخر', submit: 'إرسال طلب الموعد', sending: 'جارٍ الإرسال...',
      notice: 'يُحفظ طلبك بأمان لدى المكتب فقط، ويمكنك أيضًا إرساله عبر واتساب. الموعد طلب بتوقيت أوتاوا وليس تأكيدًا للحجز.',
      privacy: 'لا تدخل رقم SIN أو معلومات الحسابات البنكية أو تفاصيل ضريبية حساسة في هذا النموذج.',
      contactHint: 'يكفي الهاتف أو البريد الإلكتروني.', optional: 'اختياري',
      policy: 'سياسة الخصوصية',
      timezone: 'الأوقات بتوقيت أوتاوا وحسب ساعات عمل المكتب.', none: 'لا توجد أوقات متاحة لهذا التاريخ',
      lead: 'احجز استشارتك المحاسبية أو الضريبية في دقيقة واحدة',
    },
    en: {
      savedTitle: 'Your appointment request has been received', savedMessage: 'The office will contact you to confirm. The appointment is not confirmed until you hear from the office. For a faster reply you can also send the request by WhatsApp.',
      title: 'Your WhatsApp request is ready', message: 'Your request could not be saved on the website right now. To complete it, open WhatsApp and send the message, then wait for the office to confirm.',
      open: 'Send the request by WhatsApp', reset: 'Request another appointment', submit: 'Send appointment request', sending: 'Sending...',
      notice: 'Your request is stored securely for the office only, and you can also send it by WhatsApp. This is a preferred time in Ottawa, not a confirmed booking.',
      privacy: 'Do not enter a SIN, bank account details, or sensitive tax information in this form.',
      contactHint: 'A phone number or an email is enough.', optional: 'Optional',
      policy: 'Privacy Policy',
      timezone: 'Times are in Ottawa time, within office hours.', none: 'No available times for this date',
      lead: 'Book your accounting or tax consultation in one minute',
    },
    fr: {
      savedTitle: 'Votre demande de rendez-vous a été reçue', savedMessage: 'Le bureau vous contactera pour confirmer. Le rendez-vous n’est pas confirmé tant que le bureau ne vous a pas répondu. Pour une réponse plus rapide, vous pouvez aussi envoyer la demande par WhatsApp.',
      title: 'Votre demande WhatsApp est prête', message: 'Votre demande n’a pas pu être enregistrée sur le site pour le moment. Pour la compléter, ouvrez WhatsApp et envoyez le message, puis attendez la confirmation du bureau.',
      open: 'Envoyer la demande par WhatsApp', reset: 'Demander un autre rendez-vous', submit: 'Envoyer la demande', sending: 'Envoi en cours...',
      notice: 'Votre demande est conservée de façon sécurisée pour le bureau seulement, et vous pouvez aussi l’envoyer par WhatsApp. L’heure souhaitée est celle d’Ottawa; le rendez-vous n’est pas confirmé.',
      privacy: 'N’indiquez pas de NAS, de coordonnées bancaires ni de renseignements fiscaux sensibles.',
      contactHint: 'Un téléphone ou un courriel suffit.', optional: 'Facultatif',
      policy: 'Politique de confidentialité',
      timezone: 'Heure d’Ottawa, pendant les heures du bureau.', none: 'Aucune heure disponible à cette date',
      lead: 'Réservez votre consultation comptable ou fiscale en une minute',
    },
  }[language];

  // Sync preselected service from prop
  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({
        ...prev,
        serviceId: preselectedService.id,
      }));
    }
  }, [preselectedService]);

  const timeSlots = availableTimes(formData.preferredDate);
  const timeSlotsKey = timeSlots.join(',');
  useEffect(() => {
    setFormData((prev) => timeSlots.includes(prev.preferredTime) ? prev : { ...prev, preferredTime: timeSlots[0] || '' });
  }, [timeSlotsKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setErrorMessage(null);

    const error = validateBooking(formData, language, SERVICES_LIST.map((service) => service.id));
    if (error) {
      setErrorMessage(error);
      return;
    }
    const selected = SERVICES_LIST.find((service) => service.id === formData.serviceId)!;
    setPreparedUrl(bookingUrl(formData, selected.title[language], language, COMPANY_INFO.whatsappUrl));
    setSending(true);
    let saved = false;
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language, website: honeypot }),
      });
      if (res.status === 400) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        setErrorMessage(body?.error || copy.message);
        setSending(false);
        return;
      }
      saved = res.ok;
    } catch {
      saved = false;
    }
    setSending(false);
    setSavedOnServer(saved);
    setIsSubmitted(true);
  };

  const selectedServiceItem = SERVICES_LIST.find((s) => s.id === formData.serviceId);

  return (
    <section id="booking" className="py-12 sm:py-16 bg-[#090D14] border-t border-slate-800 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.badge[language]}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.title[language]}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            {copy.lead}
          </p>
        </div>

        {/* Compact Form Card (Reduced Height, Multi-Column Layout) */}
        <div className="bg-[#0F141F] rounded-2xl border border-amber-500/30 shadow-2xl shadow-black p-5 sm:p-7 relative overflow-hidden">
          
          {isSubmitted ? (
            <div role="status" aria-live="polite" className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {savedOnServer ? copy.savedTitle : copy.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  {savedOnServer ? copy.savedMessage : copy.message}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-[#141C2B] border border-amber-500/30 text-xs text-amber-300">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <a href={preparedUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp', language)} className="font-bold underline">{copy.open}</a>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setPreparedUrl('');
                    setSavedOnServer(false);
                    setFormData({ fullName: '', email: '', phone: '', serviceId: SERVICES_LIST[0].id, preferredDate: '', preferredTime: '', notes: '', subscribe: false });
                    onClearPreselectedService();
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all"
                >
                  {copy.reset}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="booking-notice">
              <p id="booking-notice" className="text-xs leading-relaxed text-slate-300">{copy.notice}</p>
              <p className="text-xs text-amber-300">{copy.privacy}</p>
              <p className="text-[11px] text-slate-400">{copy.contactHint}</p>
              
              {/* Error Alert */}
              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Grid Row 1: Full Name, Phone, Email (3 columns on desktop, 1 on mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Full Name */}
                <div>
                  <label htmlFor="booking-name" className="block text-xs font-bold text-slate-300 mb-1">
                    {t.nameLabel[language]} <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                    <input
                      id="booking-name"
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t.namePlaceholder[language]}
                      className="w-full ps-9 pe-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="booking-phone" className="block text-xs font-bold text-slate-300 mb-1">
                    {t.phoneLabel[language]}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                    <input
                      id="booking-phone"
                      name="tel"
                      autoComplete="tel"
                      maxLength={30}
                      type="tel"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (613) ..."
                      className="w-full ps-9 pe-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="booking-email" className="block text-xs font-bold text-slate-300 mb-1">
                    {t.emailLabel[language]}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                    <input
                      id="booking-email"
                      name="email"
                      autoComplete="email"
                      maxLength={254}
                      type="email"
                      dir="ltr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full ps-9 pe-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Grid Row 2: Service Selection, Date, Time (3 columns on desktop, 1 on mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Service Selector */}
                <div>
                  <label htmlFor="booking-service" className="block text-xs font-bold text-slate-300 mb-1">
                    {t.serviceLabel[language]} <span className="text-amber-400">*</span>
                  </label>
                  <select
                    id="booking-service"
                    name="service"
                    required
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    {SERVICES_LIST.map((srv) => (
                      <option key={srv.id} value={srv.id} className="bg-slate-900 text-white">
                        #{srv.number} - {srv.title[language]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date */}
                <div>
                  <label htmlFor="booking-date" className="block text-xs font-bold text-slate-300 mb-1">
                    {t.dateLabel[language]} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="booking-date"
                    name="date"
                    required
                    type="date"
                    min={officeToday()}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label htmlFor="booking-time" className="block text-xs font-bold text-slate-300 mb-1">
                    {t.timeLabel[language]} <span className="text-amber-400">*</span>
                  </label>
                  <select
                    id="booking-time"
                    name="time"
                    required
                    aria-describedby="booking-timezone"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    {timeSlots.length === 0 && <option value="">{copy.none}</option>}
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot} className="bg-slate-900 text-white">
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes (Optional compact row) */}
              <div>
                <label htmlFor="booking-notes" className="block text-xs font-bold text-slate-300 mb-1">
                  {t.notesLabel[language]} <span className="text-slate-400 font-normal">({copy.optional})</span>
                </label>
                <input
                  id="booking-notes"
                  name="notes"
                  maxLength={500}
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t.notesPlaceholder[language]}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#141B28] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Optional subscription to offers (unticked by default) */}
              <label htmlFor="booking-subscribe" className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed cursor-pointer">
                <input id="booking-subscribe" type="checkbox" checked={!!formData.subscribe} onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })} className="mt-0.5 w-4 h-4 shrink-0 accent-amber-500" />
                <span>{CONSENT_TEXT.booking[language]} <a href={pathFor(language, 'privacy')} className="underline text-amber-300 hover:text-amber-200">{copy.policy}</a></span>
              </label>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="booking-website">Website</label>
                <input id="booking-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span id="booking-timezone" className="text-[11px] text-slate-400">
                  {copy.timezone}
                </span>

                <button
                  type="submit"
                  disabled={sending}
                  className="disabled:opacity-60 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                  <span>{sending ? copy.sending : copy.submit}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
