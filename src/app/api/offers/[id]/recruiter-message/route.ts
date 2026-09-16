import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { generateRecruiterMessage } from '@/features/job-offer/services/recruiter-message.service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { message } = await generateRecruiterMessage(id);
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError || error instanceof NoEvidenceBaseError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (error instanceof ClaimValidationError) {
      return NextResponse.json(
        { message: error.message, violations: error.violations },
        { status: 422 },
      );
    }

    return toAiErrorResponse(
      error,
      'Failed to generate the recruiter message.',
    );
  }
}
