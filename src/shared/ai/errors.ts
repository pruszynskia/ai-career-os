import 'server-only';

import { NextResponse } from 'next/server';

import {
  EntitlementError,
  toEntitlementErrorResponse,
} from '@/shared/billing/errors';

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && 'status' in error && error.status === 429;
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
