# Component Guide

## Purpose

This document defines rules for creating React components in AI Career OS.

Goals:

- consistent UI architecture
- reusable components
- predictable AI-generated code
- maintainable codebase
- recruiter-quality implementation

---

# Component Architecture

Components are divided into three categories:

## 1. Shared Components

Location:

```
src/shared/ui
```

Purpose:

Reusable UI elements without business logic.

Examples:

- Button
- Input
- Modal
- Card
- Dropdown
- Avatar
- Loader

Rules:

- no feature-specific logic
- no API calls
- no Zustand stores
- no React Query usage

Example:

```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary' }: ButtonProps) {
  return <button>{children}</button>;
}
```

---

## 2. Feature Components

Location:

```
src/features/{feature}/components
```

Purpose:

Components connected to a specific business feature.

Examples:

```
features/resource/components

ResourceTimer.tsx
QuestionCard.tsx
FeedbackPanel.tsx
```

Rules:

- may contain business logic
- may use feature hooks
- may access feature services
- should not be reused by unrelated features

Example:

```tsx
export function ResourceQuestionCard() {
  const { question } = useResourceSession();

  return <Question>{question.text}</Question>;
}
```

---

## 3. Widget Components

Location:

```
src/widgets
```

Purpose:

Large reusable sections composed from multiple features.

Examples:

- ResourceDashboard
- AnalyticsPanel
- UserProfileSection

Widgets combine:

```
Features

+

Shared Components

+

Entities
```

Example:

```
ResourceDashboard

├── ResourceTimer
├── QuestionCard
├── FeedbackPanel
└── ProgressBar
```

---

# Component Responsibility

Every component should have:

- one clear responsibility
- predictable inputs
- minimal internal state
- readable JSX

Avoid:

```tsx
ResourcePage.tsx

500 lines

API calls

business logic

UI rendering

validation

state management
```

Prefer:

```
ResourcePage

↓

ResourceDashboard

↓

QuestionCard

↓

Button
```

---

# Component Creation Checklist

Before creating a new component ask:

## 1. Does this already exist?

Search:

```
src/shared/ui
src/features
```

Reuse existing components whenever possible.

---

## 2. Is this component reusable?

YES:

Create:

```
shared/ui
```

NO:

Create:

```
features/{feature}/components
```

---

## 3. Does it contain business logic?

If yes:

Move logic to:

- hooks
- services
- stores

Example:

Bad:

```tsx
function ResourceCard() {
  const data = fetch('/api/resource');
}
```

Good:

```tsx
function ResourceCard() {
  const { data } = useResource();
}
```

---

# Props Rules

## Prefer explicit interfaces

Good:

```tsx
interface CardProps {
  title: string;

  description?: string;
}

export function Card({ title, description }: CardProps) {}
```

Avoid:

```tsx
function Card(props: any) {}
```

---

# Avoid Boolean Prop Explosion

Bad:

```tsx
<Button primary large rounded disabled loading />
```

Better:

```tsx
<Button variant="primary" size="large" />
```

Use:

- variants (`class-variance-authority`, already used by shadcn/ui — extend it, don't work around it)
- composition
- slots

This rule applies even under a lazy/fast-mode shortcut — a `variant` prop is
not more work than a boolean, so there is no lazy excuse for booleans here.

---

# Component Composition

Prefer composition over many props.

Bad:

```tsx
<Card title="" subtitle="" footer="" actions="" />
```

Better:

```tsx
<Card>
  <Card.Header />

  <Card.Content />

  <Card.Footer />
</Card>
```

---

# State Management Rules

## Local UI state

Use:

```tsx
useState;
```

Examples:

- dropdown open state
- modal visibility
- input state

---

## Server State

Use:

React Query

Examples:

- API data
- resources
- user profile
- analytics

---

## Global UI State

Use:

Zustand

Examples:

- theme
- sidebar
- application preferences

---

# Forms

Use:

```
React Hook Form

+

Zod validation
```

Example:

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

Avoid:

large controlled forms with many useState hooks.

---

# Loading States

Every async component should handle:

## Loading

Example:

```tsx
<Spinner />
```

## Error

Example:

```tsx
<ErrorMessage />
```

## Empty

Example:

```tsx
<EmptyState />
```

Never leave users with blank screens.

---

# Accessibility Rules

Every component must consider:

- semantic HTML
- keyboard navigation
- focus states
- screen readers

Examples:

Use:

```html
<button></button>
```

Not:

```html
<div onClick=""></div>
```

---

# Styling Rules

Use:

- Tailwind CSS
- design tokens
- shadcn/ui components

Avoid:

- inline styles
- duplicated CSS
- arbitrary values

Bad:

```tsx
<div style={{
 marginTop:"13px"
}}>
```

Good:

```tsx
<div className="mt-4">
```

---

# Animation Rules

Use:

Framer Motion

Animations should:

- improve UX
- be subtle
- respect reduced motion

Avoid:

- unnecessary animations
- animations on every element

---

# File Structure Example

Feature component:

```
features/resource/

components/

QuestionCard.tsx

hooks/

useResource.ts

services/

resource.service.ts

types.ts
```

Shared component:

```
shared/ui/

Button/

Button.tsx

Button.types.ts

index.ts
```

---

# Component Naming

Use:

Components:

```
PascalCase
```

Files:

```
ComponentName.tsx
```

Hooks:

```
useSomething.ts
```

Examples:

Good:

```
ResourceTimer.tsx

useResourceSession.ts

FeedbackPanel.tsx
```

Bad:

```
resource_timer.tsx

timerComponent.tsx
```

---

# Testing

Important components should have tests.

Priority:

High:

- forms
- complex interactions
- business-critical flows

Medium:

- reusable UI components

Low:

- simple wrappers

---

# AI Generation Rules

When AI creates a component:

AI must:

1. Check existing components.
2. Follow folder structure.
3. Reuse shared UI.
4. Add TypeScript types.
5. Handle loading/error states.
6. Avoid unnecessary abstractions.

Never generate:

- duplicate components
- huge files
- unnecessary dependencies
- weak TypeScript typing

---

# Definition of Done

A component is complete when:

- TypeScript passes
- ESLint passes
- UI is responsive
- accessibility considered
- loading/error states implemented
- naming follows conventions
- documentation updated if architecture changes
