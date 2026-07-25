# Design Review Command

Visually review one screen against the design system, via the Playwright
MCP server.

Input:

ROUTE (e.g. `/dashboard`, `/offers`, `/sign-in`)

## Steps

Read:

- docs/design-system/colors.md
- docs/design-system/typography.md
- docs/design-system/ui-principles.md
- docs/DESIGN_REVIEW_WORKFLOW.md

Do not touch any UI before loading these.

Ensure the dev server is running (`npm run dev`), then run ROUTE through the
`docs/DESIGN_REVIEW_WORKFLOW.md` loop: screenshot via Playwright MCP,
compare against the design-system docs and the named enterprise-SaaS
benchmarks (Linear, Vercel Dashboard, Stripe Dashboard), apply a scoped fix,
re-screenshot to verify.

Output:

1. Screenshot findings (what didn't match the design system/benchmarks)
2. Fixes applied
3. Verification screenshot confirming the fix
