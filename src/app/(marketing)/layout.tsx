import Link from 'next/link';

import { Button } from '@/shared/ui/button';
import {
  Box,
  Container,
  HStack,
  Heading,
  Section,
} from '@/shared/ui/primitives';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box className="flex min-h-screen flex-col">
      <Box className="border-b">
        <Container>
          <HStack align="center" justify="between" className="py-3">
            <Link href="/">
              <Heading level={3}>AI Career OS</Heading>
            </Link>
            <HStack gap={2} align="center">
              <Button asChild variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>
      <main className="flex-1">
        <Container>
          <Section spacing="lg">{children}</Section>
        </Container>
      </main>
    </Box>
  );
}
