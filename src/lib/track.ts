import type { Language } from '../types';

export type TrackEvent = 'whatsapp' | 'call' | 'email' | 'booking_open' | 'service_open' | 'directions' | 'map';

/** Anonymous click counter: sends only the event name and page language (no cookies, no personal data). */
export function track(event: TrackEvent, lang: Language) {
  try {
    const body = JSON.stringify({ e: event, l: lang });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/event', new Blob([body], { type: 'text/plain' }));
  } catch { /* statistics must never break the page */ }
}
