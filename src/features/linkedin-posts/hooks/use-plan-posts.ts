import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { planPosts } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function usePlanPosts() {
  const router = useRouter();

  return useMutation({
    mutationFn: planPosts,
    onSuccess: () => router.refresh(),
  });
}
