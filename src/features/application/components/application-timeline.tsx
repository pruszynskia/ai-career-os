import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
      <CardContent>
        <ol className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium">
                {APPLICATION_STATUS_LABELS[event.status]}
              </span>
              <span className="text-muted-foreground">
                {event.createdAt.toLocaleDateString()}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
