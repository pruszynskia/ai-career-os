import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // pdf-parse/pdfjs-dist load a separate pdf.worker.mjs at runtime. Bundling
  // them breaks that worker's path resolution ("Setting up fake worker
  // failed"), so keep them external and require()d from node_modules.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
};

export default nextConfig;
