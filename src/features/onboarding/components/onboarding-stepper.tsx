import { Check } from 'lucide-react';

import { Text } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

export function OnboardingStepper({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  return (
    <ol
      aria-label="Onboarding progress"
      role="list"
      className="m-0 flex list-none gap-3.5 p-0"
    >
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isDone = stepNumber < currentStep;
        const isLast = stepNumber === steps.length;

        return (
          <li
            key={label}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            className={cn('flex items-center gap-2.5', !isLast && 'flex-1')}
          >
            <span
              className={cn(
                'flex size-[22px] shrink-0 items-center justify-center rounded-full font-mono text-xs tabular-nums',
                isDone
                  ? 'bg-primary text-primary-foreground'
                  : isActive
                    ? 'border-[1.5px] border-primary text-primary'
                    : 'border border-border text-muted-foreground',
              )}
            >
              {isDone ? <Check className="size-3.5" aria-hidden /> : stepNumber}
            </span>
            <Text
              as="span"
              weight={isActive ? 'medium' : 'normal'}
              color={isActive ? 'default' : 'muted'}
              className="whitespace-nowrap"
            >
              {label}
              <span className="sr-only">
                {isActive
                  ? ' (current step)'
                  : isDone
                    ? ' (completed)'
                    : ' (upcoming)'}
              </span>
            </Text>
            {!isLast && (
              <span
                aria-hidden
                className="h-px min-w-10 flex-1 bg-border"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
