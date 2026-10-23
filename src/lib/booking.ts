import type { BookingFormData, Language } from '../types';
import { officeClock, officeHours, slotMinutes, slotsForWeekday, type DayHours } from './hours.ts';

export function officeToday(now = new Date()) { return officeClock(now).date; }

function validDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

/** Bookable start times for a date (Ottawa time), using the office hours saved in the dashboard. */
export function availableTimes(date: string, now = new Date(), days: DayHours[] = officeHours()) {
  if (!validDate(date)) return [];
  const clock = officeClock(now);
  if (date < clock.date) return [];
  // Requests are accepted up to one year ahead.
  const limit = new Date(`${clock.date}T12:00:00Z`);
  limit.setUTCFullYear(limit.getUTCFullYear() + 1);
  if (date > limit.toISOString().slice(0, 10)) return [];
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return slotsForWeekday(weekday, days).filter((slot) => date !== clock.date || slotMinutes(slot) > clock.minutes);
}

const errors = {
  ar: { name: 'يرجى إدخال اسمك (من 2 إلى 100 حرف، دون روابط).', contact: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني.', email: 'البريد الإلكتروني غير صالح.', phone: 'رقم الهاتف غير صالح.', date: 'اختر تاريخًا ووقتًا قادمين ضمن ساعات عمل المكتب بتوقيت أوتاوا.', service: 'يرجى اختيار خدمة صحيحة.', notes: 'الملاحظات لا تتجاوز 500 حرف.', subscribe: 'للاشتراك في العروض يرجى إدخال البريد الإلكتروني.' },
  en: { name: 'Please enter your name (2–100 characters, no links).', contact: 'Please provide a phone number or email.', email: 'Please enter a valid email.', phone: 'Please enter a valid phone number.', date: 'Choose a future date and time within office hours (Ottawa time).', service: 'Please choose a valid service.', notes: 'Notes must be 500 characters or fewer.', subscribe: 'Please enter your email to subscribe to offers.' },
  fr: { name: 'Veuillez saisir votre nom (2 à 100 caractères, sans lien).', contact: 'Indiquez un téléphone ou un courriel.', email: 'Le courriel est invalide.', phone: 'Le numéro de téléphone est invalide.', date: 'Choisissez une date et une heure futures pendant les heures du bureau (heure d’Ottawa).', service: 'Choisissez un service valide.', notes: 'Les notes ne doivent pas dépasser 500 caractères.', subscribe: 'Indiquez votre courriel pour vous abonner aux offres.' },
};

export const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/** A person's name: 2–100 characters, no links, e-mail addresses or HTML (blocks spam names such as "Visit www.…"). */
export function validName(raw: string) {
  const name = raw.trim();
  return name.length >= 2 && name.length <= 100 && !/(https?:|www\.|:\/\/|[<>@{}\\]|\.(com|net|org|ru|xyz|top|info|io|ca|at)\b)/i.test(name);
}

export function validateBooking(data: BookingFormData, language: Language, serviceIds: string[], now = new Date(), days: DayHours[] = officeHours()) {
  const e = errors[language];
  if (!validName(data.fullName)) return e.name;
  if (!data.email.trim() && !data.phone.trim()) return e.contact;
  if (data.email && (data.email.length > 254 || !EMAIL_RE.test(data.email.trim()))) return e.email;
  if (data.phone && (data.phone.length > 30 || !/^[+\d\s().-]+$/.test(data.phone) || !/^\d{7,15}$/.test(data.phone.replace(/\D/g, '')))) return e.phone;
  if (!serviceIds.includes(data.serviceId)) return e.service;
  if (!availableTimes(data.preferredDate, now, days).includes(data.preferredTime)) return e.date;
  if (data.notes.length > 500) return e.notes;
  if (data.subscribe && !data.email.trim()) return e.subscribe;
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
