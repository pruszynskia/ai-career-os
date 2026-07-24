import type { JobOffer } from '@/entities/job-offer/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function FavoriteOffersCard({ offers }: { offers: JobOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite offers</CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No favorite offers yet.
          </p>
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
