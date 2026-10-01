import { describe, expect, it } from 'vitest';

import { safeNextPath } from './route';

describe('safeNextPath', () => {
  it('allows a same-origin path with query and hash', () => {
    expect(safeNextPath('/offers/1?tab=notes#top')).toBe(
      '/offers/1?tab=notes#top',
    );
  });

  it('falls back to /dashboard for a null path', () => {
    expect(safeNextPath(null)).toBe('/dashboard');
  });

  it('falls back to /dashboard for a protocol-relative path', () => {
    expect(safeNextPath('//evil.com')).toBe('/dashboard');
  });

  it('falls back to /dashboard for a backslash-escaped path', () => {
    expect(safeNextPath('/\\evil.com')).toBe('/dashboard');
  });

  it('falls back to /dashboard for a tab/CR/LF-smuggled path', () => {
    expect(safeNextPath('/\t/evil.com')).toBe('/dashboard');
  });

  it('falls back to /dashboard for an absolute URL', () => {
    expect(safeNextPath('https://evil.com')).toBe('/dashboard');
  });

  it('falls back to /dashboard for an unparseable path', () => {
    expect(safeNextPath('//[')).toBe('/dashboard');
  });
});
