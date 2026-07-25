import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { generatePost } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useGeneratePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: generatePost,
    onSuccess: () => router.refresh(),
  });
}
