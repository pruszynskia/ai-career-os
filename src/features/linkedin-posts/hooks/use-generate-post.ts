import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { generatePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useGeneratePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: generatePost,
    onSuccess: () => {
      track('post_generated');
      toast.success('Post generated');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
