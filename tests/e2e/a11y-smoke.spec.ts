import { expect, test } from '@playwright/test';

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test('login page exposes keyboard-first entry points', async ({ page }) => {
  await page.goto('/login');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AccessOps Login' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();
});

test('dashboard shell has navigation and main landmarks', async ({ page }) => {
  await loginAs(page, 'admin@accessops.dev');
  await expect(page).toHaveURL(/\/users/);

  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
});

test('users table has accessible name via caption', async ({ page }) => {
  await loginAs(page, 'admin@accessops.dev');
  await expect(page).toHaveURL(/\/users/);

  await expect(page.getByRole('table', { name: 'Users results table' })).toBeVisible();
});

test('audit details toggle exposes expanded state', async ({ page }) => {
  await loginAs(page, 'admin@accessops.dev');
  await page.goto('/audit');

  const firstEvent = page.locator('article').first();
  const toggle = firstEvent.getByRole('button', { name: 'Show details' });
  await toggle.click();
  await expect(firstEvent.getByRole('button', { name: 'Hide details' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});
