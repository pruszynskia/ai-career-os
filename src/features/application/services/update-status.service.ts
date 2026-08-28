import 'server-only';

import type { ApplicationStatus } from '@/entities/application/types';

import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
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

  const updated = await applicationService.update(id, { status });

  // ponytail: best-effort history write — a failed event must not fail a
  // status update that already committed. See create-application.service.ts.
  await applicationStatusEventService
    .create({
      ownerId,
      applicationId: updated.id,
      status: updated.status,
    })
    .catch((error) =>
      console.error('Failed to record the status event', error),
    );

  return updated;
}
