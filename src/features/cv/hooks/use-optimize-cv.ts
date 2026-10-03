import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { toast, toastError } from '@/shared/ui/toast';

import { optimizeCv } from '@/features/cv/api/cv.api';

export function useOptimizeCv() {
  return useMutation({
    mutationFn: optimizeCv,
    onSuccess: () => {
      toast.success('CV optimized');
      track('cv_optimized');
    },
    onError: (error) => toastError(error.message),
  });
}
