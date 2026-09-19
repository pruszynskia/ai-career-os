# Product Documentation

## Product Name

AI Career OS

---

# Product Vision

A tool that helps a job-seeking professional get more recruiter attention on
LinkedIn and never lose track of a job application. Anyone can self-serve
register an account; each account's data stays isolated (RLS-enforced).

Every job search generates scattered artifacts — offers across portals, CVs
tailored ad hoc, one-off recruiter messages, inconsistent LinkedIn posting.
AI Career OS centralizes all of it and uses AI to make each artifact better:
matched, tailored, and consistent.

---

# Product Mission

One verified record of what `the owner (job-seeking professional)` has
actually done. Every tailored CV, recruiter message and LinkedIn post AI
Career OS generates comes only from that record, with every claim traceable
back to it — and effort is spent only where a reply is actually likely.

---

# Target Users

## Primary Users

### A job-seeking professional

Especially:

- someone applying to multiple roles across multiple portals at once
- someone trying to build LinkedIn visibility alongside active applications

Typical users:

- an individual job seeker with their own self-serve account (per-account
  data isolation, not shared workspaces)

---

## Secondary Users

None. Each account is a single person's workspace; there are no teams,
shared workspaces, or organisations in the MVP.

---

# User Problems

Current job search tooling has several problems:

## Scattered application tracking

Offers, sent CVs, and recruiter messages live across email, job portals, and
memory. When an interview invite arrives, reconstructing "what did I send
this company" is manual and error-prone.

---

## Ungrounded AI output and undifferentiated effort

A CV or recruiter message an AI generates can claim things the user never
actually did, with no way to check a claim against what is true. And every
offer gets the same effort regardless of fit — there's no signal for which
ones are actually worth tailoring, messaging and following up on, and which
are not.

---

## Inconsistent LinkedIn presence

Recruiter attention rewards consistent posting, but planning and writing
posts competes with the actual job search. Without a lightweight
generate-and-schedule flow, posting lapses.

---

# Product Solution

AI Career OS provides:

1. A structured profile built once from an uploaded CV, reused as the basis for every tailored CV and match calculation.
2. Per-offer AI output: a match percentage, a tailored CV, and a recruiter message — generated from a pasted offer link or raw text.
3. An application pipeline (applied → HR → technical → team → CEO/manager) searchable by company, with duplicate-offer detection across portals.
4. AI-generated LinkedIn posts, planned and scheduled using the user's own posting history as context.

---

# Core User Journey

## Step 1

Upload a CV (PDF/DOCX); AI Career OS parses it into a structured profile and stores it as the master CV.

## Step 2

Optionally let AI optimize the master CV.

## Step 3

Paste a job offer link (or raw text if the page can't be fetched); AI extracts company, title, and description.

## Step 4

Open the offer to see the match percentage against the profile, generate a tailored CV, and generate a recruiter message.

## Step 5

Submit the application; it's tracked with the offer, sent CV, and message. Advance its status as interviews progress.

## Step 6

Search by company at any point (e.g. when an interview invite arrives) to instantly pull up the offer, CV sent, message sent, and current status. Meanwhile, generate and schedule LinkedIn posts from the dashboard to stay visible.

---

# MVP Scope

## Included Features

### Profile & CV

Users can:

- upload a CV (PDF/DOCX) and have it parsed into a structured profile
- optimize the master CV with AI and download the result

---

### Job offer ingestion & matching

Users can:

- add an offer by pasting a URL (with raw-text paste fallback when a page can't be fetched)
- see a duplicate warning when an offer matches one already saved
- see an AI match percentage against their profile
- generate and download an offer-tailored CV
- generate a recruiter message for the offer
- favorite offers

---

### Application tracking

Users can:

- create an application from an offer, capturing the sent CV and message
- move an application through the interview pipeline (applied, HR, technical, team, CEO/manager)
- search by company name to retrieve the full bundle (offer, CV, message, status)

---

### Warm contacts

A first-degree LinkedIn connection is both the highest-response and the
lowest-risk outreach channel, because the platform treats a message to
someone already connected very differently from a cold request to a
stranger. Users can:

- import their own LinkedIn "Connections.csv" data export and have each
  contact classified by job title (non-IT, generalist, IT recruiter,
  decision-maker) with a deterministic keyword matcher - no AI call, and
  never a scrape or a LinkedIn API integration
- add a contact by hand, with no import required
- see who they already know at an offer's hiring company, on that offer's
  detail page, and select a contact to address an outreach draft to
- get a non-blocking warning when another contact at the same company was
  already messaged within the last 30 days

---

### LinkedIn posts

Users can:

- generate LinkedIn post drafts from their profile and a topic
- copy a draft to paste into LinkedIn manually (no LinkedIn API integration)
- schedule posts with a date and let AI plan the next posts using already-sent posts as context

---

### Dashboard

Users can:

- see the next scheduled post and its date
- see upcoming interviews derived from application status
- see favorite offers

---

# Pricing & Packaging

AI Career OS is sold as a subscription with two plans. This section is the
single source of truth for tier names, limits, the capability split and
prices: TASK-056's Stripe prices, TASK-058/TASK-088's entitlement gate and
TASK-059's usage quota all encode what is written here, and
`src/features/marketing/components/pricing-table.tsx` and the marketing
landing page both render their feature lists from the one exported `PLANS`
constant in `src/shared/billing/plans.ts` — neither hand-writes a duplicate.

## Plans

| Plan | Price | AI actions / month | Job offers | Applications |
|---|---|---|---|---|
| **Free** | €0 / month | 10 | unlimited | unlimited |
| **Pro** | €12 / month | 500 | unlimited | unlimited |

## What each plan includes

Free is a complete, working product, not a demo: the full application
tracker (master profile and CV, job-offer ingestion, duplicate-offer
detection, the interview pipeline and company search), the headline match
percentage on every offer, tailored-CV generation and LinkedIn posts — all
within the plan's monthly AI-action allowance.

Pro adds the judgment layer Stage 3 built on top of that, enforced by
`requirePlan(ownerId, 'pro')` (`src/shared/billing/entitlements.ts`):

- the full **fit report** — criteria breakdown, callback probability and
  missing skills (the match percentage itself stays on Free)
- the **tailoring report** — keyword coverage and evidence trace on every
  tailored CV
- the **outreach studio** — channel-specific recruiter-message drafts
  (including follow-ups) and ban-list validation (the 30-day interlock
  warning itself is free - it's shown on every offer, gated or not)
- the **outcome readout** — response rates by fit band, callback band and
  channel

A Free account that reaches one of these sees an inline upgrade prompt in
place of the capability, never a blank or missing surface. A gated API route
returns a 402 (`EntitlementError` / `toEntitlementErrorResponse`,
`src/shared/billing/errors.ts`) carrying the plan, the limit and the upgrade
path — the same shape TASK-059's AI-action quota already returns when the
allowance runs out.

## What counts as one AI action

Any single AI generation the user triggers:

- an offer match-score calculation
- a tailored CV generation
- a recruiter-message generation (Pro only, see above)
- a LinkedIn post draft (including AI-planned next posts)

The allowance resets at the start of each calendar month (TASK-059). When it
is exhausted, AI generations are blocked with an upgrade prompt while all
non-AI features keep working.

## Trial model

There is no time-limited trial. The Free plan is the trial: every new account
starts on Free with no card required, and upgrades to Pro from the pricing
page or account settings.

---

# Out of Scope for MVP

The following features are intentionally postponed:

## Direct LinkedIn publishing via the LinkedIn API

Reason:

Requires LinkedIn OAuth and app approval — disproportionate effort for a
single-user MVP. Posts are generated in-app and copy-pasted manually instead.

---

## OAuth sign-in providers (Google, LinkedIn, GitHub)

Reason:

Self-serve email/password registration, email verification and password reset
now ship (TASK-053). Social-login providers are a later addition (TASK-054)
and not required for account creation.

---

## Semantic/embedding-based duplicate detection

Reason:

Normalized company+title, canonical URL, and content-hash matching covers the
realistic cross-portal duplicate case without the cost of a vector store.

---

# Product Principles

## Single source of truth per application

Every application always links back to exactly one offer, one sent CV
version, and one recruiter message — no ambiguity about what was sent where.

Avoid:

- letting CVs or messages exist detached from an application

---

## AI assists, the user decides

Match scores, tailored CVs, and recruiter messages are AI-generated starting
points the user reviews and downloads/copies — not auto-submitted anywhere.

---

## Simplicity First

MVP should avoid unnecessary complexity.

Prefer:

- fewer features
- better execution
- clear user value

---

# Success Metrics

## User Metrics

Activation:

- first CV uploaded and parsed into a profile

Engagement:

- offers added and applications tracked per week

Retention:

- returning to search by company when an interview invite arrives

---

## Product Quality Metrics

Measure:

- accuracy of AI-extracted offer fields (company/title/description)
- duplicate offers correctly flagged

---

# Future Roadmap

For the staged, task-level execution plan (Stage 0 stabilization through the
subscriptions milestone), see `docs/ROADMAP.md`. Phase 2/3 below are the
longer-horizon feature ideas that plan draws from.

## Phase 2

Possible features:

- direct LinkedIn API publishing
- browser extension for one-click offer capture
- multi-user support with full OAuth (Google, LinkedIn, GitHub, Email) — the schema and auth module are already structured for this additively (ADR-005)
- automations (e.g. scheduled offer re-checks, reminder notifications)

---

## Phase 3

Possible features:

- semantic duplicate detection across offers
- recruiter response tracking / analytics on post engagement

---

# Product Constraints

The MVP must:

- be simple enough for a single developer to build and maintain
- demonstrate production engineering quality
- support future expansion without a rewrite

---

# AI Development Rules

When creating new features:

Always verify:

1. Does this solve a real user problem?
2. Is this part of MVP scope?
3. Does it serve the product mission above?
4. Is the complexity justified?

Avoid adding features only because they are technically interesting.
