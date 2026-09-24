import Link from 'next/link';

import type { ApplicationBundle } from '@/entities/application/types';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  TERMINAL_APPLICATION_STATUSES,
} from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/primitives';

// Pipeline strip (X-dashboard.dc.html) - a StageRing + count per open
// status, counted from the `applications` page.tsx already fetched (no new
// query), plus a sunken Closed lane breaking out the four terminal outcomes
// (TASK-085) that the five open-stage cells deliberately don't include.
export function PipelineStrip({
  applications,
}: {
  applications: ApplicationBundle[];
}) {
  return (
    <Card
      aria-label="Application pipeline"
      className="grid grid-cols-2 overflow-hidden sm:grid-cols-3 md:grid-cols-[repeat(5,minmax(0,1fr))_240px]"
    >
      {ACTIVE_APPLICATION_STATUSES.map((status, index) => (
        <Link
          key={status}
          href="/offers?view=board"
          className={
            'flex flex-col gap-2 px-4 py-3.5 hover:bg-muted' +
            (index > 0 ? ' border-l border-border' : '')
          }
        >
          <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <StageRing status={status} />
            {APPLICATION_STATUS_LABELS[status]}
          </span>
          <Text
            as="span"
            weight="medium"
            className="font-mono text-[22px] leading-[26px]"
          >
            {applications.filter((a) => a.status === status).length}
          </Text>
        </Link>
      ))}
      <div className="flex flex-col gap-2 border-l border-border bg-[var(--surface-sunken)] px-4 py-3.5">
        <Text size="xs" color="muted">
          Closed
        </Text>
        <Text size="sm" color="muted" className="leading-[19px]">
          {TERMINAL_APPLICATION_STATUSES.map((status, index) => (
            <span key={status}>
              {index > 0 && (index % 2 === 0 ? <br /> : ' · ')}
              {APPLICATION_STATUS_LABELS[status]}{' '}
              <span className="font-mono tabular-nums text-foreground">
                {applications.filter((a) => a.status === status).length}
              </span>
            </span>
          ))}
        </Text>
      </div>
    </Card>
  );
}
