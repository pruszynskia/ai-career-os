import { toast } from 'sonner';

export { toast };

// Spec calls for error toasts to stay up longer (6s) than the 4s
// success/info default set in providers.tsx. sonner only exposes duration
// per call, not per type, so this wraps every toast.error() call site
// instead of touching each one's options individually (MISC-8).
export function toastError(message: string) {
  toast.error(message, { duration: 6000 });
}
