import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import { FavoriteOffersCard } from '@/features/dashboard/components/favorite-offers-card';
import { NextPostCard } from '@/features/dashboard/components/next-post-card';
import { UpcomingInterviewsCard } from '@/features/dashboard/components/upcoming-interviews-card';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [posts, applications, offers] = await Promise.all([
    postService.findMany({
      where: { ownerId: SEED_OWNER_ID, status: 'SCHEDULED' },
      orderBy: { scheduledAt: 'asc' },
      take: 1,
    }),
    applicationService.findMany({
      where: { ownerId: SEED_OWNER_ID, status: { not: 'APPLIED' } },
      include: { jobOffer: true, sentCv: true },
      orderBy: { updatedAt: 'desc' },
    }),
    jobOfferService.findMany({
      where: { ownerId: SEED_OWNER_ID, isFavorite: true },
      orderBy: { createdAt: 'desc' },
    }),
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
