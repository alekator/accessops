import { expect, test } from '@playwright/test';

test('ui state catalog exposes core visual states', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/users/);

  await page.goto('/roles?view=states');
  await expect(page).toHaveURL(/\/roles\?view=states/);

  await expect(page.getByRole('heading', { name: 'Visual State Coverage' })).toBeVisible();
  await expect(page.getByText('Users table: empty state')).toBeVisible();
  await expect(page.getByText('Users table: loading and error state')).toBeVisible();
  await expect(page.getByText('Roles: read-only and proposed revision state')).toBeVisible();
  await expect(page.getByText('Audit item: collapsed/expanded details')).toBeVisible();
  await expect(page.getByText('Connectivity and destructive confirmation states')).toBeVisible();
});
