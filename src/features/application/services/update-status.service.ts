import 'server-only';

import type { ApplicationStatus } from '@prisma/client';

import { applicationService } from '@/entities/application/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

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
  const existing = await applicationService.findFirst({
    where: { id, ownerId: SEED_OWNER_ID },
  });
  if (!existing) throw new ApplicationNotFoundError();

  return applicationService.update({
    where: { id },
    data: { status },
  });
}
