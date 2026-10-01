import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { updateApplicationNotes } from '@/features/application/api/application.api';

export function useUpdateApplicationNotes() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateApplicationNotes(id, notes),
    onSuccess: () => {
      toast.success('Notes saved');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
