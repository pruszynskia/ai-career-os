'use client';

import { useFormStatus } from 'react-dom';

import { AsyncButton, type AsyncButtonProps } from '@/shared/ui/async-button';

// Submit button for server-action <form>s: disables itself and shows a
// spinner while the enclosing form's action is in flight, so a slow action
// (sign-up's email send) can't be double-submitted.
function SubmitButton(props: Omit<AsyncButtonProps, 'pending' | 'type'>) {
  const { pending } = useFormStatus();
  return <AsyncButton {...props} type="submit" pending={pending} />;
}

export { SubmitButton };
