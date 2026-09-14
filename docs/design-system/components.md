# Shared Components

Composite components in [`src/shared/ui`](../../src/shared/ui), built on the
low-level primitives in
[`src/shared/ui/primitives`](../../src/shared/ui/primitives/README.md) and
the existing shadcn components (`Button`, `Card`, `Dialog`, `Input`,
`Textarea`). These exist so new screens compose an `EmptyState` or
`PageHeader` instead of hand-rolling the same Tailwind markup again — import
them from the barrel at `@/shared/ui`.

Page-shell components (`AppPageLayout`, `SplitLayout`) are documented here
too but live in a sibling directory,
[`src/shared/layouts`](../../src/shared/layouts) — import them from
`@/shared/layouts`, not `@/shared/ui`.

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
| `subtitle` | `string` | no | Rendered under the title via the `Text` primitive (`size="sm" color="muted"`) |
| `action` | `React.ReactNode` | no | Optional trailing action (e.g. a "New" button) |

```tsx
import { PageHeader } from '@/shared/ui';

<PageHeader title="Offers" />
```

## AppPageLayout

Purpose: the full route shell — `PageHeader` plus a `gap-6` content stack —
replacing the `<div className="flex flex-col gap-6"><PageHeader .../>…</div>`
markup that was duplicated identically across 4 app pages (and re-implemented
with raw primitives on the dashboard, and a raw `<h1>`/`<p>` in the offer
detail view). Lives in
[`src/shared/layouts`](../../src/shared/layouts/app-page-layout), not
`src/shared/ui`, since it's a layout, not a UI primitive.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | yes | Forwarded to `PageHeader` |
| `subtitle` | `string` | no | Forwarded to `PageHeader` |
| `action` | `React.ReactNode` | no | Forwarded to `PageHeader` |
| `children` | `React.ReactNode` | yes | Route content, stacked with `gap-6` |

```tsx
import { AppPageLayout } from '@/shared/layouts';

<AppPageLayout title="Offers">
  <OfferList offers={offers} />
</AppPageLayout>
```

Nests inside the `Screen` primitive already applied once in
`src/app/(app)/layout.tsx` — it never adds its own outer padding or scroll
container.

## StatCard

Purpose: a single metric tile (label + value) — extracted for the dashboard's
application-status breakdown, which needed 5 identical tiles in a grid.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | yes | Rendered via the `Text` primitive (`size="xs" color="muted"`) |
| `value` | `number \| string` | yes | Rendered via the `Text` primitive (`size="lg" weight="semibold"`) |

```tsx
import { StatCard } from '@/shared/ui';

<StatCard label="Applied" value={3} />
```

Built on the `Surface` primitive (`padding="sm"`), not `Card` — nesting
`Card` tiles inside a `Card`-based parent collapses the background contrast
that gives elevation its meaning (see Spacing & elevation in
`ui-principles.md`).

## ListRow

Purpose: a hairline-ruled, full-width row for rendering a collection as
ruled rows instead of wrapping each item in its own `Card` — the "Card
wrapping a `ul` of link rows" pattern duplicated across the dashboard.
Built on the `ruled` elevation from `Surface` (see `ui-principles.md`), not
a bordered box.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `href` | `string` | no | Renders the row as a `next/link` `Link` instead of a `div` |
| `leading` | `React.ReactNode` | no | Optional leading content (icon, avatar) |
| `title` | `React.ReactNode` | yes | Primary row text |
| `supporting` | `React.ReactNode` | no | Secondary text under the title |
| `meta` | `React.ReactNode` | no | Trailing content, rendered in mono (date, status) |
| `className` | `string` | no | Extra classes merged via `cn` |

```tsx
import { ListRow } from '@/shared/ui';

<ListRow
  href={`/offers/${offer.id}`}
  title={offer.title}
  supporting={offer.company}
  meta={offer.createdAt.toLocaleDateString()}
/>
```

## AsyncButton

Purpose: the `{isPending && <Spinner/>}{isPending ? '…' : label}` pattern
that was hand-rolled at roughly a dozen call sites — wraps `Button` behind
a single `pending` prop.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `pending` | `boolean` | no | Shows a `Spinner` and disables the button while `true` |
| `pendingLabel` | `React.ReactNode` | no | Label shown while pending; falls back to `children` |
| ...rest | `React.ComponentProps<typeof Button>` | no | Forwarded to `Button` (`variant`, `size`, `type`, etc.) |

```tsx
import { AsyncButton } from '@/shared/ui';

<AsyncButton pending={mutation.isPending} pendingLabel="Saving…">
  Save
</AsyncButton>
```

## ConfirmDialog

Purpose: the "delete this, it cannot be undone" dialog, previously
hand-implemented twice with slightly different markup. Built on the
existing `Dialog` primitives with a destructive confirm action wired
through `AsyncButton`.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `trigger` | `React.ReactNode` | yes | Rendered via `DialogTrigger asChild` |
| `title` | `React.ReactNode` | yes | Dialog title |
| `description` | `React.ReactNode` | no | Dialog description |
| `confirmLabel` | `React.ReactNode` | no | Defaults to `"Confirm"` |
| `pendingLabel` | `React.ReactNode` | no | Confirm button label while `pending` |
| `cancelLabel` | `React.ReactNode` | no | Defaults to `"Cancel"` |
| `onConfirm` | `() => void` | yes | Called when the confirm button is clicked |
| `pending` | `boolean` | no | Passed through to the confirm `AsyncButton` |
| `confirmDisabled` | `boolean` | no | Disables the confirm action, e.g. until a typed confirmation matches |
| `children` | `React.ReactNode` | no | Extra content between the description and the footer, e.g. a typed-confirmation `Input` |
| `open` / `onOpenChange` | `boolean` / `(open: boolean) => void` | no | Controlled open state; omit for an uncontrolled dialog |

```tsx
import { ConfirmDialog } from '@/shared/ui';

<ConfirmDialog
  trigger={<Button variant="destructive">Delete</Button>}
  title="Delete this offer?"
  description="This cannot be undone."
  pending={mutation.isPending}
  onConfirm={() => mutation.mutate({ id })}
/>
```

## Field

Purpose: the `Label` above a control, with optional help and error text —
previously copied across the offer edit dialog, the job preferences form
and the four auth pages, some of which used a raw `label` element or a
placeholder standing in for a label. Wires `aria-describedby` and
`aria-invalid` onto its control so the error is announced.

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | yes | Cloned onto the control and used as the `Label`'s `htmlFor` |
| `label` | `React.ReactNode` | yes | Rendered via the `Label` primitive above the control |
| `help` | `React.ReactNode` | no | Help text, linked via `aria-describedby` |
| `error` | `React.ReactNode` | no | Error text, linked via `aria-describedby`; also sets `aria-invalid` on the control |
| `className` | `string` | no | Extra classes merged via `cn` on the wrapper |
| `children` | `React.ReactElement \| ((controlProps: { id, 'aria-invalid', 'aria-describedby' }) => React.ReactElement)` | yes | A single control (e.g. `Input`), or a render function for cases where the control isn't the direct child (e.g. a `react-hook-form` `Controller`-wrapped `Select`) |

```tsx
import { Field, Input } from '@/shared/ui';

<Field id="email" label="Email" error={errors.email?.message}>
  <Input type="email" {...register('email')} />
</Field>
```

When the control is nested inside something like `Controller`, pass a
render function instead so the field props land on the real control rather
than being discarded by the wrapper:

```tsx
<Field id="workMode" label="Work mode">
  {(controlProps) => (
    <Controller
      control={control}
      name="workMode"
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger {...controlProps}>…</SelectTrigger>
        </Select>
      )}
    />
  )}
</Field>
```

## SplitLayout

Purpose: a two-pane list/detail shell for a screen with a persistent list
beside a detail view. Lives in
[`src/shared/layouts`](../../src/shared/layouts/split-layout). No screen
uses it yet — no list/detail split UI exists in this codebase today, so
this is built ready for the next screen that genuinely needs one, not
retrofitted onto today's single-pane `offers` page (which would be a page
redesign, not a shell extraction).

Props:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `list` | `React.ReactNode` | yes | Fixed-width list rail (`w-80`), own scroll, right border on `md`+ |
| `detail` | `React.ReactNode` | yes | Flexible detail pane, own scroll |
| `className` | `string` | no | Extra classes merged via `cn` |

```tsx
import { SplitLayout } from '@/shared/layouts';

<SplitLayout list={<OfferList offers={offers} />} detail={<OfferDetail offer={offer} />} />
```

## Not built here

Two other patterns were named as candidates for this task but had no actual
duplicated code to extract, so building them now would have been speculative
rather than an extraction:

- **Status badges** — no duplicated badge markup exists; the two places a
  status is shown today (`post-list.tsx`'s card title, `upcoming-interviews-card.tsx`'s
  inline text) aren't decorative badges, and turning them into one would be
  a visual-language change outside this task's scope. Use the `Badge`
  primitive directly (see `src/shared/ui/primitives/README.md`) if a future
  screen needs one.
- **Skeleton loaders** — no hand-rolled loading placeholder exists anywhere
  to extract. The `Skeleton` primitive already exists and is ready to use
  once a route adds a loading state.
