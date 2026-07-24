import { useMutation } from '@tanstack/react-query';

import { optimizeCv } from '@/features/cv/api/cv.api';

export function useOptimizeCv() {
  return useMutation({
    mutationFn: optimizeCv,
  });
}
