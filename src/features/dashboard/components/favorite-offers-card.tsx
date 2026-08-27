import type { JobOffer } from '@/entities/job-offer/types';
import Link from 'next/link';

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
              <li key={offer.id}>
                <Link
                  href={`/offers/${offer.id}`}
                  className="-mx-2 block rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{offer.title}</span> ·{' '}
                  {offer.company}
                  {offer.matchScore !== null && ` · ${offer.matchScore}% match`}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
