// Thrown on the 402 a Pro-gated route returns - shape mirrors EntitlementError's
// JSON body (src/shared/billing/errors.ts), so the upgrade prompt always has
// somewhere to link. Shared here (not per-feature) since every requestJson
// caller can hit a gated route.
export class EntitlementRequiredError extends Error {
  constructor(
    message: string,
    public readonly upgradePath: string,
  ) {
    super(message);
    this.name = 'EntitlementRequiredError';
  }
}

type JsonErrorBody = { message?: string; upgradePath?: string };

// Shared fetch+parse for every client-side API call (ERR-2): a network
// failure (offline, DNS) throws a readable message instead of the raw
// TypeError "Failed to fetch", a non-JSON or empty error body still throws
// fallbackMessage instead of crashing on .json(), and a 402 always becomes
// an EntitlementRequiredError so callers can link to the upgrade page.
export async function requestJson<T>(
  input: string,
  init: RequestInit | undefined,
  fallbackMessage: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }

  const body = (await response.json().catch(() => null)) as
    (T & JsonErrorBody) | null;

  if (!response.ok) {
    if (response.status === 402) {
      throw new EntitlementRequiredError(
        body?.message ?? 'This feature requires the Pro plan.',
        body?.upgradePath ?? '/pricing',
      );
    }
    throw new Error(body?.message ?? fallbackMessage);
  }

  return body as T;
}
