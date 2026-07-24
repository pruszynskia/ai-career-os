import { jobOfferService } from '@/entities/job-offer/service';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { OfferList } from '@/features/job-offer/components/offer-list';
import { getOwnerId } from '@/shared/auth/session';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const ownerId = await getOwnerId();
  const offers = await jobOfferService.findMany({ ownerId });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Offers</h1>

      <AddOfferForm />

      <OfferList offers={offers} />
    </div>
  );
}
