import * as React from 'react';

import { Box } from '@/shared/ui/primitives/layout/box';
import { Flex } from '@/shared/ui/primitives/layout/flex';
import { Heading } from '@/shared/ui/primitives/typography/heading';
import { Text } from '@/shared/ui/primitives/typography/text';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Flex align="center" justify="between" data-slot="page-header">
      <Box>
        <Heading level={1}>{title}</Heading>
        {subtitle && (
          <Text size="sm" color="muted">
            {subtitle}
          </Text>
        )}
      </Box>
      {action}
    </Flex>
  );
}

export { PageHeader };
export type { PageHeaderProps };
