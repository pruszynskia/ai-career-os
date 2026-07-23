# State Management Guide

## Purpose

This document defines how application state should be managed in <Project Name>.

Goals:

- predictable state management
- clear separation between client and server state
- minimal unnecessary re-renders
- scalable architecture
- easy AI-assisted development

---

# State Categories

Application state is divided into three categories:

1. Server State
2. Client/UI State
3. Form State

Each type has a dedicated solution.

---

# State Management Stack

## Server State

Technology:

React Query (TanStack Query)

Used for:

- API data
- async operations
- caching
- synchronization
- background updates

Examples:

- resource sessions
- user profile
- AI feedback
- job descriptions
- resource history

---

## Client/UI State

Technology:

Zustand

Used for:

- temporary application state
- UI preferences
- local interactions
- global client-only state

Examples:

- theme
- sidebar state
- active resource mode
- UI filters
- modal visibility

---

## Form State

Technology:

React Hook Form + Zod

Used for:

- user inputs
- validation
- multi-step forms
- complex forms

Examples:

- registration
- resource configuration
- profile setup

---

# Decision Rules

Before creating state ask:

## Question 1

Does this data come from the backend?

YES:

Use React Query.

Example:

```ts
const { data } = useQuery({
  queryKey: ['resources'],
  queryFn: getResources,
});
```

---

## Question 2

Is this only UI-related?

YES:

Use Zustand.

Example:

```ts
const sidebarOpen = useUIStore((state) => state.sidebarOpen);
```

---

## Question 3

Is this temporary form input?

YES:

Use React Hook Form.

Example:

```ts
const form = useForm({
  resolver: zodResolver(schema),
});
```

---

# React Query Rules

## Query Naming

Use predictable keys.

Good:

```ts
['resource', resourceId];
```

Bad:

```ts
['data'];
```

---

# Query Location

Queries belong inside feature folders.

Example:

```
features/resource/

hooks/

useResource.ts

services/

resourceApi.ts
```

---

# Mutations

All data changes use mutations.

Examples:

- create resource
- submit answer
- update profile

Example:

```ts
const mutation = useMutation({
  mutationFn: createResource,
});
```

---

# Cache Updates

Prefer:

## invalidateQueries()

When:

- data changed on backend
- easiest solution
- consistency is important

Example:

```ts
queryClient.invalidateQueries({
  queryKey: ['resources'],
});
```

---

## setQueryData()

Use when:

- immediate UI update is required
- optimistic update
- exact cache update is known

Example:

```ts
queryClient.setQueryData(['profile'], updatedProfile);
```

---

# Optimistic Updates

Use only when:

- user expects instant feedback
- rollback is possible

Flow:

User Action

↓

Update UI immediately

↓

Send request

↓

Success:

keep changes

Error:

rollback state

---

# Zustand Rules

## Store Structure

Keep stores small.

Good:

```
stores/

themeStore.ts

resourceUIStore.ts

```

Avoid:

```
globalStore.ts
```

with:

- user
- auth
- resources
- theme
- modals

---

# Zustand Example

```ts
interface ResourceUIState {
  activeQuestion: number;

  setActiveQuestion: (question: number) => void;
}

export const useResourceUIStore = create<ResourceUIState>((set) => ({
  activeQuestion: 0,

  setActiveQuestion: (question) =>
    set({
      activeQuestion: question,
    }),
}));
```

---

# Do Not Store

Avoid putting server data inside Zustand.

Bad:

```ts
const useStore = create(() => ({
  users: [],
}));
```

Reason:

React Query already handles:

- caching
- synchronization
- refetching
- loading states

---

# Component Rules

Components should not directly manage global state unless necessary.

Prefer:

```
Component

↓

Feature Hook

↓

State Layer
```

Example:

```
ResourcePage

↓

useResourceSession()

↓

React Query
```

---

# Loading States

Every async feature should handle:

## Loading

Example:

Skeleton UI

---

## Error

Example:

Error message + retry

---

## Empty

Example:

"No resources yet"

---

# Data Fetching Pattern

Recommended:

```
Component

↓

Custom Hook

↓

React Query

↓

API Service

↓

Backend
```

Example:

```
ResourceDashboard

↓

useResources()

↓

resourceService.getAll()

↓

GET /api/resources
```

---

# API Separation

Never call APIs directly inside components.

Bad:

```tsx
fetch('/api/resources');
```

inside component.

Good:

```ts
resourceService.getResources();
```

---

# Performance Rules

Avoid:

- unnecessary global state
- storing derived values
- excessive selectors
- duplicated server cache

Prefer:

- local component state
- memoization only when needed
- React Query caching

---

# Testing

State logic should be testable independently.

Test:

- Zustand stores
- custom hooks
- mutations
- error handling

Avoid testing implementation details.

---

# AI Development Rules

When adding new state:

AI must explain:

1. Why this state is needed.
2. Why existing state solutions cannot handle it.
3. Where the state should live.

Before creating new store:

Check existing stores first.

---

# Summary

| Type                  | Tool                  | Examples               |
| --------------------- | --------------------- | ---------------------- |
| Server State          | React Query           | API data, AI responses |
| UI State              | Zustand               | modals, preferences    |
| Forms                 | React Hook Form + Zod | user input             |
| Local Component State | useState              | temporary UI state     |

Main rule:

**Server state belongs to React Query.  
UI state belongs to Zustand.  
Forms belong to React Hook Form.**
