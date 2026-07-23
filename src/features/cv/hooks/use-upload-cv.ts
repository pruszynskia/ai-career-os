import { useMutation } from '@tanstack/react-query';

import { uploadCv } from '@/features/cv/api/cv.api';

export function useUploadCv() {
  return useMutation({
    mutationFn: uploadCv,
  });
}
