import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import type { CvDocument } from '@/entities/cv-document/types';
import { getOwnerId } from '@/shared/auth/session';

export async function listDocuments(): Promise<CvDocument[]> {
  const ownerId = await getOwnerId();
  return cvDocumentService.findMany(ownerId);
}
