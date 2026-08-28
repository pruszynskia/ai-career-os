import 'server-only';

import { toCvDocument } from '@/entities/cv-document/service';
import { toJobOffer } from '@/entities/job-offer/service';
import { createClient } from '@/shared/db/client';
import type {
  Application,
  ApplicationBundle,
  ApplicationStatus,
} from '@/entities/application/types';

function toApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    jobOfferId: row.job_offer_id as string,
    sentCvId: row.sent_cv_id as string,
    recruiterMessage: row.recruiter_message as string,
    status: row.status as ApplicationStatus,
    notes: (row.notes as string | null) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function toApplicationBundle(row: Record<string, unknown>): ApplicationBundle {
  const jobOffer = toJobOffer(row.job_offer as Record<string, unknown>);

  return {
    ...toApplication(row),
    jobOffer,
    sentCv: toCvDocument(row.sent_cv as Record<string, unknown>),
    isExpired: jobOffer.isExpired,
  };
}

const BUNDLE_SELECT = '*, job_offer:job_offers(*), sent_cv:cv_documents(*)';

export const applicationService = {
  async create(values: {
    ownerId: string;
    jobOfferId: string;
    sentCvId: string;
    recruiterMessage: string;
  }): Promise<Application> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('applications')
      .insert({
        owner_id: values.ownerId,
        job_offer_id: values.jobOfferId,
        sent_cv_id: values.sentCvId,
        recruiter_message: values.recruiterMessage,
      })
      .select()
      .single();

    if (error) throw error;
    return toApplication(data);
  },

  async findMany(filter: {
    ownerId: string;
    statusNot?: ApplicationStatus;
  }): Promise<ApplicationBundle[]> {
    const supabase = await createClient();
    let query = supabase
      .from('applications')
      .select(BUNDLE_SELECT)
      .eq('owner_id', filter.ownerId);

    if (filter.statusNot) query = query.neq('status', filter.statusNot);

    const { data, error } = await query.order('updated_at', {
      ascending: false,
    });

    if (error) throw error;
    return (data ?? []).map((row) =>
      toApplicationBundle(row as unknown as Record<string, unknown>),
    );
  },

  async findFirst(filter: {
    id: string;
    ownerId: string;
  }): Promise<Application | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', filter.id)
      .eq('owner_id', filter.ownerId)
      .maybeSingle();

    if (error) throw error;
    return data ? toApplication(data) : null;
  },

  async update(
    id: string,
    values: { status?: ApplicationStatus; notes?: string | null },
  ): Promise<Application> {
    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (values.status !== undefined) patch.status = values.status;
    if (values.notes !== undefined) patch.notes = values.notes;

    const { data, error } = await supabase
      .from('applications')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toApplication(data);
  },

  async findByOffer(
    ownerId: string,
    jobOfferId: string,
  ): Promise<Application | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('job_offer_id', jobOfferId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toApplication(data) : null;
  },

};
