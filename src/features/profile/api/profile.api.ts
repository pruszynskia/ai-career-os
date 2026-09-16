import type { EvidenceBase, JobPreferences } from '@/entities/profile/types';
import type {
  UpdateEvidenceResponse,
  UpdatePreferencesResponse,
} from '@/features/profile/types';

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

export async function updateEvidenceRules(
  rules: Pick<EvidenceBase, 'neverInclude' | 'alwaysIncludeWhenRelevant'>,
): Promise<UpdateEvidenceResponse> {
  const response = await fetch('/api/profile/evidence', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, 'Failed to update your evidence base.'),
    );
  }

  return response.json();
}
