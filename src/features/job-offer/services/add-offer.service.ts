import 'server-only';

import { jobOfferService } from '@/entities/job-offer/service';
import { parsedJobOfferSchema } from '@/entities/job-offer/types';
import { fetchAndStripUrl } from '@/features/job-offer/services/extract-offer-text';
import {
  buildParseOfferUserMessage,
  parseOfferSystemPrompt,
} from '@/shared/ai/prompts/parse-offer';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';
import {
  computeOfferFingerprint,
  isDuplicateFingerprint,
  isDuplicateWithinWindow,
  type FingerprintMatchSignal,
} from '@/shared/utils/offer-fingerprint';

export interface AddOfferInput {
  url?: string;
  rawText?: string;
}

const SIGNAL_RANK: Record<FingerprintMatchSignal, number> = {
  'canonical-url': 3,
  'content-hash': 2,
  'company-title': 1,
};

export async function addOffer({ url, rawText }: AddOfferInput) {
  const ownerId = await getOwnerId();
  const rawContent = url ? await fetchAndStripUrl(url) : (rawText as string);
  const source = url ? 'URL' : 'RAW_TEXT';

  const aiService = await getMeteredAiService('add_offer');
  const parsed = await aiService.generateStructured({
    messages: [
      { role: 'system', content: parseOfferSystemPrompt },
      { role: 'user', content: buildParseOfferUserMessage(rawContent) },
    ],
    schema: parsedJobOfferSchema,
    schemaName: 'parsed_job_offer',
  });

  const fingerprint = computeOfferFingerprint({ ...parsed, url, rawContent });
  const existingOffers = await jobOfferService.listFingerprints(ownerId);

  // Row order from listFingerprints is unspecified, so scan all matches and
  // keep the strongest signal rather than the first one seen.
  let best: { id: string; signal: FingerprintMatchSignal } | undefined;
  for (const offer of existingOffers) {
    const signal = isDuplicateFingerprint(
      fingerprint,
      computeOfferFingerprint(offer),
    );
    if (!signal || !isDuplicateWithinWindow(signal, offer.createdAt)) continue;
    if (!best || SIGNAL_RANK[signal] > SIGNAL_RANK[best.signal]) {
      best = { id: offer.id, signal };
    }
  }

  const jobOffer = await jobOfferService.create({
    ownerId,
    url,
    source,
    rawContent,
    ...parsed,
  });

  return {
    jobOffer,
    duplicateOfferId: best?.id,
    duplicateMatchSignal: best?.signal,
  };
}
