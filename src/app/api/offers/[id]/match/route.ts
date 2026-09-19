import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { matchOffer } from '@/features/job-offer/services/match-offer.service';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
