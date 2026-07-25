import type { JobOffer } from '@/entities/job-offer/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export function FavoriteOffersCard({ offers }: { offers: JobOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite offers</CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <EmptyState message="No favorite offers yet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {offers.map((offer) => (
              <li key={offer.id} className="text-sm">
                <span className="font-medium">{offer.title}</span> ·{' '}
                {offer.company}
                {offer.matchScore !== null && ` · ${offer.matchScore}% match`}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
