import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { updateApplicationStatus } from '@/features/application/api/application.api';
import type { ApplicationStatus } from '@/features/application/types';

export function useUpdateApplicationStatus() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
