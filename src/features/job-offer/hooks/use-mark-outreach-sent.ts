import { useMutation } from '@tanstack/react-query';

import { markOutreachSent } from '@/features/job-offer/api/job-offer.api';

// Silent to the user by design: this fires in the background off the
// "Copy" button (see outreach-panel.tsx) to record that a connection note
// went out, not as a user-facing action with its own feedback. Still
// logged on failure though - a swallowed error here means the
// pending-request nudge silently never fires for that message.
export function useMarkOutreachSent() {
  return useMutation({
    mutationFn: ({
      offerId,
      messageId,
    }: {
      offerId: string;
      messageId: string;
    }) => markOutreachSent(offerId, messageId),
    onError: (error) => {
      console.error('Failed to mark the outreach message as sent', error);
    },
  });
}
