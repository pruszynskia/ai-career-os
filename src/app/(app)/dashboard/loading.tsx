import { Grid, Skeleton, VStack } from '@/shared/ui/primitives';

export default function DashboardLoading() {
  return (
    <VStack gap={6}>
      <Skeleton className="h-8 w-40" />
      <Grid cols={1} colsMd={2} gap={6}>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </Grid>
    </VStack>
  );
}
