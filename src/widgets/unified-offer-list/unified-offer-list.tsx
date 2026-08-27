'use client';

import Link from 'next/link';

import type { OfferWithApplication } from '@/features/job-offer/types';
import { ApplicationStatusSelect } from '@/features/application/components/application-status-select';
import { DeleteOfferButton } from '@/features/job-offer/components/delete-offer-button';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Spinner } from '@/shared/ui/primitives/feedback/spinner';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

// One row per offer, merging the offer row (favorite, delete, match score,
// Expired badge) with its application status/actions (status pipeline
// select, Download sent CV) when the offer is tracked.
export function UnifiedOfferList({
  offers,
  isFiltered = false,
}: {
  offers: OfferWithApplication[];
  isFiltered?: boolean;
}) {
  const favoriteMutation = useToggleFavorite();

  if (offers.length === 0) {
    return (
      <EmptyState
        message={
          isFiltered
            ? 'No offers match your filters.'
            : 'No offers yet — add one above.'
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {offers.map(({ application, ...offer }) => {
        const isTogglingThis =
          favoriteMutation.isPending &&
          favoriteMutation.variables?.id === offer.id;

        return (
          <Card key={offer.id} className="transition-colors hover:bg-muted">
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
              <CardAction className="flex flex-wrap items-center gap-2">
                {application ? (
                  <ApplicationStatusSelect
                    applicationId={application.id}
                    status={application.status}
                  />
                ) : (
                  <Badge variant="outline">Not tracked</Badge>
                )}
                <Button
                  variant={offer.isFavorite ? 'default' : 'outline'}
                  size="sm"
                  disabled={isTogglingThis}
                  onClick={() =>
                    favoriteMutation.mutate({
                      id: offer.id,
                      isFavorite: !offer.isFavorite,
                    })
                  }
                >
                  {isTogglingThis && <Spinner size="sm" />}
                  {offer.isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <DeleteOfferButton offerId={offer.id} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {offer.description}
              </p>
              {application && (
                <>
                  <p className="line-clamp-2 whitespace-pre-wrap text-sm">
                    {application.recruiterMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() =>
                      downloadTextFile(
                        'sent-cv.txt',
                        application.sentCv.content,
                      )
                    }
                  >
                    Download sent CV
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
