import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createApplication } from '@/features/application/api/application.api';

export function useCreateApplication() {
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => toast.success('Application tracked'),
    onError: (error) => toast.error(error.message),
  });
}
