import type { NextConfig } from 'next';

import { SECURITY_HEADERS } from './src/shared/security-headers';

// The Content-Security-Policy is set per-request in src/proxy.ts so production
// can bind scripts to a fresh nonce instead of `'unsafe-inline'`. The static
// headers below apply to every response Next renders, including the asset paths
// the proxy matcher skips; src/proxy.ts applies the same set to the responses
// it returns itself (the 429 and the /sign-in redirect), which `headers()`
// does not reach.
const securityHeaders = SECURITY_HEADERS.map(([key, value]) => ({ key, value }));

const nextConfig: NextConfig = {
  reactCompiler: true,
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
