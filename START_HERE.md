# Start Here

This is a starter kit for running a new software project with an AI-first
workflow (Claude Code driving a YAML backlog → GitHub Issues → one-task-at-a-time
implementation). It is not a runnable app — it's scaffolding you copy into a
new repository.

## 1. Copy the scaffolding into your new repo root

```
new-project/
├── CLAUDE.md                  ← from starter-kit/CLAUDE.md
├── AI_RULES.md                ← from starter-kit/AI_RULES.md
├── ARCHITECTURE.md            ← from starter-kit/ARCHITECTURE.md
├── docs/                      ← from starter-kit/docs/
├── memory-bank/               ← from starter-kit/memory-bank/
├── backlog/mvp.yaml           ← from starter-kit/backlog/backlog.template.yaml (rename)
├── .claude/                   ← from starter-kit/claude/
├── .github/                   ← from starter-kit/github/
├── scripts/                   ← from starter-kit/scripts/
└── (root configs)             ← from starter-kit/config/ (see below)
```

`starter-kit/config/*` are staged with their real dotfile names already
(`.gitignore`, `.editorconfig`, `.prettierrc`, ...); copy them straight into
your new repo root alongside a `package.json` you create for your actual
stack (or reuse `config/package.json` if you're happy with the Next.js +
TypeScript + Tailwind + shadcn default this kit assumes — see `docs/TECH_STACK.md`).

`config/package.json` references Husky + commitlint + lint-staged but the
`.husky/` hook scripts aren't included here (they're two one-liners, not
config) — after `npm install`, run `npx husky init` once and point
`.husky/commit-msg` at `npx commitlint --edit $1` and `.husky/pre-commit` at
`npx lint-staged`.

There is no `.vscode/` here — the source project this kit was extracted from
didn't have one either. Add your own editor settings if you want them.

## 2. Fill in the placeholders

Search for these across the copied files and replace them:

- `<Project Name>` — human-readable name (CLAUDE.md, docs/PRODUCT.md, backlog)
- `<project-name>` — kebab-case slug (package.json, .env.example)
- `<Owner>` / `<Repository>` — GitHub org/repo (backlog.template.yaml → mvp.yaml)
- `<Stack>` — only where TECH_STACK.md asks; the concrete configs already
  assume Next.js/TypeScript/Tailwind — replace the whole `config/` folder if
  you're targeting a different stack

Write real content into `docs/PRODUCT.md` (vision, users, MVP scope) and
`docs/TECH_STACK.md` (your actual stack, even if it matches the default).

## 3. Seed the backlog

Rename `backlog/backlog.template.yaml` → `backlog/mvp.yaml`. Replace the
single example task with your real tasks, following `templates/TASK.md`
for the field shape. Keep `id`s sequential (`TASK-001`, `TASK-002`, ...) and
set `depends_on` accordingly.

## 4. Sync to GitHub Issues

```
gh auth login          # once
./scripts/sync-backlog.sh push   # YAML → GitHub Issues (creates or updates)
./scripts/sync-backlog.sh pull   # GitHub Issue state → YAML status
```

Requires the `gh` and `yq` CLIs.

## 5. Implement task by task

```
/implement-task TASK-001
/review-task TASK-001
/fix-task TASK-001
```

Commit, then move to the next task. Never skip ahead — see
`AI_RULES.md` and `CLAUDE.md` for the full rule set Claude follows.

## 6. Keep memory-bank current

After each task, update `memory-bank/current-task.md` (what shipped) and,
when architecture changes, `memory-bank/decisions.md` (a new ADR) and
`memory-bank/project-context.md` (current state). See `docs/README.md` for
which doc to touch when.

See `WORKFLOW.md` for how these pieces fit into the full
idea → planning → deploy → iterate loop, and `claude/commands/COMMANDS.md`
for every available Claude command.
