import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

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
      expiresAt: string | null;
    }) => updateOffer(id, input),
    onSuccess: () => {
      toast.success('Offer updated');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
