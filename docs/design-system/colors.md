# Colors

Brand direction: a **warm-neutral** surface ramp (OKLCH hue 75, very low
chroma, never pure black or white) with a **neutral-inverse** primary action
(the high-contrast opposite of the canvas — near-black on light, near-white
on dark — rather than a brand hue) and a single **amber** (hue 55) signal
accent restricted to interactive/focus states. This supersedes the Deep
Navy / Electric Blue / Emerald identity from ADR-010 (see ADR-018).

All tokens live as OKLCH CSS custom properties in
[`src/app/globals.css`](../../src/app/globals.css) under `:root` (light) and
`.dark`, consumed through the existing shadcn semantic token names — there is
no separate theming mechanism. Every semantic token (`--background`,
`--primary`, `--accent`, …) resolves through a Tier-1 primitive
(`--neutral-canvas`, `--signal-amber`, …) defined in the same block; no
semantic token is assigned a literal `oklch()` value of its own.

## Palette

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` / `--card` / `--popover` | `--neutral-canvas` / `--neutral-raised` | `--neutral-canvas` / `--neutral-raised` | Page background and elevated surfaces, warm off-white / warm near-black |
| `--foreground` / `--card-foreground` / `--popover-foreground` / `--secondary-foreground` | `--neutral-text-primary` | `--neutral-text-primary` | Default body and high-emphasis text |
| `--primary` | `--neutral-ink` (near-black) | `--neutral-paper` (near-white) | Neutral-inverse of the canvas — the single dominant action colour, structurally never a status hue |
| `--secondary` / `--muted` | `--neutral-sunken` | `--neutral-sunken` | Low-emphasis / recessed surfaces |
| `--muted-foreground` | `--neutral-text-muted` | `--neutral-text-muted` | Secondary/tertiary text |
| `--accent` | `--signal-amber` (hue 55) | `--signal-amber` (hue 55) | The one signal accent — interaction/hover highlights, never body or link text |
| `--ring` | `--primary` (near-black) | `--primary` (near-white) | Focus ring — the high-contrast neutral-inverse, not the accent (amber/background is 2.04:1 in light mode, under the 3:1 SC 1.4.11 floor for a focus indicator) |
| `--warning` | `--signal-gold` (hue 95) | `--signal-gold` (hue 95) | Warning status |
| `--info` | `--signal-info` (hue 240) | `--signal-info` (hue 240) | Informational status |
| `--success` | `--status-success` (hue 155) | `--status-success` (hue 155) | Positive status, progress |
| `--destructive` | `--status-destructive` (hue ≈27) | `--status-destructive` (hue ≈22) | Errors/destructive actions (unchanged shadcn red — out of colour-identity scope) |
| `--border` | `--neutral-border-hairline` | `--neutral-border-hairline` | Dividers |
| `--input` | `--neutral-border-strong` | `--neutral-border-strong` | Form control borders |

Unlike the superseded ADR-010 palette, hue is **not** held constant across
light/dark for the neutral surfaces — light and dark are each an
independently tuned step of the same warm-neutral ramp, not an inverted copy
of one set of numbers. The amber, gold and info signal colours are held
identical between themes, since each is a single fixed accent rather than a
surface.

`--warning` / `--warning-foreground` and `--info` / `--info-foreground` are
new tokens, wired into the `@theme inline` block in `globals.css` as
`--color-warning` / `--color-warning-foreground` / `--color-info` /
`--color-info-foreground`, following the existing `--color-success` pattern
— `bg-warning`, `text-warning-foreground`, `bg-info` and
`text-info-foreground` are usable Tailwind utilities the same way
`bg-destructive` already is.

## Colour budget

Roughly **90% neutral** (canvas/sunken/raised surfaces and border hairlines),
**~8% ink** (primary text and the neutral-inverse `--primary` action), and
**~2% accent** (amber interaction states, plus the rarer warning/info/success/
destructive status colours). Any screen leaning far outside that ratio —
several amber elements competing at once, or a status colour used for
emphasis rather than status — is a spec violation, not a style choice.

## Foreground pairing rule

`--accent-foreground` and `--warning-foreground` use a **dark ink** text
(not white) in both modes — amber and gold are light colours, so white text
on them fails WCAG AA while a dark ink foreground comfortably passes (see
contrast table below). `--info-foreground` and `--success-foreground` use a
**light** foreground, since info/success sit at a mid-to-dark lightness.
`--primary-foreground` is always the opposite of `--primary`: near-white ink
on the near-black light-mode primary, near-black ink on the near-white
dark-mode primary.

## WCAG AA contrast (verified)

Ratios computed from the final OKLCH token values above via the WCAG 2
relative-luminance formula (OKLCH → OKLab → linear sRGB → relative
luminance), not assumed. Minimum required: 4.5:1 for body text, 3:1 for
large text (≥18pt / ≥14pt bold) and for non-text UI components such as a
focus ring (WCAG 2.1 SC 1.4.11).

| Pair | Light | Dark | Result |
|---|---|---|---|
| foreground / background | 18.04 | 17.22 | Pass (body text) |
| primary-foreground / primary | 18.28 | 17.21 | Pass (body text) |
| secondary-foreground / secondary | 16.99 | 17.87 | Pass (body text) |
| muted-foreground / background | 6.26 | 5.98 | Pass (body text) |
| accent-foreground / accent | 8.51 | 8.51 | Pass (body text) |
| warning-foreground / warning | 9.95 | 9.95 | Pass (body text) |
| info-foreground / info | 6.14 | 6.14 | Pass (body text) |
| success-foreground / success | 5.30 | 7.45 | Pass (body text) |
| destructive (text) / background | 4.58 | 6.71 | Pass (body text) |
| ring (`--primary`) / background | 18.28 | 17.21 | Pass (3:1 focus indicator) |
| text-accent / background | 2.04 | 9.11 | **Fails in light** — do not use `text-accent` as body or link text; amber is reserved for non-text interaction states (borders, hover fills, icons) |
| text-warning / background | 1.67 | 11.15 | **Fails in light** — same rule as `text-accent`; use `bg-warning` + `text-warning-foreground` (badge pattern) instead of `text-warning` on the page background |
| text-info / background | 6.25 | 2.97 | **Fails in dark** — use `bg-info` + `text-info-foreground` (badge pattern), never `text-info` directly on the page background |
| text-success / background | 3.54 | 7.16 | **Fails 4.5:1 body-text in light** (passes the 3:1 large-text/UI floor) — reserve for large/bold text or icons only, use `success-foreground`/`success` for badges |

`--destructive` is used as tinted text on `bg-destructive/10` (see
`src/shared/ui/button.tsx`'s `destructive` variant), not as a solid fill with
a `-foreground` pair — the contrast check above is destructive text directly
against the page background, which is the pairing that's actually rendered.

The `text-accent`/`text-warning`/`text-info`/`text-success` rows are the
direct-on-background text pairing, distinct from the badge-style
`*-foreground`/`*` pairing above them, which is the only way these four
colours may be used as text (see Usage below).

## Radius

`--radius` is 0.375rem (6px). `--radius-xl`, `--radius-2xl`, `--radius-3xl`
and `--radius-4xl` are all capped at 0.5rem (8px) so no `rounded-xl`/
`rounded-2xl`/`rounded-3xl`/`rounded-4xl` call site in the codebase renders
above 8px, pending the individual call-site cleanup in TASK-069.

## Motion

`--dur-fast` (100ms), `--dur` (160ms), `--dur-slow` (240ms) and `--ease`
(`cubic-bezier(0.2, 0, 0, 1)`) are defined once in `globals.css`, for
TASK-077's motion work to consume.

## Dark mode

Dark is the default theme (TASK-067) — `next-themes` applies the `.dark`
class before first paint, and Light and System are opt-in via the toggle in
Settings. Its palette is a **designed inversion** of the light ramp — every
dark value above was independently tuned for legibility and elevation, not
derived by auto-inverting the light tokens.

## Usage

- Reach for the semantic token (`bg-primary`, `text-foreground`, `bg-success`),
  never a raw OKLCH/hex value in component code.
- `primary` for the single dominant call-to-action per screen and for links
  (`text-accent`/`text-warning`/`text-info` fail contrast in one theme each —
  see the table above); `accent` for non-text interactive highlights (hover
  fills, borders, icons) only; `warning`/`info`/`success` for status only,
  always as the `*-foreground`-on-`*` badge pairing, never as `text-*`
  directly on the page background.
- Do not introduce new color tokens outside this palette without updating
  this document first.
