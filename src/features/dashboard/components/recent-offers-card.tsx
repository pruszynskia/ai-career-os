import type { JobOffer } from '@/entities/job-offer/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';

export function RecentOffersCard({ offers }: { offers: JobOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent offers</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-2">
        {offers.length === 0 ? (
          <EmptyState message="No offers added yet." className="px-4" />
        ) : (
          <div>
            {offers.map((offer) => (
              <ListRow
                key={offer.id}
                href={`/offers/${offer.id}`}
                title={offer.title}
                supporting={offer.company}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
