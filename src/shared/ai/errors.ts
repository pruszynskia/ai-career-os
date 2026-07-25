import 'server-only';

import { NextResponse } from 'next/server';

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && 'status' in error && error.status === 429;
}

// ponytail: only handles rate-limit + generic fallback; each route keeps its
// own 1-2 domain-error branches before calling this — not worth a generic
// [ErrorClass, status][] table for that few branches per route.
export function toAiErrorResponse(error: unknown, fallbackMessage: string) {
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
