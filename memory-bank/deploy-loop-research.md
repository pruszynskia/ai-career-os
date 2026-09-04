# Deploy loop — research findings

Deep-research pass behind the autonomous deployment loop (`/deploy-cycle`).
Eleven findings, each with the design change it forced. Kept in the repo so the
loop's non-obvious choices don't read as arbitrary. See `ADR-015` in
`decisions.md` for the recorded decisions and `.claude/commands/deploy-cycle.md`
for the mechanism.

**F1 — LLM self-review is not a safety mechanism.** Self-review misses ~31.7%
of semantic drift; self-bias amplifies across iterative self-refinement.
→ The reviewer (`deploy-review`) is a **different model on a fresh context
seeing only the diff + the task spec** — never the implementer's rationale.
Opus-reviews-Sonnet is a safety property, not a cost choice. Deterministic
checks carry the gate. "Needed 2 fix rounds" → **escalate to human**, not merge.

**F2 — merge isn't the irreversible step here; production exposure is.** Merge
to `main` auto-deploys prod via Vercel. Staged production (disable *Auto-assign
Custom Production Domains*) was proposed and **Andrzej declined** — prod keeps
auto-deploying on merge. Compensating controls, all in the plan: `pr-only`
default (F10), platform-required checks (F4), widened path/size guard (F6), and
a **post-merge production-deploy check** — after `sync`, if the prod deployment
for the merge commit didn't succeed, the loop stops instead of starting the
next task. Hobby plan → Instant Rollback only reaches the immediately previous
deployment.

**F3 — hard limits live in the control plane, not the prompt.** Model execution
as a state machine; validate agent output against a schema before acting;
enforce budgets and iteration caps deterministically; gate irreversible actions
separately; keep an audit trail.
→ Merge gate + fix-round cap moved **out of the prompt** into
`scripts/merge-gate.sh` (exit non-zero = no merge) and state-file counters.
Every transition appended to `.claude/deploy-loop-ledger.jsonl`.

**F4 — branch protection + `gh pr merge --auto` moves the gate to the platform
and deletes our polling code.** Required status checks on `main` → GitHub
refuses a red merge and merges automatically on green.
→ Enable branch protection requiring `build`, then
`gh pr merge --auto --merge --delete-branch`. The `wait` phase collapses to an
occasional `gh pr view` poll. A bug in our own logic can no longer merge a red PR.

**F5 — runaway loops are a real, expensive failure mode** ($47k retry loop,
$30k agent loop on record). Mitigation is layered caps.
→ State-file caps checked every tick: `max_ticks_per_task` (20),
`max_tasks_per_run` (5), `consecutive_failures` (3), `deadline` (wall clock).
Any trip → `blocked`, loop stops.

**F6 — path guards beat a single-file guard.** Standard practice: migrations
immutable once committed, lockfiles generated not edited, secrets paths blocked,
plus a diff-size threshold.
→ Guard list: `package.json`, `package-lock.json`, `supabase/migrations/**`,
`.github/workflows/**`, `vercel.json`, `.env*`, `src/proxy.ts`,
`src/shared/auth/**`; plus >15 files or >400 changed lines. Any hit → human
merge. Enforced in `merge-gate.sh`.

**F7 — completion is judged against a rubric written before the task, from
independent evidence.**
→ Every task in `backlog/mvp.yaml` already has an `acceptance:` list, mostly
mechanically checkable. Passed to `deploy-review` as the rubric; CI is the
independent evidence.

**F8 — concurrent agent PRs show elevated merge-conflict rates; submit
sequentially.**
→ One task in flight; `next-task.sh` returns `INFLIGHT`. Now a deliberate
invariant, not an accident.

**F9 — orchestrator-worker costs 2–6× a single agent**, driven by context
re-encoding at every hand-off.
→ Keep the three tiers (they bound the main session across many tasks) but pay
for it: every phase agent returns a **strict JSON object**, the orchestrator
returns a **strict JSON status**, phase agents get a minimal typed payload —
never transcript.

**F10 — Ralph-loop practitioners are unanimous:** progress lives in files and
git, never the context window ("one task per run, then reset"); go attended →
unattended gradually.
→ `autonomy` config level: `pr-only` (stop after PR) → `auto-merge` (full).
Ship at `pr-only`; graduate after a few clean tasks.

**F11 — environment caveats.** The Vercel MCP connector can't see
`ai-career-os` (only `linkedin-post-schedule`). Account is on **Hobby** — no
rolling releases/canary, one-step Instant Rollback.
→ Don't design around Vercel MCP or canary. Use `gh` for checks, the `vercel`
CLI only if a promote/rollback step is ever automated.

## Net effect

Kept: three-tier orchestration, state file, sequential tasks, pinned-tier phase
agents, `next-task.sh` / `start-task.sh`.
Changed: gate logic → script + GitHub (F3/F4); guard list widened (F6);
reviewer isolated from implementer (F1); budgets + autonomy level added
(F5/F10); reports became JSON (F9).
Added: post-merge production-deploy check (F2 consequence).

## Sources

Full annotated source list in the plan:
`~/.claude/plans/goal-make-my-loop-mighty-hopcroft.md` § Sources. Groups:
orchestration & loops (Ralph loop, vercel-labs/ralph-loop-agent, agentic
design patterns), control plane & token economics (deterministic control plane,
harness-effect token economics), self-review reliability (Articulate but Wrong;
Pride and Prejudice; When Can LLMs Correct Their Own Mistakes), merge safety
(agent-PR conflict rates, deterministic merge guardrails, GitHub protected
branches / merge queue), budgets & failure modes (circuit breakers, cost
circuit breaker, SRE for autonomous agents, blast-radius gate), Vercel deploy
safety (staged production, Instant Rollback, deploying without merge queues).
