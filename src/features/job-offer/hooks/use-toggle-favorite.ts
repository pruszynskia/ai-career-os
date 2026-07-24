import { useMutation } from '@tanstack/react-query';

import { toggleFavorite } from '@/features/job-offer/api/job-offer.api';

export function useToggleFavorite() {
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavorite(id, isFavorite),
  });
}
