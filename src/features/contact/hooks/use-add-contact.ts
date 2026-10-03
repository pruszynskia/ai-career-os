import { useMutation } from '@tanstack/react-query';
import { track } from '@/shared/analytics/analytics';
import { useRouter } from 'next/navigation';
import { toast, toastError } from '@/shared/ui/toast';

import { addContact } from '@/features/contact/api/contact.api';

export function useAddContact() {
  const router = useRouter();

  return useMutation({
    mutationFn: addContact,
    onSuccess: () => {
      track('contact_added');
      toast.success('Contact added');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
