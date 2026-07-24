import type {
  Application,
  ApplicationStatus,
  JobOffer,
} from '@prisma/client';

import type { ApplicationBundle } from '@/entities/application/types';

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
