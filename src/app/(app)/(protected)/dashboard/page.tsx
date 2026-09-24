import Link from 'next/link';

import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { isTerminalApplicationStatus } from '@/entities/application/types';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import { ApplicationStatusBreakdownCard } from '@/features/dashboard/components/application-status-breakdown-card';
import { FavoriteOffersCard } from '@/features/dashboard/components/favorite-offers-card';
import { NextPostCard } from '@/features/dashboard/components/next-post-card';
import { RecentActivityCard } from '@/features/dashboard/components/recent-activity-card';
import { RecentOffersCard } from '@/features/dashboard/components/recent-offers-card';
import { ResponseRateCard } from '@/features/dashboard/components/response-rate-card';
import { UpcomingInterviewsCard } from '@/features/dashboard/components/upcoming-interviews-card';
import { getResponseRateReadout } from '@/features/dashboard/services/response-rate-readout.service';
import { getOwnerId } from '@/shared/auth/session';
import { EntitlementError } from '@/shared/billing/errors';
import { AppPageLayout } from '@/shared/layouts';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Grid, VStack } from '@/shared/ui/primitives';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const ownerId = await getOwnerId();
  const [
    posts,
    applications,
    favoriteOffers,
    recentOffers,
    recentActivity,
    responseRateReadout,
  ] = await Promise.all([
    postService.findMany(
      { ownerId, status: 'SCHEDULED' },
      { orderBy: 'scheduledAt', take: 1 },
    ),
    applicationService.findMany({ ownerId }),
    jobOfferService.findMany({ ownerId, isFavorite: true }),
    jobOfferService.findMany({ ownerId }, { take: 5 }),
    applicationStatusEventService.findRecent({ ownerId }, { take: 5 }),
    // Free plan: null, not a thrown error, so the card below renders its
    // own inline upgrade prompt instead of taking down the whole page.
    getResponseRateReadout(ownerId).catch((error) => {
      if (error instanceof EntitlementError) return null;
      throw error;
    }),
  ]);
  // Active pipeline: still-open work, not the terminal outcomes (TASK-085) -
  // an OFFER/REJECTED/NO_RESPONSE/EXPIRED application is done, not upcoming.
  const upcoming = applications.filter(
    (a) => a.status !== 'APPLIED' && !isTerminalApplicationStatus(a.status),
  );
  // recentOffers is the account's offers with no filter, just capped at 5 -
  // empty here means the account genuinely has zero offers, which is also
  // the only way applications/interviews/activity can be empty (both FK to
  // a job offer). One first-run panel replaces all four list sections
  // rather than each showing its own empty box.
  const hasOffers = recentOffers.length > 0;

  return (
    <AppPageLayout title="Dashboard">
      {hasOffers && (
        <ApplicationStatusBreakdownCard applications={applications} />
      )}
      <Grid cols={1} colsMd={12} gap={6}>
        <VStack gap={6} className="md:col-span-8">
          {hasOffers ? (
            <>
              <UpcomingInterviewsCard applications={upcoming} />
              <RecentActivityCard events={recentActivity} />
            </>
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  message="Add your first job offer to start tracking applications, interviews and activity here."
                  className="items-center px-8 py-16 text-center"
                  action={
                    <Button asChild size="sm">
                      <Link href="/offers">Add your first offer</Link>
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
          <NextPostCard post={posts[0] ?? null} />
        </VStack>
        <VStack gap={6} className="md:col-span-4">
          {hasOffers && (
            <>
              <FavoriteOffersCard offers={favoriteOffers} />
              <RecentOffersCard offers={recentOffers} />
            </>
          )}
          <ResponseRateCard readout={responseRateReadout} />
        </VStack>
      </Grid>
    </AppPageLayout>
  );
}
