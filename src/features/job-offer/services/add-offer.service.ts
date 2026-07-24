import 'server-only';

import { jobOfferService } from '@/entities/job-offer/service';
import { parsedJobOfferSchema } from '@/entities/job-offer/types';
import { fetchAndStripUrl } from '@/features/job-offer/services/extract-offer-text';
import {
  buildParseOfferUserMessage,
  parseOfferSystemPrompt,
} from '@/shared/ai/prompts/parse-offer';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';
import {
  computeOfferFingerprint,
  isDuplicateFingerprint,
} from '@/shared/utils/offer-fingerprint';

export interface AddOfferInput {
  url?: string;
  rawText?: string;
}

export async function addOffer({ url, rawText }: AddOfferInput) {
  const ownerId = await getOwnerId();
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

  const fingerprint = computeOfferFingerprint({ ...parsed, url, rawContent });
  const existingOffers = await jobOfferService.listFingerprints(ownerId);
  const duplicate = existingOffers.find((offer) =>
    isDuplicateFingerprint(fingerprint, computeOfferFingerprint(offer)),
  );

  const jobOffer = await jobOfferService.create({
    ownerId,
    url,
    source,
    rawContent,
    ...parsed,
  });

  return { jobOffer, duplicateOfferId: duplicate?.id };
}
