import { ApiError } from '@google/genai';
import { describe, expect, it } from 'vitest';

import { AiOutputError, isRetryableAiError } from './errors';

describe('isRetryableAiError', () => {
  it('retries an AiOutputError (unparseable provider response)', () => {
    expect(isRetryableAiError(new AiOutputError('bad json'))).toBe(true);
  });

  it('retries a 429 or 5xx status error', () => {
    const rateLimited = Object.assign(new Error('rate limited'), {
      status: 429,
    });
    const serverError = Object.assign(new Error('oops'), { status: 503 });
    expect(isRetryableAiError(rateLimited)).toBe(true);
    expect(isRetryableAiError(serverError)).toBe(true);
  });

  it("retries the Gemini SDK's own ApiError on 503 (model overloaded)", () => {
    expect(
      isRetryableAiError(new ApiError({ message: 'high demand', status: 503 })),
    ).toBe(true);
  });

  it('does not retry a 4xx status other than 429', () => {
    const badRequest = Object.assign(new Error('bad request'), {
      status: 400,
    });
    expect(isRetryableAiError(badRequest)).toBe(false);
  });

  it('retries a connection/timeout error by name', () => {
    const timeout = new Error('Request timed out.');
    timeout.name = 'APIConnectionTimeoutError';
    expect(isRetryableAiError(timeout)).toBe(true);
  });

  it('retries a connection/timeout error by message when name is generic', () => {
    expect(isRetryableAiError(new Error('fetch failed'))).toBe(true);
    expect(isRetryableAiError(new Error('ECONNRESET'))).toBe(true);
  });

  it('does not retry a non-Error value or an unrelated Error', () => {
    expect(isRetryableAiError('nope')).toBe(false);
    expect(isRetryableAiError(new Error('invalid schema'))).toBe(false);
  });
});
