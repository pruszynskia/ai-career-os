import { requestJson } from '@/shared/api/request';
import type {
  ApplicationStatus,
  CreateApplicationResponse,
  UpdateApplicationNotesResponse,
  UpdateApplicationStatusResponse,
} from '@/features/application/types';

export function createApplication(input: {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}): Promise<CreateApplicationResponse> {
  return requestJson(
    '/api/applications',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    'Failed to create the application.',
  );
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<UpdateApplicationStatusResponse> {
  return requestJson(
    `/api/applications/${id}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    },
    'Failed to update the status.',
  );
}

export function updateApplicationNotes(
  id: string,
  notes: string,
): Promise<UpdateApplicationNotesResponse> {
  return requestJson(
    `/api/applications/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    },
    'Failed to update the notes.',
  );
}
