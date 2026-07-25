# Design Review Workflow

How Claude Code visually reviews and iterates on a screen using the
Playwright MCP server (`.mcp.json`), instead of judging visual correctness
from code alone. This is a dev-time visual QA tool, separate from the
`@playwright/test` e2e smoke suite in `tests/smoke/e2e/` — it drives a real
browser interactively, it doesn't assert against a test suite.

## One-time setup

Playwright's browser binaries must be installed once before the MCP server
can drive a real browser:

```
npx playwright install chromium
```

## The loop

For each screen (route) under review:

1. **Load context.** Read `docs/design-system/colors.md`,
   `docs/design-system/typography.md`, `docs/design-system/ui-principles.md`,
   `docs/design-system/components.md`, `src/shared/ui/primitives/README.md`.
2. **Start the app.** Ensure `npm run dev` is running (start it if not);
   the app serves at `http://localhost:3000`.
3. **Screenshot, then immediately judge it — never just capture and move
   on.** Every screenshot or snapshot taken via the Playwright MCP tools
   (in both light and dark mode where the screen supports it) must be
   checked before doing anything else, against:
   - **Design-system compliance:** colors/type only from `colors.md` /
     `typography.md`; spacing, radius, elevation only from the scales in
     `ui-principles.md`.
   - **Component reuse:** the screen composes `src/shared/ui` primitives
     and composites (`EmptyState`, `PageHeader`, etc. — `components.md`,
     `primitives/README.md`) instead of hand-rolled markup that merely
     happens to use the right tokens.
   - **Enterprise-SaaS bar:** consistent alignment/spacing rhythm, clear
     visual hierarchy, generous whitespace, no decorative gradients/glow
     (see `ui-principles.md`'s "Explicitly avoid" section) — judged
     against the named benchmarks: **Linear**, **Vercel Dashboard**,
     **Stripe Dashboard**.
4. **If anything fails the checklist, fix it before continuing.** Apply a
   scoped diff — fix only what's visually wrong, following `CLAUDE.md`'s
   "modify as few files as possible" — reuse `src/shared/ui` primitives and
   design-system tokens, don't introduce new components or a new color
   outside the palette.
5. **Re-screenshot and re-judge (step 3) until the screen passes.** Skipping
   the re-check after a fix is not allowed — a fix isn't verified until its
   own screenshot has been judged.
6. Move to the next screen, if reviewing more than one.

## When this runs automatically

`/implement-task` and `/fix-task` run this loop as a conditional Step 4
validation sub-step — only for tasks labeled `ui` or whose scope touches
`src/app`, `src/widgets`, or a components directory. It does not run for
backend/database/AI-service-only tasks.
