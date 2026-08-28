import Link from 'next/link';

import type { RecentStatusEvent } from '@/entities/application-status-event/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

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
      <CardContent>
        {events.length === 0 ? (
          <EmptyState message="No application activity yet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/offers/${event.jobOffer.id}`}
                  className="-mx-2 block rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{event.jobOffer.title}</span> ·{' '}
                  {event.jobOffer.company} ·{' '}
                  {APPLICATION_STATUS_LABELS[event.status]} ·{' '}
                  {event.createdAt.toLocaleDateString()}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
