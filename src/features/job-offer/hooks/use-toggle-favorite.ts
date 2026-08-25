import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { toggleFavorite } from '@/features/job-offer/api/job-offer.api';

export function useToggleFavorite() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavorite(id, isFavorite),
    onSuccess: (_data, { isFavorite }) => {
      toast.success(
        isFavorite ? 'Added to favorites' : 'Removed from favorites',
      );
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
