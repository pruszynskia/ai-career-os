import * as React from 'react';

import { Tag, type TagProps } from '@/shared/ui/tag';

// Compiling shim only (DESIGN-SYSTEM \S4.8): Tag is the real, neutral-only
// component now. The coloured `variant` this used to carry is accepted here
// so the 18 existing call sites (grepped) keep type-checking, but it no
// longer changes anything visually - every Badge now renders as a Tag.
// TASK-122 updates those call sites to Tag directly and removes this file.
type LegacyBadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info';

interface BadgeProps extends Omit<TagProps, 'size'> {
  variant?: LegacyBadgeVariant;
  size?: TagProps['size'];
}

function Badge({ variant, ...props }: BadgeProps) {
  void variant; // accepted for compile compat only, Tag is neutral-only
  return <Tag {...props} />;
}

export { Badge };
export type { BadgeProps };
