# Shared Components

Composite components in [`src/shared/ui`](../../src/shared/ui), built on the
low-level primitives in
[`src/shared/ui/primitives`](../../src/shared/ui/primitives/README.md) and
the existing shadcn components (`Button`, `Card`, `Dialog`, `Input`,
`Textarea`). These exist so new screens compose an `EmptyState` or
`PageHeader` instead of hand-rolling the same Tailwind markup again — import
them from the barrel at `@/shared/ui`.

## EmptyState

Purpose: the "nothing here yet" message shown when a list has no items —
this exact markup (`text-sm text-muted-foreground`) was duplicated across 8
feature components before this was extracted.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `message` | `string` | yes | The empty-state copy |
| `icon` | `React.ReactNode` | no | Optional leading icon |
| `action` | `React.ReactNode` | no | Optional call-to-action (e.g. a `Button`) |
| `className` | `string` | no | Extra classes merged via `cn` |

```tsx
import { EmptyState } from '@/shared/ui';

<EmptyState message="No applications yet." />
```

## PageHeader

Purpose: the title row at the top of a route — replaces a raw `<h1
className="text-2xl font-semibold">`, which was duplicated identically
across 4 app pages.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | yes | Rendered via the `Heading` primitive (`level={1}`) |
| `action` | `React.ReactNode` | no | Optional trailing action (e.g. a "New" button) |

```tsx
import { PageHeader } from '@/shared/ui';

<PageHeader title="Offers" />
```

Note: `PageHeader` only replaces the title line itself. The page-shell
wrapper around it (`<div className="flex flex-col gap-6">`) is intentionally
left alone — extracting that shared page-shell structure is a separate,
later task (`AppPageLayout`).

## Not built here

Three other patterns were named as candidates for this task but had no
actual duplicated code to extract, so building them now would have been
speculative rather than an extraction:

- **Status badges** — no duplicated badge markup exists; the two places a
  status is shown today (`post-list.tsx`'s card title, `upcoming-interviews-card.tsx`'s
  inline text) aren't decorative badges, and turning them into one would be
  a visual-language change outside this task's scope. Use the `Badge`
  primitive directly (see `src/shared/ui/primitives/README.md`) if a future
  screen needs one.
- **Stat cards** — no duplicated metric-tile markup exists anywhere yet.
  Compose one from the `Surface`/`Text` primitives when a real consumer
  needs it.
- **Skeleton loaders** — no hand-rolled loading placeholder exists anywhere
  to extract. The `Skeleton` primitive already exists and is ready to use
  once a route adds a loading state.
