import { searchApplicationsAndOffers } from '@/features/application/services/search-applications.service';
import { PageHeader } from '@/shared/ui/page-header';
import { CompanySearch } from '@/widgets/company-search/company-search';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const { applications, offers } = await searchApplicationsAndOffers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Applications" />

      <CompanySearch
        initialApplications={applications}
        initialOffers={offers}
      />
    </div>
  );
}
