import 'server-only';

import type { ApplicationStatus } from '@/entities/application/types';

import { applicationService } from '@/entities/application/service';
import { getOwnerId } from '@/shared/auth/session';

export class ApplicationNotFoundError extends Error {
  constructor() {
    super('Application not found.');
    this.name = 'ApplicationNotFoundError';
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
) {
  const ownerId = await getOwnerId();
  const existing = await applicationService.findFirst({ id, ownerId });
  if (!existing) throw new ApplicationNotFoundError();
  if (existing.status === status) return existing;

  // The status event is written by the applications_status_event trigger.
  return applicationService.update(id, { status });
}
