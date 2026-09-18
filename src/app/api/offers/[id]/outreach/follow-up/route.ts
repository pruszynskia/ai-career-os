import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import {
  generateFollowUp,
  NoApplicationError,
} from '@/features/job-offer/services/recruiter-message.service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { OutreachValidationError } from '@/shared/ai/outreach-validator';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { message } = await generateFollowUp(id);
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoApplicationError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (
      error instanceof NoMasterCvError ||
      error instanceof NoEvidenceBaseError
    ) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (
      error instanceof ClaimValidationError ||
      error instanceof OutreachValidationError
    ) {
      return NextResponse.json(
        { message: error.message, violations: error.violations },
        { status: 422 },
      );
    }

    return toAiErrorResponse(error, 'Failed to draft a follow-up.');
  }
}
