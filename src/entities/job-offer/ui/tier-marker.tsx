import * as React from 'react';

import { Text } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

// Replaces the coloured Badge that used to carry a RecommendedAction's
// urgency (DESIGN-SYSTEM \S4.8/\S4.9). tier is the tokens.json tier index
// (1 applyImmediately .. 4 ignore); null renders the --tier-5 "not scored"
// dashed state. Always paired with a text label - the square alone is not
// meaningful (colour-only signal), so children is required.
const TIER_COLOR_VAR: Record<1 | 2 | 3 | 4, string> = {
  1: 'var(--tier-1)',
  2: 'var(--tier-2)',
  3: 'var(--tier-3)',
  4: 'var(--tier-4)',
};

interface TierMarkerProps extends Omit<
  React.ComponentProps<'span'>,
  'children'
> {
  tier: 1 | 2 | 3 | 4 | null;
  children: React.ReactNode;
}

function TierMarker({ tier, children, className, ...props }: TierMarkerProps) {
  return (
    <span
      data-slot="tier-marker"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 shrink-0 rounded-[1px]',
          tier === null && 'border border-dashed border-muted-foreground',
        )}
        style={
          tier === null ? undefined : { backgroundColor: TIER_COLOR_VAR[tier] }
        }
      />
      <Text as="span" size="sm">
        {children}
      </Text>
    </span>
  );
}

export { TierMarker };
export type { TierMarkerProps };
