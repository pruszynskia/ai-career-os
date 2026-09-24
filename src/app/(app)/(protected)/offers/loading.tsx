import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function OffersLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading offers…</span>
      <Skeleton variant="line" className="w-32" />
      <Skeleton className="h-32" />
      <VStack gap={0}>
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </VStack>
    </VStack>
  );
}
