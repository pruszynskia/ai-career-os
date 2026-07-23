# Technology Stack

> This document lists the starter kit's **opinionated default stack**. It's a
> real, runnable choice (matches `config/package.json`), not a placeholder —
> keep it as-is if it fits, or replace any layer with your own `<Stack>` pick
> and update this file to match.

## Purpose

This document defines the technology stack used in `<Project Name>`.

Goals:

- use modern production-ready technologies
- optimize developer experience
- keep architecture scalable
- make the project easy to understand for future developers
- enable efficient AI-assisted development

---

# Frontend Application

## Framework

**Next.js**

Version:

- latest stable version

Usage:

- application framework
- routing
- server-side rendering
- server components
- API integration
- SEO optimization

Why:

- industry standard React framework
- excellent SaaS support
- strong performance capabilities

---

## Language

**TypeScript**

Configuration:

- strict mode enabled

Usage:

- application code
- API contracts
- component props
- domain models

Why:

- improves maintainability
- prevents runtime errors
- better AI-generated code quality
- easier refactoring

---

# UI Layer

## Styling

**Tailwind CSS**

Usage:

- utility-first styling
- responsive layouts
- design consistency

Rules:

- avoid custom CSS unless required
- reuse existing design patterns
- keep spacing and colors consistent

---

## Component Library

**shadcn/ui**

Usage:

- reusable UI primitives
- accessible components
- consistent design system

Components:

- Button
- Dialog
- Form
- Input
- Dropdown
- Card
- Toast
- Navigation

Why:

- production-ready
- customizable
- based on Radix UI
- excellent TypeScript support

---

## UI Primitives

**Radix UI**

Usage:

- accessibility primitives
- complex interactions

Examples:

- dialogs
- menus
- popovers
- dropdowns

---

## Icons

**Lucide React**

Usage:

- application icons
- UI actions
- navigation

Rules:

- do not use random SVG icons
- use consistent icon system

---

## Animations

**Framer Motion**

Usage:

- page transitions
- micro interactions
- onboarding animations

Rules:

- animations must improve UX
- avoid unnecessary animations
- respect reduced motion preferences

---

# State Management

## Server State

**TanStack React Query**

Usage:

- API data fetching
- caching
- synchronization
- loading states
- optimistic updates

Examples:

- `<primary resource>` list/detail queries
- user profile
- subscription data

---

## Client State

**Zustand**

Usage:

- local application state
- UI state

Examples:

- modal state
- preferences
- temporary UI data

Rules:

Do not store server data in Zustand.

---

# Forms and Validation

## Form Management

**React Hook Form**

Usage:

- user input
- configuration forms
- profile forms

Why:

- performant
- minimal rerenders
- excellent TypeScript support

---

## Schema Validation

**Zod**

Usage:

- runtime validation
- API validation
- form schemas
- type inference

Example:

```ts
const resourceSchema = z.object({
  name: z.string(),
  tier: z.enum(['basic', 'pro', 'enterprise']),
});
```

---

# API Communication

## API Style

REST API

Communication flow:

```
Component

↓

Custom Hook

↓

Service Layer

↓

API Client

↓

Backend
```

---

## HTTP Client

Recommended:

native fetch API

or

typed API client wrapper

Rules:

- no direct API calls inside components
- all API communication goes through services

---

# Backend

## Runtime

Node.js

Usage:

- backend services
- API routes
- external integrations

---

## API Layer

Next.js API Routes / Server Actions

Usage:

- application backend
- authentication
- business logic

---

# Database

## Database

PostgreSQL

Usage:

- users
- `<primary domain entities>`
- subscriptions
- analytics

---

## ORM

Prisma

Usage:

- database access
- schema management
- migrations

Why:

- excellent TypeScript support
- developer friendly
- AI friendly

---

# Authentication

## Authentication Solution

Recommended:

Auth.js

Usage:

- user authentication
- sessions
- OAuth providers

Possible providers:

- Google
- GitHub
- Email

---

# AI Integration

`<Only if the product itself uses an LLM — remove this section otherwise.>`

## AI Provider

`<Anthropic / OpenAI / other>`

Usage:

- `<feature using AI>`
- feedback / generation pipelines

Architecture:

```
Frontend

↓

Backend API

↓

AI Service Layer

↓

LLM Provider
```

Rules:

- never expose API keys in frontend
- isolate AI logic from UI
- store prompts separately

---

# Testing

## Unit Testing

Vitest

Usage:

- utilities
- hooks
- business logic

---

## Component Testing

React Testing Library

Usage:

- component behaviour
- user interactions

---

## End-to-End Testing

Playwright

Usage:

- critical user flows
- authentication
- core scenarios

---

# Code Quality

## Linting

ESLint

Purpose:

- detect problems
- enforce standards

---

## Formatting

Prettier

Rules:

- automatic formatting
- consistent code style

---

## Git Hooks

Husky

Usage:

Before commit:

- lint
- format check
- type check

---

## Commit Convention

Conventional Commits

Examples:

```
feat(<scope>): add <feature>

fix(auth): resolve session issue

docs(api): update documentation
```

---

# Build and Deployment

## Hosting

Vercel

Usage:

- frontend deployment
- preview environments
- production hosting

---

## CI/CD

GitHub Actions

Pipeline:

```
Pull Request

↓

Install dependencies

↓

Lint

↓

Type Check

↓

Tests

↓

Build

↓

Deploy
```

---

# Development Environment

## Package Manager

Recommended:

npm

---

## Node Version

Use:

LTS version

Managed with:

nvm

Example:

```bash
nvm use
```

---

# Architecture Principles

The technology stack follows these principles:

- Type safety first
- Server-first React architecture
- Feature-based organization
- Minimal dependencies
- Reusable components
- Clear separation of concerns
- Production-quality standards

---

# AI Development Compatibility

This stack is optimized for AI-assisted development.

AI agents should:

- follow existing patterns
- reuse dependencies
- avoid introducing unnecessary libraries
- update documentation after architectural changes

Relevant documents:

- `AI_RULES.md`
- `ARCHITECTURE.md`
- `docs/CODING_STANDARDS.md`
- `memory-bank/project-context.md`
