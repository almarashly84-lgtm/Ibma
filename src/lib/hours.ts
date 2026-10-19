import type { Language } from '../types';

export interface DayHours { closed: boolean; open: string; close: string }

/** 0 = Sunday … 6 = Saturday, Ottawa time. */
export const DEFAULT_DAYS: DayHours[] = [
  { closed: true, open: '10:00', close: '18:00' },
  { closed: false, open: '10:00', close: '18:00' },
  { closed: false, open: '10:00', close: '18:00' },
  { closed: false, open: '10:00', close: '18:00' },
  { closed: false, open: '10:00', close: '18:00' },
  { closed: false, open: '10:00', close: '18:00' },
  { closed: false, open: '10:00', close: '16:00' },
];

let configured: DayHours[] = DEFAULT_DAYS;
/** Called once at start-up with the hours saved in the dashboard. */
export function setOfficeHours(days: DayHours[]) { if (days.length === 7) configured = days; }
export function officeHours() { return configured; }

export const OFFICE_TIMEZONE = 'America/Toronto';

export function officeClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: OFFICE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute), weekday };
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

/** Whether the office is open right now, in Ottawa time (not the visitor's time zone). */
export function isOpenNow(now = new Date(), days = configured) {
  const c = officeClock(now);
  const d = days[c.weekday];
  return !!d && !d.closed && c.minutes >= toMin(d.open) && c.minutes < toMin(d.close);
}

const DAY_NAMES: Record<Language, string[]> = {
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
};
const CLOSED: Record<Language, string> = { ar: 'مغلق', en: 'Closed', fr: 'Fermé' };

export function formatTime(t: string, lang: Language) {
  const h = Number(t.slice(0, 2)), m = t.slice(3, 5);
  if (lang === 'fr') return `${h}h${m}`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (lang === 'ar') return `${h12}:${m} ${h < 12 ? 'ص' : 'م'}`;
  return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Groups consecutive days (Monday→Sunday order) that share the same hours. */
export function hoursSummary(lang: Language, days = configured) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const key = (d: DayHours) => (d.closed ? 'closed' : `${d.open}-${d.close}`);
  const groups: { from: number; to: number; hours: DayHours }[] = [];
  for (const i of order) {
    const last = groups[groups.length - 1];
    if (last && key(last.hours) === key(days[i])) last.to = i;
    else groups.push({ from: i, to: i, hours: days[i] });
  }
  return groups.map((g) => ({
    day: g.from === g.to ? DAY_NAMES[lang][g.from] : `${DAY_NAMES[lang][g.from]} - ${DAY_NAMES[lang][g.to]}`,
    hours: g.hours.closed ? CLOSED[lang] : `${formatTime(g.hours.open, lang)} - ${formatTime(g.hours.close, lang)}`,
    isClosed: g.hours.closed,
  }));
}

/** Candidate appointment start times; the office hours of the chosen day decide which are offered. */
export const SLOT_CANDIDATES = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'];

export function slotMinutes(slot: string) {
  const [time, period] = slot.split(' ');
  const [h, m] = time.split(':').map(Number);
  return (h % 12 + (period === 'PM' ? 12 : 0)) * 60 + m;
}

export function slotsForWeekday(weekday: number, days = configured) {
  const d = days[weekday];
  if (!d || d.closed) return [];
  return SLOT_CANDIDATES.filter((s) => slotMinutes(s) >= toMin(d.open) && slotMinutes(s) < toMin(d.close));
}
