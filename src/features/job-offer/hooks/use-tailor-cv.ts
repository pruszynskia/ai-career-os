import { useMutation } from '@tanstack/react-query';

import { tailorCv } from '@/features/job-offer/api/job-offer.api';

export function useTailorCv() {
  return useMutation({
    mutationFn: tailorCv,
  });
}
