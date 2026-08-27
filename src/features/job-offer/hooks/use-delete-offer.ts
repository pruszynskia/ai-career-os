import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteOffer } from '@/features/job-offer/api/job-offer.api';

export function useDeleteOffer(redirectTo?: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteOffer(id),
    onSuccess: () => {
      toast.success('Offer deleted');
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
