import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  OutreachBlockedError,
  generateOutreach,
} from '@/features/job-offer/api/job-offer.api';

export function useOutreach() {
  return useMutation({
    mutationFn: ({
      id,
      contact,
    }: {
      id: string;
      contact: { name: string; profileUrl?: string };
    }) => generateOutreach(id, contact),
    onSuccess: () => toast.success('Outreach drafts generated'),
    onError: (error) => {
      // The no-contact path is an expected state shown inline (posting URL
      // + reason), not a failure worth a toast.
      if (error instanceof OutreachBlockedError) return;
      toast.error(error.message);
    },
  });
}
