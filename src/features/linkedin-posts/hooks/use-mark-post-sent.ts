import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { markPostSent } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useMarkPostSent() {
  const router = useRouter();

  return useMutation({
    mutationFn: markPostSent,
    onSuccess: () => {
      toast.success('Post marked as sent');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
