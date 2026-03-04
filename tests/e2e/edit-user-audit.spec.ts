import { expect, test } from '@playwright/test';

test('edit user and find audit log entry', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('admin@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/users/);

  await page.goto('/users/usr_001/edit');
  await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();

  const updatedName = `E2E User ${Date.now()}`;
  await page.getByLabel('Name').fill(updatedName);
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page).toHaveURL(/\/users\/usr_001$/);
  await expect(page.getByText(updatedName)).toBeVisible();

  await page.goto('/audit');
  await page.getByLabel('User ID filter').fill('usr_001');
  await page.getByLabel('Action filter').selectOption('USER_UPDATED');

  const filteredEvent = page.locator('article').filter({ hasText: 'usr_001' }).first();
  await expect(filteredEvent).toContainText('USER_UPDATED');
});
