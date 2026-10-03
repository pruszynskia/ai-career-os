import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { toast, toastError } from '@/shared/ui/toast';

import { optimizeCoverLetter } from '@/features/cv/api/cv.api';

export function useOptimizeCoverLetter() {
  return useMutation({
    mutationFn: optimizeCoverLetter,
    onSuccess: () => {
      toast.success('Cover letter optimized');
      track('cover_letter_optimized');
    },
    onError: (error) => toastError(error.message),
  });
}
