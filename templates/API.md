# API: `<Resource Name>`

## Overview

`<What this API surface manages>`

## Endpoints

### `GET /api/<resource>`

List `<resource>`.

Query params:

| Param     | Type     | Required   | Description     |
| --------- | -------- | ---------- | --------------- |
| `<param>` | `<type>` | `<yes/no>` | `<description>` |

Response:

```ts
interface <Resource>ListResponse {
  items: <Resource>[];
  total: number;
}
```

---

### `GET /api/<resource>/:id`

Fetch a single `<resource>`.

Response: `<Resource>`

Errors: `404` if not found.

---

### `POST /api/<resource>`

Create a `<resource>`.

Request body:

```ts
interface Create<Resource>Request {
  <field>: <type>;
}
```

Response: `201` + created `<Resource>`.

Validation: `<Zod schema name / rules>`

---

## Error Format

```ts
interface ApiError {
  code: string;
  message: string;
}
```

## Auth

`<Which endpoints require authentication, and how it's enforced>`
