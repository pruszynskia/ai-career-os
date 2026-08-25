import { NextResponse } from 'next/server';

import { jobPreferencesSchema } from '@/entities/profile/types';
import {
  ProfileNotFoundError,
  updateProfilePreferences,
} from '@/features/profile/services/update-preferences.service';

const updatePreferencesSchema = jobPreferencesSchema.partial();

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
