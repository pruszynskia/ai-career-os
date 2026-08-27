import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { optimizeCoverLetter } from '@/features/cv/api/cv.api';

export function useOptimizeCoverLetter() {
  return useMutation({
    mutationFn: optimizeCoverLetter,
    onSuccess: () => toast.success('Cover letter optimized'),
    onError: (error) => toast.error(error.message),
  });
}
