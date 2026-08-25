import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { planPosts } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function usePlanPosts() {
  const router = useRouter();

  return useMutation({
    mutationFn: planPosts,
    onSuccess: () => {
      toast.success('Posts planned');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
