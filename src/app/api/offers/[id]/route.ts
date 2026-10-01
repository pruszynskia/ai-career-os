import { NextResponse } from 'next/server';
import { z } from 'zod';

import { jobOfferSchema } from '@/entities/job-offer/types';
import { deleteOffer } from '@/features/job-offer/services/delete-offer.service';
import { isUuid } from '@/shared/utils/uuid';
import {
  OfferNotFoundError,
  updateOffer,
} from '@/features/job-offer/services/update-offer.service';

const requiredText = z.string().trim().min(1).max(200);

const updateOfferSchema = jobOfferSchema
  .pick({ company: true, title: true, description: true })
  .extend({
    company: requiredText,
    title: requiredText,
    description: z.string().trim().max(50_000),
    // PIPE-5: JSON has no Date type, so the client sends an ISO string (or
    // null to clear it) - z.coerce.date() parses that back into a Date.
    expiresAt: z.coerce.date().nullable(),
  })
  .partial();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsedInput = updateOfferSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'company, title and description must be strings.' },
      { status: 400 },
    );
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  }

  try {
    const jobOffer = await updateOffer(id, parsedInput.data);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  }

  try {
    await deleteOffer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to delete the offer', error);
    return NextResponse.json(
      { message: 'Failed to delete the offer.' },
      { status: 500 },
    );
  }
}
