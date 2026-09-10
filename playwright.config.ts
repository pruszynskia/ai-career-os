import { defineConfig } from '@playwright/test';

// creds + baseURL overrides live in .env.local (git-ignored)
try {
  process.loadEnvFile('.env.local');
} catch {
  // fine in CI where the file doesn't exist
}

export default defineConfig({
  testDir: './tests/smoke/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts$/,
    },
    {
      name: 'authenticated',
      testIgnore: /.*\.setup\.ts$/,
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
