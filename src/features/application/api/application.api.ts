import type {
  ApplicationStatus,
  CreateApplicationResponse,
  SearchApplicationsResponse,
  UpdateApplicationStatusResponse,
} from '@/features/application/types';

async function parseErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message ?? fallbackMessage;
}

export async function createApplication(input: {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}): Promise<CreateApplicationResponse> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, 'Failed to create the application.'),
    );
  }

  return response.json();
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<UpdateApplicationStatusResponse> {
  const response = await fetch(`/api/applications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, 'Failed to update the status.'),
    );
  }

  return response.json();
}

export async function searchApplicationsAndOffers(
  query: string,
): Promise<SearchApplicationsResponse> {
  const response = await fetch(
    `/api/applications?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to search.'));
  }

  return response.json();
}
