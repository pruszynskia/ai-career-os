import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function OffersLoading() {
  return (
    <VStack gap={6}>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-32" />
      <VStack gap={3}>
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </VStack>
    </VStack>
  );
}
