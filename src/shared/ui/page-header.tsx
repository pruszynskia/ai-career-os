import * as React from 'react';

import { Flex } from '@/shared/ui/primitives/layout/flex';
import { Heading } from '@/shared/ui/primitives/typography/heading';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Flex align="center" justify="between" data-slot="page-header">
      <Heading level={1}>{title}</Heading>
      {action}
    </Flex>
  );
}

export { PageHeader };
export type { PageHeaderProps };
