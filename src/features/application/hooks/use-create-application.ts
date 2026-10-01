import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { createApplication } from '@/features/application/api/application.api';

// `silent` lets callers that show their own success toast (e.g. the board's
// drag-and-drop "X moved to Y" message) opt out of the default one instead
// of stacking both.
export function useCreateApplication(options?: { silent?: boolean }) {
  const silent = options?.silent ?? false;
  const router = useRouter();

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      if (!silent) toast.success('Application tracked');
    },
    // A failure here is often a stale page (e.g. a 409 because the offer was
    // tracked from another tab or before Back) - refresh so the UI shows the
    // real state instead of re-offering "Track application".
    onError: (error) => {
      toastError(error.message);
      router.refresh();
    },
  });
}
