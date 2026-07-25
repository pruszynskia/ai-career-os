# Colors

Brand direction: **Deep Navy** (Trust), **Electric Blue** (Intelligence),
**Emerald** (Progress). All tokens live as OKLCH CSS custom properties in
[`src/app/globals.css`](../../src/app/globals.css) under `:root` (light) and
`.dark`, consumed through the existing shadcn semantic token names — there is
no separate theming mechanism.

## Palette

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `oklch(0.99 0.003 255)` | `oklch(0.16 0.02 255)` | Page background, subtly navy-tinted |
| `--foreground` | `oklch(0.22 0.04 255)` | `oklch(0.96 0.005 255)` | Default body text |
| `--card` / `--popover` | `oklch(1 0 0)` | `oklch(0.2 0.025 255)` | Elevated surfaces |
| `--primary` | `oklch(0.28 0.06 255)` | `oklch(0.72 0.09 255)` | Deep Navy — primary actions, brand anchor |
| `--secondary` | `oklch(0.95 0.01 255)` | `oklch(0.27 0.03 255)` | Low-emphasis surfaces |
| `--muted` | `oklch(0.96 0.008 255)` | `oklch(0.25 0.02 255)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.48 0.02 255)` | `oklch(0.65 0.02 255)` | Secondary text |
| `--accent` | `oklch(0.62 0.19 255)` | `oklch(0.68 0.19 255)` | Electric Blue — interactive highlight, focus, links |
| `--success` | `oklch(0.6 0.14 155)` | `oklch(0.68 0.14 155)` | Emerald — positive status, progress |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Errors/destructive actions (unchanged shadcn red — out of brand-hue scope) |
| `--ring` | `oklch(0.62 0.19 255)` | `oklch(0.68 0.19 255)` | Focus ring, matches accent |

Hue is held stable across light/dark for every brand token (navy/blue ≈ 255,
emerald ≈ 155); only lightness shifts per mode so the palette reads as one
identity in both themes.

`--success` / `--success-foreground` are new tokens (shadcn's starter
palette has no success color) and are wired into the `@theme inline` block
in `globals.css` as `--color-success` / `--color-success-foreground`, so
`bg-success` / `text-success-foreground` are usable Tailwind utilities the
same way `bg-destructive` already is.

`--destructive` keeps shadcn's default red — it's a status color outside the
Navy/Blue/Emerald brand hues this task defines, not part of the palette
being replaced.

## Foreground pairing rule

`--accent-foreground` and `--success-foreground` use a **dark** navy/near-black
text (not white) in both modes — at the anchor lightness/chroma given for
Electric Blue and Emerald, white text fails WCAG AA while a dark foreground
comfortably passes (see contrast table below). `--primary-foreground` is the
opposite: primary is dark in light mode / light in dark mode, so its
foreground is always the higher-contrast opposite value.

## WCAG AA contrast (verified)

Ratios computed from the OKLCH values above (relative luminance per WCAG 2).
Minimum required: 4.5:1 for body text, 3:1 for large text/UI components.

| Pair | Light | Dark |
|---|---|---|
| foreground / background | 16.83 | 17.28 |
| primary-foreground / primary | 13.79 | 7.95 |
| secondary-foreground / secondary | 12.63 | 11.18 |
| muted-foreground / background | 6.35 | 6.01 |
| accent-foreground / accent | 5.33 | 6.84 |
| success-foreground / success | 5.30 | 7.47 |
| destructive (text) / background | 4.63 | 6.71 |

`--destructive` is used as tinted text on `bg-destructive/10` (see
`src/shared/ui/button.tsx`'s `destructive` variant), not as a solid fill with
a `-foreground` pair — the contrast check above is destructive text directly
against the page background, which is the pairing that's actually rendered.

## Usage

- Reach for the semantic token (`bg-primary`, `text-accent`, `bg-success`),
  never a raw OKLCH/hex value in component code.
- `primary` for the single dominant call-to-action per screen; `accent` for
  interactive highlights, links, and focus states; `success` for positive
  status only (not general emphasis).
- Do not introduce new color tokens outside this palette without updating
  this document first.
