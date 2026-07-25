# UI Primitives

Low-level, token-driven building blocks for layout, typography, surfaces,
feedback and interaction. Feature code should compose these instead of
hand-writing layout/typography Tailwind classes, so spacing, color and type
scale stay consistent across the app.

Import from the barrel:

```tsx
import { Flex, Heading, Screen } from '@/shared/ui/primitives';
```

## Layout

`Box`, `Flex`, `Stack`/`VStack`/`HStack`, `Grid`, `Container`, `Screen`,
`Section`, `Spacer`, `Divider`.

```tsx
// Bad
<div className="flex flex-col gap-6">...</div>

// Good
<VStack gap={6}>...</VStack>
```

```tsx
// Bad
<div className="grid gap-6 md:grid-cols-2">...</div>

// Good
<Grid cols={1} colsMd={2} gap={6}>...</Grid>
```

`Screen` owns page background, min-height, scroll and padding for an app
route — see `layout.tsx`'s usage. `Stack` is an alias for `Flex`; `VStack`/
`HStack` lock `direction` so it can't be overridden.

## Surface

`Surface` is the base elevated container (rounded, card background, border,
optional padding/elevation). `src/shared/ui/card.tsx`'s `Card` composes
`surfaceVariants` from this primitive rather than duplicating the same
Tailwind classes — Card stays the one exported component for card UI, no
second Card.

## Typography

`Text` (size/weight/color/align), `Heading` (`level` 1-6, picks tag + size),
`Label` (`variant` `form`|`meta`).

```tsx
// Bad
<h1 className="text-2xl font-semibold">Dashboard</h1>

// Good
<Heading level={1}>Dashboard</Heading>
```

## Feedback

`Spinner`, `Skeleton`, `Badge`, `Avatar` — new, none of these existed in the
codebase before.

## Interaction

`Button`, `Input`, `Textarea` are re-exported as-is from `src/shared/ui` (no
reimplementation) — import them from the primitives barrel for a single
import path, or continue importing directly from `src/shared/ui` if
preferred. `IconButton` wraps `Button` with icon sizing and a required
`aria-label`. `Select` is new, built on `radix-ui`'s `Select` following the
same import convention as `src/shared/ui/dialog.tsx`.

## Forbidden patterns

- No arbitrary Tailwind values in primitive-consuming code (e.g. no
  `gap-[13px]`) — use the primitive's variant scale.
- Primitives never import from `src/features`, `src/entities`, `src/widgets`
  or `src/app` — the dependency only flows one way.
- Don't add a second scroll/padding container inside a `Screen` — it already
  owns that for the whole route.
