# Fix Task Command

Fix problems found during review.

Input:

TASK-ID

Steps:

1. Read review findings

2. Inspect related files

3. Implement fixes

4. Run validation:

If this task is labeled `ui` or its scope touches `src/app`, `src/widgets`,
or a components directory, run the `docs/DESIGN_REVIEW_WORKFLOW.md` loop
(via the Playwright MCP server) against the changed routes before marking
the task done. Skip this for backend/database/AI-service-only tasks.

- npm run lint
- npm run test
- npm run build

5. Summarize:

- problems fixed
- files changed
- validation results
