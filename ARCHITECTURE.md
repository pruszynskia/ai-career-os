# Application Architecture

> Stack references below (Next.js / Tailwind / shadcn / Framer Motion) are this
> starter kit's documented default. Swap them for `<Stack>` of your choice —
> keep the sections, replace the names.

## Architecture Pattern

Feature Slice Architecture

## Folder Structure

src

app

- routing
- layouts
- providers

features

- business functionality

entities

- domain models

shared

- reusable infrastructure

widgets

- complex reusable UI blocks

Example:

features/`<feature-name>`/

components/
hooks/
services/
types.ts
utils.ts

---

# Data Flow

UI Component

↓

React Query

↓

API Layer

↓

Backend

Client state:

Zustand

Server state:

React Query

---

# State Rules

Server data:

React Query

UI state:

Zustand

Forms:

React Hook Form + Zod

---

# Component Hierarchy

Page

↓

Widget

↓

Feature Component

↓

Shared Component

---

# Dependency Rules

Allowed:

feature → shared

feature → entity

widget → feature

Forbidden:

shared → feature

entity → feature

---

# Design System

UI:

shadcn/ui

Styling:

Tailwind CSS

Animations:

Framer Motion

Icons:

Lucide React

---

# Performance

Default:

- Server Components
- lazy loading
- optimized images
- minimal client JS

Monitor:

- LCP
- CLS
- TBT
