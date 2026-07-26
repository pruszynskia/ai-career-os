import { z } from 'zod';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

export type ApplicationStatus =
  'APPLIED' | 'HR' | 'TECHNICAL' | 'TEAM' | 'CEO_OR_MANAGER';

export const applicationStatusSchema = z.enum([
  'APPLIED',
  'HR',
  'TECHNICAL',
  'TEAM',
  'CEO_OR_MANAGER',
]);

export const applicationSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  jobOfferId: z.string().min(1),
  sentCvId: z.string().min(1),
  recruiterMessage: z.string().min(1),
  status: applicationStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface Application {
  id: string;
  ownerId: string;
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationBundle = Application & {
  jobOffer: JobOffer;
  sentCv: CvDocument;
  isExpired: boolean;
};
