import { describe, expect, it } from 'vitest';

import type { ApplicationBundle } from '@/entities/application/types';
import type { JobOffer } from '@/entities/job-offer/types';

import {
  deriveFollowUpNudge,
  deriveNudges,
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

function offer(id: string, company: string): JobOffer {
  return {
    id,
    ownerId: 'owner-1',
    url: null,
    source: 'RAW_TEXT',
    rawContent: '',
    company,
    title: 'Engineer',
    description: '',
    matchScore: 80,
    fit: null,
    expiresAt: null,
    isExpired: false,
    isFavorite: false,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  };
}

function application(id: string, jobOffer: JobOffer): ApplicationBundle {
  return {
    id,
    ownerId: 'owner-1',
    jobOfferId: jobOffer.id,
    sentCvId: 'cv-1',
    recruiterMessage: '',
    status: 'APPLIED',
    notes: null,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    jobOffer,
    sentCv: {} as ApplicationBundle['sentCv'],
    isExpired: false,
  };
}

describe('deriveNudges', () => {
  // Both get-notifications.service.ts (popover) and the dashboard's Needs
  // attention section (TASK-104) call this same aggregator - so the same
  // fixture below always produces the identical nudge for either consumer.
  it('derives the same follow-up nudge from applications/offers/statusEvents/outreachSends', () => {
    const acmeOffer = offer('offer-1', 'Acme');
    const app = application('app-1', acmeOffer);

    const nudges = deriveNudges(
      {
        applications: [app],
        offers: [acmeOffer],
        statusEvents: [],
        outreachSends: [],
      },
      NOW,
    );

    expect(nudges).toHaveLength(1);
    expect(nudges[0]).toMatchObject({
      id: 'followup-nudge-app-1-1',
      href: '/offers/offer-1?followUp=1',
    });
  });
});
