import { readdirSync } from 'node:fs';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';

// Feature slices are isolated from each other automatically, so a new slice
// under src/features/* never needs this file edited to stay enforced.
const featureNames = readdirSync(new URL('./src/features/', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const featureIsolationZones = featureNames.map((name) => ({
  target: `./src/features/${name}/**/*`,
  from: featureNames
    .filter((other) => other !== name)
    .map((other) => `./src/features/${other}/**/*`),
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared/**/*',
              from: ['./src/features/**/*', './src/widgets/**/*', './src/app/**/*'],
            },
            {
              target: './src/entities/**/*',
              from: ['./src/features/**/*', './src/widgets/**/*', './src/app/**/*'],
            },
            ...featureIsolationZones,
            {
              target: './src/features/**/*',
              from: ['./src/widgets/**/*', './src/app/**/*'],
            },
            { target: './src/widgets/**/*', from: ['./src/app/**/*'] },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
