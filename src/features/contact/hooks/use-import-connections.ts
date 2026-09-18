import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { importConnections } from '@/features/contact/api/contact.api';

export function useImportConnections() {
  const router = useRouter();

  return useMutation({
    mutationFn: importConnections,
    onSuccess: (result) => {
      toast.success(
        `Imported ${result.imported}, classified ${result.classified}, skipped ${result.skipped}`,
      );
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
