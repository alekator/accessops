import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@accessops.dev');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/users/);
}

test('admin can change permissions and save role policy', async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto('/roles');
  await expect(page).toHaveURL(/\/roles/);

  await page.getByRole('button', { name: 'Toggle all' }).click();
  await expect(page.getByText('No unsaved permission changes.')).not.toBeVisible();

  await page.getByRole('button', { name: 'Save policy' }).click();
  await expect(page.getByText('No unsaved permission changes.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save policy' })).toBeDisabled();
});

test('admin can import json policy and persist it', async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto('/roles');
  await expect(page).toHaveURL(/\/roles/);

  const importedPolicy = {
    Users: { Read: true, Write: false, Delete: false, Export: true, Admin: false },
    Billing: { Read: true, Write: false, Delete: false, Export: false, Admin: false },
    Documents: { Read: true, Write: true, Delete: false, Export: false, Admin: false },
    Reports: { Read: true, Write: false, Delete: false, Export: true, Admin: false },
  };

  await page.getByLabel('Import JSON policy').fill(JSON.stringify(importedPolicy));
  await page.getByRole('button', { name: 'Apply import to draft' }).click();

  await expect(page.getByText('Enabled: 7/20')).toBeVisible();
  await expect(page.getByText('No unsaved permission changes.')).not.toBeVisible();
  await page.getByRole('button', { name: 'Save policy' }).click();
  await expect(page.getByText('No unsaved permission changes.')).toBeVisible();
});
