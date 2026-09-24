import { Text } from '@/shared/ui/primitives/typography/text';
import { cn } from '@/shared/ui/utils';

interface StatCardProps {
  label: string;
  value: number | string;
}

// No box: a label/value pair meant to sit in a divider-separated KPI strip
// (see the `.kpi` pattern in the dashboard/offers mockups). The strip's
// parent is responsible for the `border-l` dividers between stats.
function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col justify-center gap-0.5" data-slot="stat-card">
      <Text size="xs" color="muted">
        {label}
      </Text>
      <Text
        as="span"
        weight="medium"
        className={cn(
          'text-[22px] leading-[26px]',
          typeof value === 'number' && 'font-mono tabular-nums',
        )}
      >
        {value}
      </Text>
    </div>
  );
}

export { StatCard };
export type { StatCardProps };
