import 'server-only';

import { z } from 'zod';

import { cvDocumentService } from '@/entities/cv-document/service';
import { getMasterCvOrThrow } from '@/features/job-offer/services/get-master-cv';
import { getOfferOrThrow } from '@/features/job-offer/services/get-offer';
import {
  buildTailorCvUserMessage,
  tailorCvSystemPrompt,
} from '@/shared/ai/prompts/tailor-cv';
import { getAiService } from '@/shared/ai/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

const tailoredCvSchema = z.object({
  content: z.string(),
});

export async function tailorCv(id: string) {
  const offer = await getOfferOrThrow(id);
  const masterCv = await getMasterCvOrThrow();

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

  return cvDocumentService.create({
    data: {
      ownerId: SEED_OWNER_ID,
      isMaster: false,
      content,
      jobOfferId: offer.id,
    },
  });
}
