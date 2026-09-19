import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { buildTailoringReport } from '@/features/document/services/keyword-coverage';
import { tailorCv } from '@/features/job-offer/services/tailor-cv.service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Tailoring itself stays free; the tailoring report is Pro-only
    // (TASK-088). Checked before tailorCv runs so a Free account never pays
    // for the report's own rescore-if-unscored path (tailor-cv.service.ts)
    // just to have the result discarded.
    const ownerId = await getOwnerId();
    const plan = await getPlanForOwner(ownerId);
    const canViewTailoringReport = meetsPlan(plan, 'pro');

    // job-offer and document are isolated from each other (ADR-008); this
    // route is where they compose, same as a widget composes features for UI.
    const cvDocument = await tailorCv(
      id,
      canViewTailoringReport ? buildTailoringReport : undefined,
    );

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

    return toAiErrorResponse(error, 'Failed to tailor the CV.');
  }
}
