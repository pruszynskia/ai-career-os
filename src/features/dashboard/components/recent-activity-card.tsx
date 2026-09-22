import type { RecentStatusEvent } from '@/entities/application-status-event/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';
import { Heading, VStack } from '@/shared/ui/primitives';

export function RecentActivityCard({
  events,
}: {
  events: RecentStatusEvent[];
}) {
  return (
    <VStack gap={2}>
      <Heading level={4} as="h2">
        Recent activity
      </Heading>
      {events.length === 0 ? (
        <EmptyState message="No application activity yet." />
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
    </VStack>
  );
}
