import type { SubscriptionStatus } from '@/entities/subscription/types';
import { Badge } from '@/shared/ui/primitives/feedback/badge';

// active/trialing read as healthy, past_due/unpaid as needing attention,
// everything else (canceled, incomplete*, paused) as inactive.
const VARIANT_BY_STATUS: Record<
  SubscriptionStatus,
  'success' | 'destructive' | 'secondary'
> = {
  active: 'success',
  trialing: 'success',
  past_due: 'destructive',
  unpaid: 'destructive',
  canceled: 'secondary',
  incomplete: 'secondary',
  incomplete_expired: 'secondary',
  paused: 'secondary',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function PlanBadge({
  plan,
  status,
}: {
  plan: string;
  status: SubscriptionStatus;
}) {
  return (
    <Badge variant={VARIANT_BY_STATUS[status]}>
      {capitalize(plan)} · {status.replace('_', ' ')}
    </Badge>
  );
}
