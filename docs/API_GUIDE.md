# API Guide

## Purpose

This document defines API communication standards for AI Career OS.

Goals:

- consistent API architecture
- predictable data flow
- type-safe communication
- maintainable frontend/backend separation
- efficient AI-assisted development

---

# API Architecture

## Communication Flow

Component

↓

Feature Hook

↓

API Service Layer

↓

HTTP Client

↓

Backend API

Example:

ResourcePage

↓

useResourceSession()

↓

resourceService.startSession()

↓

apiClient.post()

↓

Backend

---

# API Location Rules

All API-related code must follow:

src/

features/

resource/

api/

resource.api.ts

hooks/

useResource.ts

types.ts

Example:

features/resource/
├── api/
│ └── resource.api.ts
├── hooks/
│ └── useResource.ts
├── types.ts
└── components/

---

# HTTP Client

Use centralized API client.

Example:

```ts
// shared/api/client.ts

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers:{
    "Content-Type":"application/json"
  }
});

Rules:

never call fetch/axios directly inside components
all requests go through apiClient
authentication logic belongs to client layer
API Service Rules

API services are responsible only for communication.

Good:

export async function getResource(
 id:string
){
 const response = await apiClient.get(
 `/resources/${id}`
 )

 return response.data
}

Bad:

export async function getResource(){

 updateUI()
 showToast()

}

Services should NOT:

modify UI state
contain business logic
handle components
React Query Integration

All server state must use React Query.

Example:

export function useResource(id:string){

return useQuery({

queryKey:[
"resource",
id
],

queryFn:
()=>getResource(id)

})

}
Query Key Rules

Use structured query keys.

Good:

[
"resources",
"user",
userId
]

Bad:

[
"data"
]

Examples:

Resource list:

[
"resources"
]

Single resource:

[
"resource",
id
]

Resource feedback:

[
"feedback",
resourceId
]
Mutations

All data modifications use React Query mutations.

Example:

const mutation = useMutation({

mutationFn:
createResource

})

After successful mutation:

Invalidate related queries.

Example:

queryClient.invalidateQueries({

queryKey:[
"resources"
]

})
API Types

Every API response must have TypeScript types.

Example:

export interface Resource {

id:string;

role:string;

status:
"pending"
|"completed";

createdAt:string;

}

Never use:

any
Request / Response Pattern
Request

Example:

interface CreateResourceRequest {

jobTitle:string;

company:string;

experienceLevel:
"junior"
|
"mid"
|
"senior";

}
Response

Example:

interface CreateResourceResponse {

id:string;

status:
"created";

}
Error Handling

All API errors must follow common format.

Example:

interface ApiError {

message:string;

code:string;

status:number;

}
Error Rules

Never:

catch(error){

console.log(error)

}

Instead:

catch(error){

throw normalizeApiError(error)

}
Loading States

Every API-driven UI must handle:

Loading

Example:

Skeleton UI

Empty

Example:

"No resources yet"

Error

Example:

"Unable to load resources"

Authentication

Authentication handling belongs to API layer.

Never:

store tokens in components
manually attach headers everywhere

Use:

middleware
interceptors
server sessions
Server Components

For Next.js:

Prefer server-side data fetching when:

SEO matters
data is static
no client interaction required

Use React Query when:

data changes frequently
optimistic updates needed
client interaction required
Caching Strategy
Static Data

Use:

Next.js caching

Examples:

landing page content
documentation
Dynamic User Data

Use:

React Query

Examples:

resources
feedback
progress
Optimistic Updates

Use optimistic updates for:

changing preferences
marking resource completed
UI-only actions

Example:

Update cache immediately
Send API request
Rollback on error
API Security Rules

Never send:

passwords
API keys
private tokens

Validate:

user permissions
input data
request payloads

Use:

Zod validation.

Environment Variables

API URLs:

Development:

NEXT_PUBLIC_API_URL=http://localhost:3000/api

Production:

NEXT_PUBLIC_API_URL=https://api.example.com

Never commit:

.env
.env.local
Testing API

Every important API service should have:

Unit tests:

success case
error case

Integration tests:

complete user flow

Example:

Create resource:

User submits form
API request sent
Resource created
UI updated
AI Development Rules

When creating a new API feature:

Check existing API patterns.
Create types first.
Create service layer.
Create React Query hooks.
Connect UI.
Add loading/error states.
Update documentation.

Never create API calls directly inside components.

Backend Implementation

Backend:

Next.js Route Handlers (`src/app/api/**`) + Supabase (PostgreSQL, no ORM). No
separate backend service for MVP.

Backend Flow

Route Handler

↓

Zod validation (request boundary)

↓

Entity service (`src/entities/{entity}/service.ts` or
`src/features/{feature}/services/*.service.ts`)

↓

Supabase client (`src/shared/db/client.ts`, per-request via `@supabase/ssr`)

↓

Supabase PostgreSQL (RLS enforces owner scoping)

Rules:

- Route handlers stay thin: validate input, call one service function, return a typed response. No Supabase client calls inside route handlers.
- Supabase queries for an entity live in exactly one service module — not scattered across route handlers or components.
- This keeps ownership of each entity's data-access logic in one place; multi-tenant scoping (ADR-005) is already enforced by RLS, not app-level filtering.

See ARCHITECTURE.md "Backend & Data Layer" for the full picture, and ADR-009
in memory-bank/decisions.md for why this pattern (Supabase client + RLS)
replaced Prisma + app-level `ownerId` filtering.
