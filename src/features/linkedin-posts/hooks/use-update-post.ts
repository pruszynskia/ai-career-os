import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { PostStatus } from '@/entities/post/types';
import { updatePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useUpdatePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      ...values
    }: {
      id: string;
      content?: string;
      status?: PostStatus;
    }) => updatePost(id, values),
    onSuccess: () => {
      toast.success('Post updated');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
