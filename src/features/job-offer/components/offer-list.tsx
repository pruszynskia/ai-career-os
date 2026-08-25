'use client';

import type { JobOffer } from '@/entities/job-offer/types';
import Link from 'next/link';

import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Spinner } from '@/shared/ui/primitives/feedback/spinner';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export function OfferList({ offers }: { offers: JobOffer[] }) {
  const mutation = useToggleFavorite();

  if (offers.length === 0) {
    return <EmptyState message="No offers yet — add one above." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {offers.map((offer) => {
        const isTogglingThis =
          mutation.isPending && mutation.variables?.id === offer.id;

        return (
          <Card key={offer.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/offers/${offer.id}`} className="hover:underline">
                  {offer.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {offer.company} · {offer.source}
                {offer.matchScore !== null && ` · ${offer.matchScore}% match`}
                {offer.isExpired && (
                  <Badge variant="destructive" className="ml-2">
                    Expired
                  </Badge>
                )}
              </CardDescription>
              <CardAction>
                <Button
                  variant={offer.isFavorite ? 'default' : 'outline'}
                  size="sm"
                  disabled={isTogglingThis}
                  onClick={() =>
                    mutation.mutate({
                      id: offer.id,
                      isFavorite: !offer.isFavorite,
                    })
                  }
                >
                  {isTogglingThis && <Spinner size="sm" />}
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
        );
      })}
    </div>
  );
}
