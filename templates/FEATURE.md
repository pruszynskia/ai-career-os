# Feature: `<Feature Name>`

## Summary

`<One paragraph: what this feature does and why it exists>`

## User Story

As a `<user type>`, I want to `<action>`, so that `<outcome>`.

## Scope

Included:

- `<capability>`

Out of scope:

- `<explicitly deferred capability>`

## Architecture

Layer placement: `features/<feature-name>/`

```
features/<feature-name>/
├── components/
├── hooks/
├── services/
├── types.ts
└── utils.ts
```

Dependencies on other layers: `<shared components/entities used>`

## Data Flow

`<UI Component → hook → service → API → backend, or the relevant path>`

## Acceptance Criteria

- `<checkable condition>`
- `<checkable condition>`

## Edge Cases

- `<empty state>`
- `<error state>`
- `<loading state>`

## Related

- Backlog tasks: `<TASK-IDs>`
- ADRs: `<ADR-IDs, if any architectural decision was made for this feature>`
