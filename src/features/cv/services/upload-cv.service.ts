import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { parsedProfileSchema } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import {
  buildParseCvUserMessage,
  parseCvSystemPrompt,
} from '@/shared/ai/prompts/parse-cv';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export async function uploadCv(text: string) {
  const ownerId = await getOwnerId();
  const aiService = await getMeteredAiService('upload_cv');
  const parsed = await aiService.generateStructured({
    messages: [
      { role: 'system', content: parseCvSystemPrompt },
      { role: 'user', content: buildParseCvUserMessage(text) },
    ],
    schema: parsedProfileSchema,
    schemaName: 'parsed_profile',
    // Output now covers summary/skills/experience/projects/score - give
    // thinking models (Gemini) enough budget beyond their reasoning tokens.
    maxTokens: 16384,
  });

  const profile = await profileService.upsert(ownerId, parsed);
  const cvDocument = await cvDocumentService.createVersion({
    ownerId,
    isMaster: true,
    content: text,
    kind: 'MASTER',
  });

  return { profile, cvDocument };
}
