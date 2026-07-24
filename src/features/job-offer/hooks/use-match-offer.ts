import { useMutation } from '@tanstack/react-query';

import { matchOffer } from '@/features/job-offer/api/job-offer.api';

export function useMatchOffer() {
  return useMutation({
    mutationFn: matchOffer,
  });
}
