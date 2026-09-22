import 'server-only';

import { NextResponse } from 'next/server';

import {
  EntitlementError,
  toEntitlementErrorResponse,
} from '@/shared/billing/errors';

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && 'status' in error && error.status === 429;
}

// Whether a provider failure should move the fallback loop in
// src/shared/ai/service.ts to the next provider (TASK-089) rather than
// give up immediately. The Anthropic, OpenAI/Groq and Gemini SDKs all set
// `status` on their error classes for an HTTP response (429 rate limit,
// 5xx); a connection/timeout failure (e.g. openai's APIConnectionError,
// APIConnectionTimeoutError) has no HTTP status at all, so those are
// recognized by message instead. A validation or other 4xx status is never
// retryable - retrying it against another provider would just repeat the
// same bad request.
export function isRetryableAiError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const status = 'status' in error ? error.status : undefined;
  if (typeof status === 'number') return status === 429 || status >= 500;

  return /timeout|network|ECONNRESET|ECONNREFUSED|fetch failed/i.test(
    error.message,
  );
}

// ponytail: only handles entitlement, rate-limit + generic fallback; each
// route keeps its own 1-2 domain-error branches before calling this — not
// worth a generic [ErrorClass, status][] table for that few branches per
// route.
export function toAiErrorResponse(error: unknown, fallbackMessage: string) {
  // Every AI feature service now goes through the metered accessor
  // (getMeteredAiService in src/shared/ai/service.ts), which throws this
  // for an over-quota call - map it here once rather than in all eleven
  // routes.
  if (error instanceof EntitlementError) {
    return toEntitlementErrorResponse(error);
  }

  if (isRateLimitError(error)) {
    return NextResponse.json(
      {
        message:
          'The AI provider rate limit or quota was exceeded. Try again later.',
      },
      { status: 429 },
    );
  }

  console.error(fallbackMessage, error);
  return NextResponse.json({ message: fallbackMessage }, { status: 500 });
}
