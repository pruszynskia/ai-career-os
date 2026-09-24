import * as React from 'react';
import { Lock } from 'lucide-react';

import { Skeleton } from '@/shared/ui/primitives/feedback/skeleton';
import { VStack } from '@/shared/ui/primitives/layout/stack';
import { Text } from '@/shared/ui/primitives/typography/text';
import { cn } from '@/shared/ui/utils';

interface LockedPanelProps {
  /** One sentence explaining what's behind the lock. */
  message: string;
  /** Upgrade CTA - the caller decides the action/destination and when to
   * render this panel at all; LockedPanel is presentation only. */
  action?: React.ReactNode;
  /** Dimmed background standing in for the locked content, e.g. a real
   * (blurred) report layout. Defaults to a few generic skeleton lines. */
  children?: React.ReactNode;
  className?: string;
}

function LockedPanel({ message, action, children, className }: LockedPanelProps) {
  return (
    <div
      data-slot="locked-panel"
      className={cn('relative min-h-[200px] overflow-hidden', className)}
    >
      <div aria-hidden="true" inert className="pointer-events-none opacity-55">
        {children ?? (
          <VStack gap={3} className="p-4">
            <Skeleton variant="line" className="w-3/5" />
            <Skeleton variant="line" className="w-4/5" />
            <Skeleton variant="line" className="w-2/5" />
          </VStack>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <VStack
          align="center"
          gap={3}
          className="max-w-[360px] rounded-[12px] border border-[var(--border-default)] bg-popover p-6 text-center shadow-[var(--shadow-overlay)]"
        >
          <Lock
            aria-hidden="true"
            size={18}
            strokeWidth={1.6}
            className="text-muted-foreground"
          />
          <Text size="sm">{message}</Text>
          {action}
        </VStack>
      </div>
    </div>
  );
}

export { LockedPanel };
export type { LockedPanelProps };
