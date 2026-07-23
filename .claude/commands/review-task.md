# Review Task Command

Review implementation of a `<Project Name>` task.

Input:

TASK-ID

## Steps

Read:

- backlog/mvp.yaml
- CLAUDE.md
- docs/CODING_STANDARDS.md

Review changed files.

Check:

## Architecture

- Project's stated architecture pattern followed (see ARCHITECTURE.md)
- Proper separation of concerns
- No unnecessary abstractions

## Language / Framework

- Components/functions are small
- Hooks/utilities used correctly
- No unnecessary re-renders or recomputation
- Server-state library (if any) used correctly

## Types

- No `any` (or language equivalent of untyped escape hatches)
- Proper interfaces/types
- Good error handling

## Quality

Find:

- bugs
- missing edge cases
- security issues
- performance problems

Output:

1. Issues found
2. Severity
3. Suggested fixes
4. Approval status
