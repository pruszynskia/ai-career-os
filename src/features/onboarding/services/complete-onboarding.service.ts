'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { profileService } from '@/entities/profile/service';
import { getOwnerId } from '@/shared/auth/session';

// Used directly as a <form action> from both the "Skip" and "Finish"
// buttons in the onboarding panel (see src/shared/auth/actions.ts for the
// same pattern).
export async function completeOnboarding() {
  const ownerId = await getOwnerId();
  await profileService.completeOnboarding(ownerId);
  // The (app) layout computes needsOnboarding and is a shared segment Next
  // serves from the Router Cache on navigation; without this the redirect
  // lands on a cached layout that bounces the user back to /onboarding.
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
