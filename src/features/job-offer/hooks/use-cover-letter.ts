import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { toast, toastError } from '@/shared/ui/toast';

import { generateCoverLetter } from '@/features/job-offer/api/job-offer.api';

export function useCoverLetter() {
  return useMutation({
    mutationFn: generateCoverLetter,
    onSuccess: () => {
      toast.success('Cover letter generated');
      track('cover_letter_generated');
    },
    onError: (error) => toastError(error.message),
  });
}
