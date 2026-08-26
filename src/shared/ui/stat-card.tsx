import { Surface } from '@/shared/ui/primitives/surface/surface';
import { Text } from '@/shared/ui/primitives/typography/text';

interface StatCardProps {
  label: string;
  value: number | string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Surface padding="sm" data-slot="stat-card">
      <Text size="xs" color="muted">
        {label}
      </Text>
      <Text size="lg" weight="semibold">
        {value}
      </Text>
    </Surface>
  );
}

export { StatCard };
export type { StatCardProps };
