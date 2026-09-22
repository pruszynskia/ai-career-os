import { Surface } from '@/shared/ui/primitives/surface/surface';
import { Text } from '@/shared/ui/primitives/typography/text';
import { cn } from '@/shared/ui/utils';

interface StatCardProps {
  label: string;
  value: number | string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Surface padding="sm" elevation="raised" data-slot="stat-card">
      <Text size="xs" color="muted">
        {label}
      </Text>
      <Text
        size="lg"
        weight="semibold"
        className={cn(typeof value === 'number' && 'font-mono tabular-nums')}
      >
        {value}
      </Text>
    </Surface>
  );
}

export { StatCard };
export type { StatCardProps };
