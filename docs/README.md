# Documentation Guide

This folder contains project documentation used by:

- Claude Code
- GitHub Copilot
- Continue.dev
- Developers
- Future contributors

## Purpose

The documentation system provides:

- architectural context
- development standards
- product decisions
- technical guidelines
- AI collaboration rules

The goal is to keep the codebase:

- maintainable
- scalable
- consistent
- easy to understand

---

# Documentation Structure

## Product Documentation

### PRODUCT.md

Contains:

- product vision
- target users
- main problems solved
- MVP scope
- future roadmap

Read when:

- implementing new features
- making product decisions
- changing user flows

---

# Architecture Documentation

### ARCHITECTURE.md

Contains:

- application architecture
- folder structure
- dependency rules
- data flow
- state management strategy
- design patterns

Read when:

- creating new features
- adding new modules
- refactoring code
- making architectural decisions

---

# Technical Documentation

## TECH_STACK.md

Contains:

- frameworks
- libraries
- tools
- infrastructure decisions
- technology rationale

Read when:

- adding dependencies
- replacing technologies
- configuring tools

---

## API_GUIDE.md

Contains:

- API communication rules
- endpoint conventions
- request/response patterns
- error handling
- data validation

Read when:

- creating API calls
- modifying backend communication
- adding integrations

---

## STATE_MANAGEMENT.md

Contains:

- React Query usage
- Zustand patterns
- server vs client state rules
- caching strategy

Read when:

- adding application state
- creating hooks
- managing async data

---

# Code Quality Documentation

## CODING_STANDARDS.md

Contains:

- naming conventions
- TypeScript rules
- React standards
- code organization
- common anti-patterns

Read before:

- writing code
- refactoring
- reviewing pull requests

---

## COMPONENT_GUIDE.md

Contains:

- component creation rules
- component responsibilities
- composition patterns
- UI consistency rules

Read when:

- creating new components
- modifying UI
- building reusable elements

---

# Quality Documentation

## TESTING.md

Contains:

- testing strategy
- unit testing rules
- integration testing
- E2E testing approach

Read when:

- adding features
- fixing bugs
- increasing coverage

---

## PERFORMANCE.md

Contains:

- performance principles
- Core Web Vitals
- optimization rules
- loading strategies

Read when:

- optimizing UI
- reviewing performance
- improving user experience

---

# AI Collaboration Rules

## AI_RULES.md

Contains:

- AI coding behavior
- token optimization rules
- implementation expectations
- code generation standards

Every AI assistant should read this file before making changes.

---

# Memory Bank

Located in:

/memory-bank

Contains dynamic project knowledge.

## project-context.md

Current project state:

- implemented features
- current architecture
- active decisions

Update after:

- major feature completion
- architecture changes

---

## decisions.md

Contains Architecture Decision Records (ADR).

Documents:

- important choices
- alternatives considered
- reasons behind decisions

Update when:

- changing architecture
- introducing major libraries
- changing patterns

---

## current-task.md

Contains:

- active work
- TODO items
- implementation status

Update after completing tasks.

---

# Documentation Rules

## Before Creating Code

AI should:

1. Read AI_RULES.md
2. Read ARCHITECTURE.md
3. Read memory-bank/project-context.md
4. Read relevant technical documentation

## After Changing Architecture

Update:

- ARCHITECTURE.md
- memory-bank/decisions.md

## After Adding Features

Update:

- memory-bank/project-context.md
- relevant documentation files

---

# Documentation Principles

Keep documentation:

- short
- actionable
- updated
- focused on decisions

Avoid:

- duplicating code
- explaining obvious syntax
- outdated information

The documentation should explain:

"Why we do something"

not:

"How every line of code works"
