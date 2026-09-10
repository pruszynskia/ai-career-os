import { expect, test } from '@playwright/test';

// stays a logged-out test even though the 'authenticated' project would
// otherwise seed it with the saved session
test.use({ storageState: { cookies: [], origins: [] } });

test('sign-in page renders the credentials form', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
