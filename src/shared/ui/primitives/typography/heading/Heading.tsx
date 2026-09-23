import * as React from 'react';

import { cn } from '@/shared/ui/utils';

// Geist Sans is the only face (Midnight Mint, ADR-023) - no display face
// split anymore, every heading level renders in font-sans, differentiated
// by size and weight only.
const LEVEL_CLASS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'font-sans text-h1',
  2: 'font-sans text-h2',
  3: 'font-sans text-h3',
  4: 'font-sans text-body-lg',
  5: 'font-sans text-body',
  6: 'font-sans text-body-sm',
};

interface HeadingProps extends React.ComponentProps<'h1'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

function Heading({ className, level = 1, as, ...props }: HeadingProps) {
  const Comp = as ?? (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  return (
    <Comp
      data-slot="heading"
      className={cn('font-semibold', LEVEL_CLASS[level], className)}
      {...props}
    />
  );
}

export { Heading };
export type { HeadingProps };
