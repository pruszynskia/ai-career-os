import 'server-only';

import { jobOfferService } from '@/entities/job-offer/service';
import { parsedJobOfferSchema } from '@/entities/job-offer/types';
import { fetchAndStripUrl } from '@/features/job-offer/services/extract-offer-text';
import {
  buildParseOfferUserMessage,
  parseOfferSystemPrompt,
} from '@/shared/ai/prompts/parse-offer';
import { getAiService } from '@/shared/ai/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export interface AddOfferInput {
  url?: string;
  rawText?: string;
}

export async function addOffer({ url, rawText }: AddOfferInput) {
  const rawContent = url ? await fetchAndStripUrl(url) : (rawText as string);
  const source = url ? 'URL' : 'RAW_TEXT';

  const parsed = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: parseOfferSystemPrompt },
      { role: 'user', content: buildParseOfferUserMessage(rawContent) },
    ],
    schema: parsedJobOfferSchema,
    schemaName: 'parsed_job_offer',
  });

  return jobOfferService.create({
    data: { ownerId: SEED_OWNER_ID, url, source, rawContent, ...parsed },
  });
}
