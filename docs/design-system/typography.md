# Typography

## Typefaces

Three faces, each with one job. All three load via `next/font/google` in
[`src/app/layout.tsx`](../../src/app/layout.tsx) — no self-hosted font files,
no font npm package.

| Face | Variable | Tailwind | Zone |
|---|---|---|---|
| **Geist Sans** | `--font-geist-sans` → `--font-sans` | `font-sans` (default on `html`) | UI and body copy: paragraphs, buttons, inputs, table cells, badges, and headings below 24px |
| **Archivo** | `--font-archivo` → `--font-display` → `--font-heading` | `font-heading` | Display type at 24px and up only: h1–h3 and the `display` step |
| **Geist Mono** | `--font-geist-mono` → `--font-mono` | `font-mono` | Data meant to be scanned or compared: numerals, dates, counts, IDs, tags, and the `Label` meta variant. Numerals inside a prose sentence stay in Geist Sans. |

**Inter and Roboto are banned everywhere, including as a fallback in any font
stack.**

## Zone rule

Archivo (`font-heading`) only applies at 24px and above. Never apply it to
body copy, buttons, inputs, table cells, or badges, and never apply it to a
`Heading` level below `h3` — `Heading` levels 4–6 render in Geist Sans by
design (see `LEVEL_CLASS` in
[`Heading.tsx`](../../src/shared/ui/primitives/typography/heading/Heading.tsx)).
`CardTitle` and `DialogTitle` render at `body-lg` (16px), below the 24px
floor, so both use `font-sans`, not `font-heading`.

## Scale

The scale is deliberately gapped: there is no step between the 16px
`body-lg` and the 24px `h3`. Do not add one — the gap is what makes display
type read as a considered choice instead of the h1 variant of the body font.

Each step is a Tailwind v4 `--text-*` theme token in
[`globals.css`](../../src/app/globals.css) and used via its `text-*`
utility (e.g. `text-h1`, `text-body-sm`).

| Step | Size | Notes |
|---|---|---|
| `label` | 11px | Uppercase, Geist Mono, `+0.08em` tracking — used by `Label`'s `meta` variant |
| `body-sm` | 13px | Dense default body/UI size (`Text`'s default) |
| `body` | 14px | |
| `body-lg` | 16px | Geist Sans. Also the size of `CardTitle` / `DialogTitle` |
| — | — | **gap: no step between 16px and 24px** |
| `h3` | `clamp(20px, 1.4vw + .8rem, 24px)` | Archivo, tracking `-0.01em` |
| `h2` | `clamp(26px, 2.2vw + .8rem, 32px)` | Archivo, tracking `-0.015em` |
| `h1` | `clamp(32px, 3.2vw + 1rem, 44px)` | Archivo, tracking `-0.02em` |
| `display` | `clamp(44px, 6vw + 1rem, 72px)` | Archivo, tracking `-0.03em` |

Tracking gets progressively more negative moving up through the display
sizes.

## Primitives

- [`Text`](../../src/shared/ui/primitives/typography/text/Text.tsx) —
  `size` maps `xs`/`sm`/`base`/`lg` to `label`/`body-sm`/`body`/`body-lg`.
  Default is `sm` (13px).
- [`Heading`](../../src/shared/ui/primitives/typography/heading/Heading.tsx)
  — `level` 1–3 render `font-heading` at `h1`/`h2`/`h3`; levels 4–6 render
  `font-sans` at `body-lg`/`body`/`body-sm` and never use the display face.
- [`Label`](../../src/shared/ui/primitives/typography/label/Label.tsx) —
  `variant="meta"` renders `text-label` in Geist Mono, uppercase.

## Rules

- Never introduce a fourth typeface, or Inter/Roboto anywhere including as a
  fallback, without updating this document.
- Fix typography at the primitive or token layer (`globals.css`, `Text`,
  `Heading`, `Label`) — never add one-off font utilities in feature
  components.
- Prose measure stays capped at 68 characters (`max-w-[68ch]` or equivalent)
  for any long-form body text block.
