# Product Documentation

## Product Name

AI Career OS

---

# Product Vision

A single-user tool that helps the owner get more recruiter attention on
LinkedIn and never lose track of a job application.

Every job search generates scattered artifacts — offers across portals, CVs
tailored ad hoc, one-off recruiter messages, inconsistent LinkedIn posting.
AI Career OS centralizes all of it and uses AI to make each artifact better:
matched, tailored, and consistent.

---

# Product Mission

Help `the owner (job-seeking professional)` land more interviews by:

- `keeping a consistent, AI-assisted LinkedIn presence`
- `tailoring CV and recruiter messages to each job offer automatically`
- `tracking every application, its status, and its interview pipeline without duplicates`

---

# Target Users

## Primary Users

### The owner — a single job-seeking professional

Especially:

- someone applying to multiple roles across multiple portals at once
- someone trying to build LinkedIn visibility alongside active applications

Typical users:

- the app owner (single-user tool, not multi-tenant)

---

## Secondary Users

None. This is a personal tool built for one user; there is no team or
multi-tenant use case in the MVP.

---

# User Problems

Current job search tooling has several problems:

## Scattered application tracking

Offers, sent CVs, and recruiter messages live across email, job portals, and
memory. When an interview invite arrives, reconstructing "what did I send
this company" is manual and error-prone.

---

## Inconsistent CV tailoring

A CV tailored for one offer is forgotten by the next. There's no persistent
"master" profile that every tailored version derives from, and no visibility
into how well a CV actually matches a given offer.

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

# Out of Scope for MVP

The following features are intentionally postponed:

## Direct LinkedIn publishing via the LinkedIn API

Reason:

Requires LinkedIn OAuth and app approval — disproportionate effort for a
single-user MVP. Posts are generated in-app and copy-pasted manually instead.

---

## Multi-user / OAuth authentication

Reason:

This is a personal tool for one owner. A single seeded account is sufficient;
multi-tenant auth adds data-isolation complexity with no current user to serve.

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
