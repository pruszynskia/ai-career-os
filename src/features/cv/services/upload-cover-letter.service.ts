import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { getOwnerId } from '@/shared/auth/session';

// No AI structuring, unlike uploadCv — the master cover letter is stored as
// raw text, same as the master CV before optimize-cv rewrites it.
export async function uploadCoverLetter(text: string) {
  const ownerId = await getOwnerId();
  const cvDocument = await cvDocumentService.createVersion({
    ownerId,
    isMaster: true,
    content: text,
    kind: 'COVER_LETTER',
  });

  return { cvDocument };
}
