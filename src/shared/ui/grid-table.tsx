import * as React from 'react';
import { ChevronRightIcon } from 'lucide-react';

import { TierMarker } from '@/entities/job-offer/ui/tier-marker';
import { cn } from '@/shared/ui/utils';

// GridTable (DESIGN-SYSTEM \S4.13) - CSS-grid table primitive: GridTable
// (root), GridTableHead (32, 12px muted), GridTableRow (36, 13px,
// border-subtle bottom), a tier-aware GridTableGroupHeader (36, sunken bg,
// TierMarker + count + meta) and GridTableShowMore (30, 12 muted). Primitive
// only, following Card's <Root><Sub/></Root> naming - no consumer yet
// (Offers list/dashboard/Fit report wire real data in TASK-104/105/109).
//
// `columns` is a CSS grid-template-columns track list (e.g.
// "20px minmax(0,1fr) 96px"). GridTable sets it once as the `--gt-columns`
// custom property; GridTableHead/GridTableRow read that var via normal CSS
// inheritance, so every row in a table shares one column layout without
// repeating the string per row.
interface GridTableProps extends React.ComponentProps<'div'> {
  columns: string;
}

function GridTable({ columns, className, style, ...props }: GridTableProps) {
  return (
    <div
      data-slot="grid-table"
      style={{ ...style, '--gt-columns': columns } as React.CSSProperties}
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}

function GridTableHead({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="grid-table-head"
      style={{ gridTemplateColumns: 'var(--gt-columns)' }}
      className={cn(
        'grid h-8 items-center gap-x-3 border-b border-border px-4 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

interface GridTableRowProps extends React.ComponentProps<'div'> {
  selected?: boolean;
}

function GridTableRow({ className, selected, ...props }: GridTableRowProps) {
  return (
    <div
      data-slot="grid-table-row"
      data-selected={selected || undefined}
      style={{ gridTemplateColumns: 'var(--gt-columns)' }}
      className={cn(
        'grid h-9 items-center gap-x-3 border-b border-border px-4 text-[13px] hover:bg-muted data-[selected]:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

// Numeric cells (score, count, date columns) are right-aligned tabular by
// convention - apply this to the cell's own className rather than adding a
// dedicated Cell component (Head/Row accept arbitrary children per column).
const gridTableNumericCellClassName =
  'text-right font-mono text-xs tabular-nums';

interface GridTableGroupHeaderProps extends Omit<
  React.ComponentProps<'div'>,
  'children'
> {
  tier: 1 | 2 | 3 | 4 | null;
  label: React.ReactNode;
  count: number;
  /** Trailing muted meta, e.g. "avg match 76 · callback 60". */
  meta?: React.ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function GridTableGroupHeader({
  tier,
  label,
  count,
  meta,
  collapsed = false,
  onCollapsedChange,
  className,
  ...props
}: GridTableGroupHeaderProps) {
  return (
    <div
      data-slot="grid-table-group-header"
      className={cn(
        'flex h-9 items-center gap-2 bg-[var(--surface-sunken)] px-4 text-[13px]',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-label={
          typeof label === 'string' ? `Toggle ${label}` : 'Toggle group'
        }
        onClick={() => onCollapsedChange?.(!collapsed)}
        className="flex size-[22px] shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
      >
        <ChevronRightIcon
          aria-hidden="true"
          className={cn(
            'size-3.5 transition-transform',
            !collapsed && 'rotate-90',
          )}
        />
      </button>
      <TierMarker tier={tier} className="shrink-0">
        <span className="font-semibold text-foreground">{label}</span>
      </TierMarker>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
      {meta && (
        <span className="truncate text-xs text-muted-foreground">{meta}</span>
      )}
    </div>
  );
}

interface GridTableShowMoreProps extends Omit<
  React.ComponentProps<'button'>,
  'children'
> {
  count: number;
}

function GridTableShowMore({
  count,
  className,
  ...props
}: GridTableShowMoreProps) {
  return (
    <button
      type="button"
      data-slot="grid-table-show-more"
      className={cn(
        'flex h-[30px] w-full items-center pr-4 pl-12 text-xs text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      Show {count} more
    </button>
  );
}

export {
  GridTable,
  GridTableHead,
  GridTableRow,
  GridTableGroupHeader,
  GridTableShowMore,
  gridTableNumericCellClassName,
};
export type {
  GridTableProps,
  GridTableRowProps,
  GridTableGroupHeaderProps,
  GridTableShowMoreProps,
};
