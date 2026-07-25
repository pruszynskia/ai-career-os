# Typography

## Typeface

**Geist Sans** (body/UI) and **Geist Mono** (code), loaded via
`next/font/google` in [`src/app/layout.tsx`](../../src/app/layout.tsx) as
`--font-geist-sans` / `--font-geist-mono`, applied through Tailwind's
`font-sans` utility (`@layer base { html { @apply font-sans; } }` in
`globals.css`).

Geist is a clean, neutral grotesk already used across the app — it reads as
enterprise/product software (the same family Vercel and Linear ship) without
adding a new font-loading dependency. No change to the font stack was made
for this task.

## Scale

Use Tailwind's default type scale utilities directly — do not hardcode
`font-size`/`line-height` in component styles:

| Utility | Use |
|---|---|
| `text-2xl` / `text-3xl` (+ `font-semibold`) | Page/section titles |
| `text-lg` (+ `font-medium`) | Card/dialog headings |
| `text-sm` | Default body and UI copy (buttons, inputs, table cells) |
| `text-xs` | Meta text, labels, helper/error text |

## Weight

- `font-semibold` for headings and emphasis.
- `font-medium` for interactive labels (buttons, nav items) — matches
  `src/shared/ui/button.tsx`'s existing `font-medium`.
- `font-normal` (default) for body copy.

## Rules

- Never introduce a second font family or a new `next/font` loader without
  updating this document.
- Prefer Tailwind's scale over one-off pixel values so text stays consistent
  across `shared/ui` primitives and feature screens.
