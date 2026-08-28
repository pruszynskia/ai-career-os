import 'server-only';

import { toJobOffer } from '@/entities/job-offer/service';
import { createClient } from '@/shared/db/client';
import type { ApplicationStatus } from '@/entities/application/types';
import type {
  ApplicationStatusEvent,
  RecentStatusEvent,
} from '@/entities/application-status-event/types';

function toApplicationStatusEvent(
  row: Record<string, unknown>,
): ApplicationStatusEvent {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    applicationId: row.application_id as string,
    status: row.status as ApplicationStatus,
    createdAt: new Date(row.created_at as string),
  };
}

export const applicationStatusEventService = {
  async create(values: {
    ownerId: string;
    applicationId: string;
    status: ApplicationStatus;
  }): Promise<ApplicationStatusEvent> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('application_status_events')
      .insert({
        owner_id: values.ownerId,
        application_id: values.applicationId,
        status: values.status,
      })
      .select()
      .single();

    if (error) throw error;
    return toApplicationStatusEvent(data);
  },

  async findMany(filter: {
    applicationId: string;
  }): Promise<ApplicationStatusEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('application_status_events')
      .select('*')
      .eq('application_id', filter.applicationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(toApplicationStatusEvent);
  },

  async findRecent(
    filter: { ownerId: string },
    opts?: { take?: number },
  ): Promise<RecentStatusEvent[]> {
    const supabase = await createClient();
    let query = supabase
      .from('application_status_events')
      .select('*, application:applications(job_offer:job_offers(*))')
      .eq('owner_id', filter.ownerId)
      .order('created_at', { ascending: false });

    if (opts?.take) query = query.limit(opts.take);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? [])
      .map((row): RecentStatusEvent | null => {
        const record = row as Record<string, unknown>;
        const application = record.application as
          | Record<string, unknown>
          | null;
        const jobOfferRow = application?.job_offer as
          | Record<string, unknown>
          | null;
        if (!jobOfferRow) return null;

        return {
          ...toApplicationStatusEvent(record),
          jobOffer: toJobOffer(jobOfferRow),
        };
      })
      .filter((event): event is RecentStatusEvent => event !== null);
  },
};
