import type { ApplicationBundle } from '@/entities/application/types';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';
import { Heading, VStack } from '@/shared/ui/primitives';

export function UpcomingInterviewsCard({
  applications,
}: {
  applications: ApplicationBundle[];
}) {
  return (
    <VStack gap={2}>
      <Heading level={4} as="h2">
        Upcoming interviews
      </Heading>
      {applications.length === 0 ? (
        <EmptyState message="No interviews in progress." />
      ) : (
        <div>
          {applications.map((application) => (
            <ListRow
              key={application.id}
              href={`/offers/${application.jobOffer.id}`}
              title={application.jobOffer.title}
              supporting={application.jobOffer.company}
              meta={application.status}
            />
          ))}
        </div>
      )}
    </VStack>
  );
}
