# Performance Guidelines

## Purpose

This document defines performance standards for <Project Name>.

Goals:

- fast user experience
- excellent Core Web Vitals scores
- minimal JavaScript bundle size
- efficient rendering
- scalable frontend architecture
- production-ready application quality

---

# Performance Principles

## Default Rules

Always optimize for:

1. Less client-side JavaScript
2. Faster initial page load
3. Efficient rendering
4. Reduced network requests
5. Stable UI rendering

Prefer:

- Server Components
- static generation where possible
- caching
- code splitting
- lazy loading
- optimized assets

Avoid:

- unnecessary client components
- large dependencies
- premature optimization
- unnecessary re-renders

---

# Next.js Rendering Strategy

## Server Components

Default choice.

Use Server Components for:

- data fetching
- static content
- layouts
- pages
- SEO content

Example:

```tsx
export default async function ResourcePage() {

const resources = await getResources()

return (
  <ResourceList data={resources}/>
)

}
Client Components

Use only when required.

Examples:

user interaction
browser APIs
animations
state management
event handlers

Add:

"use client"

only when necessary.

Avoid converting entire pages into Client Components.

Data Fetching Performance
React Query

Use React Query for:

API data
caching
background updates
synchronization

Example:

const {
 data,
 isLoading
} = useQuery({
 queryKey:["resources"],
 queryFn:getResources
})
Caching Strategy

Use caching whenever possible.

Static Data

Prefer:

build-time generation
static rendering

Examples:

landing pages
documentation
marketing content
Dynamic Data

Use:

React Query cache
Next.js fetch caching
server-side data fetching
Component Performance
Component Size

Avoid large components.

Recommended:

UI component: <150 lines
feature component: <300 lines

Split when:

multiple responsibilities exist
difficult to test
difficult to understand
React Rendering Rules
Avoid unnecessary re-renders

Use:

component composition
memoization only when needed

Avoid:

useMemo()
useCallback()
React.memo()

without performance measurement.

State Management
Server State

Use:

React Query

Examples:

resources
user profile
AI feedback
history
Client State

Use:

Zustand

Examples:

UI preferences
modal state
temporary workflow state

Avoid storing server data in Zustand.

Images

Always optimize images.

Rules:

Use:

<Image />

from Next.js.

Avoid:

<img />

Requirements:

correct dimensions
lazy loading
modern formats
compressed assets
Bundle Size
Dependency Rules

Before adding package:

Check:

bundle size
maintenance
necessity

Avoid:

large libraries for simple functionality.

Code Splitting

Use dynamic imports for heavy features.

Example:

const ResourceRecorder =
dynamic(
()=>import("./ResourceRecorder")
)

Good candidates:

charts
editors
AI playgrounds
complex animations
Animations

Use:

Framer Motion

Rules:

Prefer GPU-friendly properties:

Good:

transform
opacity

Avoid heavy animations:

width
height
layout changes

Example:

<motion.div
 initial={{opacity:0}}
 animate={{opacity:1}}
/>
Forms Performance

Use:

React Hook Form

Reasons:

uncontrolled inputs
fewer renders
better performance

Validation:

Use:

Zod schemas

API Performance
Frontend Rules

Avoid:

duplicate requests
unnecessary refetching
fetching unused data

Prefer:

pagination
filtering
optimistic updates
request deduplication
Large Lists

For large datasets:

Use:

virtualization
pagination
infinite scrolling

Examples:

resource history
questions database
analytics tables
Core Web Vitals
LCP (Largest Contentful Paint)

Target:

< 2.5 seconds

Improve:

optimize images
reduce JS
improve server response
preload important assets
CLS (Cumulative Layout Shift)

Target:

< 0.1

Prevent:

missing image dimensions
dynamic content jumps
late-loading fonts
INP (Interaction to Next Paint)

Target:

< 200ms

Improve:

reduce main thread work
split large tasks
optimize event handlers
Monitoring

Use:

Lighthouse
Chrome DevTools
React Profiler
Web Vitals

Check performance before major releases.

Performance Checklist

Before merging:

Rendering
 Server Components used where possible
 No unnecessary Client Components
 No unnecessary re-renders
Assets
 Images optimized
 Fonts optimized
 Bundle size checked
Data
 Requests cached
 No duplicated API calls
 Loading states implemented
UX
 Fast initial load
 No layout shifts
 Smooth interactions
Performance Review Questions

Before approving code:

Does this add unnecessary JavaScript?
Can this run on the server?
Does this create additional network requests?
Can this component re-render unnecessarily?
Is this dependency really needed?
AI Development Rules

When generating code:

AI must:

follow existing performance patterns
avoid adding unnecessary dependencies
avoid Client Components by default
explain performance impact of architectural changes

Never optimize blindly.

Measure first, optimize second.
```
