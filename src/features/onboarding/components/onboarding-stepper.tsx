import { HStack, Text } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

export function OnboardingStepper({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  return (
    <HStack gap={4} wrap="wrap" role="list">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isDone = stepNumber < currentStep;

        return (
          <HStack
            key={label}
            gap={2}
            align="center"
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isDone
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {stepNumber}
            </span>
            <span className="sr-only">
              {isActive
                ? '(current step)'
                : isDone
                  ? '(completed)'
                  : '(upcoming)'}
            </span>
            <Text
              color={isActive ? 'default' : 'muted'}
              weight={isActive ? 'medium' : 'normal'}
            >
              {label}
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
}
