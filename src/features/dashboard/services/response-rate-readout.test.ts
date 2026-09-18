import { describe, expect, it } from 'vitest';

import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import type { ApplicationBundle } from '@/entities/application/types';
import type { FitAssessment, JobOffer } from '@/entities/job-offer/types';

import {
  computeResponseRateReadout,
  MIN_SAMPLE_SIZE,
} from './response-rate-readout';

function fit(overrides: Partial<FitAssessment> = {}): FitAssessment {
  return {
    criteria: {
      technicalMatch: { score: 80, reasoning: '' },
      seniorityMatch: { score: 80, reasoning: '' },
      coreStack: { score: 80, reasoning: '' },
      industry: { score: 80, reasoning: '' },
      workMode: { score: 80, reasoning: '' },
      salary: { score: 80, reasoning: '' },
      architectureExperience: { score: 80, reasoning: '' },
      companyAttractiveness: { score: 80, reasoning: '' },
      experienceSimilarity: { score: 80, reasoning: '' },
    },
    missingSkills: [],
    absentButTrue: [],
    hrCallbackProbability: 80,
    callbackModifiers: [],
    recommendedAction: 'APPLY_IMMEDIATELY',
    ...overrides,
  };
}

function offer(id: string, overrides: Partial<JobOffer> = {}): JobOffer {
  return {
    id,
    ownerId: 'owner-1',
    url: null,
    source: 'RAW_TEXT',
    rawContent: '',
    company: 'Acme',
    title: 'Engineer',
    description: '',
    matchScore: 80,
    fit: fit(),
    expiresAt: null,
    isExpired: false,
    isFavorite: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function application(
  id: string,
  status: ApplicationBundle['status'],
  jobOfferOverrides: Partial<JobOffer> = {},
): ApplicationBundle {
  return {
    id,
    ownerId: 'owner-1',
    jobOfferId: id,
    sentCvId: 'cv-1',
    recruiterMessage: '',
    status,
    notes: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    jobOffer: offer(id, jobOfferOverrides),
    sentCv: {} as ApplicationBundle['sentCv'],
    isExpired: false,
  };
}

describe('computeResponseRateReadout', () => {
  it('computes the fit-band response rate once the minimum sample is met', () => {
    const applications: ApplicationBundle[] = [
      application('a1', 'HR'),
      application('a2', 'REJECTED'),
      application('a3', 'APPLIED'),
      application('a4', 'NO_RESPONSE'),
      application('a5', 'OFFER'),
    ];

    const readout = computeResponseRateReadout(applications, [], []);

    expect(applications.length).toBe(MIN_SAMPLE_SIZE);
    const band = readout.byFitBand.find((g) => g.key === 'APPLY_IMMEDIATELY');
    // Responded: HR, REJECTED, OFFER = 3 of 5. Not responded: APPLIED (no
    // decision yet), NO_RESPONSE (decided: nothing came back).
    expect(band).toEqual({
      key: 'APPLY_IMMEDIATELY',
      label: 'Apply immediately',
      total: 5,
      responded: 3,
      responseRate: 0.6,
    });
  });

  it('shows not-enough-data (null rate) below the minimum sample size', () => {
    const applications = [application('a1', 'HR'), application('a2', 'OFFER')];

    const readout = computeResponseRateReadout(applications, [], []);

    expect(readout.byFitBand[0].responseRate).toBeNull();
  });

  it('excludes EXPIRED applications entirely - no decision was made either way', () => {
    const applications = [
      application('a1', 'EXPIRED'),
      application('a2', 'HR'),
      application('a3', 'HR'),
      application('a4', 'HR'),
      application('a5', 'HR'),
      application('a6', 'HR'),
    ];

    const readout = computeResponseRateReadout(applications, [], []);

    expect(readout.totalConsidered).toBe(5);
    expect(
      readout.byFitBand.find((g) => g.key === 'APPLY_IMMEDIATELY')?.total,
    ).toBe(5);
  });

  it('groups by outreach channel from job-offer-joined rows, one app can span channels', () => {
    const applications = [
      application('a1', 'HR'),
      application('a2', 'HR'),
      application('a3', 'NO_RESPONSE'),
      application('a4', 'NO_RESPONSE'),
      application('a5', 'NO_RESPONSE'),
    ];
    const outreachChannels = [
      { jobOfferId: 'a1', channel: 'EMAIL' as const },
      { jobOfferId: 'a2', channel: 'EMAIL' as const },
      { jobOfferId: 'a3', channel: 'EMAIL' as const },
      { jobOfferId: 'a4', channel: 'EMAIL' as const },
      { jobOfferId: 'a5', channel: 'EMAIL' as const },
    ];

    const readout = computeResponseRateReadout(
      applications,
      [],
      outreachChannels,
    );

    const email = readout.byChannel.find((g) => g.key === 'EMAIL');
    expect(email).toEqual({
      key: 'EMAIL',
      label: 'Email',
      total: 5,
      responded: 2,
      responseRate: 0.4,
    });
  });

  it('computes median days to first reply from the status-event log, ignoring NO_RESPONSE/EXPIRED as a reply', () => {
    function events(
      applicationId: string,
      values: [ApplicationBundle['status'], string][],
    ): ApplicationStatusEvent[] {
      return values.map(([status, date]) => ({
        id: `${applicationId}-${status}`,
        ownerId: 'owner-1',
        applicationId,
        status,
        createdAt: new Date(date),
      }));
    }

    const statusEvents = [
      ...events('a1', [
        ['APPLIED', '2026-01-01'],
        ['HR', '2026-01-04'],
      ]), // 3 days
      ...events('a2', [
        ['APPLIED', '2026-01-01'],
        ['HR', '2026-01-08'],
      ]), // 7 days
      ...events('a3', [
        ['APPLIED', '2026-01-01'],
        ['HR', '2026-01-11'],
      ]), // 10 days
      ...events('a4', [
        ['APPLIED', '2026-01-01'],
        ['NO_RESPONSE', '2026-02-01'],
      ]), // not a reply - excluded
      ...events('a5', [
        ['APPLIED', '2026-01-01'],
        ['TECHNICAL', '2026-01-06'],
      ]), // 5 days
      ...events('a6', [
        ['APPLIED', '2026-01-01'],
        ['HR', '2026-01-10'],
      ]), // 9 days
    ];

    const readout = computeResponseRateReadout([], statusEvents, []);

    // Sorted replies: 3, 5, 7, 9, 10 -> median (middle of 5) = 7
    expect(readout.medianDaysToFirstReply).toBe(7);
  });
});
