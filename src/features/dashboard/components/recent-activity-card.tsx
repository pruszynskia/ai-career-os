import type { RecentStatusEvent } from '@/entities/application-status-event/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';

export function RecentActivityCard({
  events,
}: {
  events: RecentStatusEvent[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-2">
        {events.length === 0 ? (
          <EmptyState message="No application activity yet." className="px-4" />
        ) : (
          <div>
            {events.map((event) => (
              <ListRow
                key={event.id}
                href={`/offers/${event.jobOffer.id}`}
                title={event.jobOffer.title}
                supporting={`${event.jobOffer.company} · ${APPLICATION_STATUS_LABELS[event.status]}`}
                meta={event.createdAt.toLocaleDateString()}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
