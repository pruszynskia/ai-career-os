'use client';

import type { JobOffer } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/shared/ui/card';

export function OfferList({ offers }: { offers: JobOffer[] }) {
  const router = useRouter();
  const mutation = useToggleFavorite();

  if (offers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No offers yet — add one above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {offers.map((offer) => (
        <Card key={offer.id}>
          <CardHeader>
            <CardTitle>{offer.title}</CardTitle>
            <CardDescription>
              {offer.company} · {offer.source}
            </CardDescription>
            <CardAction>
              <Button
                variant={offer.isFavorite ? 'default' : 'outline'}
                size="sm"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate(
                    { id: offer.id, isFavorite: !offer.isFavorite },
                    { onSuccess: () => router.refresh() },
                  )
                }
              >
                {offer.isFavorite ? 'Favorited' : 'Favorite'}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {offer.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
