import { useMutation } from '@tanstack/react-query';

import { generatePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useGeneratePost() {
  return useMutation({
    mutationFn: generatePost,
  });
}
