import { NextResponse } from 'next/server';
import { z } from 'zod';

import { claimStateSchema } from '@/entities/profile/types';
import {
  ProfileNotFoundError,
  updateEvidenceClaimState,
  updateEvidenceRules,
} from '@/features/profile/services/update-evidence.service';

const claimUpdateSchema = z.object({
  claimId: z.string(),
  state: claimStateSchema,
});

const rulesUpdateSchema = z.object({
  neverInclude: z.array(z.string()),
  alwaysIncludeWhenRelevant: z.array(z.string()),
});

const updateEvidenceSchema = z.union([claimUpdateSchema, rulesUpdateSchema]);

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = updateEvidenceSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      {
        message:
          'A claim id and state, or neverInclude/alwaysIncludeWhenRelevant lists, are required.',
      },
      { status: 400 },
    );
  }

  try {
    const profile =
      'claimId' in parsedInput.data
        ? await updateEvidenceClaimState(
            parsedInput.data.claimId,
            parsedInput.data.state,
          )
        : await updateEvidenceRules(parsedInput.data);

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update evidence base', error);
    return NextResponse.json(
      { message: 'Failed to update your evidence base.' },
      { status: 500 },
    );
  }
}
