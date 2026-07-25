import * as React from 'react';

import { cn } from '@/shared/ui/utils';

interface SplitLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  className?: string;
}

function SplitLayout({ list, detail, className }: SplitLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-6 md:flex-row md:gap-0',
        className,
      )}
      data-slot="split-layout"
    >
      <div className="w-full shrink-0 overflow-y-auto md:w-80 md:border-r md:pr-6">
        {list}
      </div>
      <div className="w-full flex-1 overflow-y-auto md:pl-6">{detail}</div>
    </div>
  );
}

export { SplitLayout };
export type { SplitLayoutProps };
