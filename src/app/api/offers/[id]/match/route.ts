import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/features/job-offer/services/get-master-cv';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { matchOffer } from '@/features/job-offer/services/match-offer.service';
import { isRateLimitError } from '@/shared/ai/service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const jobOffer = await matchOffer(id);
    return NextResponse.json({ jobOffer });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
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

    console.error('Failed to match the offer', error);
    return NextResponse.json(
      { message: 'Failed to match the offer.' },
      { status: 500 },
    );
  }
}
