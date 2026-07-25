import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { uploadCv } from '@/features/cv/api/cv.api';

export function useUploadCv() {
  const router = useRouter();

  return useMutation({
    mutationFn: uploadCv,
    onSuccess: () => router.refresh(),
  });
}
