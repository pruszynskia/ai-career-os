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

# Future Improvements

Possible additions:

- visual regression testing
- performance testing
- accessibility automation
- AI response quality evaluation
- contract testing
