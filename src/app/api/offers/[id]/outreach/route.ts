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
