import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

setup('authenticate via /sign-in and persist session', async ({ page }) => {
  const email = process.env.AUTH_OWNER_EMAIL;
  const password = process.env.AUTH_OWNER_PASSWORD;
  setup.skip(
    !email || !password,
    'AUTH_OWNER_EMAIL / AUTH_OWNER_PASSWORD not set',
  );

  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // server action -> 303 -> "/" -> "/dashboard" (or "/onboarding" if not onboarded)
  await page.waitForURL(/\/(dashboard|onboarding)(\?.*)?$/);

  // prove we are actually authenticated, not bounced back to /sign-in
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page).not.toHaveURL(/\/sign-in/);

  await page.context().storageState({ path: AUTH_FILE });
});
