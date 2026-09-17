import 'server-only';

import { contactService } from '@/entities/contact/service';
import { parseConnectionsCsv } from '@/features/contact/services/parse-connections-csv';
import { getOwnerId } from '@/shared/auth/session';

export { InvalidConnectionsFileError } from '@/features/contact/services/parse-connections-csv';

export interface ImportConnectionsResult {
  imported: number;
  classified: number;
  skipped: number;
}

export async function importConnections(
  csvText: string,
): Promise<ImportConnectionsResult> {
  const ownerId = await getOwnerId();
  const { contacts, skipped } = parseConnectionsCsv(csvText);

  const created = await contactService.createMany(ownerId, contacts);
  const classified = created.filter(
    (contact) => contact.classification !== 'generalist',
  ).length;

  // Rows already imported in a previous run are deduped inside createMany
  // and don't come back in `created` - count them as skipped too, so
  // re-importing a refreshed export doesn't report "skipped: 0" for rows
  // that were, in fact, skipped.
  const alreadyImported = contacts.length - created.length;

  return {
    imported: created.length,
    classified,
    skipped: skipped + alreadyImported,
  };
}
