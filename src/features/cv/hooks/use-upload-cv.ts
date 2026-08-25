import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { uploadCv } from '@/features/cv/api/cv.api';

export function useUploadCv() {
  const router = useRouter();

  return useMutation({
    mutationFn: uploadCv,
    onSuccess: () => {
      toast.success('CV uploaded');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
