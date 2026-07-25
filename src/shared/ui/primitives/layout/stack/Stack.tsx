import { Flex, type FlexProps } from '@/shared/ui/primitives/layout/flex';

const Stack = Flex;

type VStackProps = Omit<FlexProps, 'direction'>;
type HStackProps = Omit<FlexProps, 'direction'>;

function VStack(props: VStackProps) {
  return <Flex direction="col" {...props} />;
}

function HStack(props: HStackProps) {
  return <Flex direction="row" {...props} />;
}

export { Stack, VStack, HStack };
export type { VStackProps, HStackProps };
