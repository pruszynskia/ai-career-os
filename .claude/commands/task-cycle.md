# Task Cycle Command

Chains `/implement-task` → `/review-task` → `/fix-task` (capped) →
`/commit-and-push` for one task, driven by the `staged-execution` skill so
model/effort switches and the next-task handoff are explicit stop points
instead of silent continuation.

Input:

TASK-ID (required)

## Step 0 — Phase table

Invoke the `staged-execution` skill before doing anything else. Feed it this
default table (staged-execution may adjust it per its own tiering rules —
this is guidance, not an override):

| Phase | Command | Model | Effort | Why |
|---|---|---|---|---|
| Implement | `/implement-task TASK-ID` | Sonnet | medium–high | routine execution / single- or multi-file edits |
| Review | `/review-task TASK-ID` | Opus | high | catching architecture/logic/security issues benefits from the strongest model |
| Fix (conditional) | `/fix-task TASK-ID` | Sonnet | medium | targeted fixes from review findings |
| Commit | `/commit-and-push` | Haiku | low | mechanical: stage, format message, push |

Each step below is also a model/effort boundary in this table, so
staged-execution's hard-stop rule applies naturally between them — wait for
"ready"/"continue" at every one.

## Step 1 — Implement

Run `/implement-task TASK-ID` in full.

## Step 2 — Review

Run `/review-task TASK-ID`. Branch on its Approval status:

- Approved → go to Step 4.
- Not approved → go to Step 3, round 1.

## Step 3 — Fix / re-review loop (max 2 rounds)

Run `/fix-task TASK-ID`, then re-run `/review-task TASK-ID`.

- Approved → go to Step 4.
- Not approved and round < 2 → repeat this step (round 2).
- Not approved after round 2 → stop. Summarize the outstanding review
  findings and hand off to the user instead of looping further.

## Step 4 — Commit

Run `/commit-and-push`.

## Step 5 — Handoff

Stop here. Do not continue to another TASK-ID in this conversation (one task
per session — every later turn re-sends everything before it). Output:

1. One-line summary of what got done
2. Commit result
3. Instruction to open a new conversation before running `/task-cycle` on
   the next TASK-ID
