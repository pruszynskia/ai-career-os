import { NextResponse } from 'next/server';

import { generateCoverLetter } from '@/features/job-offer/services/cover-letter.service';
import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';

// Longer than the 90s SDK timeout (AI-7) so a slow provider's own timeout
// error reaches the fallback logic instead of Vercel killing the function
// first and returning a non-JSON 504.
export const maxDuration = 120;

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

    if (
      error instanceof NoMasterCvError ||
      error instanceof NoEvidenceBaseError
    ) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (error instanceof ClaimValidationError) {
      return NextResponse.json(
        { message: error.message, violations: error.violations },
        { status: 422 },
      );
    }

    return toAiErrorResponse(error, 'Failed to generate the cover letter.');
  }
}
