import * as React from 'react';

import { cn } from '@/shared/ui/utils';

const LEVEL_CLASS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'text-2xl font-semibold',
  2: 'text-xl font-semibold',
  3: 'text-lg font-semibold',
  4: 'text-base font-semibold',
  5: 'text-sm font-semibold',
  6: 'text-xs font-semibold',
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
      className={cn('font-heading', LEVEL_CLASS[level], className)}
      {...props}
    />
  );
}

export { Heading };
export type { HeadingProps };
