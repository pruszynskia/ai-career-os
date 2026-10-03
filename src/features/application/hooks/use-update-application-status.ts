import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { updateApplicationStatus } from '@/features/application/api/application.api';
import type { ApplicationStatus } from '@/features/application/types';

// `silent` lets callers that show their own success toast (e.g. the board's
// drag-and-drop "X moved to Y" message) opt out of the default one instead
// of stacking both.
export function useUpdateApplicationStatus(options?: { silent?: boolean }) {
  const router = useRouter();
  const silent = options?.silent ?? false;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: (_data, { status }) => {
      track('application_status_changed', { status });
      if (!silent) toast.success('Status updated');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
