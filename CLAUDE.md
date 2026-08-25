# AI Career OS - Claude Instructions

# Claude-OS

This project inherits Claude-OS. Do not copy global rules into this file —
reference them.

- Local (Cowork / Claude Code): `~/claude/CLAUDE-OS/CLAUDE.md`
- Desktop Project without file access: fetch the mirrored copy at
  `/Claude-OS/CLAUDE.md` via the file connector. If the fetch fails or that
  file's `Last verified` date is more than 30 days old, say so instead of
  proceeding on stale rules.

Claude-OS carries the hard rules (never invent facts about Andrzej;
deterministic work is a script, not prose-in-context; grep before read),
the routing table, and model tiering. Everything below is specific to this
project.

This project's own long-term memory is `memory-bank/` — **not** a `MEMORY.md`.
`memory-bank/decisions.md` is the ADR log, `memory-bank/ai-notes.md` holds
operational learnings. Do not create a `MEMORY.md` here; it would compete with
files that already hold real content.

| Need | Load |
|---|---|
| This project's decisions | `memory-bank/decisions.md` |
| This project's operational learnings | `memory-bank/ai-notes.md` |
| This project's docs | `docs/README.md` → the one file it names |
| Facts about Andrzej, global rules, templates | Claude-OS root (path above) |
| This project's state in the OS-wide index | `projects-index.md` in Claude-OS |

---

# Task Management

All implementation tasks are stored in:

backlog/mvp.yaml

Never create tasks manually.

Always use:

/implement-task TASK-ID

Example:

/implement-task TASK-001

Task workflow:

TASK CREATED
↓
Implementation
↓
Review
↓
Fix
↓
Commit
↓
Next TASK

---

# Common Commands

Development

npm run dev

Build

npm run build

Lint

npm run lint

Type check

npm run typecheck

Tests

npm run test

Format

npm run format

---

# Project Overview

AI Career OS is a single-user tool that helps the owner get more recruiter attention on LinkedIn and track every job application in one place: AI-tailored CVs and recruiter messages per offer, a duplicate-free application pipeline, and planned LinkedIn posts.

Primary goals:

- production-quality code
- maintainable architecture
- scalable frontend
- predictable development
- excellent UX
- AI-friendly codebase

---

# Development Workflow

This project follows an AI-first workflow.

Source of truth:

1. backlog/mvp.yaml
2. GitHub Issues
3. Project documentation

GitHub Issues are generated from `backlog/mvp.yaml`.

Never treat GitHub Issue as the primary source if it differs from the repository.

---

# Context Loading Order

Before implementing any task ALWAYS load:

1. CLAUDE.md
2. AI_RULES.md
3. ARCHITECTURE.md
4. memory-bank/project-context.md
5. docs/ROADMAP.md

Load `memory-bank/decisions.md` before any task that touches architecture,
picks a library, or changes a data contract — it is the ADR log and a task
that contradicts a recorded ADR is a bug, not a preference. Load
`memory-bank/ai-notes.md` when debugging something that feels
already-solved.

For feature work additionally load:

- relevant documentation inside docs/
- relevant architecture document
- related GitHub Issue

Do NOT load unrelated documentation.

Token efficiency is important.

docs/ROADMAP.md exists so architectural and design decisions made while
implementing one task stay compatible with the stages that come after it
(see that file's "Forward-compatibility notes"). This does not override
"Implement ONLY ONE TASK at a time" below — it means choosing the
non-limiting option when a task leaves a real design choice open, not
building future-stage functionality now.

---

# Task Execution Rules

Implement **ONLY ONE TASK** at a time.

Never implement future tasks.

Never implement "nice to have" features.

Never expand project scope unless explicitly requested.

Follow exactly the current task specification.

If task requirements conflict with project architecture:

Stop and explain the conflict.

---

# Backlog Rules

Each task contains:

- Goal
- Tasks
- Files to modify
- Acceptance Criteria
- Prompt
- Do not

Use them as implementation constraints.

Files outside "Files to modify" should remain unchanged unless absolutely necessary.

---

# Adding Tasks From a Roadmap

Prefer `/add-tasks` (rough ideas) or `/generate-next-milestone` (auto-draft
the next stage) over doing this by hand — see
`.claude/commands/add-tasks.md`, `.claude/commands/generate-next-milestone.md`
and `docs/BACKLOG_MANAGEMENT.md` for the full grouping/placement/milestone
methodology those commands follow. The schema rules below (step 5) are the
canonical reference both commands and any manual edit must use.

When the user gives a roadmap/list of new tasks (e.g. "add these to the
backlog starting at TASK-0XX") and asks to add them to `backlog/mvp.yaml`
directly rather than via those commands, follow this process instead of
transcribing the list as-is:

1. Read the full current `backlog/mvp.yaml` first. Never edit, renumber, or
   move existing tasks. New tasks always take the next unused sequential
   `TASK-XXX` ID (continuing the numbering monotonically — IDs are never
   reused or reassigned), but their position in the task list is not forced
   to the end: insert each new task's YAML block wherever it logically
   belongs among the existing (untouched) tasks, per
   `docs/BACKLOG_MANAGEMENT.md` §5-7 — mirroring the same position in
   `docs/ROADMAP.md`'s matching stage table. ID order and file position can
   therefore differ for new tasks; dependency resolution is by ID
   (`depends_on`), not by position, so this is safe.
2. If the user's list re-uses low numbers (TASK-001, TASK-002, ...) for new
   work, renumber it to continue from the real last task in the file, and
   rewrite every internal cross-reference in titles/goals/do_not accordingly.
3. Resolve any requested merges, insertions, or splits (e.g. "combine these
   two", "add a task near X for Y") into the final task list and numbering
   *before* writing YAML, and confirm materially ambiguous calls (renaming
   files vs. updating docs to match reality, splitting vs. merging a task)
   with the user via a quick question rather than guessing.
4. Ground every new task in the real codebase, not just the roadmap title —
   read/grep the actual files that scope will touch (existing helper
   functions, duplicated code, doc-vs-code drift, ADR numbers already used)
   so `scope`, `tasks`, and `acceptance` name real paths and are objectively
   checkable, not generic restatements of the roadmap line item.
5. Match the exact schema and style of existing tasks: `id`, `github:
   {issue: null, project_item: null}` (no GitHub issue exists yet for new
   tasks), `status: todo`, `priority`, `estimate`, `depends_on`, `title`,
   `goal: >` (single paragraph), `scope`, `deliverables`, `tasks`,
   `acceptance`, `done`, `labels` (only from the `project.labels` enum —
   never invent a new label), `context: {architecture: [project-overview],
   standards: [coding-standards]}`, `references`, `prompt: |` ("Implement
   ONLY this task." ... "Stop immediately after acceptance criteria are
   met."), `do_not`.
6. Set `depends_on` to the actual technical prerequisites (what files/exports
   the task needs to already exist), not just "the previous item in the
   list" — an inflated dependency chain is a spec bug even if tasks happen to
   run in order anyway.
7. After writing, validate before reporting done: the YAML parses, no
   duplicate `id`s, every `depends_on` reference exists, and a diff shows
   only insertions (zero deletions) to the existing tasks.
8. Do a self-review pass on the new tasks specifically for: acceptance
   criteria referencing APIs/files that don't actually exist (re-verify with
   a grep/read, don't trust the first draft), over-constrained `depends_on`,
   and speculative deliverables with no real consumer (e.g. a barrel export
   nothing imports) — cut those before presenting the result.

---

# Development Rules

Before coding:

1. Understand current architecture.
2. Search existing implementation.
3. Reuse existing components.
4. Reuse existing hooks.
5. Reuse existing services.
6. Reuse existing utilities.

Never duplicate existing logic.

Never create new folders without checking architecture.

---

# Coding Philosophy

Prefer:

- simple code
- explicit code
- reusable components
- composition over inheritance
- TypeScript strict mode
- accessibility
- performance
- predictable state management

Avoid:

- premature abstraction
- unnecessary dependencies
- duplicated logic
- huge files
- unnecessary custom hooks
- overengineering

---

# Architecture

Follow Feature-Sliced Architecture.

Structure:

src/

├── app/
├── features/
├── entities/
├── shared/
├── widgets/

Rules:

Business logic belongs inside features.

Reusable UI belongs inside shared.

Never move code between layers without reason.

---

# Component Rules

Every component should:

- have single responsibility
- use TypeScript interfaces
- avoid boolean prop explosion
- minimize props
- support composition
- avoid unnecessary state

Before creating a component ask:

Is this:

- reusable?
- feature-specific?

Choose correct location.

---

# AI Implementation Rules

Always:

- modify as few files as possible
- keep PRs small
- avoid unrelated refactoring
- preserve existing architecture
- preserve public APIs unless required

If uncertain:

Prefer consistency over cleverness.

---

# Testing Rules

When task requires tests:

- test behavior
- avoid implementation testing
- keep tests maintainable

Do not write unnecessary tests.

---

# Before Finishing Any Task

Always:

1. Run type checking
2. Run lint
3. Run formatting
4. Run affected tests
5. Verify build
6. Update memory-bank/current-task.md
7. Update documentation if required

---

# Git Rules

Commits follow Conventional Commits.

Examples:

feat(<scope>): implement <feature>

fix(<scope>): resolve <bug>

refactor(shared): simplify button component

docs(architecture): update feature documentation

---

# Documentation Rules

If architecture changes update:

- ARCHITECTURE.md
- memory-bank/decisions.md

If feature changes update:

- memory-bank/project-context.md

If public API changes update:

- relevant docs/

---

# Token Efficiency

Minimize context usage.

Reuse existing implementation whenever possible.

Avoid reading unrelated files.

Prefer modifying existing code over generating new abstractions.

Keep generated code concise and maintainable.

---

# Definition of Done

A task is complete only if:

- Acceptance Criteria are satisfied
- Project builds successfully
- Lint passes
- Type checking passes
- Tests pass (if applicable)
- Documentation is updated (if required)
- Scope matches GitHub Issue exactly
