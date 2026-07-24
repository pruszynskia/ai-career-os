import { useMutation } from '@tanstack/react-query';

import { markPostSent } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useMarkPostSent() {
  return useMutation({
    mutationFn: markPostSent,
  });
}
