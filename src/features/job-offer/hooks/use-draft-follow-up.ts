import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { draftFollowUp } from '@/features/job-offer/api/job-offer.api';

export function useDraftFollowUp() {
  return useMutation({
    mutationFn: draftFollowUp,
    onSuccess: () => toast.success('Follow-up drafted'),
    onError: (error) => toast.error(error.message),
  });
}
