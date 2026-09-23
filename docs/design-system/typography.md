# Typography

## Typeface

One face, one job: **Geist**. Loads via `next/font/google` in
[`src/app/layout.tsx`](../../src/app/layout.tsx) — no self-hosted font
files, no font npm package.

| Face | Variable | Tailwind | Zone |
|---|---|---|---|
| **Geist Sans** | `--font-geist-sans` → `--font-sans` | `font-sans` (default on `html`, including every heading level) | UI, body copy and headings alike: paragraphs, buttons, inputs, table cells, tags, and h1–h3 |
| **Geist Mono** | `--font-geist-mono` → `--font-mono` | `font-mono` | Code only — never numbers or dates |

**The secondary display face is dropped.** There is no display-face split
anymore: every heading level renders in Geist Sans, differentiated by size
and weight only. **Inter and Roboto stay banned everywhere, including as a
fallback in any font stack.**

## Numerals

Every number, score, count and date uses `font-variant-numeric:
tabular-nums` on Geist Sans (`tabular-nums` utility) — not Geist Mono.
Geist Mono is reserved for code.

## Scale

Each step below is `tokens.json`'s `typography.scale` and becomes a
Tailwind v4 `--text-*` theme token in
[`globals.css`](../../src/app/globals.css), used via its `text-*` utility.

| Step | Size / line-height | Weight | Use |
|---|---|---|---|
| `caption` | 12 / 16 | 400 | Meta, help text, table headers, section labels (sentence case, weight 500 in practice) |
| `body` | 13 / 20 | 400 | Default UI text, table cells, buttons (weight 500) |
| `bodyLarge` | 14 / 22 | 400 | Long-form text: summaries, descriptions, documents |
| `titleSmall` | 16 / 22, tracking -0.01em | 600 | Dialog titles, auth card titles |
| `title` | 18 / 24, tracking -0.015em | 600 | Preview pane title, mobile page titles |
| `pageTitle` | 22 / 28, tracking -0.02em | 600 | App H1 (one per page) |
| `metric` | 22 / 26 | 500 | KPI values, match/callback numbers (unit in `text.muted` at 15px) |
| `displaySmall` | 24 / 30, tracking -0.02em | 600 | Marketing sub-sections |
| `displayMedium` | 36 / 42, tracking -0.03em | 600 | Marketing section titles |
| `displayLarge` | 44 / 48, tracking -0.035em | 600 | Marketing statement, pricing H1 |
| `displayXL` | 60 / 64, tracking -0.04em | 600 | Landing hero only |

Tracking gets progressively more negative moving up through the display
sizes.

## Weight budget

Three weights only, no others: **400** (regular body), **500** (buttons,
labels, captions, metrics) and **600** (titles, page titles, display type).

## Primitives

- [`Text`](../../src/shared/ui/primitives/typography/text/Text.tsx) — maps
  its `size` prop to the scale steps above (`caption`/`body`/`bodyLarge`).
- [`Heading`](../../src/shared/ui/primitives/typography/heading/Heading.tsx)
  — every level renders `font-sans`; there is no display-face threshold to
  cross. Level maps to the `titleSmall`/`title`/`pageTitle`/`body` steps
  above, not to a separate display-face scale.

## Rules

- Never introduce a second typeface, or Inter/Roboto anywhere including as
  a fallback, without updating this document.
- Fix typography at the primitive or token layer (`globals.css`, `Text`,
  `Heading`) — never add one-off font utilities in feature components.
- Prose measure stays capped at 68 characters (`max-w-[68ch]` or
  equivalent) for any long-form body text block.
