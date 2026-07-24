import { useMutation } from '@tanstack/react-query';

import { generateCoverLetter } from '@/features/job-offer/api/job-offer.api';

export function useCoverLetter() {
  return useMutation({
    mutationFn: generateCoverLetter,
  });
}
