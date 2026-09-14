import * as React from 'react';
import Link from 'next/link';

import { surfaceVariants } from '@/shared/ui/primitives/surface/surface';
import { cn } from '@/shared/ui/utils';

interface ListRowProps {
  /** Optional URL - renders the row as a `Link` instead of a `div`. */
  href?: string;
  leading?: React.ReactNode;
  title: React.ReactNode;
  supporting?: React.ReactNode;
  /** Trailing content, e.g. a date or status - rendered in mono. */
  meta?: React.ReactNode;
  className?: string;
}

function ListRow({
  href,
  leading,
  title,
  supporting,
  meta,
  className,
}: ListRowProps) {
  const content = (
    <>
      {leading}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{title}</span>
        {supporting && (
          <span className="truncate text-sm text-muted-foreground">
            {supporting}
          </span>
        )}
      </span>
      {meta && (
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {meta}
        </span>
      )}
    </>
  );

  const rowClassName = cn(
    surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
    'flex w-full items-center gap-3 last:border-b-0',
    href && 'hover:bg-muted/50',
    className,
  );

  if (href) {
    return (
      <Link href={href} data-slot="list-row" className={rowClassName}>
        {content}
      </Link>
    );
  }

  return (
    <div data-slot="list-row" className={rowClassName}>
      {content}
    </div>
  );
}

export { ListRow };
export type { ListRowProps };
