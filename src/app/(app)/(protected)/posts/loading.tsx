import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function PostsLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading posts…</span>
      <Skeleton variant="line" className="w-28" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <VStack gap={4}>
          <div className="flex gap-6 border-b border-border pb-0">
            {['w-10', 'w-14', 'w-20', 'w-14'].map((width, index) => (
              <Skeleton key={index} variant="line" className={`h-6 ${width}`} />
            ))}
          </div>
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </VStack>
        <VStack gap={4}>
          <Skeleton className="h-48" />
          <Skeleton className="h-24" />
        </VStack>
      </div>
    </VStack>
  );
}
