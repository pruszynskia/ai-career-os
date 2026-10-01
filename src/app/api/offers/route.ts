import { NextResponse } from 'next/server';
import { z } from 'zod';

import { addOffer } from '@/features/job-offer/services/add-offer.service';
import { OfferFetchError } from '@/features/job-offer/services/extract-offer-text';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { httpUrlSchema } from '@/shared/utils/http-url';

// PIPE-12: without a cap, a huge paste blows the AI context window and
// 500s after the metered quota is already spent.
const addOfferSchema = z
  .object({
    url: httpUrlSchema.optional(),
    rawText: z.string().min(1).max(50_000).optional(),
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
    const { jobOffer, duplicateOfferId, duplicateMatchSignal } = await addOffer(
      parsedInput.data,
    );
    return NextResponse.json({
      jobOffer,
      duplicateOfferId,
      duplicateMatchSignal,
    });
  } catch (error) {
    if (error instanceof OfferFetchError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to add the offer.');
  }
}
