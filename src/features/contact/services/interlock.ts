import 'server-only';

import { outreachMessageService } from '@/entities/outreach-message/service';

const INTERLOCK_WINDOW_DAYS = 30;

export interface InterlockWarning {
  contactName: string;
  messagedAt: Date;
}

// A warning, not a block (TASK-084 do_not) - the user may have a good
// reason to contact two people at one company. Returns the most recently
// messaged contact at this company within the window, if any; the caller
// decides whether that's "someone other than the person I'm about to
// message" (see OutreachPanel, which compares this against the currently
// selected contact's name).
export async function checkInterlock(
  ownerId: string,
  company: string,
): Promise<InterlockWarning | null> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - INTERLOCK_WINDOW_DAYS);

  const [latest] = await outreachMessageService.findRecentByCompany(
    ownerId,
    company,
    since,
  );

  return latest
    ? { contactName: latest.contactName, messagedAt: latest.createdAt }
    : null;
}
