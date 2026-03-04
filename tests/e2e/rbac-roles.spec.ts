import { expect, test } from '@playwright/test';

test('viewer cannot access roles page', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('viewer@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/users/);

  await page.goto('/roles');
  await expect(page).toHaveURL(/\/users/);
});

test('manager sees roles page in read-only mode', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('manager@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.goto('/roles');

  await expect(page).toHaveURL(/\/roles/);
  await expect(page.getByText('Read-only access: Manager can inspect policies')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save policy' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Toggle all' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Apply import to draft' })).toBeDisabled();
});
