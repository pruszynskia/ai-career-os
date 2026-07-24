# AI Engineering Rules

## Role

Act as a senior software engineer.

Optimize every change for:

1. Maintainability
2. Readability
3. Scalability
4. Developer Experience
5. Performance
6. Long-term project stability

Prefer simple, well-established solutions over unnecessary complexity.

---

# Before Editing Code

Always:

1. Inspect the existing implementation.
2. Understand the project structure and dependencies.
3. Identify existing patterns and conventions.
4. Reuse existing components, utilities, and abstractions.
5. Check if a similar solution already exists.

Never:

- Rewrite working code unnecessarily.
- Introduce new dependencies without a clear reason.
- Change architecture without discussing the impact.
- Create duplicate utilities or components.

Prefer incremental improvements.

---

# Code Quality Rules

All code must:

- Compile successfully.
- Pass linting.
- Follow TypeScript strict mode.
- Use meaningful names.
- Avoid unnecessary complexity.
- Follow existing project conventions.
- Be easy for another developer to understand.

Avoid:

- Magic numbers.
- Hardcoded strings.
- Dead code.
- Duplicate logic.
- Over-engineering.

---

# React Rules

Prefer:

- Functional components.
- Composition over inheritance.
- Reusable components.
- Custom hooks for reusable logic.
- Server Components where applicable.
- Separation of UI and business logic.

Avoid:

- Unnecessary `useEffect`.
- Large monolithic components.
- Prop drilling.
- Excessive state management.
- Derived state stored unnecessarily.

Before adding state ask:

> Can this value be calculated from existing props or state?

---

# Component Design Rules

Components should:

- Have a single responsibility.
- Be easy to test.
- Have clear interfaces.
- Avoid excessive configuration.

Prefer:

```
Component
 ├── UI rendering
 ├── hooks
 └── business logic separated into utilities/services
```

Avoid components with:

- More than one responsibility.
- Many boolean props.
- Complex conditional rendering.

Prefer composition:

```tsx
<Card>
  <Card.Header />
  <Card.Content />
</Card>
```

instead of:

```tsx
<Card showHeader showFooter showActions />
```

## Variant Props Over Boolean Props

For any reusable component, prefer one `variant` (and `size`) prop over
multiple booleans — even when moving fast. This holds in lazy/fast-mode too:
it is not extra work, since shadcn/ui components already ship with
`class-variance-authority` (cva) variants — reuse that pattern instead of
bolting booleans onto it.

```tsx
<Button variant="primary" size="lg" />
```

instead of:

```tsx
<Button primary large rounded />
```

See `docs/COMPONENT_GUIDE.md` for the full rule.

---

# TypeScript Rules

Prefer:

```ts
interface UserCardProps {
  user: User;
}
```

for React component props.

Use:

- Strict typing.
- Interfaces for object contracts.
- Discriminated unions.
- Generics.
- Type inference where possible.

Avoid:

```ts
any;
```

unless absolutely necessary.

Prefer:

```ts
unknown;
```

with proper type narrowing.

Avoid unnecessary type assertions:

```ts
as SomeType
```

unless the reason is documented.

---

# State Management Rules

Choose the simplest solution:

1. Local React state.
2. URL state.
3. Server state management.
4. Global state only when necessary.

Prefer:

- React Query for server state.
- Zustand or equivalent for lightweight client state.

Avoid:

- Storing server data in global state.
- Duplicating sources of truth.
- Unnecessary reducers.

---

# Styling Rules

Use:

- Existing design system.
- Tailwind CSS.
- Design tokens.
- Existing UI components.

Maintain:

- Consistent spacing.
- Consistent typography.
- Responsive layouts.
- Accessibility standards.

Avoid:

- Inline styles.
- Random colors.
- Arbitrary spacing values.
- Duplicated CSS.

---

# UI Quality Rules

Every UI implementation must consider:

## User Experience

- Loading states.
- Empty states.
- Error states.
- Success feedback.
- Responsive behavior.
- Mobile experience.

## Accessibility

Always consider:

- Semantic HTML.
- Keyboard navigation.
- Proper labels.
- Focus states.
- Screen reader compatibility.

---

# Performance Rules

Always consider:

- Bundle size.
- Rendering performance.
- Unnecessary re-renders.
- Network requests.
- Image optimization.
- Lazy loading where appropriate.

Avoid premature optimization.

Optimize only where there is measurable impact.

---

# Backend and Data Access Rules

Route Handlers stay thin: validate the request with Zod, call one service
function, return a typed response. Never call the Supabase client from a
route handler.

All Supabase queries for one entity live in exactly one service module
(`src/entities/{entity}/service.ts` or `src/features/{feature}/services/*.service.ts`),
never scattered across route handlers or components.

Every table has `id`, `owner_id`, `created_at`, `updated_at`, and RLS policies
enforcing `owner_id = auth.uid()`. Schema changes only through
`supabase/migrations/*.sql` — never a hand-edited database.

See `ARCHITECTURE.md` "Backend & Data Layer" and ADR-009 in
`memory-bank/decisions.md`.

---

# Architecture Rules

Before creating new files:

Ask:

- Does this already exist?
- Is this abstraction needed?
- Does it belong to the correct layer?

Prefer clear separation:

```
features/
components/
hooks/
services/
lib/
utils/
types/
```

Follow existing architecture patterns.

Do not introduce new architectural patterns without justification.

---

# Error Handling Rules

Always handle:

- API failures.
- Loading states.
- Invalid user input.
- Unexpected states.

Avoid silent failures.

Errors should provide:

- Useful developer information.
- Clear user feedback.

---

# Testing Rules

When adding significant functionality:

Consider:

- Unit tests.
- Integration tests.
- Component tests.
- Edge cases.

Do not add tests that only verify implementation details.

Test behavior, not internal structure.

---

# AI Token Optimization Rules

Optimize communication and output.

When modifying code:

Prefer:

- Small targeted patches.
- Minimal file changes.
- Existing abstractions.

Do not:

- Repeat unchanged code.
- Rewrite entire files.
- Explain obvious implementation details.

Responses should focus on:

1. Changed files.
2. Important architectural decisions.
3. Potential risks.
4. Required follow-up actions.

---

# Change Management Rules

Before making large changes:

Explain:

- What will change.
- Why it is needed.
- Possible impact.

For complex tasks:

Implement step-by-step.

Keep changes:

- Small.
- Reviewable.
- Easy to revert.

---

# Final Verification

Before finishing any task:

Check:

- Does it compile?
- Does lint pass?
- Are types correct?
- Does it follow existing patterns?
- Are edge cases handled?
- Did we introduce unnecessary complexity?

The best solution is:

> The simplest maintainable solution that solves the problem correctly.
