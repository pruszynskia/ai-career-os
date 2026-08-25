# UI Principles

## Brand direction

The palette in [`colors.md`](./colors.md) encodes three attributes the
product needs to project, since it manages a single owner's real job search:

- **Trust** — Deep Navy as the dominant, anchoring color. Stable, low-chroma,
  never flashy.
- **Intelligence** — Electric Blue reserved for interactive/AI-driven
  moments (tailoring a CV, generating a message) — it should read as "the
  system is doing something smart," not as generic UI chrome.
- **Progress** — Emerald reserved for positive status only (applied, offer
  moved forward, task done) — it must stay rare enough to keep its meaning.

## Explicitly avoid

- **No gradients** as a decorative device (hero backgrounds, card fills,
  button fills). Flat semantic-token fills only.
- **No glow/blur "AI" effects** (soft box-shadows in brand colors, animated
  glassmorphism, particle backgrounds). These read as generic AI-product
  fluff, not as an enterprise tool.
- **No decorative color** — every use of `accent` or `success` must map to
  an actual interactive or status meaning, not just "make it pop."

## Spacing & elevation

- Use Tailwind's default spacing scale (`gap-2`, `p-4`, `space-y-6`, …); no
  custom spacing tokens.
- Elevation comes from `--card`/`--popover` background contrast and existing
  `shadow-*` utilities, not from color. Don't invent new shadow tokens.
- Corner radius follows the existing `--radius` scale already defined in
  `globals.css` (`--radius-sm` … `--radius-4xl`, derived from
  `--radius: 0.625rem`) — reuse it, don't hardcode `rounded-[Npx]`.

## Layouts

Compose routes from [`src/shared/layouts`](../../src/shared/layouts) instead
of re-implementing the page shell:

- **`AppPageLayout`** — the standard shell for a route: a `PageHeader`
  (title, optional subtitle, optional trailing action) above a `gap-6`
  content stack. It sits inside the `Screen` primitive that
  `src/app/(app)/layout.tsx` already applies once per route — never re-add
  outer padding or a second scroll container inside it.
- **`SplitLayout`** — a two-pane list/detail shell (fixed-width list rail,
  flexible detail pane, stacks vertically below `md`), for a future screen
  that actually needs a persistent list beside a detail view. Reach for it
  only when a real master-detail navigation exists — don't wrap a
  single-pane screen in it just because the component is available.

## When adding a new screen

1. Compose from existing `src/shared/ui` primitives (Button, Card, Dialog,
   Input) before building anything new.
2. Pick colors only from the semantic tokens in `colors.md` — never a raw
   OKLCH/hex value.
3. If a screen seems to need a color or spacing value not covered here,
   update this document first, then use it — don't improvise locally.

## Audit findings (TASK-034)

Every route (dashboard, offers list/detail, applications, posts, profile,
sign-in) was run through the `/design-review` Playwright loop against the
Linear/Vercel Dashboard/Stripe Dashboard benchmarks. Two root-cause CSS bugs
accounted for nearly every visual defect found across all of them:

- **`--font-sans` was self-referential** in `globals.css`'s `@theme inline`
  block (`--font-sans: var(--font-sans)`), so Tailwind's `font-sans`
  utility never resolved to Geist and the whole app silently fell back to
  the browser's default serif font. Fixed to point at
  `--font-geist-sans`.
- **Two unlayered resets** in `globals.css` (outside any `@layer`) outranked
  every matching Tailwind utility per CSS cascade-layer rules:
  - `* { padding: 0; margin: 0; }` zeroed every `Card`'s inner padding
    (dashboard cards, offer/application list items, the sign-in card),
    content touching its own border. Removed — Tailwind's preflight already
    resets margin/padding inside `@layer base`, so this was a duplicate
    that happened to be load-bearing in the wrong direction.
  - `a { color: inherit; text-decoration: none; }` killed every
    `.underline`/`hover:underline` utility app-wide (the duplicate-offer
    recovery link in `AddOfferForm`, `OfferList`/`ApplicationList` row
    links, the `Button` `link` variant). Moved inside `@layer base` so an
    explicit `.underline` opt-in still wins, matching how Tailwind's own
    preflight registers this exact rule.

Per-route: `AddOfferForm` (offers route) was floating unboxed above the
bordered offer list; wrapped it in the existing `Card`/`CardContent`
components so it groups visually like every other surface on the screen.

No new component library, dependency, or one-off per-screen styling was
added — every fix reused `src/shared/ui`/`src/shared/layouts` or corrected
an existing shared token.
