import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function ProfileLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading profile…</span>
      <Skeleton variant="line" className="w-32" />
      <Skeleton className="h-24" />
      <Skeleton className="h-40" />
      <Skeleton className="h-24" />
      <Skeleton className="h-40" />
    </VStack>
  );
}
