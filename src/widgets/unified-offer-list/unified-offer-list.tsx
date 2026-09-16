'use client';

import Link from 'next/link';

import type { OfferWithApplication } from '@/features/job-offer/types';
import { ApplicationStatusSelect } from '@/features/application/components/application-status-select';
import { DeleteOfferButton } from '@/features/job-offer/components/delete-offer-button';
import { RecommendedActionBadge } from '@/features/job-offer/components/recommended-action-badge';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Spinner } from '@/shared/ui/primitives/feedback/spinner';
import { surfaceVariants } from '@/shared/ui/primitives/surface/surface';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/utils';
import { EmptyState } from '@/shared/ui/empty-state';

// One row per offer, merging the offer row (favorite, delete, match score,
// Expired badge) with its application status/actions (status pipeline
// select, Download sent CV) when the offer is tracked. Rendered as ruled
// rows - each row carries more than one line of content and several
// actions, so it is built directly on the `ruled` Surface elevation rather
// than the simple link-row ListRow primitive.
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
    <div className="flex flex-col">
      {offers.map(({ application, ...offer }) => {
        const isTogglingThis =
          favoriteMutation.isPending &&
          favoriteMutation.variables?.id === offer.id;

        return (
          <div
            key={offer.id}
            className={cn(
              surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
              'flex flex-col gap-2 last:border-b-0',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <Link
                    href={`/offers/${offer.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {offer.title}
                  </Link>
                  {offer.isExpired && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                  {offer.fit && (
                    <RecommendedActionBadge
                      action={offer.fit.recommendedAction}
                    />
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {offer.company} · {offer.source}
                  {offer.matchScore !== null && ` · ${offer.matchScore}% match`}
                  {offer.fit &&
                    ` · ${offer.fit.hrCallbackProbability}% callback`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
              </div>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {offer.description}
            </p>
            {application && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap text-sm">
                  {application.recruiterMessage}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    downloadTextFile('sent-cv.txt', application.sentCv.content)
                  }
                >
                  Download sent CV
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
