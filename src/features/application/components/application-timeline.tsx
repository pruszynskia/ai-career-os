import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ListRow } from '@/shared/ui/list-row';

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
                title={APPLICATION_STATUS_LABELS[event.status]}
                meta={event.createdAt.toLocaleDateString()}
              />
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
