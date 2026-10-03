import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

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
      track('campaign_generated');
      toast.success('Campaign generated');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
