import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { deletePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useDeletePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success('Post deleted');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
