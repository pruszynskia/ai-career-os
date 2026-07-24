import { useMutation } from '@tanstack/react-query';

import { planPosts } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function usePlanPosts() {
  return useMutation({
    mutationFn: planPosts,
  });
}
