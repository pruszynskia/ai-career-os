import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';

export class NoMasterCvError extends Error {
  constructor() {
    super('Upload a CV before using it for this offer.');
    this.name = 'NoMasterCvError';
  }
}

export async function getMasterCvOrThrow(ownerId: string) {
  const masterCv = await cvDocumentService.findFirst({
    ownerId,
    isMaster: true,
  });

  if (!masterCv) throw new NoMasterCvError();

  return masterCv;
}
