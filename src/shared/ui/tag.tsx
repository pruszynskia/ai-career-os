import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

// Neutral-only chip (DESIGN-SYSTEM \S4.8) - the coloured badgeVariants this
// replaces are retired, status now reads as Text colour instead of a box.
// aria-pressed:* covers the selected/filter-chip state from the mockup's
// `.tag.on` style; it is opt-in (pass aria-pressed on the element).
const tagVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 rounded-lg border border-[var(--border-default)] px-2 text-xs font-normal whitespace-nowrap text-[var(--foreground-secondary)] aria-pressed:border-[var(--border-strong)] aria-pressed:bg-muted aria-pressed:text-foreground',
  {
    variants: {
      size: {
        sm: 'h-5',
        md: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface TagProps
  extends React.ComponentProps<'span'>, VariantProps<typeof tagVariants> {}

function Tag({ className, size, ...props }: TagProps) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ size }), className)}
      {...props}
    />
  );
}

export { Tag, tagVariants };
export type { TagProps };
