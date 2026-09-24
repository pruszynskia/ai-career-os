import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function DocumentsLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading documents…</span>
      <Skeleton variant="line" className="w-36" />
      <VStack gap={0}>
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </VStack>
    </VStack>
  );
}
