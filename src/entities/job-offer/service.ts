import 'server-only';

import { createClient } from '@/shared/db/client';
import { readOwnedColumn } from '@/shared/db/gated-columns';
import { isInvalidInputSyntaxError } from '@/shared/db/postgres-errors';
import { buildSearchOrFilter } from '@/shared/utils/offer-search';
import {
  CV_DOCUMENT_COLUMNS,
  withTailoringReport,
} from '@/entities/cv-document/service';
import type { CvDocument } from '@/entities/cv-document/types';
import {
  fitAssessmentSchema,
  type FitAssessment,
  type JobOffer,
  type OfferSortOption,
  type OfferSource,
} from '@/entities/job-offer/types';

// Every column `authenticated` can SELECT (ADR-025) - `fit` is excluded and
// merged in by withFit. Also used for embedded job_offers(...) selects.
export const JOB_OFFER_COLUMNS =
  'id, owner_id, url, source, raw_content, company, title, description, match_score, is_favorite, created_at, updated_at, expires_at';

async function withFit(rows: Record<string, unknown>[]): Promise<JobOffer[]> {
  const fits = await readOwnedColumn('job_offers', 'fit', rows);
  return rows.map((row) =>
    toJobOffer({ ...row, fit: fits.get(row.id as string) ?? null }),
  );
}

export function toJobOffer(row: Record<string, unknown>): JobOffer {
  const expiresAt = row.expires_at ? new Date(row.expires_at as string) : null;
  const fitParsed = row.fit ? fitAssessmentSchema.safeParse(row.fit) : null;

  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    url: (row.url as string | null) ?? null,
    source: row.source as OfferSource,
    rawContent: row.raw_content as string,
    company: row.company as string,
    title: row.title as string,
    description: row.description as string,
    matchScore: (row.match_score as number | null) ?? null,
    fit: fitParsed?.success ? fitParsed.data : null,
    expiresAt,
    isExpired: expiresAt !== null && expiresAt < new Date(),
    isFavorite: row.is_favorite as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export const jobOfferService = {
  async create(values: {
    ownerId: string;
    url?: string;
    source: OfferSource;
    rawContent: string;
    company: string;
    title: string;
    description: string;
    expiresAt?: Date;
  }): Promise<JobOffer> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('job_offers')
      .insert({
        owner_id: values.ownerId,
        url: values.url ?? null,
        source: values.source,
        raw_content: values.rawContent,
        company: values.company,
        title: values.title,
        description: values.description,
        expires_at: values.expiresAt?.toISOString() ?? null,
      })
      .select(JOB_OFFER_COLUMNS)
      .single();

    if (error) throw error;
    return toJobOffer(data);
  },

  async findMany(
    filter: { ownerId: string; isFavorite?: boolean; query?: string },
    opts?: { take?: number; sort?: OfferSortOption },
  ): Promise<JobOffer[]> {
    const supabase = await createClient();
    let query = supabase
      .from('job_offers')
      .select(JOB_OFFER_COLUMNS)
      .eq('owner_id', filter.ownerId);

    if (filter.isFavorite !== undefined)
      query = query.eq('is_favorite', filter.isFavorite);

    // Title/company substring matching applied server-side via ilike.
    if (filter.query) {
      const orFilter = buildSearchOrFilter(filter.query);
      query = query.or(orFilter);
    }

    const sort = opts?.sort ?? 'createdAt';
    // `fit` isn't selectable by `authenticated` (ADR-025), so the callback
    // sort runs in JS after withFit; created_at desc breaks ties.
    // ponytail: the callback sort fetches every row before `take` applies -
    // fine at one owner's offer count; add a generated, granted sort column
    // if that ever grows (it would expose the Pro-only number, so not now).
    const byCallback = sort === 'callbackProbability';
    const sortColumn = {
      createdAt: 'created_at',
      matchScore: 'match_score',
      callbackProbability: 'created_at',
      company: 'company',
    }[sort];
    query = query.order(sortColumn, {
      ascending: sort === 'company',
      nullsFirst: false,
    });
    if (opts?.take && !byCallback) query = query.limit(opts.take);

    const { data, error } = await query;
    if (error) throw error;
    const offers = await withFit(data ?? []);
    if (!byCallback) return offers;

    const score = (offer: JobOffer) => offer.fit?.hrCallbackProbability ?? -1;
    return offers.sort((a, b) => score(b) - score(a)).slice(0, opts?.take);
  },

  async update(
    id: string,
    values: Partial<{
      isFavorite: boolean;
      matchScore: number;
      fit: FitAssessment;
      expiresAt: Date | null;
      company: string;
      title: string;
      description: string;
    }>,
  ): Promise<JobOffer> {
    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (values.isFavorite !== undefined) patch.is_favorite = values.isFavorite;
    if (values.matchScore !== undefined) patch.match_score = values.matchScore;
    if (values.fit !== undefined) patch.fit = values.fit;
    if (values.expiresAt !== undefined)
      patch.expires_at = values.expiresAt?.toISOString() ?? null;
    if (values.company !== undefined) patch.company = values.company;
    if (values.title !== undefined) patch.title = values.title;
    if (values.description !== undefined)
      patch.description = values.description;

    const { data, error } = await supabase
      .from('job_offers')
      .update(patch)
      .eq('id', id)
      .select(JOB_OFFER_COLUMNS)
      .single();

    if (error) throw error;
    const [offer] = await withFit([data]);
    return offer;
  },

  // For client-side duplicate-fingerprint detection in addOffer().
  async listFingerprints(ownerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('job_offers')
      .select('id, company, title, url, raw_content, created_at')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      company: row.company as string,
      title: row.title as string,
      url: (row.url as string | null) ?? null,
      rawContent: row.raw_content as string,
      createdAt: new Date(row.created_at as string),
    }));
  },

  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from('job_offers').delete().eq('id', id);
    if (error) throw error;
  },

  async findWithLatestTailoredCv(
    id: string,
  ): Promise<{ offer: JobOffer; latestTailoredCv?: CvDocument } | null> {
    const supabase = await createClient();
    const { data: offerRow, error: offerError } = await supabase
      .from('job_offers')
      .select(JOB_OFFER_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (offerError) {
      if (isInvalidInputSyntaxError(offerError)) return null;
      throw offerError;
    }
    if (!offerRow) return null;

    const { data: cvRow, error: cvError } = await supabase
      .from('cv_documents')
      .select(CV_DOCUMENT_COLUMNS)
      .eq('job_offer_id', id)
      .eq('kind', 'TAILORED')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cvError) throw cvError;

    const [[offer], [latestTailoredCv]] = await Promise.all([
      withFit([offerRow]),
      cvRow ? withTailoringReport([cvRow]) : [undefined],
    ]);
    return { offer, latestTailoredCv };
  },
};

export class OfferNotFoundError extends Error {
  constructor() {
    super('Offer not found.');
    this.name = 'OfferNotFoundError';
  }
}

// RLS scopes this to the signed-in owner — a query for another owner's
// offer id simply returns no row, which still throws OfferNotFoundError.
export async function getOfferOrThrow(id: string): Promise<JobOffer> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('job_offers')
    .select(JOB_OFFER_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isInvalidInputSyntaxError(error)) throw new OfferNotFoundError();
    throw error;
  }
  if (!data) throw new OfferNotFoundError();

  const [offer] = await withFit([data]);
  return offer;
}
