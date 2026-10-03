// GA4 wrapper. Everything here is a safe no-op until the visitor has granted
// consent and google-analytics.tsx has loaded gtag.js, so callers never need
// to check for either.

export type AnalyticsEvent =
  | 'offer_added'
  | 'offer_matched'
  | 'cv_tailored'
  | 'cover_letter_generated'
  | 'outreach_generated'
  | 'follow_up_generated'
  | 'outreach_sent'
  | 'application_created'
  | 'application_status_changed'
  | 'cv_uploaded'
  | 'cover_letter_uploaded'
  | 'cv_optimized'
  | 'cover_letter_optimized'
  | 'contact_added'
  | 'contacts_imported'
  | 'post_generated'
  | 'campaign_generated'
  | 'posts_planned'
  | 'post_published'
  | 'begin_checkout';

// Enums and counts only - never IDs, free text, names or emails.
type AnalyticsParams = Record<string, string | number | boolean>;

export type Consent = 'granted' | 'denied';

const CONSENT_KEY = 'analytics-consent';
const CONSENT_EVENT = 'analytics-consent-change';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(name: AnalyticsEvent, params?: AnalyticsParams): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
}

export function getConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

export function setConsent(value: Consent): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice just won't persist past this page view.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
  if (value === 'denied') {
    // Reloading is the one guaranteed way to unload an already-running gtag.
    clearGaCookies();
    window.location.reload();
  }
}

function clearGaCookies(): void {
  const host = window.location.hostname;
  // _ga / _ga_<id> are set on the registrable domain, so try each parent too.
  const parts = host.split('.');
  const domains = parts.map((_, i) => parts.slice(i).join('.'));
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const domain of ['', ...domains]) {
      const d = domain ? `; domain=${domain}` : '';
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  }
}
