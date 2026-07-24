import type {
  Application,
  ApplicationBundle,
  ApplicationStatus,
} from '@/entities/application/types';
import type { JobOffer } from '@/entities/job-offer/types';

export interface CreateApplicationResponse {
  application: Application;
}

export interface UpdateApplicationStatusResponse {
  application: Application;
}

export interface SearchApplicationsResponse {
  applications: ApplicationBundle[];
  offers: JobOffer[];
}

export type { ApplicationStatus };
