import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { optimizeCv } from '@/features/cv/api/cv.api';

export function useOptimizeCv() {
  return useMutation({
    mutationFn: optimizeCv,
    onSuccess: () => toast.success('CV optimized'),
    onError: (error) => toast.error(error.message),
  });
}
