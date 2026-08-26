// Builds a PostgREST .or() filter string for a title/company substring
// search. Values are double-quoted so a literal comma in the query can't be
// read as the .or() condition separator; backslashes and quotes inside the
// value are escaped so the quoting itself can't be broken out of.
export function buildSearchOrFilter(query: string): string {
  const escaped = query.replace(/[\\"]/g, '\\$&');
  const like = `%${escaped}%`;
  return `title.ilike."${like}",company.ilike."${like}"`;
}
