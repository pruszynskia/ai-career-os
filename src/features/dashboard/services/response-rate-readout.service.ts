import 'server-only';

import type { ResponseRateReadout } from '@/features/dashboard/services/response-rate-readout';

import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { applicationService } from '@/entities/application/service';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { computeResponseRateReadout } from '@/features/dashboard/services/response-rate-readout';

export async function getResponseRateReadout(
  ownerId: string,
): Promise<ResponseRateReadout> {
  const [applications, statusEvents, outreachChannels] = await Promise.all([
    applicationService.findMany({ ownerId }),
    applicationStatusEventService.findAllByOwnerId(ownerId),
    outreachMessageService.findChannelsByOwnerId(ownerId),
  ]);

  return computeResponseRateReadout(
    applications,
    statusEvents,
    outreachChannels,
  );
}
