import 'server-only';

import { z } from 'zod';

import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import {
  buildCoverLetterUserMessage,
  coverLetterSystemPrompt,
} from '@/shared/ai/prompts/cover-letter';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const coverLetterSchema = z.object({
  content: z.string(),
});

export async function generateCoverLetter(id: string) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before using it for this offer.',
  );

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
