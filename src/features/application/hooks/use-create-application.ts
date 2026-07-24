import { useMutation } from '@tanstack/react-query';

import { createApplication } from '@/features/application/api/application.api';

export function useCreateApplication() {
  return useMutation({ mutationFn: createApplication });
}
