# Database: `<Domain Area>`

## Overview

`<What this part of the schema models>`

## Entities

### `<Entity>`

| Field     | Type     | Constraints                 | Notes     |
| --------- | -------- | --------------------------- | --------- |
| `id`      | `uuid`   | primary key                 |           |
| `<field>` | `<type>` | `<required/unique/default>` | `<notes>` |

## Relations

- `<Entity A>` `<1:1 / 1:N / N:M>` `<Entity B>` — `<why>`

## Migration Notes

`<Anything non-obvious about how this migration was applied — backfills,
default values chosen for existing rows, etc.>`

## Access Pattern

`<Which layer/service owns reads and writes for this entity — should match
the "database access isolated from UI" rule in ARCHITECTURE.md>`
