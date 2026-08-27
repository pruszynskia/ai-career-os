import type {
  Application,
  ApplicationStatus,
} from '@/entities/application/types';

export interface CreateApplicationResponse {
  application: Application;
}

export interface UpdateApplicationStatusResponse {
  application: Application;
}

export type { ApplicationStatus };
