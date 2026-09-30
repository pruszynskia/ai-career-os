import { useMutation } from '@tanstack/react-query';
import { toast, toastError } from '@/shared/ui/toast';

import { optimizeCoverLetter } from '@/features/cv/api/cv.api';

export function useOptimizeCoverLetter() {
  return useMutation({
    mutationFn: optimizeCoverLetter,
    onSuccess: () => toast.success('Cover letter optimized'),
    onError: (error) => toastError(error.message),
  });
}
