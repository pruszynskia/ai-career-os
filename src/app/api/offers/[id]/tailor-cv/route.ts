import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/features/job-offer/services/get-master-cv';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { tailorCv } from '@/features/job-offer/services/tailor-cv.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const cvDocument = await tailorCv(id);
    return NextResponse.json({ cvDocument });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to tailor the CV.');
  }
}
