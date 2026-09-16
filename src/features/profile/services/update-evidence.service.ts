import 'server-only';

import type { ClaimState, EvidenceBase } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { getOwnerId } from '@/shared/auth/session';
// Reused rather than redeclared: "no profile yet" means the same thing for
// every profile mutation.
import { ProfileNotFoundError } from '@/features/profile/services/update-preferences.service';

export { ProfileNotFoundError };

export async function updateEvidenceClaimState(
  claimId: string,
  state: ClaimState,
) {
  const ownerId = await getOwnerId();
  const profile = await profileService.updateEvidenceClaim(
    ownerId,
    claimId,
    state,
  );
  if (!profile) throw new ProfileNotFoundError();
  return profile;
}

export async function updateEvidenceRules(
  rules: Pick<EvidenceBase, 'neverInclude' | 'alwaysIncludeWhenRelevant'>,
) {
  const ownerId = await getOwnerId();
  const profile = await profileService.updateEvidenceRules(ownerId, rules);
  if (!profile) throw new ProfileNotFoundError();
  return profile;
}
