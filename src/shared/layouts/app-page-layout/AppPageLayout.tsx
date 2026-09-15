import * as React from 'react';

import { PageHeader } from '@/shared/ui/page-header';
import { VStack } from '@/shared/ui/primitives';

interface AppPageLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function AppPageLayout({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: AppPageLayoutProps) {
  return (
    <VStack gap={6}>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={action}
      />
      {children}
    </VStack>
  );
}

export { AppPageLayout };
export type { AppPageLayoutProps };
