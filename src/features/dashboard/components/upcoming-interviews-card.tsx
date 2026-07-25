import type { ApplicationBundle } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

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
      <CardContent>
        {applications.length === 0 ? (
          <EmptyState message="No interviews in progress." />
        ) : (
          <ul className="flex flex-col gap-2">
            {applications.map((application) => (
              <li key={application.id} className="text-sm">
                <span className="font-medium">
                  {application.jobOffer.title}
                </span>{' '}
                · {application.jobOffer.company} · {application.status}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
