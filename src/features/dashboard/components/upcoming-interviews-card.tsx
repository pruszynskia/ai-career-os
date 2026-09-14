import type { ApplicationBundle } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';

export function UpcomingInterviewsCard({
  applications,
}: {
  applications: ApplicationBundle[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming interviews</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {applications.length === 0 ? (
          <EmptyState message="No interviews in progress." className="p-6" />
        ) : (
          applications.map((application) => (
            <ListRow
              key={application.id}
              href={`/offers/${application.jobOffer.id}`}
              title={application.jobOffer.title}
              supporting={application.jobOffer.company}
              meta={application.status}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
