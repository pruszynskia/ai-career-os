import { describe, expect, it } from 'vitest';

import { httpUrlSchema } from './http-url';

describe('httpUrlSchema', () => {
  it.each(['https://example.com/a?b=1', 'HTTP://example.com'])(
    'accepts %s',
    (url) => expect(httpUrlSchema.safeParse(url).success).toBe(true),
  );

  it.each([
    'javascript:alert(1)',
    'data:text/html,hi',
    'ftp://example.com',
    'linkedin.com/in/x',
    'https://',
    `https://example.com/${'a'.repeat(2048)}`,
  ])('rejects %s', (url) =>
    expect(httpUrlSchema.safeParse(url).success).toBe(false),
  );
});
