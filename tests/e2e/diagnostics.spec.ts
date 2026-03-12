import { expect, test } from '@playwright/test';

test('dev diagnostics panel is available and can be expanded', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/users/);

  const toggle = page.getByRole('button', { name: /Diagnostics/ });
  await expect(toggle).toBeVisible();
  await toggle.click();

  await expect(page.getByText('mode:')).toBeVisible();
  await expect(page.getByLabel('Log category')).toBeVisible();
});
