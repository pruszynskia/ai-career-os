# UI Principles

## Brand direction

See [`colors.md`](./colors.md) for the palette itself (Midnight Mint —
near-black/near-white neutrals, a single teal accent — ADR-023). The
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
- 6px radius (`rounded-lg`, i.e. `--radius`) is the default everywhere a
  control needs a radius (buttons, inputs, selects, chips). `rounded-xl`
  (12px, `tokens.json`'s `radius.lg`) is allowed on dialogs and product
  frames only (`dialog.tsx`) — `rounded-2xl`/`3xl`/`4xl` stay banned. If a
  design calls for a bigger radius anywhere else, that's a spec bug, not a
  new call site.
- Focus rings stay on `--ring` (an alias of the teal `--primary` accent —
  see `colors.md`), which passes the WCAG 2.1 SC 1.4.11 3:1 non-text-
  contrast floor against every background token in both themes (see
  `colors.md`'s contrast table). A focus indicator that fails in either
  theme is not an acceptable trade for brand colour.
- `Badge` is a small mono, uppercase, 2px-radius label (`success`,
  `warning`, `destructive`, plus `default`/`secondary`/`outline`), not a
  pill — status text, not a button.

## Layouts

Compose routes from [`src/shared/layouts`](../../src/shared/layouts) instead
of re-implementing the page shell:

- **`AppPageLayout`** — the standard shell for a route: a `PageHeader`
  (title, optional subtitle, optional trailing action) above a `gap-6`
  content stack. It sits inside the `Screen` primitive that
  `src/app/(app)/layout.tsx` already applies once per route — never re-add
  outer padding or a second scroll container inside it.

## Guardrail checklist

Run these from the repo root. Each is a pass/fail gate for `/design-review`
and for TASK-077's own audit — a rule that only lives in prose drifts back to
the defaults within a few features, so it's a grep, not a suggestion.

| Rule | Rationale | Grep |
|---|---|---|
| No gradients | "Explicitly avoid" above | `grep -rn "gradient" src --include="*.tsx" --include="*.css"` → no matches |
| No `backdrop-blur` | "Explicitly avoid" above | `grep -rn "backdrop-blur" src --include="*.tsx"` → no matches |
| No radius above 12px, and `rounded-xl` only on dialogs | Radius scale caps at `radius.lg`/12px (`tokens.json`), reserved for dialogs/product frames | `grep -rEn "rounded-(2xl|3xl|4xl)\b" src --include="*.tsx"` → no matches; `grep -rln "rounded-xl" src --include="*.tsx"` → only `dialog.tsx` |
| `rounded-full` only on genuinely circular elements | Pill shapes on rectangular controls read as generic AI-product chrome | `grep -rln "rounded-full" src --include="*.tsx"` → only `Avatar.tsx` |
| No raw Tailwind palette colour | Colour comes from `colors.md`'s semantic tokens only | `grep -rEn "(bg|text|border|ring|fill|stroke)-(red|blue|green|yellow|purple|pink|indigo|orange|teal|cyan|lime|emerald|sky|violet|fuchsia|rose|amber|slate|gray|zinc|neutral|stone)-[0-9]+" src --include="*.tsx"` → no matches |
| Shadow only on true overlays | Elevation model above — no shadow on an inline `Card` | `grep -rln "shadow-" src --include="*.tsx"` → only `dialog.tsx`, `Popover.tsx`, `Select.tsx` (and any future toast/tooltip/dropdown) |
| No `Card` wrapping an individual list item | Elevation model — a collection reads as ruled rows, not stacked cards; a small, fixed-count row of richly-detailed distinct objects (a board column, a pricing tier) is the exception, a scrolling list of similar rows is not | `grep -rln "<Card" src --include="*.tsx"` → for every match, open the file and confirm the `<Card>` either wraps a single, non-repeated entity, or is one of the two sanctioned repeated-item exceptions: `application-board.tsx`'s `BoardCard` (one per board column) and `pricing-table.tsx` (one per plan, a fixed 2-3-item comparison grid, not an open-ended list). A `.map((` proximity grep is not enough here: an extracted row component (like `BoardCard`) puts `<Card` lines away from its call site, so this rule is a listing to audit by hand, not a zero-match gate |
| No hardcoded transition duration or easing | [`motion.md`](./motion.md) — every transition goes through `--dur*`/`--ease` | Two portable (no `-P`, no lookahead) checks: (1) `grep -rEn "duration-[0-9]+\b|\bease-(linear|in|out|in-out)\b|cubic-bezier\(" src --include="*.tsx" --include="*.ts" --include="*.css" --exclude="globals.css"` and `grep -rn "style={{[^}]*transition" src --include="*.tsx"` → no matches (catches hardcoded values); (2) `grep -rEn "duration-\[|ease-\[" src --include="*.tsx" --include="*.ts" --include="*.css" --exclude="globals.css"` → every match reads `duration-[var(--dur` or `ease-[var(--ease` (catches an arbitrary-value escape hatch smuggling in a literal like `duration-[300ms]`) |
| Reduced motion drops transform | [`motion.md`](./motion.md) | `grep -n "\-\-tw-enter-scale: 1 !important" src/app/globals.css` → present (checks that the reduced-motion block actually neutralizes the transform vars, not just that the media query exists) |

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
