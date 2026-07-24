import type { ApplicationBundle } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
          <p className="text-sm text-muted-foreground">
            No interviews in progress.
          </p>
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
