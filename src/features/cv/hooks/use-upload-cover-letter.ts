import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { uploadCoverLetter } from '@/features/cv/api/cv.api';

export function useUploadCoverLetter() {
  const router = useRouter();

  return useMutation({
    mutationFn: uploadCoverLetter,
    onSuccess: () => {
      toast.success('Cover letter uploaded');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
