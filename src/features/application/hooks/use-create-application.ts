import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createApplication } from '@/features/application/api/application.api';

// `silent` lets callers that show their own success toast (e.g. the board's
// drag-and-drop "X moved to Y" message) opt out of the default one instead
// of stacking both.
export function useCreateApplication(options?: { silent?: boolean }) {
  const silent = options?.silent ?? false;

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      if (!silent) toast.success('Application tracked');
    },
    onError: (error) => toast.error(error.message),
  });
}
