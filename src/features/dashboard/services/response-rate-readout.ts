import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import type { ApplicationBundle } from '@/entities/application/types';
import type { RecommendedAction } from '@/entities/job-offer/types';
import type { OutreachChannel } from '@/entities/outreach-message/types';

// Below this many applications a percentage is noise dressed up as insight
// (TASK-085) - the card shows the not-enough-data state instead.
export const MIN_SAMPLE_SIZE = 5;

export type CallbackBand = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ResponseRateGroup {
  key: string;
  label: string;
  total: number;
  responded: number;
  // null below MIN_SAMPLE_SIZE - never a rate computed from noise.
  responseRate: number | null;
}

export interface ResponseRateReadout {
  minSampleSize: number;
  totalConsidered: number;
  // Every considered application, fit-scored or not (unlike byFitBand,
  // which only buckets the ones with a fit) - the offers list KPI strip's
  // single "Response rate" figure needs the whole account, not just the
  // Pro-scored subset (TASK-105).
  overallResponded: number;
  byFitBand: ResponseRateGroup[];
  byCallbackBand: ResponseRateGroup[];
  byChannel: ResponseRateGroup[];
  medianDaysToFirstReply: number | null;
}

const FIT_BAND_LABELS: Record<RecommendedAction, string> = {
  APPLY_IMMEDIATELY: 'Apply immediately',
  STRONG_OPPORTUNITY: 'Strong opportunity',
  CONSIDER: 'Consider',
  IGNORE: 'Ignore',
};

const CALLBACK_BAND_LABELS: Record<CallbackBand, string> = {
  HIGH: 'High callback odds (70%+)',
  MEDIUM: 'Medium callback odds (40-69%)',
  LOW: 'Low callback odds (<40%)',
};

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  CONNECTION_NOTE: 'Connection note',
  DIRECT_MESSAGE: 'Direct message',
  EMAIL: 'Email',
};

function callbackBandOf(probability: number): CallbackBand {
  if (probability >= 70) return 'HIGH';
  if (probability >= 40) return 'MEDIUM';
  return 'LOW';
}

// A reply already happened once the current status has moved past APPLIED
// into anything but the two "nothing came back" outcomes - status only ever
// moves forward, so the current value alone is enough (no event scan).
function hasResponded(status: ApplicationBundle['status']): boolean {
  return status !== 'APPLIED' && status !== 'NO_RESPONSE';
}

function toGroups<T extends string>(
  buckets: Map<T, { total: number; responded: number }>,
  labels: Record<T, string>,
): ResponseRateGroup[] {
  return Array.from(buckets.entries()).map(([key, { total, responded }]) => ({
    key,
    label: labels[key],
    total,
    responded,
    responseRate: total >= MIN_SAMPLE_SIZE ? responded / total : null,
  }));
}

function bump<T extends string>(
  buckets: Map<T, { total: number; responded: number }>,
  key: T,
  responded: boolean,
): void {
  const current = buckets.get(key) ?? { total: 0, responded: 0 };
  current.total += 1;
  if (responded) current.responded += 1;
  buckets.set(key, current);
}

function medianOf(values: number[]): number | null {
  if (values.length < MIN_SAMPLE_SIZE) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Days from the APPLIED event to the first event that is an actual reply -
// NO_RESPONSE/EXPIRED are the user recording that no reply ever came, not a
// reply themselves, so they're never picked as "first reply".
function daysToFirstReply(events: ApplicationStatusEvent[]): number | null {
  const sorted = [...events].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const applied = sorted.find((event) => event.status === 'APPLIED');
  if (!applied) return null;

  const reply = sorted.find(
    (event) =>
      event.createdAt.getTime() > applied.createdAt.getTime() &&
      event.status !== 'NO_RESPONSE' &&
      event.status !== 'EXPIRED',
  );
  if (!reply) return null;

  const ms = reply.createdAt.getTime() - applied.createdAt.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

// Pure computation, kept free of data-fetching/'server-only' so it can be
// unit tested against a manual calculation on seeded data (see the
// .test.ts file) - mirrors mechanical-subscores.ts's split from
// match-offer.service.ts.
export function computeResponseRateReadout(
  applications: ApplicationBundle[],
  statusEvents: ApplicationStatusEvent[],
  outreachChannels: { jobOfferId: string; channel: OutreachChannel }[],
): ResponseRateReadout {
  // EXPIRED means the listing was pulled - no decision was ever made about
  // the candidate, so it can't be counted as either a response or a
  // non-response (this is why EXPIRED must stay distinct from REJECTED).
  const considered = applications.filter((a) => a.status !== 'EXPIRED');

  const fitBandBuckets = new Map<
    RecommendedAction,
    { total: number; responded: number }
  >();
  const callbackBandBuckets = new Map<
    CallbackBand,
    { total: number; responded: number }
  >();

  const channelsByOffer = new Map<string, Set<OutreachChannel>>();
  for (const row of outreachChannels) {
    const set = channelsByOffer.get(row.jobOfferId) ?? new Set();
    set.add(row.channel);
    channelsByOffer.set(row.jobOfferId, set);
  }
  const channelBuckets = new Map<
    OutreachChannel,
    { total: number; responded: number }
  >();

  let overallResponded = 0;
  for (const application of considered) {
    const responded = hasResponded(application.status);
    if (responded) overallResponded += 1;
    const fit = application.jobOffer.fit;

    if (fit) {
      bump(fitBandBuckets, fit.recommendedAction, responded);
      bump(
        callbackBandBuckets,
        callbackBandOf(fit.hrCallbackProbability),
        responded,
      );
    }

    for (const channel of channelsByOffer.get(application.jobOfferId) ?? []) {
      bump(channelBuckets, channel, responded);
    }
  }

  const eventsByApplication = new Map<string, ApplicationStatusEvent[]>();
  for (const event of statusEvents) {
    const list = eventsByApplication.get(event.applicationId) ?? [];
    list.push(event);
    eventsByApplication.set(event.applicationId, list);
  }
  const replyDays = Array.from(eventsByApplication.values())
    .map(daysToFirstReply)
    .filter((days): days is number => days !== null);

  return {
    minSampleSize: MIN_SAMPLE_SIZE,
    totalConsidered: considered.length,
    overallResponded,
    byFitBand: toGroups(fitBandBuckets, FIT_BAND_LABELS),
    byCallbackBand: toGroups(callbackBandBuckets, CALLBACK_BAND_LABELS),
    byChannel: toGroups(channelBuckets, CHANNEL_LABELS),
    medianDaysToFirstReply: medianOf(replyDays),
  };
}
