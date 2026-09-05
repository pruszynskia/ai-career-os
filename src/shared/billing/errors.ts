import 'server-only';

import { NextResponse } from 'next/server';

import type { PlanId } from '@/shared/billing/plans';

const UPGRADE_PATH = '/pricing';

// Modeled on src/shared/ai/errors.ts's toAiErrorResponse: one typed error,
// one mapper to a JSON response, documented in docs/API_GUIDE.md.
export class EntitlementError extends Error {
  readonly plan: PlanId;
  readonly limit: number;
  readonly upgradePath: string;

  constructor(
    message: string,
    details: { plan: PlanId; limit: number; upgradePath?: string },
  ) {
    super(message);
    this.name = 'EntitlementError';
    this.plan = details.plan;
    this.limit = details.limit;
    this.upgradePath = details.upgradePath ?? UPGRADE_PATH;
  }
}

export function toEntitlementErrorResponse(error: EntitlementError) {
  return NextResponse.json(
    {
      message: error.message,
      plan: error.plan,
      limit: error.limit,
      upgradePath: error.upgradePath,
    },
    { status: 402 },
  );
}
