import { useMutation } from '@tanstack/react-query';

import { createCheckoutSession } from '@/features/marketing/api/checkout.api';

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}
