# AI Notes

## Purpose

This file contains short notes for AI assistants working on this project.

Use this file to remember:

- important implementation details
- recurring problems
- project-specific rules
- lessons learned
- things to avoid

Do not store:

- full documentation
- architecture descriptions
- large explanations

For architecture decisions use:

memory-bank/decisions.md

For current work use:

memory-bank/current-task.md

---

# Project Intelligence

## General Rules

- Prefer improving existing code over creating new abstractions.
- Before adding dependencies check if existing tools solve the problem.
- Keep implementation simple until complexity is justified.
- Production quality is more important than speed of implementation.

---

# AI Development Preferences

## Code Generation

When generating code:

Prefer:

- complete TypeScript types
- small focused components
- reusable utilities
- clear naming
- predictable data flow

Avoid:

- unnecessary comments
- over-engineering
- premature optimization
- creating generic abstractions too early

---

# Architecture Reminders

Current architecture:

Feature Slice Architecture

Business logic location:

features/

Reusable UI:

shared/components/

Server state:

React Query

Client state:

Zustand

Forms:

React Hook Form + Zod

---

# Component Rules

Before creating component ask:

1. Does similar component already exist?
2. Is this reusable?
3. Should it live in shared or feature?

Avoid:

- components above 200-300 lines
- components with many boolean props
- mixing API calls with UI rendering

Prefer:

Composition:

```tsx
<Card>
  <Card.Header />
  <Card.Content />
</Card>
```
