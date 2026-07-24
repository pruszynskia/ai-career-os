import { searchApplicationsAndOffers } from '@/features/application/services/search-applications.service';
import { CompanySearch } from '@/widgets/company-search/company-search';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const { applications, offers } = await searchApplicationsAndOffers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Applications</h1>

      <CompanySearch
        initialApplications={applications}
        initialOffers={offers}
      />
    </div>
  );
}
