import { useMutation } from '@tanstack/react-query';

import { generateRecruiterMessage } from '@/features/job-offer/api/job-offer.api';

export function useRecruiterMessage() {
  return useMutation({
    mutationFn: generateRecruiterMessage,
  });
}
