import { Skeleton, VStack } from '@/shared/ui/primitives';

// Mirrors OffersPage's list-view shape: KPI/recommendation-mix summary
// strip, toolbar, then a tier-grouped GridTable (group header + a few rows,
// repeated).
export default function OffersLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading offers…</span>
      <Skeleton className="h-[86px] w-full" />
      <Skeleton className="h-9 w-full" />
      <VStack gap={0} className="w-full">
        {[0, 1].map((group) => (
          <VStack gap={0} key={group} className="w-full">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}
