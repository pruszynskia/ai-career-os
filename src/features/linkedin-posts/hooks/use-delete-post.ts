import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { deletePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useDeletePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => router.refresh(),
  });
}
