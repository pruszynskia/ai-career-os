# UI Principles

## Brand direction

See [`colors.md`](./colors.md) for the palette itself (warm-neutral ramp,
neutral-inverse primary, single amber signal accent — ADR-018). The
takeaway for layout/component decisions: colour is not how this product
creates hierarchy or separation. Structure, spacing and the elevation model
below do that job.

## Explicitly avoid

- **No gradients** as a decorative device (hero backgrounds, card fills,
  button fills). Flat semantic-token fills only.
- **No glassmorphism** (`backdrop-blur` on overlays, glow/blur "AI"
  effects, animated particle backgrounds). These read as generic AI-product
  fluff, not as an enterprise tool.
- **No decorative color** — every use of `accent` or a status token must
  map to an actual interactive or status meaning, not just "make it pop."
- **No pill shapes on rectangular controls** (`rounded-full` on a button,
  input, badge, etc.). `rounded-full` is reserved for genuinely circular
  elements — avatars, single-character step/notification dots.

## Elevation model

A uniform bordered box around every piece of content is the single
strongest tell that a UI was generated rather than designed. `Surface` (the
base `Card` is built on) exposes three tiers instead, via
`surfaceVariants({ elevation })` in
[`Surface.tsx`](../../src/shared/ui/primitives/surface/surface/Surface.tsx):

| Tier | Renders | Use for |
|---|---|---|
| `flat` (default) | No border, no background, no shadow | Most content. Separation comes from spacing and type hierarchy, not a box. |
| `ruled` | A single hairline `border-b` | Rows in a list/section — a collection of things reads as ruled rows, not stacked cards. |
| `raised` | `bg-card` + hairline border, 6px radius | Content that genuinely needs to read as a distinct object — a single stat, a form panel. No shadow here. |

**A `Card` must earn its box.** Reach for `Card` when a single item (a
stat, a settings panel, a form) needs to be visually distinct from the
page. When rendering a collection, prefer a `ruled`-elevation `Surface` (or
the `Divider` primitive between rows) over one `Card` per item — N bordered
boxes stacked in a column is the pattern this model replaces, not a safe
default to keep using.

Shadow is reserved for true overlays that sit above the raised tier:
`dialog.tsx`, `Popover.tsx`, `Select.tsx` content, and the toast stack.
Never a shadow on an inline `Card`, and never a shadow tinted with a colour
token — `shadow-md` on the plain `--popover`/`border` combination only.

## Controls

- 28px (`h-7`) is the dense, in-app default control height for `Button`,
  `Input`, `Textarea` and `Select`'s trigger. `size="comfortable"` (32px,
  the previous default) is reserved for primary/standalone actions, not
  the default for in-app density.
- 6px radius (`rounded-lg`, i.e. `--radius`) everywhere a control needs a
  radius. Nothing above 8px anywhere in the app — `rounded-xl`/`2xl`/`3xl`/
  `4xl` are all banned; if a design calls for a bigger radius, that's a
  spec bug, not a new call site.
- Focus rings stay on `--ring` (the neutral-inverse `--primary`), not the
  amber `--accent` — the accent fails the WCAG 2.1 SC 1.4.11 3:1
  non-text-contrast floor against the light-mode background (measured
  2.04:1, see `colors.md`'s contrast table and ADR-018). A focus indicator
  that's invisible in light mode is not an acceptable trade for brand
  colour.
- `Badge` is a small mono, uppercase, 2px-radius label (`success`,
  `warning`, `info`, `destructive`, plus `default`/`secondary`/`outline`),
  not a pill — status text, not a button.

## Layouts

Compose routes from [`src/shared/layouts`](../../src/shared/layouts) instead
of re-implementing the page shell:

- **`AppPageLayout`** — the standard shell for a route: a `PageHeader`
  (title, optional subtitle, optional trailing action) above a `gap-6`
  content stack. It sits inside the `Screen` primitive that
  `src/app/(app)/layout.tsx` already applies once per route — never re-add
  outer padding or a second scroll container inside it.

## When adding a new screen

1. Compose from existing `src/shared/ui` primitives (Button, Card, Dialog,
   Input) before building anything new.
2. Pick colors only from the semantic tokens in `colors.md` — never a raw
   OKLCH/hex value.
3. Default to `flat`/`ruled` `Surface` for a collection; reach for `Card`
   only when a single item earns its own box (see Elevation model above).
4. If a screen seems to need a color, spacing or elevation value not
   covered here, update this document first, then use it — don't
   improvise locally.
