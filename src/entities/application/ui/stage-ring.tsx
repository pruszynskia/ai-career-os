import {
  ACTIVE_APPLICATION_STATUSES,
  isTerminalApplicationStatus,
  type ApplicationStatus,
} from '@/entities/application/types';
import { cn } from '@/shared/ui/utils';

// 14px decorative progress ring (DESIGN-SYSTEM \S4.10). Purely visual - the
// stage/outcome must always be carried by a sibling text label, so this is
// aria-hidden at every call site.
const SIZE = 14;
const CENTER = SIZE / 2;
const STROKE = 1.5;
const RADIUS = CENTER - STROKE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface StageRingProps {
  /** null = no application tracked yet (dashed ring). */
  status: ApplicationStatus | null;
  className?: string;
}

function StageRing({ status, className }: StageRingProps) {
  const rootProps = {
    'aria-hidden': true as const,
    width: SIZE,
    height: SIZE,
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    className: cn('shrink-0', className),
  };

  if (status === null) {
    return (
      <svg {...rootProps} data-slot="stage-ring" data-state="not-tracked">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth={STROKE}
          strokeDasharray="1.5 1.5"
        />
      </svg>
    );
  }

  if (status === 'OFFER') {
    return (
      <svg {...rootProps} data-slot="stage-ring" data-state="offer">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="var(--primary)" />
        <path
          d="M4.5 7.2l1.7 1.7L9.7 5"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (isTerminalApplicationStatus(status)) {
    // REJECTED / NO_RESPONSE / EXPIRED - closed, but not a success.
    return (
      <svg {...rootProps} data-slot="stage-ring" data-state="closed">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="var(--border-default)"
        />
        <line
          x1={4.5}
          y1={CENTER}
          x2={9.5}
          y2={CENTER}
          stroke="var(--foreground)"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const stageIndex = ACTIVE_APPLICATION_STATUSES.indexOf(status);
  const progress = stageIndex / ACTIVE_APPLICATION_STATUSES.length;

  return (
    <svg {...rootProps} data-slot="stage-ring" data-state="active">
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="var(--chart-track)"
        strokeWidth={STROKE}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
    </svg>
  );
}

export { StageRing };
export type { StageRingProps };
