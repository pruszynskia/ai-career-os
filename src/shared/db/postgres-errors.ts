// Postgres error code for a malformed input value (e.g. `eq('id', 'abc')`
// against a uuid column) - PostgREST/supabase-js surface it as a plain
// `{ code: '22P02' }` object, not a typed exception. A lookup by a
// not-a-uuid id should read as "not found," not crash the route (PIPE-8).
const INVALID_TEXT_REPRESENTATION = '22P02';

export function isInvalidInputSyntaxError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === INVALID_TEXT_REPRESENTATION
  );
}
