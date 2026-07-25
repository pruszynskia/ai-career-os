import * as React from 'react';

import { PageHeader } from '@/shared/ui/page-header';
import { VStack } from '@/shared/ui/primitives';

interface AppPageLayoutProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function AppPageLayout({
  title,
  subtitle,
  action,
  children,
}: AppPageLayoutProps) {
  return (
    <VStack gap={6}>
      <PageHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </VStack>
  );
}

export { AppPageLayout };
export type { AppPageLayoutProps };
