import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { matchOffer } from '@/features/job-offer/services/match-offer.service';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';
import { isUuid } from '@/shared/utils/uuid';

// Longer than the 90s SDK timeout (AI-7) so a slow provider's own timeout
// error reaches the fallback logic instead of Vercel killing the function
// first and returning a non-JSON 504.
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  }

  try {
    const jobOffer = await matchOffer(id);

    // Fit report detail is Pro-only (TASK-088); strip it from the response
    // so a Free account can't read it off the network payload even though
    // matchScore stays free (mirrors the SSR gate in offers/[id]/page.tsx).
    const ownerId = await getOwnerId();
    const plan = await getPlanForOwner(ownerId);
    const canViewFitDetail = meetsPlan(plan, 'pro');

    return NextResponse.json({
      jobOffer: canViewFitDetail ? jobOffer : { ...jobOffer, fit: null },
    });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to match the offer.');
  }
}
