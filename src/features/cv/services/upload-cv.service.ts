import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { parsedProfileSchema } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import {
  buildParseCvUserMessage,
  parseCvSystemPrompt,
} from '@/shared/ai/prompts/parse-cv';
import { getAiService } from '@/shared/ai/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';
import { prisma } from '@/shared/db/client';

export async function uploadCv(text: string) {
  const parsed = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: parseCvSystemPrompt },
      { role: 'user', content: buildParseCvUserMessage(text) },
    ],
    schema: parsedProfileSchema,
    schemaName: 'parsed_profile',
  });

  const [, profile, cvDocument] = await prisma.$transaction([
    cvDocumentService.updateMany({
      where: { ownerId: SEED_OWNER_ID, isMaster: true },
      data: { isMaster: false },
    }),
    profileService.upsert({
      where: { ownerId: SEED_OWNER_ID },
      create: { ownerId: SEED_OWNER_ID, ...parsed },
      update: { ...parsed },
    }),
    cvDocumentService.create({
      data: { ownerId: SEED_OWNER_ID, isMaster: true, content: text },
    }),
  ]);

  return { profile, cvDocument };
}
