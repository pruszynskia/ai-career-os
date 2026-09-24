import { TierMarker } from '@/entities/job-offer/ui/tier-marker';
import type { RecommendedAction } from '@/entities/job-offer/types';

const RECOMMENDED_ACTION_LABEL: Record<RecommendedAction, string> = {
  APPLY_IMMEDIATELY: 'Apply immediately',
  STRONG_OPPORTUNITY: 'Strong opportunity',
  CONSIDER: 'Consider',
  IGNORE: 'Ignore',
};

// tokens.json's tier order (applyImmediately/strongOpportunity/consider/
// ignore -> tier-1..4) mirrors RecommendedAction 1:1.
const RECOMMENDED_ACTION_TIER: Record<RecommendedAction, 1 | 2 | 3 | 4> = {
  APPLY_IMMEDIATELY: 1,
  STRONG_OPPORTUNITY: 2,
  CONSIDER: 3,
  IGNORE: 4,
};

export function RecommendedActionBadge({
  action,
}: {
  action: RecommendedAction;
}) {
  return (
    <TierMarker tier={RECOMMENDED_ACTION_TIER[action]}>
      {RECOMMENDED_ACTION_LABEL[action]}
    </TierMarker>
  );
}
