import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { uploadCoverLetter } from '@/features/cv/api/cv.api';

export function useUploadCoverLetter() {
  const router = useRouter();

  return useMutation({
    mutationFn: uploadCoverLetter,
    onSuccess: () => {
      toast.success('Cover letter uploaded');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
