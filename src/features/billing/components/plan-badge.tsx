import type { SubscriptionStatus } from '@/entities/subscription/types';
import { Tag } from '@/shared/ui/tag';
import { Text } from '@/shared/ui/primitives';

// past_due/unpaid need attention and read as status text (destructive,
// no box, DESIGN-SYSTEM \S4.8); every other status is neutral plan info
// and reads as a plain Tag, matching X-settings.dc.html's "Current" tag.
const NEEDS_ATTENTION: ReadonlySet<SubscriptionStatus> = new Set([
  'past_due',
  'unpaid',
]);

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
  const label = `${capitalize(plan)} · ${status.replace('_', ' ')}`;

  return NEEDS_ATTENTION.has(status) ? (
    <Text color="destructive" weight="medium">
      {label}
    </Text>
  ) : (
    <Tag>{label}</Tag>
  );
}
