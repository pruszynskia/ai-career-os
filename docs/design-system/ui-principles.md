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

## When adding a new screen

1. Compose from existing `src/shared/ui` primitives (Button, Card, Dialog,
   Input) before building anything new.
2. Pick colors only from the semantic tokens in `colors.md` — never a raw
   OKLCH/hex value.
3. If a screen seems to need a color or spacing value not covered here,
   update this document first, then use it — don't improvise locally.
