import 'server-only';

import type { ResponseRateReadout } from '@/features/dashboard/services/response-rate-readout';

import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { computeResponseRateReadout } from '@/features/dashboard/services/response-rate-readout';
import { requirePlan } from '@/shared/billing/entitlements';

/**
 * Outcome readout is Pro-only (TASK-088). Throws EntitlementError on Free -
 * the dashboard page is the only caller and it catches that to render the
 * card's inline upgrade prompt instead of the readout, rather than failing
 * the whole page. Any new caller must catch it the same way.
 */
export async function getResponseRateReadout(
  ownerId: string,
): Promise<ResponseRateReadout> {
  await requirePlan(ownerId, 'pro');

  const [applications, offers, statusEvents, outreachChannels] =
    await Promise.all([
      applicationService.findMany({ ownerId }),
      // Bundles carry no fit (ADR-025); the readout buckets by it.
      jobOfferService.findMany({ ownerId }),
      applicationStatusEventService.findAllByOwnerId(ownerId),
      outreachMessageService.findChannelsByOwnerId(ownerId),
    ]);
  const offerById = new Map(offers.map((offer) => [offer.id, offer]));

  return computeResponseRateReadout(
    applications.map((application) => ({
      ...application,
      jobOffer: offerById.get(application.jobOffer.id) ?? application.jobOffer,
    })),
    statusEvents,
    outreachChannels,
  );
}
