import type { NextConfig } from 'next';

// The Content-Security-Policy is set per-request in src/proxy.ts so production
// can bind scripts to a fresh nonce instead of `'unsafe-inline'`. The static
// headers below apply to every response, including the asset paths the
// middleware matcher skips.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

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
