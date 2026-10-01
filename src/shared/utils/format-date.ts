// A bare `date.toLocaleDateString()` reads the runtime's own locale, which
// can differ between the server that renders a client component's initial
// HTML and the browser that hydrates it (PIPE-10) - React then either warns
// on the mismatch or, worse, silently keeps the wrong server-rendered text.
// Pinning both the locale and the time zone here makes the two renders
// agree. Andrzej is this single-user app's only owner (Wrocław, CET/CEST),
// so Europe/Warsaw is the zone that matches what he actually means by "today".
const LOCALE = 'en-GB';
const TIME_ZONE = 'Europe/Warsaw';

export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return date.toLocaleDateString(LOCALE, { timeZone: TIME_ZONE, ...options });
}
