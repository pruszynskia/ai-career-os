import { Grid, Skeleton, VStack } from '@/shared/ui/primitives';

export default function DashboardLoading() {
  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Skeleton className="h-5 w-40" />
        <Grid cols={3} colsMd={6} gap={3}>
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </Grid>
      </VStack>
      <Grid cols={1} colsMd={12} gap={6}>
        <VStack gap={6} className="md:col-span-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40" />
        </VStack>
        <VStack gap={6} className="md:col-span-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-40" />
        </VStack>
      </Grid>
    </VStack>
  );
}
