import { createHash } from 'node:crypto';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { isPasswordBreached } from './pwned-password';

const suffixOf = (pw: string) =>
  createHash('sha1').update(pw).digest('hex').toUpperCase().slice(5);

function mockFetch(body: string, ok = true) {
  const fn = vi.fn().mockResolvedValue({ ok, text: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('isPasswordBreached', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is true when the suffix is in the range response, and sends only a 5-char prefix', async () => {
    const fn = mockFetch(
      `0000000000000000000000000000000000A:2\r\n${suffixOf('password')}:9545824`,
    );
    expect(await isPasswordBreached('password')).toBe(true);
    expect(fn.mock.calls[0][0]).toMatch(/\/range\/[0-9A-F]{5}$/);
  });

  it('ignores zero-count padding entries and absent suffixes', async () => {
    mockFetch(`${suffixOf('x-unique-pw')}:0\r\n`);
    expect(await isPasswordBreached('x-unique-pw')).toBe(false);
  });

  it('fails open on HTTP error or network failure', async () => {
    mockFetch('', false);
    expect(await isPasswordBreached('whatever')).toBe(false);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await isPasswordBreached('whatever')).toBe(false);
  });
});
