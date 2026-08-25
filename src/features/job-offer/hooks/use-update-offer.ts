import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    onSuccess: () => {
      toast.success('Offer updated');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
