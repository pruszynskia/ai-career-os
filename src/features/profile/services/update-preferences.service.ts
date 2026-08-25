import 'server-only';

import type { JobPreferences } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { getOwnerId } from '@/shared/auth/session';

export class ProfileNotFoundError extends Error {
  constructor() {
    super('Profile not found.');
    this.name = 'ProfileNotFoundError';
  }
}

export async function updateProfilePreferences(
  preferences: Partial<JobPreferences>,
) {
  const ownerId = await getOwnerId();
  const profile = await profileService.updatePreferences(ownerId, preferences);
  if (!profile) throw new ProfileNotFoundError();
  return profile;
}
