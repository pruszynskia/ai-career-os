import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function DocumentsLoading() {
  return (
    <VStack gap={6}>
      <Skeleton className="h-8 w-36" />
      <VStack gap={0}>
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </VStack>
    </VStack>
  );
}
