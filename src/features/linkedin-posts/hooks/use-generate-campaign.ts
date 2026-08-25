import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    onSuccess: () => {
      toast.success('Campaign generated');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
