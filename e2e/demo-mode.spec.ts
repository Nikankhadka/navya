import { test, expect } from '@playwright/test';

test.describe('Demo Mode & Auth', () => {
  test('should load login screen', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Navya/);
    await expect(page.getByText('Navya')).toBeVisible();
    await expect(page.getByText("Enter your email and we'll send you a one-time sign-in link")).toBeVisible();
  });

  test('should have email input and send link button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Email Link' })).toBeVisible();
  });

  test('should have demo mode entry point', async ({ page }) => {
    await page.goto('/');
    const demoButton = page.getByRole('button', { name: 'Explore Demo App' });
    await expect(demoButton).toBeVisible();
    await demoButton.click();
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('tabs');
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /theme/i })).toBeVisible();
  });
});
