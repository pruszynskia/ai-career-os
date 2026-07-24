import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { parsedProfileSchema } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import {
  buildParseCvUserMessage,
  parseCvSystemPrompt,
} from '@/shared/ai/prompts/parse-cv';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export async function uploadCv(text: string) {
  const ownerId = await getOwnerId();
  const parsed = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: parseCvSystemPrompt },
      { role: 'user', content: buildParseCvUserMessage(text) },
    ],
    schema: parsedProfileSchema,
    schemaName: 'parsed_profile',
  });

  // ponytail: sequential awaits, not one DB transaction — see the
  // cvDocumentService.updateMany note in src/entities/cv-document/service.ts.
  await cvDocumentService.updateMany(
    { ownerId, isMaster: true },
    { isMaster: false },
  );
  const profile = await profileService.upsert(ownerId, parsed);
  const cvDocument = await cvDocumentService.create({
    ownerId,
    isMaster: true,
    content: text,
  });

  return { profile, cvDocument };
}
