import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export class NoMasterCvError extends Error {
  constructor() {
    super('Upload a CV before using it for this offer.');
    this.name = 'NoMasterCvError';
  }
}

export async function getMasterCvOrThrow() {
  const masterCv = await cvDocumentService.findFirst({
    where: { ownerId: SEED_OWNER_ID, isMaster: true },
  });

  if (!masterCv) throw new NoMasterCvError();

  return masterCv;
}
