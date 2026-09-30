import { NextResponse } from 'next/server';

import { jobPreferencesSchema } from '@/entities/profile/types';
import {
  ProfileNotFoundError,
  updateProfilePreferences,
} from '@/features/profile/services/update-preferences.service';

// MISC-9: the min<=max check lived only in the client form
// (preferences-form.ts's superRefine) - a direct API call bypassed it
// entirely. Only enforced when both are present in this request: a partial
// PATCH sending just one of the pair has no way to compare against
// whatever value already exists for the other.
const updatePreferencesSchema = jobPreferencesSchema
  .partial()
  .refine(
    (value) =>
      value.salaryMin == null ||
      value.salaryMax == null ||
      value.salaryMin <= value.salaryMax,
    {
      message: 'Minimum salary must not exceed maximum salary.',
      path: ['salaryMax'],
    },
  );

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = updatePreferencesSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Valid job preferences are required.' },
      { status: 400 },
    );
  }

  try {
    const profile = await updateProfilePreferences(parsedInput.data);
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update job preferences', error);
    return NextResponse.json(
      { message: 'Failed to update your job preferences.' },
      { status: 500 },
    );
  }
}
