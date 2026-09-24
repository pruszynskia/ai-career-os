import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';

import { cn } from '@/shared/ui/utils';

// "A state on the page the user must see before acting" (DESIGN-SYSTEM \S6)
// - duplicate offer, interlock, expired link, plan gating banners all reuse
// this. Text always stays foreground; only the icon carries the tone.
const bannerVariants = cva(
  'flex items-start gap-3 rounded-[8px] px-3.5 py-3 text-body-sm text-foreground',
  {
    variants: {
      tone: {
        neutral: 'border border-[var(--border-default)]',
        warning: 'bg-[var(--warning-subtle)]',
        danger: 'bg-[var(--destructive-subtle)]',
        success: 'bg-[var(--primary-subtle)]',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

const ICON_CLASSNAME: Record<
  NonNullable<VariantProps<typeof bannerVariants>['tone']>,
  string
> = {
  neutral: 'text-muted-foreground',
  warning: 'text-warning',
  danger: 'text-destructive',
  success: 'text-success',
};

const DEFAULT_ICON: Record<
  NonNullable<VariantProps<typeof bannerVariants>['tone']>,
  React.ElementType
> = {
  neutral: Info,
  warning: TriangleAlert,
  danger: CircleAlert,
  success: CircleCheck,
};

interface BannerProps
  extends React.ComponentProps<'div'>, VariantProps<typeof bannerVariants> {
  /** Overrides the tone's default leading icon. */
  icon?: React.ReactNode;
  /** Actions row, indented to align under the message. */
  actions?: React.ReactNode;
}

function Banner({
  className,
  tone = 'neutral',
  icon,
  actions,
  children,
  ...props
}: BannerProps) {
  const resolvedTone = tone ?? 'neutral';
  const Icon = DEFAULT_ICON[resolvedTone];

  return (
    <div
      data-slot="banner"
      role={
        resolvedTone === 'warning' || resolvedTone === 'danger'
          ? 'alert'
          : 'status'
      }
      className={cn(bannerVariants({ tone }), className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('mt-0.5 shrink-0', ICON_CLASSNAME[resolvedTone])}
      >
        {icon ?? <Icon size={16} strokeWidth={1.6} />}
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <div className="leading-[19px]">{children}</div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
}

export { Banner, bannerVariants };
export type { BannerProps };
