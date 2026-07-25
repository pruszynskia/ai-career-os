import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { schedulePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useSchedulePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: Date }) =>
      schedulePost(id, scheduledAt),
    onSuccess: () => router.refresh(),
  });
}
