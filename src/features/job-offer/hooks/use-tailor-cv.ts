import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { toast, toastError } from '@/shared/ui/toast';

import { tailorCv } from '@/features/job-offer/api/job-offer.api';

export function useTailorCv() {
  return useMutation({
    mutationFn: tailorCv,
    onSuccess: () => {
      toast.success('Tailored CV generated');
      track('cv_tailored');
    },
    onError: (error) => toastError(error.message),
  });
}
