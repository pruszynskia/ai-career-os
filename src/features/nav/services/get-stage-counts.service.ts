import 'server-only';

import {
  applicationStatusSchema,
  type ApplicationStatus,
} from '@/entities/application/types';
import { getOwnerId } from '@/shared/auth/session';
import { createClient } from '@/shared/db/client';

// One grouped query, not one round trip per stage: select every status
// value for the owner in a single request and reduce to counts in-process
// (Supabase/PostgREST has no `GROUP BY` in the query builder).
export async function getStageCounts(): Promise<
  Record<ApplicationStatus, number>
> {
  const ownerId = await getOwnerId();
  const supabase = await createClient();

  const counts = Object.fromEntries(
    applicationStatusSchema.options.map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;

  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .eq('owner_id', ownerId);

  if (error) throw error;

  for (const row of data ?? []) {
    const status = row.status as ApplicationStatus;
    counts[status] += 1;
  }

  return counts;
}
