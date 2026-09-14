import type { JobOffer } from '@/entities/job-offer/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';

export function FavoriteOffersCard({ offers }: { offers: JobOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite offers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {offers.length === 0 ? (
          <EmptyState message="No favorite offers yet." className="p-6" />
        ) : (
          offers.map((offer) => (
            <ListRow
              key={offer.id}
              href={`/offers/${offer.id}`}
              title={offer.title}
              supporting={offer.company}
              meta={
                offer.matchScore !== null ? `${offer.matchScore}%` : undefined
              }
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
