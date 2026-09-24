import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function OfferDetailLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading offer…</span>
      <VStack gap={2}>
        <Skeleton variant="line" className="w-64" />
        <Skeleton variant="line" className="w-40" />
      </VStack>
      <Skeleton className="h-40" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </VStack>
  );
}
