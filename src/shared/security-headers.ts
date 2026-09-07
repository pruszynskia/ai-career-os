// Static security response headers, applied in two places because each covers
// responses the other misses:
//   - next.config.ts `headers()` — every response Next renders for a route,
//     including the asset paths the proxy matcher skips.
//   - src/proxy.ts `finalize()` — responses the proxy returns itself (the 429
//     and the /sign-in gate redirect), which `headers()` never touches.
// The per-request Content-Security-Policy is built in src/proxy.ts, not here,
// because it carries a per-request nonce.
export const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['X-DNS-Prefetch-Control', 'off'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
];
