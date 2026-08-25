import type { JobPreferences } from '@/entities/profile/types';
import type { UpdatePreferencesResponse } from '@/features/profile/types';

async function parseErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message ?? fallbackMessage;
}

export async function updateProfilePreferences(
  preferences: Partial<JobPreferences>,
): Promise<UpdatePreferencesResponse> {
  const response = await fetch('/api/profile/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        'Failed to update your job preferences.',
      ),
    );
  }

  return response.json();
}
