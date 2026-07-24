import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  OfferNotFoundError,
  toggleFavorite,
} from '@/features/job-offer/services/toggle-favorite.service';

const toggleFavoriteSchema = z.object({
  isFavorite: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsedInput = toggleFavoriteSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'isFavorite must be a boolean.' },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const jobOffer = await toggleFavorite(id, parsedInput.data.isFavorite);
    return NextResponse.json({ jobOffer });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update the offer', error);
    return NextResponse.json(
      { message: 'Failed to update the offer.' },
      { status: 500 },
    );
  }
}
