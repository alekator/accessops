import { expect, test } from '@playwright/test';

test('login and view users list', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('admin@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/users/);
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('Total:')).toBeVisible();
});
