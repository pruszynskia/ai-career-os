import * as React from 'react';

import { cn } from '@/shared/ui/utils';

const VERTICAL_SIZE: Record<number, string> = {
  1: 'h-1',
  2: 'h-2',
  4: 'h-4',
  6: 'h-6',
  8: 'h-8',
};

const HORIZONTAL_SIZE: Record<number, string> = {
  1: 'w-1',
  2: 'w-2',
  4: 'w-4',
  6: 'w-6',
  8: 'w-8',
};

interface SpacerProps extends React.ComponentProps<'div'> {
  axis?: 'horizontal' | 'vertical';
  size?: 1 | 2 | 4 | 6 | 8;
}

function Spacer({
  className,
  axis = 'vertical',
  size = 4,
  ...props
}: SpacerProps) {
  const sizeClass =
    axis === 'horizontal' ? HORIZONTAL_SIZE[size] : VERTICAL_SIZE[size];

  return (
    <div
      data-slot="spacer"
      aria-hidden="true"
      className={cn(sizeClass, className)}
      {...props}
    />
  );
}

export { Spacer };
export type { SpacerProps };
