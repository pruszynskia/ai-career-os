import { requestJson } from '@/shared/api/request';
import type {
  ClaimState,
  EvidenceBase,
  JobPreferences,
} from '@/entities/profile/types';
import type {
  UpdateEvidenceResponse,
  UpdatePreferencesResponse,
} from '@/features/profile/types';

export function updateProfilePreferences(
  preferences: Partial<JobPreferences>,
): Promise<UpdatePreferencesResponse> {
  return requestJson(
    '/api/profile/preferences',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    },
    'Failed to update your job preferences.',
  );
}

// Also used to patch a single claim's state ({ claimId, state }) - the
// route accepts either shape, so evidence-review.tsx's claim mutation
// shares this instead of duplicating the fetch/parse block.
export function updateEvidenceRules(
  rules:
    | Pick<EvidenceBase, 'neverInclude' | 'alwaysIncludeWhenRelevant'>
    | { claimId: string; state: ClaimState },
): Promise<UpdateEvidenceResponse> {
  return requestJson(
    '/api/profile/evidence',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rules),
    },
    'Failed to update your evidence base.',
  );
}
