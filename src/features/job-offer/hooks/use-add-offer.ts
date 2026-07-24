import { useMutation } from '@tanstack/react-query';

import { addOffer } from '@/features/job-offer/api/job-offer.api';

export function useAddOffer() {
  return useMutation({
    mutationFn: addOffer,
  });
}
