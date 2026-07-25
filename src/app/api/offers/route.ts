import { NextResponse } from 'next/server';
import { z } from 'zod';

import { addOffer } from '@/features/job-offer/services/add-offer.service';
import { OfferFetchError } from '@/features/job-offer/services/extract-offer-text';
import { toAiErrorResponse } from '@/shared/ai/errors';

const addOfferSchema = z
  .object({
    url: z.string().url().optional(),
    rawText: z.string().min(1).optional(),
  })
  .refine((value) => Boolean(value.url) !== Boolean(value.rawText), {
    message: 'Provide either a URL or pasted text, not both.',
  });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = addOfferSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Provide either a URL or pasted job offer text.' },
      { status: 400 },
    );
  }

  try {
    const { jobOffer, duplicateOfferId } = await addOffer(parsedInput.data);
    return NextResponse.json({ jobOffer, duplicateOfferId });
  } catch (error) {
    if (error instanceof OfferFetchError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to add the offer.');
  }
}
