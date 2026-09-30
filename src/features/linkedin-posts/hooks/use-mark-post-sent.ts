import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { markPostSent } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useMarkPostSent() {
  const router = useRouter();

  return useMutation({
    mutationFn: markPostSent,
    onSuccess: () => {
      toast.success('Post marked as sent');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
