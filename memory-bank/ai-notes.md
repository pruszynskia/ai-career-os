# AI Notes

## Purpose

This file contains short notes for AI assistants working on this project.

Use this file to remember:

- important implementation details
- recurring problems
- project-specific rules
- lessons learned
- things to avoid

Do not store:

- full documentation
- architecture descriptions
- large explanations

For architecture decisions use:

memory-bank/decisions.md

For current work use:

memory-bank/current-task.md

---

# Project Intelligence

## General Rules

- Prefer improving existing code over creating new abstractions.
- Before adding dependencies check if existing tools solve the problem.
- Keep implementation simple until complexity is justified.
- Production quality is more important than speed of implementation.

## Lessons Learned

- Supabase Auth email flows (sign-up confirm, password recovery): the built-in
  email service is capped at ~2 messages/hour **project-wide** across all auth
  emails. Testing sign-up + reset in one sitting exhausts it and `/recover`
  starts returning `429: email rate limit exceeded`. Our server actions
  swallow that (forgot-password always redirects to `?sent=1` to avoid
  account-existence disclosure), so the UI looks fine while no mail is sent.
  Check `auth_logs` for the 429. Fix: configure custom SMTP (Auth → Emails →
  SMTP Settings), then the cap is self-managed under Auth → Rate Limits.
- A `redirectTo` / `emailRedirectTo` that is not an **exact** match in
  Authentication → URL Configuration → Redirect URLs is silently replaced with
  the Site URL — the email link then never reaches `/auth/callback`. Keep the
  passed value query-string-free and carry `next` in the email template
  (`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=…&next=…`). Email links
  use the stateless `token_hash` + `verifyOtp` path so they work cross-device;
  the PKCE `code` path needs a code-verifier cookie and only works same-browser.
- Migrations: apply with `npm run db:push` only. Applying via the Supabase MCP
  `apply_migration` or the dashboard SQL editor stamps a *new* version
  timestamp (not the file's), so the ledger row's version stops matching the
  `supabase/migrations/*.sql` filename. Once that happens `supabase db push`
  re-runs every mismatched migration and fails on the first `create type` /
  `create table`. Sept 2026: 4 merged migrations (`job_offer_expiration`,
  `application_notes`, `subscriptions`, `ai_usage`) were silently never
  applied to the linked dev DB because `db push` had been broken this way for
  weeks. Recovery: `supabase migration repair --linked --status reverted <mcp
  versions> --status applied <file versions>`, then `db push`. Check drift
  anytime with `npm run db:status`.

---

# AI Development Preferences

## Code Generation

When generating code:

Prefer:

- complete TypeScript types
- small focused components
- reusable utilities
- clear naming
- predictable data flow

Avoid:

- unnecessary comments
- over-engineering
- premature optimization
- creating generic abstractions too early

---

# Architecture Reminders

Current architecture:

Feature Slice Architecture

Business logic location:

features/

Reusable UI:

shared/components/

Server state:

React Query

Client state:

Zustand

Forms:

React Hook Form + Zod

---

# Component Rules

Before creating component ask:

1. Does similar component already exist?
2. Is this reusable?
3. Should it live in shared or feature?

Avoid:

- components above 200-300 lines
- components with many boolean props
- mixing API calls with UI rendering

Prefer:

Composition:

```tsx
<Card>
  <Card.Header />
  <Card.Content />
</Card>
```
