import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';
import { GAP_CLASS, type Gap } from '@/shared/ui/primitives/layout/gap';

const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
    },
  },
  defaultVariants: {
    direction: 'row',
  },
});

interface FlexProps
  extends React.ComponentProps<'div'>, VariantProps<typeof flexVariants> {
  gap?: Gap;
}

function Flex({
  className,
  direction,
  align,
  justify,
  wrap,
  gap,
  ...props
}: FlexProps) {
  return (
    <div
      data-slot="flex"
      className={cn(
        flexVariants({ direction, align, justify, wrap }),
        gap !== undefined && GAP_CLASS[gap],
        className,
      )}
      {...props}
    />
  );
}

export { Flex, flexVariants };
export type { FlexProps };
