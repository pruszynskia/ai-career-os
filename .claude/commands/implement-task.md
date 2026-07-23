# Implement Task Command

You are implementing a task from the `<Project Name>` backlog.

Task source:

backlog/mvp.yaml

## Workflow

Follow these steps exactly:

### Step 1 - Load task

Read:

- backlog/mvp.yaml
- CLAUDE.md
- ARCHITECTURE.md
- docs/CODING_STANDARDS.md

Find the requested task by ID.

Example:

TASK-001

Do not implement anything before understanding the task.

---

### Step 2 - Analyze

Provide:

1. Task summary
2. Files that need modification
3. New files required
4. Dependencies
5. Potential risks

Wait for confirmation before large architectural changes.

---

### Step 3 - Implementation

Implement only requested task scope.

Rules:

- Follow existing architecture
- Avoid unrelated refactoring
- Reuse existing components
- Prefer simple solutions
- Do not install packages without approval
- Keep components small

---

### Step 4 - Validation

Run:

- npm run lint
- npm run test (if available)
- npm run build

Fix issues caused by your changes.

---

### Step 5 - Summary

Provide:

- files changed
- implementation summary
- tests executed
- possible follow-up tasks

Prepare git commit message:

TASK-ID: short description
