import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { generateCampaign } from '@/features/linkedin-posts/api/linkedin-posts.api';

export function useGenerateCampaign() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      theme,
      postCount,
      cadenceDays,
    }: {
      theme: string;
      postCount: number;
      cadenceDays: number;
    }) => generateCampaign(theme, postCount, cadenceDays),
    onSuccess: () => router.refresh(),
  });
}
