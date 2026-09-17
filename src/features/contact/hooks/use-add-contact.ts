import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { addContact } from '@/features/contact/api/contact.api';

export function useAddContact() {
  const router = useRouter();

  return useMutation({
    mutationFn: addContact,
    onSuccess: () => {
      toast.success('Contact added');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
