import 'server-only';

import { createAdminClient } from '@/shared/db/admin';

// ADR-025: `authenticated` has no SELECT on the Pro-only report columns, so a
// Free owner can't read them over PostgREST. Server code reads them here with
// the service-role client. `rows` must come from an RLS-scoped query under the
// user's session - that query is the owner check, and the owner_id filter
// below keeps this read inside it. Plan gating stays at response boundaries
// (callers null the field for Free owners, see ADR-024).
export async function readOwnedColumn(
  table: 'job_offers' | 'cv_documents',
  column: 'fit' | 'tailoring_report',
  rows: Record<string, unknown>[],
): Promise<Map<string, unknown>> {
  if (rows.length === 0) return new Map();

  const { data, error } = await createAdminClient()
    .from(table)
    .select(`id, ${column}`)
    .eq('owner_id', rows[0].owner_id as string)
    .in(
      'id',
      rows.map((row) => row.id as string),
    );

  if (error) throw error;
  return new Map(
    (data as Record<string, unknown>[]).map((row) => [
      row.id as string,
      row[column],
    ]),
  );
}
