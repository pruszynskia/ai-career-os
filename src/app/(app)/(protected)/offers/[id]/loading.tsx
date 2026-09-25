import { Skeleton, VStack } from '@/shared/ui/primitives';

// Mirrors offer-detail.tsx's shell (TASK-108): sticky header (company/title
// meta + actions), a 5-tab strip and a main column + 320px rail below it.
export default function OfferDetailLoading() {
  return (
    <VStack gap={4} aria-busy="true">
      <span className="sr-only">Loading offer…</span>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <VStack gap={2}>
          <Skeleton variant="line" className="w-32" />
          <Skeleton variant="line" className="h-6 w-64" />
          <Skeleton variant="line" className="w-40" />
        </VStack>
        <div className="flex items-center gap-2">
          <Skeleton className="size-7" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-28" />
        </div>
      </div>

      <div className="flex gap-6 border-b border-border pb-0">
        {['w-20', 'w-24', 'w-20', 'w-24', 'w-28'].map((width, index) => (
          <Skeleton key={index} variant="line" className={`h-6 ${width}`} />
        ))}
      </div>

      <div className="grid gap-6 pt-2 lg:grid-cols-[minmax(0,1fr)_320px]">
        <VStack gap={4}>
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </VStack>
        <VStack gap={4}>
          <Skeleton className="h-24" />
          <Skeleton className="h-32" />
          <Skeleton className="h-40" />
        </VStack>
      </div>
    </VStack>
  );
}
