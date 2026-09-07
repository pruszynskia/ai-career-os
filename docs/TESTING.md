# Testing Strategy

## Purpose

This document defines testing standards for <Project Name>.

Goals:

- maintain high code quality
- prevent regressions
- enable safe refactoring
- keep development fast
- provide confidence before releases

---

# Testing Philosophy

We focus on:

1. Testing business-critical logic
2. Testing user-facing behavior
3. Avoiding unnecessary tests
4. Keeping tests easy to maintain

The priority order:

1. User flows
2. Business logic
3. Components
4. Utilities

---

# Testing Stack

## Unit Testing

Tool:

Vitest

Used for:

- utility functions
- business logic
- custom hooks
- data transformations

Example:

```
formatResourceScore()
calculateFeedback()
validateAnswer()
```

---

## Component Testing

Tools:

- React Testing Library
- Vitest

Used for:

- component behavior
- user interactions
- accessibility checks

Test:

- what the user sees
- what the user can do

Avoid testing:

- internal implementation details
- private functions
- React internals

---

## End-to-End Testing

Tool:

Playwright

Used for:

critical user journeys:

Examples:

- user registration
- login
- starting resource session
- completing resource
- receiving AI feedback
- subscription flow

---

# Test Structure

Tests should be located close to tested code.

Example:

```
features/
 └── resource/
     ├── components/
     │    ├── ResourceCard.tsx
     │    └── ResourceCard.test.tsx
     │
     ├── hooks/
     │    ├── useResource.ts
     │    └── useResource.test.ts
     │
     └── services/
          ├── resourceService.ts
          └── resourceService.test.ts
```

---

# Naming Conventions

Test files:

```
*.test.ts
*.test.tsx
```

Examples:

```
Button.test.tsx

useResource.test.ts

resourceService.test.ts
```

---

# Unit Testing Rules

## Test Behavior

Good:

```ts
it('shows validation error when answer is empty');
```

Bad:

```ts
it('calls setState');
```

Tests should describe user behavior.

---

# Mocking Rules

Use mocks for:

- external APIs
- authentication providers
- AI services
- third-party libraries

Avoid mocking:

- simple utility functions
- internal implementation details

---

# React Component Testing

Every important component should test:

## Rendering

Example:

- component appears correctly

## User Interaction

Example:

- button click
- form submission
- navigation

## States

Test:

- loading state
- empty state
- error state
- success state

Example:

```tsx
expect(screen.getByText('Generating feedback...')).toBeInTheDocument();
```

---

# API Testing

API layer should verify:

- correct request format
- error handling
- response mapping

Example:

```
resourceService.startSession()
```

Should test:

- successful response
- failed request
- invalid data

---

# React Query Testing

Test:

- successful queries
- loading states
- errors
- cache updates

Example scenarios:

```
User starts resource

↓

Mutation runs

↓

Cache updates

↓

UI refreshes
```

---

# Form Testing

Forms use:

- React Hook Form
- Zod

Test:

- validation rules
- required fields
- invalid input
- successful submission

Example:

```
Empty answer

↓

Validation error

↓

User fixes input

↓

Submission succeeds
```

---

# Accessibility Testing

All UI should consider:

- keyboard navigation
- screen readers
- proper labels
- semantic HTML

Recommended:

- Testing Library accessibility queries
- eslint-plugin-jsx-a11y

Prefer:

```tsx
getByRole('button');
```

Avoid:

```tsx
getByTestId('submit-button');
```

unless necessary.

---

# Coverage Rules

Coverage is not the main goal.

Focus on:

High coverage:

- authentication
- payments
- AI processing logic
- resource scoring
- data transformations

Lower coverage:

- simple UI wrappers
- styling-only components

---

# CI Testing Pipeline

Every Pull Request runs:

```
Install dependencies

↓

Lint

↓

Type checking

↓

Unit tests

↓

Build

↓

E2E tests
```

---

# Definition of Done

A feature is complete when:

✅ TypeScript passes

✅ ESLint passes

✅ Tests pass

✅ No console errors

✅ Loading states handled

✅ Error states handled

✅ Mobile layout checked

✅ Documentation updated if architecture changed

---

# AI Development Rules

When generating tests:

AI should:

1. Inspect existing test patterns.
2. Reuse existing utilities.
3. Prefer behavior testing.
4. Avoid creating unnecessary mocks.
5. Keep tests readable.

Do not generate tests only to increase coverage numbers.

---

# Manual Verification Journeys

Run these by hand before a release. They cover the security-sensitive paths
that automated tests only touch in parts.

## Auth

1. Sign up with a new email → confirmation email arrives, link lands on
   `/auth/callback` and then the app.
2. Sign in with the wrong password several times fast → after 10 attempts in
   a minute the page reloads showing "Too many attempts. Please wait a minute
   and try again." instead of the usual credentials error, and no request
   reaches Supabase. A single correct sign-in once the window resets still
   works. The same applies to sign-up, forgot-password and `Continue with
   Google`.

   The auth limit is enforced inside the Server Functions
   (`src/shared/rate-limit/auth-guard.ts`), not in `src/proxy.ts`: a Server
   Function is a POST to the page's own path, and a redirect or `429` answered
   from the proxy would break the action client instead of reaching the user
   ([vercel/next.js#65394](https://github.com/vercel/next.js/issues/65394)).
   The AI route handlers are limited in `src/proxy.ts` and do answer a real
   `429` with `Retry-After` — check with 30+ rapid `POST /api/cv/optimize`
   calls. Both share the limiter in `src/shared/rate-limit`, which no-ops
   when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are unset, so
   none of this is reproducible locally without an Upstash database.
3. `Forgot password` → reset email arrives, the link sets a new password, and
   the old password no longer works.
4. Visit a protected route while signed out → redirected to `/sign-in`
   (`src/proxy.ts`).

## RLS isolation

1. Sign in as owner A, create a job offer and a CV.
2. Sign in as owner B → none of A's offers, CVs, applications, posts or usage
   rows are visible anywhere in the UI or via the API routes.
3. Call an API route such as `GET /api/offers/{A's id}` as B → `404`, not
   A's data. No route uses the service-role client on the request path
   (enforced by the `no-restricted-imports` lint rule on
   `src/shared/db/admin.ts`).

## Subscription flow

1. As a free owner, start `Upgrade` → redirected to Stripe Checkout, all
   assets load under the CSP in `next.config.ts`.
2. Complete payment → Stripe fires the webhook to `/api/stripe/webhook`, the
   `subscriptions` row is written, and Pro features unlock.
3. Retry the webhook from the Stripe dashboard → handled idempotently and
   never rate limited.
4. Open `Manage billing` → redirected to the Stripe portal; cancelling there
   downgrades the owner after the next webhook.

---

# Future Improvements

Possible additions:

- visual regression testing
- performance testing
- accessibility automation
- AI response quality evaluation
- contract testing
