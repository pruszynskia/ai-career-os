import type { RecommendedAction } from '@/entities/job-offer/types';

import { Badge, type BadgeProps } from '@/shared/ui/primitives';

const RECOMMENDED_ACTION_LABEL: Record<RecommendedAction, string> = {
  APPLY_IMMEDIATELY: 'Apply immediately',
  STRONG_OPPORTUNITY: 'Strong opportunity',
  CONSIDER: 'Consider',
  IGNORE: 'Ignore',
};

const RECOMMENDED_ACTION_VARIANT: Record<
  RecommendedAction,
  NonNullable<BadgeProps['variant']>
> = {
  APPLY_IMMEDIATELY: 'success',
  STRONG_OPPORTUNITY: 'info',
  CONSIDER: 'warning',
  IGNORE: 'outline',
};

export function RecommendedActionBadge({
  action,
}: {
  action: RecommendedAction;
}) {
  return (
    <Badge variant={RECOMMENDED_ACTION_VARIANT[action]}>
      {RECOMMENDED_ACTION_LABEL[action]}
    </Badge>
  );
}
