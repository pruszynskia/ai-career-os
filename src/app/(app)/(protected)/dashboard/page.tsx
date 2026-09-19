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
import { Grid } from '@/shared/ui/primitives';

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

  return (
    <AppPageLayout title="Dashboard">
      <Grid cols={1} colsMd={2} gap={6}>
        <NextPostCard post={posts[0] ?? null} />
        <UpcomingInterviewsCard applications={upcoming} />
        <ApplicationStatusBreakdownCard applications={applications} />
        <ResponseRateCard readout={responseRateReadout} />
        <RecentActivityCard events={recentActivity} />
        <FavoriteOffersCard offers={favoriteOffers} />
        <RecentOffersCard offers={recentOffers} />
      </Grid>
    </AppPageLayout>
  );
}
