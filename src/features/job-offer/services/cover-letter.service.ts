import 'server-only';

import { z } from 'zod';

import { getMasterCvOrThrow } from '@/features/job-offer/services/get-master-cv';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import {
  buildCoverLetterUserMessage,
  coverLetterSystemPrompt,
} from '@/shared/ai/prompts/cover-letter';
import { getAiService } from '@/shared/ai/service';

const coverLetterSchema = z.object({
  content: z.string(),
});

export async function generateCoverLetter(id: string) {
  const offer = await getOfferOrThrow(id);
  const masterCv = await getMasterCvOrThrow();

  return getAiService().generateStructured({
    messages: [
      { role: 'system', content: coverLetterSystemPrompt },
      {
        role: 'user',
        content: buildCoverLetterUserMessage(
          masterCv.content,
          offer.description,
        ),
      },
    ],
    schema: coverLetterSchema,
    schemaName: 'cover_letter',
    maxTokens: 2048,
  });
}
