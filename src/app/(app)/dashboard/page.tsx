import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import { FavoriteOffersCard } from '@/features/dashboard/components/favorite-offers-card';
import { NextPostCard } from '@/features/dashboard/components/next-post-card';
import { UpcomingInterviewsCard } from '@/features/dashboard/components/upcoming-interviews-card';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';
import { Grid } from '@/shared/ui/primitives';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const ownerId = await getOwnerId();
  const [posts, applications, offers] = await Promise.all([
    postService.findMany(
      { ownerId, status: 'SCHEDULED' },
      { orderBy: 'scheduledAt', take: 1 },
    ),
    applicationService.findMany({ ownerId, statusNot: 'APPLIED' }),
    jobOfferService.findMany({ ownerId, isFavorite: true }),
  ]);

  return (
    <AppPageLayout title="Dashboard">
      <Grid cols={1} colsMd={2} gap={6}>
        <NextPostCard post={posts[0] ?? null} />
        <UpcomingInterviewsCard applications={applications} />
        <FavoriteOffersCard offers={offers} />
      </Grid>
    </AppPageLayout>
  );
}
