import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';

import { createCheckoutSession } from '@/features/marketing/api/checkout.api';

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      track('begin_checkout');
      window.location.href = url;
    },
  });
}
