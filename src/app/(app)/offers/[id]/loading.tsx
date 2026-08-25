import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function OfferDetailLoading() {
  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
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
