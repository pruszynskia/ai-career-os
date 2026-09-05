import 'server-only';

import { z } from 'zod';

import { cvDocumentService } from '@/entities/cv-document/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import {
  buildMatchOfferUserMessage,
  matchOfferSystemPrompt,
} from '@/shared/ai/prompts/match-offer';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const matchScoreSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
});

export async function matchOffer(id: string) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before using it for this offer.',
  );

  const aiService = await getMeteredAiService('match_offer');
  const { matchScore } = await aiService.generateStructured({
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

  return jobOfferService.update(offer.id, { matchScore });
}
