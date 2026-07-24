import 'server-only';

import { createClient } from '@/shared/db/client';
import { toCvDocument } from '@/entities/cv-document/service';
import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer, OfferSource } from '@/entities/job-offer/types';

export function toJobOffer(row: Record<string, unknown>): JobOffer {
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
      })
      .select()
      .single();

    if (error) throw error;
    return toJobOffer(data);
  },

  async findMany(
    filter: { ownerId: string; isFavorite?: boolean },
    opts?: { take?: number },
  ): Promise<JobOffer[]> {
    const supabase = await createClient();
    let query = supabase
      .from('job_offers')
      .select('*')
      .eq('owner_id', filter.ownerId);

    if (filter.isFavorite !== undefined)
      query = query.eq('is_favorite', filter.isFavorite);

    query = query.order('created_at', { ascending: false });
    if (opts?.take) query = query.limit(opts.take);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toJobOffer);
  },

  async update(
    id: string,
    values: Partial<{ isFavorite: boolean; matchScore: number }>,
  ): Promise<JobOffer> {
    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (values.isFavorite !== undefined) patch.is_favorite = values.isFavorite;
    if (values.matchScore !== undefined) patch.match_score = values.matchScore;

    const { data, error } = await supabase
      .from('job_offers')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toJobOffer(data);
  },

  // For client-side duplicate-fingerprint detection in addOffer().
  async listFingerprints(ownerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('job_offers')
      .select('id, company, title, url, raw_content')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      company: row.company as string,
      title: row.title as string,
      url: (row.url as string | null) ?? null,
      rawContent: row.raw_content as string,
    }));
  },

  // ponytail: fetches offers + applied-offer ids and filters in JS rather
  // than a SQL anti-join/ilike-on-embed — fine at single-user scale, move
  // to a SQL view/RPC if the offer count grows large.
  async findUnapplied(ownerId: string, query?: string): Promise<JobOffer[]> {
    const supabase = await createClient();
    const [offersResult, applicationsResult] = await Promise.all([
      supabase
        .from('job_offers')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('job_offer_id')
        .eq('owner_id', ownerId),
    ]);

    if (offersResult.error) throw offersResult.error;
    if (applicationsResult.error) throw applicationsResult.error;

    const appliedOfferIds = new Set(
      (applicationsResult.data ?? []).map((row) => row.job_offer_id as string),
    );

    const normalizedQuery = query?.toLowerCase();

    return (offersResult.data ?? [])
      .filter((row) => !appliedOfferIds.has(row.id as string))
      .filter(
        (row) =>
          !normalizedQuery ||
          (row.title as string).toLowerCase().includes(normalizedQuery) ||
          (row.company as string).toLowerCase().includes(normalizedQuery),
      )
      .map(toJobOffer);
  },

  async findWithLatestTailoredCv(
    id: string,
  ): Promise<{ offer: JobOffer; latestTailoredCv?: CvDocument } | null> {
    const supabase = await createClient();
    const { data: offerRow, error: offerError } = await supabase
      .from('job_offers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (offerError) throw offerError;
    if (!offerRow) return null;

    const { data: cvRow, error: cvError } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('job_offer_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cvError) throw cvError;

    return {
      offer: toJobOffer(offerRow),
      latestTailoredCv: cvRow ? toCvDocument(cvRow) : undefined,
    };
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
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new OfferNotFoundError();

  return toJobOffer(data);
}
