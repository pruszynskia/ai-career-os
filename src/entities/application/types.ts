import { z } from 'zod';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

export type ApplicationStatus =
  | 'APPLIED'
  | 'HR'
  | 'TECHNICAL'
  | 'TEAM'
  | 'CEO_OR_MANAGER'
  | 'OFFER'
  | 'REJECTED'
  | 'NO_RESPONSE'
  | 'EXPIRED';

export const applicationStatusSchema = z.enum([
  'APPLIED',
  'HR',
  'TECHNICAL',
  'TEAM',
  'CEO_OR_MANAGER',
  'OFFER',
  'REJECTED',
  'NO_RESPONSE',
  'EXPIRED',
]);

// Terminal outcomes (TASK-085): a stage is still open work, an outcome is
// not. EXPIRED stays distinct from REJECTED - the listing was pulled, no
// decision was made about the candidate either way - so it must never be
// collapsed into it.
export const TERMINAL_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  'OFFER',
  'REJECTED',
  'NO_RESPONSE',
  'EXPIRED',
];

export function isTerminalApplicationStatus(
  status: ApplicationStatus,
): boolean {
  return (TERMINAL_APPLICATION_STATUSES as ApplicationStatus[]).includes(
    status,
  );
}

export const applicationSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  jobOfferId: z.string().min(1),
  sentCvId: z.string().min(1),
  recruiterMessage: z.string().min(1),
  status: applicationStatusSchema,
  notes: z.string().nullable(),
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
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationBundle = Application & {
  jobOffer: JobOffer;
  sentCv: CvDocument;
  isExpired: boolean;
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  HR: 'HR',
  TECHNICAL: 'Technical',
  TEAM: 'Team',
  CEO_OR_MANAGER: 'CEO / Manager',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  NO_RESPONSE: 'No response',
  EXPIRED: 'Expired',
};

// The five open stages the Kanban board renders as columns - terminal
// outcomes get one closed lane instead (see application-board.tsx).
export const ACTIVE_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  'APPLIED',
  'HR',
  'TECHNICAL',
  'TEAM',
  'CEO_OR_MANAGER',
];
