import 'server-only';

import { z } from 'zod';

import { jobOfferService } from '@/entities/job-offer/service';
import { getMasterCvOrThrow } from '@/features/job-offer/services/get-master-cv';
import { getOfferOrThrow } from '@/features/job-offer/services/get-offer';
import {
  buildMatchOfferUserMessage,
  matchOfferSystemPrompt,
} from '@/shared/ai/prompts/match-offer';
import { getAiService } from '@/shared/ai/service';

const matchScoreSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
});

export async function matchOffer(id: string) {
  const offer = await getOfferOrThrow(id);
  const masterCv = await getMasterCvOrThrow();

  const { matchScore } = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: matchOfferSystemPrompt },
      {
        role: 'user',
        content: buildMatchOfferUserMessage(
          masterCv.content,
          offer.description,
        ),
      },
    ],
    schema: matchScoreSchema,
    schemaName: 'offer_match_score',
  });

  return jobOfferService.update({
    where: { id: offer.id },
    data: { matchScore },
  });
}
