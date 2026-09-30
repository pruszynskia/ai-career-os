import { useMutation } from '@tanstack/react-query';
import { toast, toastError } from '@/shared/ui/toast';

import { generateCoverLetter } from '@/features/job-offer/api/job-offer.api';

export function useCoverLetter() {
  return useMutation({
    mutationFn: generateCoverLetter,
    onSuccess: () => toast.success('Cover letter generated'),
    onError: (error) => toastError(error.message),
  });
}
