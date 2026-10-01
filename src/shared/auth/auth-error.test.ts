import { describe, expect, it } from 'vitest';

import { authErrorKey } from './auth-error';

describe('authErrorKey', () => {
  it('maps a known Supabase error code to its key', () => {
    expect(authErrorKey({ code: 'weak_password' })).toBe('weak_password');
    expect(authErrorKey({ code: 'email_exists' })).toBe('exists');
  });

  it('maps a 429 status with no known code to rate_limit', () => {
    expect(authErrorKey({ status: 429 })).toBe('rate_limit');
  });

  it('falls back to "1" for an unknown code and status', () => {
    expect(authErrorKey({ code: 'something_new', status: 400 })).toBe('1');
    expect(authErrorKey({})).toBe('1');
  });
});
