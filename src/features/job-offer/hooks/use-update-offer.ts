import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { updateOffer } from '@/features/job-offer/api/job-offer.api';

export function useUpdateOffer() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      company: string;
      title: string;
      description: string;
    }) => updateOffer(id, input),
    onSuccess: () => router.refresh(),
  });
}
