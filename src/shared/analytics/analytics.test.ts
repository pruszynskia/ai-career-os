import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getConsent, setConsent, track } from './analytics';

function stubWindow(cookie = '') {
  const store = new Map<string, string>();
  const cookies: string[] = [];
  const win = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    location: { hostname: 'app.example.com', reload: vi.fn() },
    gtag: undefined as undefined | ReturnType<typeof vi.fn>,
  };
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', {
    get cookie() {
      return cookie;
    },
    set cookie(v: string) {
      cookies.push(v);
    },
  });
  return { win, cookies };
}

describe('analytics', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('track is a no-op without gtag and calls it when present', () => {
    const { win } = stubWindow();
    expect(() => track('offer_added')).not.toThrow();
    win.gtag = vi.fn();
    track('application_status_changed', { status: 'HR' });
    expect(win.gtag).toHaveBeenCalledWith(
      'event',
      'application_status_changed',
      {
        status: 'HR',
      },
    );
  });

  it('round-trips consent through localStorage', () => {
    const { win } = stubWindow();
    expect(getConsent()).toBeNull();
    setConsent('granted');
    expect(getConsent()).toBe('granted');
    expect(win.location.reload).not.toHaveBeenCalled();
  });

  it('revoking clears _ga cookies and reloads', () => {
    const { win, cookies } = stubWindow('_ga=1; _ga_ABC=2; session=3');
    setConsent('denied');
    expect(getConsent()).toBe('denied');
    expect(cookies.some((c) => c.startsWith('_ga='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('_ga_ABC='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('session='))).toBe(false);
    expect(win.location.reload).toHaveBeenCalled();
  });
});
