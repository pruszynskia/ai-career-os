import { describe, expect, it } from 'vitest';

import {
  deriveFollowUpNudge,
  derivePendingRequestNudge,
} from '@/features/notification/services/derive-nudges';

const NOW = new Date('2026-09-18T00:00:00Z');
const daysAgo = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

describe('deriveFollowUpNudge', () => {
  const base = {
    applicationId: 'app-1',
    jobOfferId: 'offer-1',
    company: 'Acme',
    status: 'APPLIED' as const,
    latestStatusEventAt: daysAgo(8),
    latestOutreachAt: null,
  };

  it('fires once the latest status event is more than 7 days old', () => {
    const nudge = deriveFollowUpNudge(base, NOW);
    expect(nudge?.id).toBe('followup-nudge-app-1-1');
    expect(nudge?.href).toBe('/offers/offer-1?followUp=1');
  });

  it('changes id on the next weekly occurrence, so a dismiss does not suppress it forever', () => {
    const week1 = deriveFollowUpNudge(base, NOW);
    const week2 = deriveFollowUpNudge(
      { ...base, latestStatusEventAt: daysAgo(15) },
      NOW,
    );
    expect(week1?.id).not.toBe(week2?.id);
  });

  it('does not fire under 7 days since the last event', () => {
    expect(
      deriveFollowUpNudge({ ...base, latestStatusEventAt: daysAgo(3) }, NOW),
    ).toBeNull();
  });

  it('is suppressed once the application has a terminal outcome', () => {
    expect(
      deriveFollowUpNudge({ ...base, status: 'REJECTED' }, NOW),
    ).toBeNull();
  });

  it('resets the window off a more recent outreach send than the status event', () => {
    expect(
      deriveFollowUpNudge(
        {
          ...base,
          latestStatusEventAt: daysAgo(30),
          latestOutreachAt: daysAgo(2),
        },
        NOW,
      ),
    ).toBeNull();
  });
});

describe('derivePendingRequestNudge', () => {
  const base = {
    outreachMessageId: 'msg-1',
    jobOfferId: 'offer-1',
    company: 'Acme',
    sentAt: daysAgo(15),
  };

  it('fires once a sent connection note is more than 14 days old', () => {
    const nudge = derivePendingRequestNudge(base, NOW);
    expect(nudge?.id).toBe('pending-request-nudge-msg-1-1');
  });

  it('does not fire under 14 days', () => {
    expect(
      derivePendingRequestNudge({ ...base, sentAt: daysAgo(5) }, NOW),
    ).toBeNull();
  });
});
