# <Project Name> - Claude Instructions

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

<Project Name> is a <one-line description of the product and its primary users>.

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

For feature work additionally load:

- relevant documentation inside docs/
- relevant architecture document
- related GitHub Issue

Do NOT load unrelated documentation.

Token efficiency is important.

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
