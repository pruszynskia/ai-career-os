import { jobOfferService } from '@/entities/job-offer/service';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { OfferList } from '@/features/job-offer/components/offer-list';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const offers = await jobOfferService.findMany({
    where: { ownerId: SEED_OWNER_ID },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Offers</h1>

      <AddOfferForm />

      <OfferList offers={offers} />
    </div>
  );
}
