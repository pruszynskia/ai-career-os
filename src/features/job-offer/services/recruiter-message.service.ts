import 'server-only';

import { z } from 'zod';

import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import {
  buildRecruiterMessageUserMessage,
  recruiterMessageSystemPrompt,
} from '@/shared/ai/prompts/recruiter-message';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const recruiterMessageSchema = z.object({
  message: z.string(),
});

export async function generateRecruiterMessage(id: string) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before using it for this offer.',
  );

  const aiService = await getMeteredAiService('recruiter_message');
  return aiService.generateStructured({
    messages: [
      { role: 'system', content: recruiterMessageSystemPrompt },
      {
        role: 'user',
        content: buildRecruiterMessageUserMessage(
          masterCv.content,
          offer.description,
        ),
      },
    ],
    schema: recruiterMessageSchema,
    schemaName: 'recruiter_message',
  });
}
