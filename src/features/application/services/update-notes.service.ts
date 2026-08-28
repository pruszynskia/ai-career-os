import 'server-only';

import { applicationService } from '@/entities/application/service';
// Shared with the status flow — one "not found" error for the whole feature.
import { ApplicationNotFoundError } from '@/features/application/services/update-status.service';
import { getOwnerId } from '@/shared/auth/session';

export { ApplicationNotFoundError };

export async function updateApplicationNotes(id: string, notes: string) {
  const ownerId = await getOwnerId();
  const existing = await applicationService.findFirst({ id, ownerId });
  if (!existing) throw new ApplicationNotFoundError();

  // Empty / whitespace-only notes clear the column back to null.
  return applicationService.update(id, { notes: notes.trim() || null });
}
