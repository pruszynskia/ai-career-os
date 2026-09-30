import { describe, expect, it } from 'vitest';

import { authErrorKey } from '../../../src/shared/auth/auth-error';

describe('authErrorKey', () => {
  it('maps known Supabase codes to page error keys', () => {
    expect(authErrorKey({ code: 'over_email_send_rate_limit' })).toBe(
      'rate_limit',
    );
    expect(authErrorKey({ code: 'weak_password' })).toBe('weak_password');
    expect(authErrorKey({ code: 'email_not_confirmed' })).toBe('unconfirmed');
    expect(authErrorKey({ code: 'same_password' })).toBe('same_password');
  });

  it('treats an uncoded 429 as a rate limit and anything else as generic', () => {
    expect(authErrorKey({ status: 429 })).toBe('rate_limit');
    expect(authErrorKey({ code: 'unexpected_failure', status: 500 })).toBe('1');
  });
});
