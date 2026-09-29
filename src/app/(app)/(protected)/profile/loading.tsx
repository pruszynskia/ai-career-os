import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function ProfileLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading profile…</span>
      <Skeleton variant="line" className="w-32" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <VStack gap={4} className="min-w-0">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </VStack>
        <VStack gap={4}>
          <Skeleton className="h-48" />
          <Skeleton className="h-40" />
          <Skeleton className="h-24" />
        </VStack>
      </div>
    </VStack>
  );
}
