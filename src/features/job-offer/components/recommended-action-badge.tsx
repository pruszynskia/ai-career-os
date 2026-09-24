import { TierMarker } from '@/entities/job-offer/ui/tier-marker';
import type { RecommendedAction } from '@/entities/job-offer/types';

// Exported so TASK-105's tier-grouped GridTable (unified-offer-list.tsx,
// offers-summary.tsx) can group/label by the same enum instead of a second
// copy of these maps.
export const RECOMMENDED_ACTION_LABEL: Record<RecommendedAction, string> = {
  APPLY_IMMEDIATELY: 'Apply immediately',
  STRONG_OPPORTUNITY: 'Strong opportunity',
  CONSIDER: 'Consider',
  IGNORE: 'Ignore',
};

// tokens.json's tier order (applyImmediately/strongOpportunity/consider/
// ignore -> tier-1..4) mirrors RecommendedAction 1:1.
export const RECOMMENDED_ACTION_TIER: Record<RecommendedAction, 1 | 2 | 3 | 4> = {
  APPLY_IMMEDIATELY: 1,
  STRONG_OPPORTUNITY: 2,
  CONSIDER: 3,
  IGNORE: 4,
};

// TIER_LABEL by number (rather than by RecommendedAction) - one copy for
// both offers-summary.tsx's mix legend and unified-offer-list.tsx's group
// headers, which both group by tier number, not by the enum itself.
export const TIER_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: RECOMMENDED_ACTION_LABEL.APPLY_IMMEDIATELY,
  2: RECOMMENDED_ACTION_LABEL.STRONG_OPPORTUNITY,
  3: RECOMMENDED_ACTION_LABEL.CONSIDER,
  4: RECOMMENDED_ACTION_LABEL.IGNORE,
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
