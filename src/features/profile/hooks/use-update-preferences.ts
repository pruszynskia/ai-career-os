import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { JobPreferences } from '@/entities/profile/types';
import { updateProfilePreferences } from '@/features/profile/api/profile.api';

export function useUpdatePreferences() {
  const router = useRouter();

  return useMutation({
    mutationFn: (preferences: Partial<JobPreferences>) =>
      updateProfilePreferences(preferences),
    onSuccess: () => router.refresh(),
  });
}
