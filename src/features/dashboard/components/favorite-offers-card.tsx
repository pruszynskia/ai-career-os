import type { JobOffer } from '@/entities/job-offer/types';

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListRow } from '@/shared/ui/list-row';
import { Text } from '@/shared/ui/primitives';

export function FavoriteOffersCard({ offers }: { offers: JobOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite offers</CardTitle>
        {offers.length > 0 && (
          <CardAction>
            <Text size="xs" color="muted">
              {offers.length}
            </Text>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-2">
        {offers.length === 0 ? (
          <EmptyState message="No favorite offers yet." className="px-4" />
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
      </CardContent>
    </Card>
  );
}
