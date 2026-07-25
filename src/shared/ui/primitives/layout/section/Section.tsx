import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const sectionVariants = cva('', {
  variants: {
    spacing: {
      sm: 'py-4',
      md: 'py-6',
      lg: 'py-8',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
});

interface SectionProps
  extends
    React.ComponentProps<'section'>,
    VariantProps<typeof sectionVariants> {}

function Section({ className, spacing, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}

export { Section, sectionVariants };
export type { SectionProps };
