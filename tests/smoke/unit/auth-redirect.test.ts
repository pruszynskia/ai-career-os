import { describe, expect, it } from 'vitest';

import { safeNextPath } from '../../../src/app/auth/callback/route';

describe('safeNextPath', () => {
  it('rejects paths that can escape the origin', () => {
    expect(safeNextPath('https://evil.com')).toBe('/dashboard');
    expect(safeNextPath('//evil.com')).toBe('/dashboard');
    expect(safeNextPath('/\\evil.com')).toBe('/dashboard');
    expect(safeNextPath(null)).toBe('/dashboard');
  });

  it('accepts a same-origin absolute path', () => {
    expect(safeNextPath('/reset-password')).toBe('/reset-password');
  });
});
