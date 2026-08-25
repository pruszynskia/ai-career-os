import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { tailorCv } from '@/features/job-offer/api/job-offer.api';

export function useTailorCv() {
  return useMutation({
    mutationFn: tailorCv,
    onSuccess: () => toast.success('Tailored CV generated'),
    onError: (error) => toast.error(error.message),
  });
}
