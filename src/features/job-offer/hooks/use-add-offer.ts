import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { addOffer } from '@/features/job-offer/api/job-offer.api';

export function useAddOffer() {
  const router = useRouter();

  return useMutation({
    mutationFn: addOffer,
    onSuccess: () => {
      toast.success('Offer added');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
