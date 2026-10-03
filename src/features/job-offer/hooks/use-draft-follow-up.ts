import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { toast, toastError } from '@/shared/ui/toast';

import { draftFollowUp } from '@/features/job-offer/api/job-offer.api';

export function useDraftFollowUp() {
  return useMutation({
    mutationFn: draftFollowUp,
    onSuccess: () => {
      toast.success('Follow-up drafted');
      track('follow_up_generated');
    },
    onError: (error) => toastError(error.message),
  });
}
