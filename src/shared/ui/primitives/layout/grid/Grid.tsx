import * as React from 'react';

import { cn } from '@/shared/ui/utils';
import { GAP_CLASS, type Gap } from '@/shared/ui/primitives/layout/gap';

const COLS_CLASS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
} as const;

const COLS_MD_CLASS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
} as const;

type Cols = keyof typeof COLS_CLASS;

interface GridProps extends React.ComponentProps<'div'> {
  cols?: Cols;
  colsMd?: Cols;
  gap?: Gap;
}

function Grid({ className, cols = 1, colsMd, gap, ...props }: GridProps) {
  return (
    <div
      data-slot="grid"
      className={cn(
        'grid',
        COLS_CLASS[cols],
        colsMd !== undefined && COLS_MD_CLASS[colsMd],
        gap !== undefined && GAP_CLASS[gap],
        className,
      )}
      {...props}
    />
  );
}

export { Grid };
export type { GridProps };
