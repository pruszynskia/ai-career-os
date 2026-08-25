import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function ApplicationsLoading() {
  return (
    <VStack gap={6}>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-8 w-full" />
      <VStack gap={3}>
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </VStack>
    </VStack>
  );
}
