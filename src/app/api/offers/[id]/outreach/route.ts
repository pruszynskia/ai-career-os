import { NextResponse } from 'next/server';
import { z } from 'zod';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import {
  NoOutreachContactError,
  generateOutreach,
} from '@/features/job-offer/services/recruiter-message.service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { OutreachValidationError } from '@/shared/ai/outreach-validator';
import { getOwnerId } from '@/shared/auth/session';
import { requirePlan } from '@/shared/billing/entitlements';

const outreachRequestSchema = z.object({
  contactName: z.string().optional(),
  contactUrl: z.string().url().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsedInput = outreachRequestSchema.safeParse(body);

  // An invalid contactUrl used to fail the whole parse and silently fall
  // back to an empty name, surfacing a misleading "add a contact name"
  // error for what was actually a bad URL. Report the real problem instead.
  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Invalid outreach request: contactUrl must be a valid URL.' },
      { status: 422 },
    );
  }

  try {
    // Outreach studio is Pro-only (TASK-088) - checked here, before the
    // contact/CV lookups, so a Free account never spends its AI-action
    // allowance on a draft it can't have; the EntitlementError falls
    // through to toAiErrorResponse below, the same 402 path the quota uses.
    const ownerId = await getOwnerId();
    await requirePlan(ownerId, 'pro');

    const { messages } = await generateOutreach(id, {
      name: parsedInput.data.contactName ?? '',
      profileUrl: parsedInput.data.contactUrl,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoOutreachContactError) {
      return NextResponse.json(
        { message: error.message, postingUrl: error.postingUrl },
        { status: 422 },
      );
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

    return toAiErrorResponse(error, 'Failed to generate outreach drafts.');
  }
}
