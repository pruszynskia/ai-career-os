import { useMutation } from '@tanstack/react-query';
import { toast, toastError } from '@/shared/ui/toast';

import { matchOffer } from '@/features/job-offer/api/job-offer.api';

export function useMatchOffer() {
  return useMutation({
    mutationFn: matchOffer,
    onSuccess: () => toast.success('Match calculated'),
    onError: (error) => toastError(error.message),
  });
}
