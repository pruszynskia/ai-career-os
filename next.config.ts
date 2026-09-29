import type { NextConfig } from 'next';

import { SECURITY_HEADERS } from './src/shared/security-headers';

// The Content-Security-Policy is set per-request in src/proxy.ts so production
// can bind scripts to a fresh nonce instead of `'unsafe-inline'`. The static
// headers below apply to every response Next renders, including the asset paths
// the proxy matcher skips; src/proxy.ts applies the same set to the responses
// it returns itself (the 429 and the /sign-in redirect), which `headers()`
// does not reach.
const securityHeaders = SECURITY_HEADERS.map(([key, value]) => ({
  key,
  value,
}));

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Every route under (app) is force-dynamic, and Next 16 defaults dynamic
  // pages' client router cache to staleTime 0 - clicking between sidebar
  // cards re-fetched the entire tree (including the shared layout's
  // notifications/stage-counts/plan/usage queries) on every single
  // navigation, even to a page just visited seconds ago. 30s keeps
  // navigation snappy for a single-user tool while still refreshing well
  // within any session.
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  // pdf-parse/pdfjs-dist load a separate pdf.worker.mjs at runtime. Bundling
  // them breaks that worker's path resolution ("Setting up fake worker
  // failed"), so keep them external and require()d from node_modules.
  // @napi-rs/canvas is pdf-parse's native canvas backend (see
  // extract-cv-text.ts) — same bundling concern applies.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
