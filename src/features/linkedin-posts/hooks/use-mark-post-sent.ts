import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { markPostSent } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useMarkPostSent() {
  const router = useRouter();

  return useMutation({
    mutationFn: markPostSent,
    onSuccess: () => router.refresh(),
  });
}
