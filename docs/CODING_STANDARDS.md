# Coding Standards

## Naming

### Components

Use **PascalCase**.

Example:

```tsx
UserProfile.tsx;
SearchButton.tsx;
```

---

### Files

Use **kebab-case**.

Example:

```text
user-profile.tsx
search-button.tsx
```

---

### Hooks

Use the `useSomething` naming convention.

Example:

```ts
useUser.ts;
useAuth.ts;
useDebounce.ts;
```

---

### Functions

Use **camelCase**.

Example:

```ts
getUserData();
handleSubmit();
calculateTotal();
```

---

# Component Standards

## Component Example

### Good

```tsx
interface ButtonProps {
  label: string;
}

export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}
```

---

## Avoid

### Huge components

Avoid components larger than **500+ lines**.

Large components usually indicate:

- multiple responsibilities
- difficult testing
- poor maintainability
- unclear ownership

---

## Instead

Split components by responsibility.

Example:

```text
components/
 ├── UserProfile/
 │    ├── UserProfile.tsx
 │    ├── UserAvatar.tsx
 │    ├── UserDetails.tsx
 │    └── index.ts
```

---

# Component Creation Guide

Before creating a component, ask:

## Question 1

### Is it reusable?

### YES

Place it in:

```text
shared/components
```

Examples:

```text
shared/components/Button
shared/components/Modal
shared/components/Input
```

---

### NO

Place it inside the feature:

```text
feature/components
```

Example:

```text
features/resources/components/ResourceCard
```

---

# Component Requirements

Every component should include:

- TypeScript props
- responsive design
- accessibility support
- loading state when needed
- proper error handling when needed

---

# Avoid

Components with:

- 20+ props
- multiple responsibilities
- business logic mixed with UI
- duplicated logic
- unclear naming

---

# Prefer Composition

Avoid:

```tsx
<Card title="Profile" showHeader showFooter loading error user={user} />
```

Prefer:

```tsx
<Card>
  <Card.Header>Profile</Card.Header>

  <Card.Body>Content</Card.Body>
</Card>
```

---

# Component Design Principles

Follow:

- Single Responsibility Principle
- Composition over configuration
- Reusable primitives
- Clear component boundaries
- Predictable props API
