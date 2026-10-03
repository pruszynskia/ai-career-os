import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { uploadCv } from '@/features/cv/api/cv.api';

export function useUploadCv() {
  const router = useRouter();

  return useMutation({
    mutationFn: uploadCv,
    onSuccess: () => {
      track('cv_uploaded');
      toast.success('CV uploaded');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
