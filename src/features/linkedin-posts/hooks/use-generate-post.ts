import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { generatePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useGeneratePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: generatePost,
    onSuccess: () => {
      toast.success('Post generated');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
