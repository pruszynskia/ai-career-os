import { NextResponse } from 'next/server';

import { generateCoverLetter } from '@/features/job-offer/services/cover-letter.service';
import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const cvDocument = await generateCoverLetter(id);
    return NextResponse.json({ cvDocument });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to generate the cover letter.');
  }
}
