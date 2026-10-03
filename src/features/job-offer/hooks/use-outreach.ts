import { useRouter } from 'next/navigation';
import { track } from '@/shared/analytics/analytics';

import { useMutation } from '@tanstack/react-query';
import { toast, toastError } from '@/shared/ui/toast';

import {
  OutreachBlockedError,
  generateOutreach,
} from '@/features/job-offer/api/job-offer.api';

export function useOutreach() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      contact,
    }: {
      id: string;
      contact: { name: string; profileUrl?: string };
    }) => generateOutreach(id, contact),
    onSuccess: () => {
      track('outreach_generated');
      toast.success('Outreach drafts generated');
      // interlockWarning is computed server-side from outreach_messages, so
      // a draft generated this session needs a refresh to raise it without
      // a manual reload.
      router.refresh();
    },
    onError: (error) => {
      // The no-contact path is an expected state shown inline (posting URL
      // + reason), not a failure worth a toast.
      if (error instanceof OutreachBlockedError) return;
      toastError(error.message);
    },
  });
}
