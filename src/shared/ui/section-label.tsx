import * as React from 'react';

import { cn } from '@/shared/ui/utils';

/**
 * Eyebrow / section heading text - 12px, weight 500, muted, sentence case.
 * Replaces the old Label "meta" variant (DESIGN-SYSTEM.md \S4.4), which was
 * mono + uppercase. Deliberately not a Label variant: the look and semantics
 * (a caption, not a form label) are different enough to warrant its own
 * small component.
 */
function SectionLabel({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="section-label"
      className={cn('text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

export { SectionLabel };
