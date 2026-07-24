import { useMutation } from '@tanstack/react-query';

import { updateApplicationStatus } from '@/features/application/api/application.api';
import type { ApplicationStatus } from '@/features/application/types';

export function useUpdateApplicationStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
  });
}
