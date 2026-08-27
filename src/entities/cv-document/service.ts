import 'server-only';

import { createClient } from '@/shared/db/client';
import type { CvDocument, CvDocumentKind } from '@/entities/cv-document/types';

export class NoMasterCvError extends Error {
  constructor(message = 'Upload a CV before using it.') {
    super(message);
    this.name = 'NoMasterCvError';
  }
}

export class CvDocumentNotFoundError extends Error {
  constructor(message = 'Document not found.') {
    super(message);
    this.name = 'CvDocumentNotFoundError';
  }
}

export function toCvDocument(row: Record<string, unknown>): CvDocument {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    isMaster: row.is_master as boolean,
    content: row.content as string,
    jobOfferId: (row.job_offer_id as string | null) ?? null,
    kind: row.kind as CvDocumentKind,
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
    kind: CvDocumentKind;
  }): Promise<CvDocument> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cv_documents')
      .insert({
        owner_id: values.ownerId,
        is_master: values.isMaster,
        content: values.content,
        job_offer_id: values.jobOfferId ?? null,
        kind: values.kind,
      })
      .select()
      .single();

    if (error) throw error;
    return toCvDocument(data);
  },

  async findMany(ownerId: string): Promise<CvDocument[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(toCvDocument);
  },

  async update(
    id: string,
    ownerId: string,
    content: string,
  ): Promise<CvDocument> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cv_documents')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new CvDocumentNotFoundError();
    return toCvDocument(data);
  },

  async findFirst(filter: {
    id?: string;
    ownerId: string;
    isMaster?: boolean;
    kind?: CvDocumentKind;
  }): Promise<CvDocument | null> {
    const supabase = await createClient();
    let query = supabase
      .from('cv_documents')
      .select('*')
      .eq('owner_id', filter.ownerId);

    if (filter.id !== undefined) query = query.eq('id', filter.id);
    if (filter.isMaster !== undefined)
      query = query.eq('is_master', filter.isMaster);
    if (filter.kind !== undefined) query = query.eq('kind', filter.kind);

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
    filter: { ownerId: string; isMaster: boolean; kind: CvDocumentKind },
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
      .eq('is_master', filter.isMaster)
      .eq('kind', filter.kind);

    if (error) throw error;
  },

  // Removes tailored CVs / cover letters generated for an offer; master
  // documents never carry a job_offer_id, the is_master guard is belt-and-braces.
  async deleteByJobOffer(jobOfferId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('cv_documents')
      .delete()
      .eq('job_offer_id', jobOfferId)
      .eq('is_master', false);

    if (error) throw error;
  },

  // kind defaults to 'MASTER' so every existing caller (tailor-cv,
  // optimize-cv, per-offer cover-letter generation) keeps resolving the
  // master CV unchanged; the master cover letter is a separate kind.
  async getMasterOrThrow(
    ownerId: string,
    message?: string,
    kind: CvDocumentKind = 'MASTER',
  ): Promise<CvDocument> {
    const masterCv = await this.findFirst({ ownerId, isMaster: true, kind });
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
    kind: CvDocumentKind;
  }): Promise<CvDocument> {
    if (values.isMaster) {
      await this.updateMany(
        { ownerId: values.ownerId, isMaster: true, kind: values.kind },
        { isMaster: false },
      );
    }
    return this.create(values);
  },
};
