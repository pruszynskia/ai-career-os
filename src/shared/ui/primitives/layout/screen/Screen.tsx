import * as React from 'react';

import { cn } from '@/shared/ui/utils';

interface ScreenProps extends React.ComponentProps<'main'> {
  as?: 'main' | 'div';
}

function Screen({ className, as = 'main', ...props }: ScreenProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp
      data-slot="screen"
      className={cn('flex-1 overflow-y-auto p-6', className)}
      {...props}
    />
  );
}

export { Screen };
export type { ScreenProps };
