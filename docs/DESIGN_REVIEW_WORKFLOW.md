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
   `docs/design-system/typography.md`, `docs/design-system/ui-principles.md`.
2. **Start the app.** Ensure `npm run dev` is running (start it if not);
   the app serves at `http://localhost:3000`.
3. **See the screen.** Navigate to the target route and take a screenshot
   via the Playwright MCP tools (in both light and dark mode where the
   screen supports it).
4. **Compare.** Judge the screenshot against `docs/design-system/*.md` and
   these named enterprise-SaaS benchmarks: **Linear**, **Vercel Dashboard**,
   **Stripe Dashboard** — clean, low-chroma-except-for-purpose, generous
   whitespace, no decorative gradients/glow (see `ui-principles.md`'s
   "Explicitly avoid" section).
5. **Propose and apply a scoped diff.** Fix only what's visually wrong,
   following `CLAUDE.md`'s "modify as few files as possible" — reuse
   `src/shared/ui` primitives and design-system tokens, don't introduce new
   components or a new color outside the palette.
6. **Re-screenshot to verify** the fix actually rendered as intended.
7. Move to the next screen, if reviewing more than one.

## When this runs automatically

`/implement-task` and `/fix-task` run this loop as a conditional Step 4
validation sub-step — only for tasks labeled `ui` or whose scope touches
`src/app`, `src/widgets`, or a components directory. It does not run for
backend/database/AI-service-only tasks.
