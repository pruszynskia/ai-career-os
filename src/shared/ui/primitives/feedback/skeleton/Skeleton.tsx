import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    variant: {
      // Generic loading block - radius 6.
      block: 'rounded-[6px]',
      // Stand-in for a line of copy - height 10, radius 3. Compose several
      // to mimic paragraph/heading placeholders, e.g.
      // `<Skeleton variant="line" className="w-2/3" />`.
      line: 'h-[10px] rounded-[3px]',
    },
  },
  defaultVariants: {
    variant: 'block',
  },
});

interface SkeletonProps
  extends React.ComponentProps<'div'>, VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
export type { SkeletonProps };
