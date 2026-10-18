import type { BookingFormData, Language } from '../types';

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM'];

function officeClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

export function officeToday(now = new Date()) { return officeClock(now).date; }

function slotMinutes(slot: string) {
  const [time, period] = slot.split(' ');
  const [h, m] = time.split(':').map(Number);
  return (h % 12 + (period === 'PM' ? 12 : 0)) * 60 + m;
}

function validDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

export function availableTimes(date: string, now = new Date()) {
  if (!validDate(date)) return [];
  const clock = officeClock(now);
  if (date < clock.date) return [];
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (weekday === 0) return [];
  return TIME_SLOTS.filter((slot) =>
    (weekday !== 6 || slotMinutes(slot) < 16 * 60) &&
    (date !== clock.date || slotMinutes(slot) > clock.minutes)
  );
}

const errors = {
  ar: { name: 'يرجى إدخال اسم من 2 إلى 100 حرف.', contact: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني.', email: 'البريد الإلكتروني غير صالح.', phone: 'رقم الهاتف غير صالح.', date: 'اختر تاريخًا ووقتًا قادمين ضمن ساعات العمل بتوقيت أوتاوا (الأحد مغلق).', service: 'يرجى اختيار خدمة صحيحة.', notes: 'الملاحظات لا تتجاوز 500 حرف.' },
  en: { name: 'Please enter a name of 2–100 characters.', contact: 'Please provide a phone number or email.', email: 'Please enter a valid email.', phone: 'Please enter a valid phone number.', date: 'Choose a future date and time within Ottawa office hours (closed Sundays).', service: 'Please choose a valid service.', notes: 'Notes must be 500 characters or fewer.' },
  fr: { name: 'Veuillez saisir un nom de 2 à 100 caractères.', contact: 'Indiquez un téléphone ou un courriel.', email: 'Le courriel est invalide.', phone: 'Le numéro de téléphone est invalide.', date: 'Choisissez une date et une heure futures pendant les heures du bureau à Ottawa (fermé le dimanche).', service: 'Choisissez un service valide.', notes: 'Les notes ne doivent pas dépasser 500 caractères.' },
};

export function validateBooking(data: BookingFormData, language: Language, serviceIds: string[], now = new Date()) {
  const e = errors[language];
  if (data.fullName.trim().length < 2 || data.fullName.trim().length > 100) return e.name;
  if (!data.email.trim() && !data.phone.trim()) return e.contact;
  if (data.email && (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))) return e.email;
  if (data.phone && (!/^[+\d\s().-]+$/.test(data.phone) || !/^\d{7,15}$/.test(data.phone.replace(/\D/g, '')))) return e.phone;
  if (!serviceIds.includes(data.serviceId)) return e.service;
  if (!availableTimes(data.preferredDate, now).includes(data.preferredTime)) return e.date;
  if (data.notes.length > 500) return e.notes;
  return null;
}

export function bookingUrl(data: BookingFormData, service: string, language: Language, baseUrl: string) {
  const labels = {
    ar: ['طلب موعد — غير مؤكد', 'الاسم', 'البريد', 'الهاتف', 'الخدمة', 'التاريخ المفضل', 'الوقت المفضل (أوتاوا)', 'ملاحظات'],
    en: ['Appointment request — not confirmed', 'Name', 'Email', 'Phone', 'Service', 'Preferred date', 'Preferred time (Ottawa)', 'Notes'],
    fr: ['Demande de rendez-vous — non confirmée', 'Nom', 'Courriel', 'Téléphone', 'Service', 'Date souhaitée', 'Heure souhaitée (Ottawa)', 'Notes'],
  }[language];
  const values = [data.fullName, data.email, data.phone, service, data.preferredDate, data.preferredTime, data.notes];
  const message = [labels[0], ...values.map((value, i) => value.trim() ? `${labels[i + 1]}: ${value.trim()}` : '')].filter(Boolean).join('\n');
  const url = new URL(baseUrl);
  url.searchParams.set('text', message);
  return url.toString();
}
