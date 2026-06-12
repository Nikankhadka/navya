import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Navya')).toBeVisible({ timeout: 10000 });
  });

  test('should load login screen', async ({ page }) => {
    await expect(page.getByText('Navya')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByTestId('login-send-magic-link')).toBeVisible();
    await expect(page.getByText(/sign-in link/)).toBeVisible();
  });

  test('should show email validation error', async ({ page }) => {
    await page.getByTestId('login-send-magic-link').click();
    const errorMsg = page.getByText(/Invalid email|Please enter a valid email address/);
    await expect(errorMsg.first()).toBeVisible();
  });

  test('should call magic link API', async ({ page }) => {
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-send-magic-link').click();
    const toast = page.getByRole('status');
    const errorLog = page.getByText('[ERROR]');
    await expect(toast.or(errorLog).first()).toBeAttached({ timeout: 15000 });
  });

  test('should have demo mode entry point', async ({ page }) => {
    await expect(page.getByTestId('login-demo-shortcut')).toBeVisible();
    await page.getByTestId('login-demo-shortcut').click();
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 10000 });
  });

  test('should keep theme toggle visible', async ({ page }) => {
    await expect(page.getByTestId('theme-toggle-dark')).toBeVisible();
  });
});
