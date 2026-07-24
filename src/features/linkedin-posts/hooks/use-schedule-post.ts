import { useMutation } from '@tanstack/react-query';

import { schedulePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useSchedulePost() {
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: Date }) =>
      schedulePost(id, scheduledAt),
  });
}
