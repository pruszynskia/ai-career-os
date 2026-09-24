import * as React from 'react';

import { VStack } from '@/shared/ui/primitives/layout/stack';
import { Text } from '@/shared/ui/primitives/typography/text';
import { cn } from '@/shared/ui/utils';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ message, icon, action, className }: EmptyStateProps) {
  return (
    <VStack
      align="start"
      gap={3}
      data-slot="empty-state"
      className={cn('text-left', className)}
    >
      {icon}
      <Text color="muted" className="max-w-[420px]">
        {message}
      </Text>
      {action}
    </VStack>
  );
}

export { EmptyState };
export type { EmptyStateProps };
