import { z } from 'zod';

// Non-UUID ids reach Postgres as 22P02 and surface as 500s; route handlers
// check this first and answer 404 instead.
const uuidSchema = z.uuid();

export function isUuid(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}
