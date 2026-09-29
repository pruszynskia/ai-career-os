import { Skeleton, VStack } from '@/shared/ui/primitives';

export default function DocumentsLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading documents…</span>
      <Skeleton variant="line" className="w-36" />
      <div className="flex flex-col items-start gap-4 md:flex-row">
        <div className="flex w-full flex-col gap-3 rounded-lg border border-border p-3 md:w-[400px] md:shrink-0">
          <Skeleton className="h-8" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <div className="min-w-0 flex-1 rounded-lg border border-border p-4">
          <Skeleton className="h-64" />
        </div>
      </div>
    </VStack>
  );
}
