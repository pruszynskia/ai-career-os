import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import { ApplicationStatusBreakdownCard } from '@/features/dashboard/components/application-status-breakdown-card';
import { FavoriteOffersCard } from '@/features/dashboard/components/favorite-offers-card';
import { NextPostCard } from '@/features/dashboard/components/next-post-card';
import { RecentOffersCard } from '@/features/dashboard/components/recent-offers-card';
import { UpcomingInterviewsCard } from '@/features/dashboard/components/upcoming-interviews-card';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';
import { Grid } from '@/shared/ui/primitives';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const ownerId = await getOwnerId();
  const [posts, applications, favoriteOffers, recentOffers] = await Promise.all(
    [
      postService.findMany(
        { ownerId, status: 'SCHEDULED' },
        { orderBy: 'scheduledAt', take: 1 },
      ),
      applicationService.findMany({ ownerId }),
      jobOfferService.findMany({ ownerId, isFavorite: true }),
      jobOfferService.findMany({ ownerId }, { take: 5 }),
    ],
  );
  const upcoming = applications.filter((a) => a.status !== 'APPLIED');

  return (
    <AppPageLayout title="Dashboard">
      <Grid cols={1} colsMd={2} gap={6}>
        <NextPostCard post={posts[0] ?? null} />
        <UpcomingInterviewsCard applications={upcoming} />
        <ApplicationStatusBreakdownCard applications={applications} />
        <FavoriteOffersCard offers={favoriteOffers} />
        <RecentOffersCard offers={recentOffers} />
      </Grid>
    </AppPageLayout>
  );
}
