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
import { getOwnerId } from '@/shared/auth/session';
import { requirePlan } from '@/shared/billing/entitlements';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // A follow-up is the outreach studio drafting again (TASK-086 wires it
    // to the same recruiter-message service), so it is gated the same as
    // the initial draft (TASK-088) - otherwise a Free account could reach
    // the studio through this route without ever hitting the gate above.
    const ownerId = await getOwnerId();
    await requirePlan(ownerId, 'pro');

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
