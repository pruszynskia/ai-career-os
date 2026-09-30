import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ListRow } from '@/shared/ui/list-row';
import { formatDate } from '@/shared/utils/format-date';

// Events arrive oldest-to-newest from applicationStatusEventService.findMany.
export function ApplicationTimeline({
  events,
}: {
  events: ApplicationStatusEvent[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status history</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ol>
          {events.map((event) => (
            <li key={event.id}>
              <ListRow
                leading={<StageRing status={event.status} />}
                title={APPLICATION_STATUS_LABELS[event.status]}
                meta={formatDate(event.createdAt)}
              />
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
