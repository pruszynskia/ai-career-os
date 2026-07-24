import { useMutation } from '@tanstack/react-query';

import { searchApplicationsAndOffers } from '@/features/application/api/application.api';

export function useSearchApplications() {
  return useMutation({ mutationFn: searchApplicationsAndOffers });
}
