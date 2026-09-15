import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function PostsLoading() {
  return (
    <VStack gap={6}>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <VStack gap={3}>
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </VStack>
    </VStack>
  );
}
