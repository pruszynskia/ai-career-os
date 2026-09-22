import type { JobOffer } from '@/entities/job-offer/types';

import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';
import { Heading, VStack } from '@/shared/ui/primitives';

export function FavoriteOffersCard({ offers }: { offers: JobOffer[] }) {
  return (
    <VStack gap={2}>
      <Heading level={4} as="h2">
        Favorite offers
      </Heading>
      {offers.length === 0 ? (
        <EmptyState message="No favorite offers yet." />
      ) : (
        <div>
          {offers.map((offer) => (
            <ListRow
              key={offer.id}
              href={`/offers/${offer.id}`}
              title={offer.title}
              supporting={offer.company}
              meta={
                offer.matchScore !== null ? `${offer.matchScore}%` : undefined
              }
            />
          ))}
        </div>
      )}
    </VStack>
  );
}
