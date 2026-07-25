import * as React from 'react';

import { VStack } from '@/shared/ui/primitives/layout/stack';
import { Text } from '@/shared/ui/primitives/typography/text';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ message, icon, action, className }: EmptyStateProps) {
  return (
    <VStack gap={2} className={className} data-slot="empty-state">
      {icon}
      <Text color="muted">{message}</Text>
      {action}
    </VStack>
  );
}

export { EmptyState };
export type { EmptyStateProps };
