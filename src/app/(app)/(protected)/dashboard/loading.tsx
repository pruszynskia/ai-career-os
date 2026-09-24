import { Grid, Skeleton, VStack } from '@/shared/ui/primitives';

export default function DashboardLoading() {
  return (
    <VStack gap={6} aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>
      <Skeleton variant="line" className="w-40" />
      <Skeleton className="h-[76px] w-full" />
      <Grid cols={1} colsMd={12} gap={6}>
        <VStack gap={6} className="md:col-span-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
          <Skeleton className="h-40" />
        </VStack>
        <VStack gap={6} className="md:col-span-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </VStack>
      </Grid>
    </VStack>
  );
}
