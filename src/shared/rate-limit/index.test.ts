import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { classifyRateLimit, clientIp } from './index';

describe('classifyRateLimit', () => {
  it('leaves the auth pages to the Server Function guard', () => {
    // Their submits are Server Functions posting to the page path; limiting
    // them here would break the action client. See ./auth-guard.
    expect(classifyRateLimit('POST', '/sign-in')).toBeNull();
    expect(classifyRateLimit('POST', '/sign-up')).toBeNull();
    expect(classifyRateLimit('POST', '/forgot-password')).toBeNull();
  });

  it('guards the AI endpoints, including the dynamic offer routes', () => {
    expect(classifyRateLimit('POST', '/api/cv/optimize')).toBe('ai');
    expect(classifyRateLimit('POST', '/api/offers')).toBe('ai');
    expect(classifyRateLimit('POST', '/api/offers/abc-123/match')).toBe('ai');
    expect(classifyRateLimit('POST', '/api/offers/abc-123/tailor-cv')).toBe(
      'ai',
    );
  });

  it('never rate limits the Stripe webhook', () => {
    expect(classifyRateLimit('POST', '/api/stripe/webhook')).toBeNull();
  });

  it('ignores non-POST requests and unrelated paths', () => {
    expect(classifyRateLimit('GET', '/sign-in')).toBeNull();
    expect(classifyRateLimit('POST', '/api/applications')).toBeNull();
    expect(
      classifyRateLimit('POST', '/api/offers/abc-123/favorite'),
    ).toBeNull();
  });
});

describe('clientIp', () => {
  it('prefers x-real-ip over the spoofable x-forwarded-for hop', () => {
    const headers = new Headers({
      'x-real-ip': '203.0.113.7',
      'x-forwarded-for': '198.51.100.1, 10.0.0.1',
    });
    expect(clientIp(headers)).toBe('203.0.113.7');
  });

  it('falls back to the first x-forwarded-for hop', () => {
    expect(
      clientIp(new Headers({ 'x-forwarded-for': '198.51.100.1, 10.0.0.1' })),
    ).toBe('198.51.100.1');
  });

  it('returns null when no client IP is present, so nothing shares a bucket', () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe('warnRateLimitSkipped', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns only once however many times it is called', async () => {
    vi.resetModules();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { warnRateLimitSkipped } = await import('./index');
    warnRateLimitSkipped('auth action');
    warnRateLimitSkipped('AI endpoint');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

const { limitMock } = vi.hoisted(() => ({ limitMock: vi.fn() }));

vi.mock('@upstash/redis', () => ({
  Redis: class {},
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = () => ({});
    limit = limitMock;
  },
}));

describe('enforceRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.restoreAllMocks();
  });

  it('allows the request when under the limit', async () => {
    limitMock.mockResolvedValue({ success: true, reset: Date.now() + 60_000 });
    const { enforceRateLimit } = await import('./index');
    expect(await enforceRateLimit('auth', 'ip')).toEqual({
      ok: true,
      retryAfter: 0,
    });
  });

  it('blocks with a positive retryAfter when over the limit', async () => {
    limitMock.mockResolvedValue({ success: false, reset: Date.now() + 30_000 });
    const { enforceRateLimit } = await import('./index');
    const result = await enforceRateLimit('auth', 'ip');
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('does not enforce, or cache the miss, while Upstash is unconfigured', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { enforceRateLimit } = await import('./index');

    expect(await enforceRateLimit('auth', 'ip')).toEqual({
      ok: true,
      retryAfter: 0,
    });
    expect(limitMock).not.toHaveBeenCalled();

    // Env read is lazy: config appearing later must take effect without a
    // fresh module instance.
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    limitMock.mockResolvedValue({ success: false, reset: Date.now() + 30_000 });
    expect((await enforceRateLimit('auth', 'ip')).ok).toBe(false);
  });

  it('fails open when the limiter throws', async () => {
    limitMock.mockRejectedValue(new Error('upstash 401'));
    const { enforceRateLimit } = await import('./index');
    expect(await enforceRateLimit('ai', 'owner-1')).toEqual({
      ok: true,
      retryAfter: 0,
    });
  });
});
