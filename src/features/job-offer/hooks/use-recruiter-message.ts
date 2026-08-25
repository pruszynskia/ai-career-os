import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { generateRecruiterMessage } from '@/features/job-offer/api/job-offer.api';

export function useRecruiterMessage() {
  return useMutation({
    mutationFn: generateRecruiterMessage,
    onSuccess: () => toast.success('Recruiter message generated'),
    onError: (error) => toast.error(error.message),
  });
}
