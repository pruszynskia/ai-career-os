# Monorepo Strategy

## Current state (audited 2026-07-25)

This repo is **not** a monorepo. There is no `turbo.json`, no
`pnpm-workspace.yaml`, no `"workspaces"` field in `package.json`, and no
`packages/` or `apps/` directory. It is a single Next.js app with `src/` at
the repo root, using npm as its package manager and root-level scripts
(`dev`, `build`, `lint`, `typecheck`, `test`, `format`) for everything.

## Decision: deferred

Adding npm workspaces + Turborepo was evaluated (TASK-027) and **deferred**.
See `memory-bank/decisions.md` ADR-012 for the full audit findings and
reasoning. In short: there is no second app or package consuming shared
code yet, so workspace/task-graph tooling would have nothing to orchestrate.
Scaffolding placeholder packages (`packages/typescript-config`,
`packages/eslint-config`, a design-system package, etc.) ahead of a real
consumer would be dead weight kept in sync with the root config for no
benefit — the project's YAGNI convention (`CLAUDE.md`) argues against that.

This is not a permanent "no" — it's "not yet, until one of the readiness
criteria below is met."

## Readiness criteria — when to revisit

Reopen this decision when **either** becomes true:

1. **A second app actually starts being built** — most likely a React
   Native/Expo mobile client (see "Future mobile strategy" below). This is
   the concrete trigger already anticipated in `docs/ROADMAP.md`'s
   Forward-Compatibility Notes.
2. **A second package gains a real consumer** — e.g. a design-system
   package, a domain-types package, or an API-client package that more than
   one app/service actually imports, not just a place designed to eventually
   hold code.

Do not scaffold `packages/*` in anticipation of either — wait until the
consumer exists, then introduce the workspace and the specific package(s)
it needs together.

## FSD / monorepo boundary

If and when workspaces are introduced, Feature-Sliced Design stays the
**internal architecture of the app** (`src/app`, `src/features`,
`src/entities`, `src/shared`, `src/widgets`) — it does not change or get
replaced. `packages/*` would exist purely for **cross-app reuse**: code that
more than one app/package needs, with no FSD layers of its own. `src/`
does not move into `apps/web` as part of introducing workspaces — that move
is tied specifically to the mobile app trigger (see below), not to
workspace tooling on its own.

## If/when adopted: what gets scaffolded

Recorded here so the decision doesn't need to be re-researched later — none
of this exists yet:

- Root `package.json` gains `"workspaces": ["packages/*"]` (npm workspaces —
  package manager stays npm, per this task's constraints).
- `turbo.json` with pipelines mirroring the current root scripts (`dev`,
  `build`, `lint`, `typecheck`, `test`, `format`), and those root scripts
  updated to invoke `turbo run <task>` with caching enabled.
- `packages/typescript-config` and `packages/eslint-config` — the two
  packages every future package or app would need — created first, with no
  other placeholder packages (`ui`, `design-system`, `types`, `utils`)
  scaffolded until they have a real second consumer.
- `eslint.config.mjs`'s FSD boundary rules (`import/no-restricted-paths`,
  see `ARCHITECTURE.md`'s Dependency Rules) extended to also cover the
  `packages/*` workspace.
- `.github/workflows/ci.yml` updated only if the root script invocation
  shape changes (e.g. `npm run build` becoming a `turbo run build` wrapper
  changes what CI needs to call).

## Future mobile strategy

The anticipated second app is a React Native/Expo mobile client. When that
work actually starts (not before):

1. Introduce npm workspaces + Turborepo per the section above, if not
   already done.
2. Move the existing Next.js app from repo-root `src/` into `apps/web`,
   updating every existing backlog task's `scope:` paths that reference
   `src/` accordingly (a one-time, explicit migration — not done
   speculatively by this or any earlier task).
3. Add the mobile app under `apps/mobile`.
4. Extract genuinely shared code (domain types from `src/entities`, API
   client shapes, design tokens) into `packages/*` as the mobile app needs
   them — not preemptively.

Until this trigger fires, code that would eventually move into `packages/*`
(design tokens, domain types, API-client shapes) should stay easy to lift
out of `src/shared` and `src/entities` rather than tightly coupled to
Next.js-only APIs — this is already called out in `docs/ROADMAP.md`'s
Forward-Compatibility Notes and `ARCHITECTURE.md`'s Future Extensibility
section.
