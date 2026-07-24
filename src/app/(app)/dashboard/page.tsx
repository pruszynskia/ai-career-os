import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import { FavoriteOffersCard } from '@/features/dashboard/components/favorite-offers-card';
import { NextPostCard } from '@/features/dashboard/components/next-post-card';
import { UpcomingInterviewsCard } from '@/features/dashboard/components/upcoming-interviews-card';
import { getOwnerId } from '@/shared/auth/session';

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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <NextPostCard post={posts[0] ?? null} />
        <UpcomingInterviewsCard applications={applications} />
        <FavoriteOffersCard offers={offers} />
      </div>
    </div>
  );
}
