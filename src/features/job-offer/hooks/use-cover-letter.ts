import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { generateCoverLetter } from '@/features/job-offer/api/job-offer.api';

export function useCoverLetter() {
  return useMutation({
    mutationFn: generateCoverLetter,
    onSuccess: () => toast.success('Cover letter generated'),
    onError: (error) => toast.error(error.message),
  });
}
