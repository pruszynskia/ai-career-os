import * as React from 'react';

import { cn } from '@/shared/ui/utils';

// Score/usage bar (DESIGN-SYSTEM \S4.11). Two heights: 3px inline (sits next
// to text, e.g. a table cell) and 6px standalone (its own row, e.g. the
// billing usage bar). `segments` renders a stacked multi-colour bar for the
// recommendation-mix legend instead of a single fill - there is no single
// "current value" in that case, so it stays presentational (no meter role).
interface MeterSegment {
  value: number;
  colorVar: string;
}

interface MeterProps {
  variant?: 'inline' | 'standalone';
  value?: number;
  max?: number;
  segments?: MeterSegment[];
  className?: string;
  'aria-label'?: string;
}

function Meter({
  variant = 'inline',
  value = 0,
  max = 100,
  segments,
  className,
  'aria-label': ariaLabel,
}: MeterProps) {
  const isStandalone = variant === 'standalone';
  const isSegmented = segments !== undefined;

  return (
    <div
      data-slot="meter"
      role={isStandalone && !isSegmented ? 'meter' : undefined}
      aria-valuenow={isStandalone && !isSegmented ? value : undefined}
      aria-valuemin={isStandalone && !isSegmented ? 0 : undefined}
      aria-valuemax={isStandalone && !isSegmented ? max : undefined}
      aria-label={isStandalone && !isSegmented ? ariaLabel : undefined}
      className={cn(
        'flex w-full overflow-hidden rounded-full bg-[var(--chart-track)]',
        isStandalone ? 'h-1.5' : 'h-[3px]',
        className,
      )}
    >
      {isSegmented ? (
        segments.map((segment, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(segment.value / max) * 100}%`,
              backgroundColor: segment.colorVar,
            }}
          />
        ))
      ) : (
        <span
          aria-hidden="true"
          className="h-full rounded-full bg-primary"
          style={{
            width: `${Math.min(100, Math.max(0, (value / max) * 100))}%`,
          }}
        />
      )}
    </div>
  );
}

export { Meter };
export type { MeterProps, MeterSegment };
