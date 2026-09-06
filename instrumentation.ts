// Next.js instrumentation hooks.
//
// `register` runs once when the server process starts (not during `next
// build`) — the place to fail fast on a broken environment.
//
// `onRequestError` fires for every unhandled server-side error. We forward a
// small summary to a monitoring webhook so production breakage shows up
// somewhere other than a customer email. console.error diagnostics stay as
// they are.

export async function register(): Promise<void> {
  const { getClientEnv } = await import('@/shared/env');
  // Throws a readable, variable-naming message if a required public var is
  // missing — refusing to start rather than failing later inside a request.
  getClientEnv();
}

type ErroredRequest = {
  path?: string;
  method?: string;
};

export async function onRequestError(
  error: unknown,
  request: ErroredRequest,
): Promise<void> {
  const webhookUrl = process.env.ERROR_MONITORING_WEBHOOK_URL;
  if (!webhookUrl) return;

  const err = error instanceof Error ? error : new Error(String(error));

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Only the error and the route — never request bodies, prompt text,
      // CV content or other personal data.
      body: JSON.stringify({
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: request.path,
        method: request.method,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Reporting must never throw into the request lifecycle.
  }
}
