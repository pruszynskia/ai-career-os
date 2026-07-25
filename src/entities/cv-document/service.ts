import 'server-only';

import { createClient } from '@/shared/db/client';
import type { CvDocument } from '@/entities/cv-document/types';

export class NoMasterCvError extends Error {
  constructor(message = 'Upload a CV before using it.') {
    super(message);
    this.name = 'NoMasterCvError';
  }
}

export function toCvDocument(row: Record<string, unknown>): CvDocument {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    isMaster: row.is_master as boolean,
    content: row.content as string,
    jobOfferId: (row.job_offer_id as string | null) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export const cvDocumentService = {
  async create(values: {
    ownerId: string;
    isMaster: boolean;
    content: string;
    jobOfferId?: string;
  }): Promise<CvDocument> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cv_documents')
      .insert({
        owner_id: values.ownerId,
        is_master: values.isMaster,
        content: values.content,
        job_offer_id: values.jobOfferId ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return toCvDocument(data);
  },

  async findFirst(filter: {
    id?: string;
    ownerId: string;
    isMaster?: boolean;
  }): Promise<CvDocument | null> {
    const supabase = await createClient();
    let query = supabase
      .from('cv_documents')
      .select('*')
      .eq('owner_id', filter.ownerId);

    if (filter.id !== undefined) query = query.eq('id', filter.id);
    if (filter.isMaster !== undefined)
      query = query.eq('is_master', filter.isMaster);

    // .limit(1) mirrors Prisma's findFirst tolerance for multiple matches —
    // without it, .maybeSingle() throws if more than one row qualifies.
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toCvDocument(data) : null;
  },

  // ponytail: sequential awaits, not a single DB transaction — fine for a
  // single-writer app; move to a Postgres RPC if concurrent uploads matter.
  async updateMany(
    filter: { ownerId: string; isMaster: boolean },
    values: { isMaster: boolean },
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('cv_documents')
      .update({
        is_master: values.isMaster,
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', filter.ownerId)
      .eq('is_master', filter.isMaster);

    if (error) throw error;
  },

  async getMasterOrThrow(
    ownerId: string,
    message?: string,
  ): Promise<CvDocument> {
    const masterCv = await this.findFirst({ ownerId, isMaster: true });
    if (!masterCv) throw new NoMasterCvError(message);
    return masterCv;
  },

  // Flips any existing master off only when the new version is itself the
  // master (upload's pattern); optimize/tailor pass isMaster:false and skip
  // the flip — the same 2-line sequence upload-cv already had, hoisted here
  // so all three creators share it.
  async createVersion(values: {
    ownerId: string;
    content: string;
    isMaster: boolean;
    jobOfferId?: string;
  }): Promise<CvDocument> {
    if (values.isMaster) {
      await this.updateMany(
        { ownerId: values.ownerId, isMaster: true },
        { isMaster: false },
      );
    }
    return this.create(values);
  },
};
