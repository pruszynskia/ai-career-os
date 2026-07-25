import { searchApplicationsAndOffers } from '@/features/application/services/search-applications.service';
import { AppPageLayout } from '@/shared/layouts';
import { CompanySearch } from '@/widgets/company-search/company-search';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const { applications, offers } = await searchApplicationsAndOffers();

  return (
    <AppPageLayout title="Applications">
      <CompanySearch
        initialApplications={applications}
        initialOffers={offers}
      />
    </AppPageLayout>
  );
}
