import { useMutation } from '@tanstack/react-query';
import { toast, toastError } from '@/shared/ui/toast';

import { draftFollowUp } from '@/features/job-offer/api/job-offer.api';

export function useDraftFollowUp() {
  return useMutation({
    mutationFn: draftFollowUp,
    onSuccess: () => toast.success('Follow-up drafted'),
    onError: (error) => toastError(error.message),
  });
}
