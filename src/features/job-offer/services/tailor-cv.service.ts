import 'server-only';

import { z } from 'zod';

import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import {
  buildTailorCvUserMessage,
  tailorCvSystemPrompt,
} from '@/shared/ai/prompts/tailor-cv';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const tailoredCvSchema = z.object({
  content: z.string(),
});

export async function tailorCv(id: string) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before using it for this offer.',
  );

  const { content } = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: tailorCvSystemPrompt },
      {
        role: 'user',
        content: buildTailorCvUserMessage(masterCv.content, offer.description),
      },
    ],
    schema: tailoredCvSchema,
    schemaName: 'tailored_cv',
    maxTokens: 4096,
  });

  return cvDocumentService.createVersion({
    ownerId,
    isMaster: false,
    content,
    jobOfferId: offer.id,
  });
}
