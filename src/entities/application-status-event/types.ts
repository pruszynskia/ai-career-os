import { z } from 'zod';

import { applicationStatusSchema } from '@/entities/application/types';
import type { ApplicationStatus } from '@/entities/application/types';
import type { JobOffer } from '@/entities/job-offer/types';

export const applicationStatusEventSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  applicationId: z.string().min(1),
  status: applicationStatusSchema,
  createdAt: z.date(),
});

export interface ApplicationStatusEvent {
  id: string;
  ownerId: string;
  applicationId: string;
  status: ApplicationStatus;
  createdAt: Date;
}

// findRecent joins the offer so the dashboard card can show company/title
// without a second query — mirrors ApplicationBundle in application/types.ts.
export type RecentStatusEvent = ApplicationStatusEvent & { jobOffer: JobOffer };
