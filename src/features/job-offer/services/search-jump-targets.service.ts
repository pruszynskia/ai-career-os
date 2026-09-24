'use server';

import { jobOfferService } from '@/entities/job-offer/service';
import { getOwnerId } from '@/shared/auth/session';

export interface JumpOfferMatch {
  id: string;
  title: string;
  company: string;
}

export interface JumpTargets {
  offers: JumpOfferMatch[];
  companies: string[];
}

// One query via jobOfferService.findMany (buildSearchOrFilter's existing
// title/company ilike OR-filter, same as offer-filters.tsx's search input) -
// offers and companies are both derived from these rows, not a second
// search implementation or a companies table (none exists).
const QUERY_LIMIT = 20;
const RESULT_LIMIT = 5;

export async function searchJumpTargets(query: string): Promise<JumpTargets> {
  const trimmed = query.trim();
  if (!trimmed) return { offers: [], companies: [] };

  const ownerId = await getOwnerId();
  const matches = await jobOfferService.findMany(
    { ownerId, query: trimmed },
    { take: QUERY_LIMIT },
  );

  const companies = [...new Set(matches.map((offer) => offer.company))];

  return {
    offers: matches
      .slice(0, RESULT_LIMIT)
      .map(({ id, title, company }) => ({ id, title, company })),
    companies: companies.slice(0, RESULT_LIMIT),
  };
}
