import Link from 'next/link';

import type { ApplicationBundle } from '@/entities/application/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  GridTable,
  GridTableHead,
  GridTableRow,
  gridTableNumericCellClassName,
} from '@/shared/ui/grid-table';
import { Meter, Text } from '@/shared/ui/primitives';

const COLUMNS = 'minmax(0,1fr) 150px 96px 76px';

export function UpcomingInterviewsCard({
  applications,
}: {
  applications: ApplicationBundle[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming interviews</CardTitle>
        <CardAction className="flex items-center gap-3">
          <Text size="xs" color="muted">
            {applications.length} in progress past Applied
          </Text>
          <Link
            href="/offers"
            className="text-body-sm font-medium text-primary"
          >
            All offers
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-2">
        {applications.length === 0 ? (
          <EmptyState message="No interviews in progress." className="px-4" />
        ) : (
          <GridTable columns={COLUMNS}>
            <GridTableHead>
              <span>Role</span>
              <span>Stage</span>
              <span>Match</span>
              <span className={gridTableNumericCellClassName}>Updated</span>
            </GridTableHead>
            {applications.map((application) => (
              <GridTableRow key={application.id}>
                <span className="truncate">
                  <Link
                    href={`/offers/${application.jobOffer.id}`}
                    className="font-medium hover:underline"
                  >
                    {application.jobOffer.title}
                  </Link>
                  <span className="text-muted-foreground">
                    {' '}
                    · {application.jobOffer.company}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <StageRing status={application.status} />
                  {APPLICATION_STATUS_LABELS[application.status]}
                </span>
                {application.jobOffer.matchScore !== null ? (
                  <span className="flex items-center gap-2">
                    <Meter
                      variant="inline"
                      value={application.jobOffer.matchScore}
                      className="w-10"
                    />
                    <span className={gridTableNumericCellClassName}>
                      {application.jobOffer.matchScore}
                    </span>
                  </span>
                ) : (
                  <span className={gridTableNumericCellClassName}>—</span>
                )}
                <span className={gridTableNumericCellClassName}>
                  {application.updatedAt.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </GridTableRow>
            ))}
          </GridTable>
        )}
      </CardContent>
    </Card>
  );
}
