import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

export type ApplicationStatus =
  'APPLIED' | 'HR' | 'TECHNICAL' | 'TEAM' | 'CEO_OR_MANAGER';

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
};
