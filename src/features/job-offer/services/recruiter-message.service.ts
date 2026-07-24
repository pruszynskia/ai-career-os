import 'server-only';

import { z } from 'zod';

import { getMasterCvOrThrow } from '@/features/job-offer/services/get-master-cv';
import { getOfferOrThrow } from '@/features/job-offer/services/get-offer';
import {
  buildRecruiterMessageUserMessage,
  recruiterMessageSystemPrompt,
} from '@/shared/ai/prompts/recruiter-message';
import { getAiService } from '@/shared/ai/service';

const recruiterMessageSchema = z.object({
  message: z.string(),
});

export async function generateRecruiterMessage(id: string) {
  const offer = await getOfferOrThrow(id);
  const masterCv = await getMasterCvOrThrow();

  return getAiService().generateStructured({
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
